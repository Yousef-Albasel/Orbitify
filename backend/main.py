from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from preprocessing import preprocess_data 
from extract_features import planet_volume , star_volume , explain_disposition
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score
from catboost import CatBoostClassifier
import joblib
from os.path import exists
import io


app = FastAPI(title="Exoplanet Predictor", description="Upload KOI-like CSV and get predictions")

if exists("models/fineturned_catboost.pkl"):
    model = joblib.load("models/fineturned_catboost.pkl")
else:
    model = joblib.load("models/catboost_exoplanet_model.pkl")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
def read_root():
    return {"message": "Exoplanet Detection API is running!"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        X_processed = preprocess_data(df)
        predictions = model.predict(X_processed)
        probabilities = model.predict_proba(X_processed)[:, 1]
        df_results = df.copy()
        df_results["Prediction"] = ["Exoplanet" if p == 1 else "False Positive" for p in predictions]
        df_results["Probability"] = probabilities
        return {
            "status": "success",
            "preview": df_results[["Prediction", "Probability"]].to_dict(orient="records"),
            "total_predictions": len(df_results),
            "info": {
                "planet_volume": planet_volume(df["koi_prad"]),
                "star_volume": star_volume(df["koi_srad"]),
                "explanations": df_results.apply(lambda row: explain_disposition(row, row["Prediction"]), axis=1).tolist()
            }
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/retrain")
async def retrain_model(file: UploadFile = File(...)):
    try:
        # Read CSV
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents) , comment='#')

        # Preprocess
        X_processed, y_train = preprocess_data(df , retrain=True)

        # Retrain model
        catboost = CatBoostClassifier(iterations=500, random_state=42, verbose=0)
        catboost.fit(X_processed, y_train, init_model=model)

        joblib.dump(catboost, "models/fineturned_catboost.pkl")
        return {
                "status": "success"
            }

    except Exception as e:
        return {"status": "error", "message": str(e)}