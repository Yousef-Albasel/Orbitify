from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from preprocessing import preprocess_data 
from extract_features import planet_volume, star_volume, explain_disposition
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score
from catboost import CatBoostClassifier
import joblib
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
        print("✅ Loaded fine-tuned model")
    else:
        model = joblib.load("models/catboost_exoplanet_model.pkl")
        print("✅ Loaded base model")
except Exception as e:
    print(f"❌ Failed to load model: {e}")
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
        
        # Clean NaN values
        predictions = np.nan_to_num(predictions, nan=0)
        probabilities = np.nan_to_num(probabilities, nan=0.0)
        
        df_results = df.copy()
        df_results["Prediction"] = ["Exoplanet" if p == 1 else "False Positive" for p in predictions]
        df_results["Probability"] = probabilities
        
        # Convert to native Python types and clean NaN
        preview_data = []
        for _, row in df_results[["Prediction", "Probability"]].head(10).iterrows():
            preview_data.append({
                "Prediction": str(row["Prediction"]),
                "Probability": float(row["Probability"]) if not np.isnan(row["Probability"]) else 0.0
            })
        
        return {
            "status": "success",
            "preview": preview_data,
            "total": int(len(df_results)),
            "exoplanets": int((predictions == 1).sum()),
            "confidence": round(float(np.nanmean(probabilities) * 100), 2)
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}
    
@app.post("/retrain")
async def retrain_model(file: UploadFile = File(...)):
    global model
    
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents), comment='#')
        
        print(f"🔄 Retraining with {len(df)} rows")
        
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