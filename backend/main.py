from fastapi import FastAPI, UploadFile, File
import pandas as pd
from preprocessing import preprocess_data 
import joblib
import io


app = FastAPI(title="Exoplanet Predictor", description="Upload KOI-like CSV and get predictions")

model = joblib.load("models/catboost_exoplanet_model.pkl")

@app.get("/")
def read_root():
    return {"message": "🚀 Exoplanet Detection API is running! Go to /docs to test."}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Read CSV
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        # Preprocess
        X_processed = preprocess_data(df)

        # Predict
        predictions = model.predict(X_processed)
        probabilities = model.predict_proba(X_processed)[:, 1]

        # Attach results to original dataframe for clarity
        df_results = df.copy()
        df_results["Prediction"] = ["Exoplanet" if p == 1 else "False Positive" for p in predictions]
        df_results["Probability"] = probabilities

        # Return top 10 as preview
        return {
            "status": "success",
            "preview": df_results[["Prediction", "Probability"]].head(10).to_dict(orient="records"),
            "total_predictions": len(df_results)
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

