# ------------------------------------------------------------
# Climate Risk Analysis, Prediction & Model Saving Script
# Author: Krishna Marathe
# ------------------------------------------------------------

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

# -----------------------------
# 1️⃣ Load Cleaned Dataset
# -----------------------------
df = pd.read_csv("perfect_realistic_climate_risk_cleaned.csv")
print("✅ Dataset loaded")
print(df.head())

# -----------------------------
# 2️⃣ Feature Engineering
# -----------------------------
np.random.seed(42)

# Simulate Month
df['Month'] = np.random.randint(1,13, size=len(df))

# Season from Month
def get_season(month):
    if month in [12,1,2]: return 'Winter'
    elif month in [3,4,5]: return 'Spring'
    elif month in [6,7,8]: return 'Summer'
    else: return 'Autumn'

df['Season'] = df['Month'].apply(get_season)

# Region-specific averages
region_avg = df.groupby('Region')[['Rainfall_mm','Temperature_C']].transform('mean')
df['Rainfall_Avg_Region'] = region_avg['Rainfall_mm']
df['Temp_Avg_Region'] = region_avg['Temperature_C']

# Anomaly flags
df['Rainfall_Anomaly'] = df['Rainfall_mm'] > (df['Rainfall_Avg_Region'] + 2*df['Rainfall_mm'].std())
df['Temperature_Anomaly'] = df['Temperature_C'] > (df['Temp_Avg_Region'] + 2*df['Temperature_C'].std())

# -----------------------------
# 3️⃣ Prepare Features & Targets
# -----------------------------
features = ['Rainfall_mm','Temperature_C','Soil_Moisture','Humidity_%',
            'Wind_Speed_mps','CO2_ppm','Evaporation_mm_day','Month',
            'Rainfall_Avg_Region','Temp_Avg_Region']

targets = ['FloodRisk_Level','DroughtRisk_Level','HeatwaveRisk_Level']

# Dictionary to store models
models = {}

# -----------------------------
# 4️⃣ Train & Save Models
# -----------------------------
for target in targets:
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    
    y_pred = rf.predict(X_test)
    print(f"\n--- {target} ---")
    print(f"Accuracy: {accuracy_score(y_test, y_pred)*100:.2f}%")
    print(classification_report(y_test, y_pred))
    
    # Save model as .pkl
    file_name = f"{target.replace('_Level','')}_Model.pkl"
    joblib.dump(rf, file_name)
    print(f"✅ Model saved as {file_name}")
    
    # Store model
    models[target] = rf

# -----------------------------
# 5️⃣ Predict Future Year Example (e.g., 2030)
# -----------------------------
def predict_future(df, future_year):
    future_df = df.copy()
    # Increase trend for temperature & CO2
    future_df['Temperature_C'] += 0.02*(future_year - future_df['Year'])
    future_df['CO2_ppm'] += 0.5*(future_year - future_df['Year'])
    future_df['Year'] = future_year
    
    X_future = future_df[features]
    
    predictions = {}
    for target in targets:
        model = joblib.load(f"{target.replace('_Level','')}_Model.pkl")
        predictions[target] = model.predict(X_future)
    
    future_df['Predicted_FloodRisk'] = predictions['FloodRisk_Level']
    future_df['Predicted_DroughtRisk'] = predictions['DroughtRisk_Level']
    future_df['Predicted_HeatwaveRisk'] = predictions['HeatwaveRisk_Level']
    
    return future_df[['Country','Region','Year','Predicted_FloodRisk','Predicted_DroughtRisk','Predicted_HeatwaveRisk']]

# Example prediction for 2030
future_prediction_2030 = predict_future(df, 2030)
print("\n✅ Future Risk Prediction for 2030")
print(future_prediction_2030.head())
