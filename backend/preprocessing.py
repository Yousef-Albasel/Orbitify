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

def recite_target_mapping(df: pd.DataFrame) -> pd.DataFrame:
    if 'koi_disposition' in df.columns:
        df = df[df['koi_disposition'].isin(['CONFIRMED', 'FALSE POSITIVE'])]
        df['target'] = (df['koi_disposition'] == 'CONFIRMED').astype(int)
        return df
    else:
        raise ValueError("Column 'koi_disposition' not found in DataFrame.")
def preprocess_data(df: pd.DataFrame , retrain: bool = False) -> pd.DataFrame:
    """
    Complete preprocessing pipeline matching training exactly
    
    Steps:
    1. Drop unnecessary columns
    2. Filter to cols_to_keep (those with <50% missing)
    3. Apply KNN imputation
    4. Scale ALL features
    5. Select only RFE features
    """
    
    # Load all preprocessing objects
    _, scaler, knn_imputer, cols_to_keep, selected_features, columns_to_drop = load_model()
    df_clean = df.drop(columns=[c for c in columns_to_drop if c in df.columns], errors="ignore")
    print(f"[DEBUG] After dropping columns: {df_clean.shape}")

    # Step 2: Keep only the columns used during training (after filtering missing values)
    # Add missing columns with NaN if they don't exist
    for col in cols_to_keep:
        if col not in df_clean.columns:
            df_clean[col] = np.nan

    if retrain:
        df_clean = recite_target_mapping(df_clean)
    # Keep only cols_to_keep in the same order
    df_clean = df_clean.drop(columns=["koi_disposition"], errors="ignore")

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
    print(f"[DEBUG] After RFE selection: {X_final.shape}")
    print(f"[DEBUG] Final features: {X_final.columns.tolist()}")
    if retrain:
        return X_final, df_clean["target"]
    else:
        return X_final