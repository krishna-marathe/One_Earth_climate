import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report

# ------------------------------
# Step 1: Load or generate Model 1 predictions
# ------------------------------
base_csv = "smart_synthetic_climate_10k.csv"
if not os.path.exists(base_csv):
    print(f"⚠️ {base_csv} not found. Generating synthetic dataset...")
    n_samples = 10000
    df_base = pd.DataFrame({
        "time_index": range(n_samples),
        "year": np.random.choice(range(2025, 2046), n_samples),
        "month": np.random.choice(range(1, 13), n_samples),
        "region": np.random.choice(
            ["India-Mumbai","India-Delhi","India-Kolkata","India-Gujrat",
             "India-Chennai","India-Kashmir","USA-California","USA-Texas",
             "China-Beijing","UK-London","UAE-Dubai"], n_samples),
        "co2_ppm": np.random.uniform(380, 450, n_samples),
        "temperature_anomaly": np.random.uniform(-2, 5, n_samples),
        "rainfall_mm": np.random.uniform(0, 500, n_samples),
        "humidity_pct": np.random.uniform(30, 90, n_samples),
        "enso_index": np.random.uniform(-2, 2, n_samples),
        "volcanic_activity": np.random.uniform(0, 5, n_samples),
        "ocean_heat_index": np.random.uniform(0, 5, n_samples)
    })
    df_base.to_csv(base_csv, index=False)
    print(f"✅ Synthetic dataset created: {base_csv}")
else:
    df_base = pd.read_csv(base_csv)
    print(f"✅ Loaded base dataset: {base_csv}")
print("Columns:", df_base.columns.tolist())

# ------------------------------
# Step 2: Add scenario slider columns if missing
# ------------------------------
slider_columns = {
    "CO2_Reduction_Percent": (0, 30),
    "Deforestation_Percent": (0, 50),
    "Urban_Heat_Control_Percent": (0, 40),
    "Irrigation_Efficiency_Percent": (0, 50),
    "Water_Conservation_Percent": (0, 50),
    "Renewable_Energy_Percent": (0, 50),
    "Cloud_Seeding_Efficiency_Percent": (0, 30)
}

for col, (low, high) in slider_columns.items():
    if col not in df_base.columns:
        df_base[col] = np.random.uniform(low, high, size=df_base.shape[0])
        print(f"ℹ️ Added missing slider column '{col}' with random values.")

# ------------------------------
# Step 3: Compute scenario-adjusted predictions
# ------------------------------
df_base['Temperature_with_scenario'] = df_base['temperature_anomaly'] \
    - 0.02*df_base['CO2_Reduction_Percent'] + 0.01*df_base['Urban_Heat_Control_Percent']

df_base['CO2_with_scenario'] = df_base['co2_ppm'] \
    - 0.05*df_base['CO2_Reduction_Percent'] + 0.01*df_base['Deforestation_Percent']

df_base['Rainfall_with_scenario'] = df_base['rainfall_mm'] \
    + 0.03*df_base['Deforestation_Percent'] - 0.02*df_base['Water_Conservation_Percent']

# ------------------------------
# Step 4: Train Model 2 (Risk classifier)
# ------------------------------
# For prototyping: generate synthetic risk labels
np.random.seed(42)
df_base['FloodRisk_Label'] = np.random.choice([0, 1, 2], size=df_base.shape[0])  # 0:Low, 1:Medium, 2:High
df_base['DroughtRisk_Label'] = np.random.choice([0, 1, 2], size=df_base.shape[0])
df_base['HeatwaveRisk_Label'] = np.random.choice([0, 1, 2], size=df_base.shape[0])

risk_features = ['Temperature_with_scenario', 'CO2_with_scenario', 'Rainfall_with_scenario',
                 'Deforestation_Percent','Urban_Heat_Control_Percent','Irrigation_Efficiency_Percent',
                 'Water_Conservation_Percent','CO2_Reduction_Percent','Renewable_Energy_Percent',
                 'Cloud_Seeding_Efficiency_Percent']

risk_models = {}
risk_labels = ['Flood', 'Drought', 'Heatwave']

for label in risk_labels:
    y = df_base[f"{label}Risk_Label"]
    X = df_base[risk_features]
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    y_pred = rf.predict(X_test)
    print(f"\n📊 {label} Risk Model Classification Report:\n", classification_report(y_test, y_pred))
    
    # Save trained model in dictionary for future prediction
    risk_models[label] = rf

# ------------------------------
# Step 5: Compute Risk Scores (probabilities) and map levels
# ------------------------------
for label in risk_labels:
    df_base[f"{label}Risk_Score"] = risk_models[label].predict_proba(df_base[risk_features]).dot([0,0.5,1])  # Map 0,1,2 → score 0–1
    # Map to Low/Medium/High
    df_base[f"{label}Risk_Level"] = pd.cut(df_base[f"{label}Risk_Score"],
                                           bins=[-0.01,0.33,0.66,1],
                                           labels=['Low','Medium','High'])

# ------------------------------
# Step 6: Save final dataset
# ------------------------------
output_file = "scenario_dataset_with_risks_full.csv"
df_base.to_csv(output_file, index=False)
print(f"\n✅ Final scenario dataset with risks saved to: {output_file}")
print("Columns in final dataset:", df_base.columns.tolist())
