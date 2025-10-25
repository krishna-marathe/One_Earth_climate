# whatif_data_preprocessing.py
"""
DATA CLEANING & PREPROCESSING for WHAT-IF SIMULATOR MODEL
----------------------------------------------------------
This script cleans and prepares the synthetic dataset
for model training by:
  - Handling missing and wrong values
  - Scaling numerical features
  - Adding engineered interaction terms
  - Saving the cleaned dataset
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler

# -------------------------------
# STEP 1: Load Raw Dataset
# -------------------------------
data = pd.read_csv("whatif_simulator_raw.csv")
print("✅ Raw data loaded successfully")
print("Shape:", data.shape)
print(data.head())

# -------------------------------
# STEP 2: Handle Missing Values
# -------------------------------
# Fill missing numeric values using median (robust to outliers)
data.fillna(data.median(numeric_only=True), inplace=True)

# Verify if any missing left
print("\nMissing values after cleaning:")
print(data.isnull().sum())

# -------------------------------
# STEP 3: Remove Extreme Outliers
# -------------------------------
# Clip outliers beyond 1st and 99th percentile
for col in data.select_dtypes(include=np.number).columns:
    lower, upper = data[col].quantile([0.01, 0.99])
    data[col] = np.clip(data[col], lower, upper)

# -------------------------------
# STEP 4: Feature Engineering
# -------------------------------
# Add interaction features to improve model learning
data["co2_x_deforestation"] = data["co2_change_percent"] * data["deforestation_percent"]
data["renewable_x_industry"] = data["renewable_energy_percent"] * data["industrial_growth_index"]
data["eco_balance_index"] = (
    data["renewable_energy_percent"] -
    (data["co2_change_percent"] + data["deforestation_percent"]) / 2
)

# -------------------------------
# STEP 5: Feature Scaling
# -------------------------------
# Scale features to 0–1 range for better model performance
scaler = MinMaxScaler()
scaled_features = data.drop(columns=["temperature_change", "risk_index", "year"])

scaled_array = scaler.fit_transform(scaled_features)
scaled_df = pd.DataFrame(scaled_array, columns=scaled_features.columns)

# Combine scaled features with target variables
cleaned_data = pd.concat([data[["year", "temperature_change", "risk_index"]], scaled_df], axis=1)

# -------------------------------
# STEP 6: Save Cleaned Data
# -------------------------------
cleaned_data.to_csv("whatif_simulator_cleaned.csv", index=False)
print("\n✅ Data cleaned and saved as 'whatif_simulator_cleaned.csv'")
print("Final shape:", cleaned_data.shape)
print(cleaned_data.head())
