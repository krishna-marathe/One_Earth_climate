"""
Enhanced Preprocessing Script for Model 1
Ensures proper feature ordering and enhanced feature engineering.
"""

import sys
import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import OneHotEncoder

def preprocess_data(data):
    """
    Enhanced preprocessing for climate data with proper feature ordering.
    """
    df = data.copy()
    
    # Handle known data issues
    df["co2_ppm"].replace(9999.0, np.nan, inplace=True)
    df.loc[df["rainfall_mm"] < 0, "rainfall_mm"] = np.nan
    df["humidity_pct"] = df["humidity_pct"].clip(lower=0, upper=100)
    df["volcanic_activity"] = df["volcanic_activity"].fillna(0)

    # Handle missing values
    num_cols = df.select_dtypes(include=["float64", "int64"]).columns
    cat_cols = df.select_dtypes(include=["object"]).columns

    for col in num_cols:
        df[col] = df[col].fillna(df[col].median())

    for col in cat_cols:
        df[col] = df[col].fillna(df[col].mode()[0])

    # Handle outliers using IQR
    def clip_outliers(series, factor=1.5):
        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        lower = q1 - factor * iqr
        upper = q3 + factor * iqr
        return np.clip(series, lower, upper)

    for col in ["temperature_anomaly", "rainfall_mm", "co2_ppm", "humidity_pct"]:
        if col in df.columns:
            df[col] = clip_outliers(df[col])

    # Feature Engineering
    if "month" in df.columns:
        df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
        df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)

    if "region" in df.columns:
        encoder = OneHotEncoder(sparse_output=False, drop="first")
        encoded_regions = encoder.fit_transform(df[["region"]])
        encoded_df = pd.DataFrame(encoded_regions, columns=encoder.get_feature_names_out(["region"]))
        df = pd.concat([df.drop(columns=["region"]), encoded_df], axis=1)

    if "time_index" in df.columns:
        df = df.sort_values(by="time_index").reset_index(drop=True)
        
        # Lag features (matching training script naming exactly)
        if "temperature_anomaly" in df.columns:
            df["temp_lag1"] = df["temperature_anomaly"].shift(1)
        if "co2_ppm" in df.columns:
            df["co2_lag1"] = df["co2_ppm"].shift(1)
        if "rainfall_mm" in df.columns:
            df["rainfall_lag1"] = df["rainfall_mm"].shift(1)
            
        # Fill first row NaNs
        df = df.fillna(method="bfill")
        
        # Rolling features
        if "temperature_anomaly" in df.columns:
            df["temp_roll3"] = df["temperature_anomaly"].rolling(3, min_periods=1).mean()
        if "rainfall_mm" in df.columns:
            df["rain_roll3"] = df["rainfall_mm"].rolling(3, min_periods=1).mean()
            
        df.drop(columns=["time_index"], inplace=True, errors="ignore")

    # Ensure proper feature order (matching the trained model)
    expected_features = [
        'co2_ppm', 'enso_index', 'volcanic_activity', 'ocean_heat_index',
        'rainfall_mm', 'humidity_pct', 'month_sin', 'month_cos', 'temp_lag1',
        'co2_lag1', 'rainfall_lag1', 'temp_roll3', 'rain_roll3', 'region_Inland',
        'region_Polar', 'region_Temperate', 'region_Tropics'
    ]
    
    # Add any missing features with default values
    for feature in expected_features:
        if feature not in df.columns:
            if feature.startswith('region_'):
                df[feature] = 0  # Default to 0 for one-hot encoded regions
            else:
                df[feature] = 0  # Default value for other features
    
    # Reorder columns to match expected order
    available_features = [f for f in expected_features if f in df.columns]
    df_ordered = df[available_features + ['temperature_anomaly', 'year', 'month']]
    
    return df_ordered

# Command line interface
if __name__ == "__main__":
    if len(sys.argv) > 1:
        raw_path = sys.argv[1]
    else:
        raw_path = input("Enter path to your dataset (CSV file): ").strip()

    if not os.path.exists(raw_path):
        print(f"ERROR: Dataset not found at: {raw_path}")
        sys.exit(1)

    print(f"\nLoading dataset from: {raw_path}")
    df = pd.read_csv(raw_path)
    print("SUCCESS: Loaded dataset:", df.shape)

    # Process the data
    df_cleaned = preprocess_data(df)

    # Save cleaned data
    out_path = os.path.join(os.path.dirname(raw_path), "climate_cleaned.csv")
    df_cleaned.to_csv(out_path, index=False)

    print(f"\nSUCCESS: Cleaned data saved to: {out_path}")
    print("Shape:", df_cleaned.shape)
    print("Columns:", list(df_cleaned.columns))
    print("------------------------------------------------------")