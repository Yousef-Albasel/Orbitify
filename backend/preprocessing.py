import pandas as pd
import numpy as np
import joblib
from sklearn.impute import KNNImputer
from sklearn.preprocessing import StandardScaler


def load_model():
    model = joblib.load("models/catboost_exoplanet_model.pkl")
    scaler = joblib.load("models/scaler.pkl")
    knn_imputer = joblib.load("models/knn_imputer.pkl")
    cols_to_keep = joblib.load("models/cols_to_keep.pkl")
    selected_features = joblib.load("models/selected_features.pkl")
    columns_to_drop = joblib.load("models/columns_to_drop.pkl")
     
    return model, scaler, knn_imputer, cols_to_keep, selected_features, columns_to_drop


def preprocess_data(df: pd.DataFrame):
    _, scaler, knn_imputer, cols_to_keep, selected_features, columns_to_drop = load_model()
    df_clean = df.drop(columns=[c for c in columns_to_drop if c in df.columns], errors="ignore")
    for col in cols_to_keep:
        if col not in df_clean.columns:
            df_clean[col] = np.nan
    X_filtered = df_clean[cols_to_keep]
    X_imputed_array = knn_imputer.transform(X_filtered)
    X_imputed = pd.DataFrame(
        X_imputed_array,
        columns=cols_to_keep,
        index=X_filtered.index
    )
    X_scaled = scaler.transform(X_imputed)
    X_scaled = pd.DataFrame(
        X_scaled,
        columns=cols_to_keep,
        index=X_imputed.index
    )
    X_final = X_scaled[selected_features]
    return X_final
