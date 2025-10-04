from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import shap
import pandas as pd
from preprocessing import preprocess_data 
from extract_features import planet_volume, star_volume, explain_disposition
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score
from catboost import CatBoostClassifier
import joblib
from datetime import datetime
import matplotlib.pyplot as plt

from os.path import exists
import io
import numpy as np
import traceback

app = FastAPI(
    title="Exoplanet Predictor", 
    description="Upload KOI-like CSV and get predictions"
)

# Load model at startup
try:
    if exists("models/fineturned_catboost.pkl"):
        model = joblib.load("models/fineturned_catboost.pkl")
        print("Loaded fine-tuned model")
    else:
        model = joblib.load("models/catboost_exoplanet_model.pkl")
        print("Loaded base model")
except Exception as e:
    print(f"Failed to load model: {e}")
    model = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Exoplanet Detection API is running!",
        "model_loaded": model is not None,
        "endpoints": {
            "predict": "/predict (POST)",
            "retrain": "/retrain (POST)"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None
    }
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        X_processed = preprocess_data(df)
        predictions = model.predict(X_processed)
        probabilities = model.predict_proba(X_processed)[:, 1]
        predictions = np.nan_to_num(predictions, nan=0)
        probabilities = np.nan_to_num(probabilities, nan=0.0)
            
        explainer = shap.TreeExplainer(model)

        shap_values = explainer.shap_values(X_processed)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"shap_summary_{timestamp}.png"
        filepath = f"plots/{filename}"
        
        # Generate SHAP plot
        plt.figure(figsize=(10, 8))
        shap.summary_plot(shap_values, X_processed, show=False)

        # Save to disk
        plt.savefig(filepath, bbox_inches='tight', dpi=150)
        plt.close()

        df_results = df.copy()
        df_results["Prediction"] = ["CONFIRMED" if p == 1 else "FALSE POSITIVE" for p in predictions]
        df_results["Probability"] = probabilities
        
        # Generate preview with explanations for ALL samples
        preview_data = []
        # Use enumerate to get sequential position
        for position, (idx, row) in enumerate(df_results.head(10).iterrows()):
            prediction_label = "CONFIRMED" if predictions[position] == 1 else "FALSE POSITIVE"
            explanation = explain_disposition(df.iloc[position], prediction_label)
            
            preview_data.append({
                "Prediction": prediction_label,
                "Probability": float(probabilities[position]) if not np.isnan(probabilities[position]) else 0.0,
                "explanation": explanation  # Add explanation
            })
            
            # Debug print
            print(f"Position {position}: {prediction_label}, Explanation length: {len(explanation) if explanation else 0}")
        
        exoplanet_data = []
        for idx, row in df_results[df_results["Prediction"] == "CONFIRMED"].iterrows():
            if 'koi_prad' in df and 'koi_srad' in df and not pd.isna(row.get('koi_prad')) and not pd.isna(row.get('koi_srad')):
                planet_vol = float(planet_volume(row['koi_prad']))
                star_vol = float(star_volume(row['koi_srad']))
                
                # Get the position in the original dataframe
                original_position = df.index.get_loc(idx)
                
                exoplanet_data.append({
                    'kepoi_name': str(row.get('kepoi_name', f'KOI-{idx}')),
                    'planet_radius_earth': float(row['koi_prad']),
                    'star_radius_solar': float(row['koi_srad']),
                    'planet_volume_km3': planet_vol,
                    'star_volume_km3': star_vol,
                    'planet_volume_earth': float(row['koi_prad'] ** 3),
                    'star_volume_solar': float(row['koi_srad'] ** 3),
                    'probability': float(row['Probability']),
                    'explanation': explain_disposition(df.iloc[original_position], 'CONFRIMED')
                })
        
        avg_planet_volume_earth = 0
        avg_star_volume_solar = 0
        if exoplanet_data:
            avg_planet_volume_earth = np.mean([e['planet_volume_earth'] for e in exoplanet_data])
            avg_star_volume_solar = np.mean([e['star_volume_solar'] for e in exoplanet_data])
        
        print("Preview data sample:", preview_data[0] if preview_data else "No data")

        return {
            "status": "success",
            "preview": preview_data,
            "total": int(len(df_results)),
            "exoplanets": int((predictions == 1).sum()),
            "confidence": round(float(np.nanmean(probabilities) * 100), 2),
            "exoplanet_details": exoplanet_data[:5],
            "avg_planet_volume_earth": float(avg_planet_volume_earth),
            "avg_star_volume_solar": float(avg_star_volume_solar),
            "shap_plot": FileResponse(
                    filepath,
                    media_type="image/png",
                    filename=filename
                )
        }

    except Exception as e:
        print(f"Error: {traceback.format_exc()}")
        return {"status": "error", "message": str(e)}
        
@app.post("/retrain")
async def retrain_model(file: UploadFile = File(...)):
    global model
    
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents), comment='#')
        
        print(f"Retraining with {len(df)} rows")
        
        X_processed, y_train = preprocess_data(df, retrain=True)
        
        catboost = CatBoostClassifier(iterations=500, random_state=42, verbose=0)
        catboost.fit(X_processed, y_train, init_model=model)

        joblib.dump(catboost, "models/fineturned_catboost.pkl")
        model = catboost
        
        print("Model retrained successfully")
        
        return {"status": "success", "message": "Model retrained successfully"}

    except Exception as e:
        print(f"Retraining error:")
        print(traceback.format_exc())
        return {"status": "error", "message": str(e)}