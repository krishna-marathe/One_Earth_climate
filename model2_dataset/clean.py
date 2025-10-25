# ------------------------------------------------------------
# Data Cleaning & Preprocessing for Synthetic Climate Risk Dataset
# ------------------------------------------------------------

import pandas as pd
from sklearn.preprocessing import MinMaxScaler

# Load the dataset
df = pd.read_csv("perfect_realistic_climate_risk.csv")

# -----------------------------
# 1️⃣ Handle missing values
# -----------------------------
# Forward fill / backward fill for safety
df.fillna(method='ffill', inplace=True)
df.fillna(method='bfill', inplace=True)

# -----------------------------
# 2️⃣ Remove extreme outliers (optional but keeps realism)
# -----------------------------
# Define realistic thresholds for numeric columns
numeric_limits = {
    'Rainfall_mm': (10, 500),
    'Temperature_C': (-10, 50),
    'Soil_Moisture': (0.05, 0.7),
    'Humidity_%': (20, 95),
    'Wind_Speed_mps': (0, 25),
    'CO2_ppm': (280, 500),
    'Evaporation_mm_day': (0.5, 15),
    'Rainfall_Lag_mm': (0, 500),
    'FloodRisk_Score': (0, 100),
    'DroughtRisk_Score': (0, 100),
    'HeatwaveRisk_Score': (0, 100)
}

for col, (min_val, max_val) in numeric_limits.items():
    df[col] = df[col].clip(lower=min_val, upper=max_val)

# -----------------------------
# 3️⃣ Ensure categorical consistency
# -----------------------------
# Reclassify risk levels to match numeric scores
def classify_risk(score):
    if score < 35:
        return 'Low'
    elif score < 70:
        return 'Medium'
    else:
        return 'High'

df['FloodRisk_Level'] = df['FloodRisk_Score'].apply(classify_risk)
df['DroughtRisk_Level'] = df['DroughtRisk_Score'].apply(classify_risk)
df['HeatwaveRisk_Level'] = df['HeatwaveRisk_Score'].apply(classify_risk)

# -----------------------------
# 4️⃣ Optional: Normalize numeric features for ML
# -----------------------------
scaler = MinMaxScaler()
numeric_features = [
    'Rainfall_mm', 'Temperature_C', 'Soil_Moisture', 'Humidity_%', 'Wind_Speed_mps',
    'CO2_ppm', 'Evaporation_mm_day', 'Rainfall_Lag_mm',
    'FloodRisk_Score', 'DroughtRisk_Score', 'HeatwaveRisk_Score'
]
df[numeric_features] = scaler.fit_transform(df[numeric_features])

# -----------------------------
# 5️⃣ Save cleaned dataset
# -----------------------------
df.to_csv("perfect_realistic_climate_risk_cleaned.csv", index=False)
print("✅ Dataset cleaned and saved as 'perfect_realistic_climate_risk_cleaned.csv'")
print(df.head())
