# preprocess_ecological_data.py
"""
Preprocessing pipeline for ecological dataset (NDVI, landcover, species, climate).
Performs:
 - Cleaning and imputations
 - Outlier handling
 - Feature engineering (lags, rolling means, cyclic encodings)
 - Encodes landcover
Outputs a ready-for-ML CSV: ecological_cleaned.csv
"""

import pandas as pd
import numpy as np

# --------------------------------------
# Step 1: Load raw data
# --------------------------------------
data = pd.read_csv("ecological_synthetic_10k.csv")
print("✅ Loaded data:", data.shape)
print("Columns:", data.columns.tolist())

# --------------------------------------
# Step 2: Basic cleaning & replacements
# --------------------------------------
# Replace unrealistic or sentinel values with NaN
data['rainfall_mm'] = data['rainfall_mm'].apply(lambda x: np.nan if x < 0 else x)
data['co2_ppm'] = data['co2_ppm'].replace(9999.0, np.nan)

# Clip NDVI to valid range
data['ndvi'] = data['ndvi'].clip(-0.1, 0.95)

# --------------------------------------
# Step 3: Handle missing values
# --------------------------------------
# For continuous features
continuous_features = ['co2_ppm', 'rainfall_mm', 'temp_c', 'enso', 'human_disturbance', 'ndvi']

# Impute by group (region+month median) to preserve ecological structure
for col in continuous_features:
    data[col] = data.groupby(['region', 'month'])[col].transform(
        lambda x: x.fillna(x.median())
    )
    # fallback: fill remaining NaN with overall median
    data[col] = data[col].fillna(data[col].median())

# --------------------------------------
# Step 4: Feature Engineering
# --------------------------------------

# (a) Cyclic encodings for month (to preserve seasonality)
data['month_sin'] = np.sin(2 * np.pi * data['month'] / 12)
data['month_cos'] = np.cos(2 * np.pi * data['month'] / 12)

# (b) Sort by site and time for lag/rolling features
data = data.sort_values(by=['site_id', 'year', 'month']).reset_index(drop=True)

# Create NDVI lag and rolling mean features
def add_lags(df, col, lags=[1, 3, 12]):
    for lag in lags:
        df[f'{col}_lag{lag}'] = df.groupby('site_id')[col].shift(lag)
    return df

def add_rolling_mean(df, col, window=12):
    df[f'{col}_roll{window}'] = df.groupby('site_id')[col].transform(
        lambda x: x.rolling(window=window, min_periods=1).mean()
    )
    return df

data = add_lags(data, 'ndvi', [1, 3, 12])
data = add_rolling_mean(data, 'ndvi', 12)

# Fill any new NaNs created by lagging
for col in [c for c in data.columns if 'lag' in c or 'roll' in c]:
    data[col] = data[col].fillna(data[col].median())

# (c) Encode landcover
landcover_dummies = pd.get_dummies(data['landcover'], prefix='landcover')
data = pd.concat([data.drop(columns=['landcover']), landcover_dummies], axis=1)

# --------------------------------------
# Step 5: Normalize continuous features (optional)
# --------------------------------------
# For many models like XGBoost normalization isn't mandatory,
# but you can scale features if desired for interpretability.
# Here we just ensure values are numeric and consistent.
numeric_cols = data.select_dtypes(include=[np.number]).columns.tolist()
data[numeric_cols] = data[numeric_cols].apply(pd.to_numeric, errors='coerce')

# --------------------------------------
# Step 6: Final sanity checks
# --------------------------------------
print("\n✅ Final data summary:")
print(data.describe())
print("\nMissing values after processing:\n", data.isna().sum().sum())

# --------------------------------------
# Step 7: Save processed dataset
# --------------------------------------
data.to_csv("ecological_cleaned.csv", index=False)
print("\n💾 Saved preprocessed dataset as 'ecological_cleaned.csv'")
print("Final shape:", data.shape)
