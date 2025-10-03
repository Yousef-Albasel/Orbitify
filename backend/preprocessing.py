"""
preprocessing.py - Complete preprocessing pipeline matching training
"""

import pandas as pd
import numpy as np
import joblib
from sklearn.impute import KNNImputer
from sklearn.preprocessing import StandardScaler


def load_model():
    """Load all saved model components"""
    model = joblib.load("models/catboost_exoplanet_model.pkl")
    scaler = joblib.load("models/scaler.pkl")
    knn_imputer = joblib.load("models/knn_imputer.pkl")
    cols_to_keep = joblib.load("models/cols_to_keep.pkl")
    selected_features = joblib.load("models/selected_features.pkl")
    columns_to_drop = joblib.load("models/columns_to_drop.pkl")
     
    return model, scaler, knn_imputer, cols_to_keep, selected_features, columns_to_drop


def preprocess_data(df: pd.DataFrame):
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
    
    print(f"[DEBUG] Input shape: {df.shape}")
    print(f"[DEBUG] Input columns: {df.columns.tolist()}")
    
    # Step 1: Drop unnecessary columns (same as training)
    df_clean = df.drop(columns=[c for c in columns_to_drop if c in df.columns], errors="ignore")
    print(f"[DEBUG] After dropping columns: {df_clean.shape}")
    
    # Step 2: Keep only the columns used during training (after filtering missing values)
    # Add missing columns with NaN if they don't exist
    for col in cols_to_keep:
        if col not in df_clean.columns:
            df_clean[col] = np.nan
    
    # Keep only cols_to_keep in the same order
    X_filtered = df_clean[cols_to_keep]
    print(f"[DEBUG] After filtering to cols_to_keep: {X_filtered.shape}")
    print(f"[DEBUG] Columns: {X_filtered.columns.tolist()}")
    
    # Step 3: Apply KNN Imputation (same as training)
    X_imputed_array = knn_imputer.transform(X_filtered)
    X_imputed = pd.DataFrame(
        X_imputed_array,
        columns=cols_to_keep,
        index=X_filtered.index
    )
    print(f"[DEBUG] After imputation: {X_imputed.shape}")
    
    # Step 4: Scale ALL features (not just selected ones!)
    X_scaled = scaler.transform(X_imputed)
    X_scaled = pd.DataFrame(
        X_scaled,
        columns=cols_to_keep,  # All columns, not just selected
        index=X_imputed.index
    )
    print(f"[DEBUG] After scaling: {X_scaled.shape}")
    print(f"[DEBUG] Scaled columns: {X_scaled.columns.tolist()}")
    
    # Step 5: Select only RFE features (final step)
    X_final = X_scaled[selected_features]
    print(f"[DEBUG] After RFE selection: {X_final.shape}")
    print(f"[DEBUG] Final features: {X_final.columns.tolist()}")
    
    return X_final
