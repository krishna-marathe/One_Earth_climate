import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import os

# ------------------------------
# Step 1: Load base dataset
# ------------------------------
base_file = "smart_synthetic_climate_10k.csv"

if os.path.exists(base_file):
    df = pd.read_csv(base_file)
    print(f"✅ Loaded base dataset: {base_file}")
else:
    # Generate synthetic dataset if not exists
    print("⚠️ smart_synthetic_climate_10k.csv not found. Generating synthetic dataset...")
    regions = ['India-Mumbai','India-Delhi','India-Kolkata','India-Gujrat','India-Chennai','India-Kashmir',
               'USA-NewYork','China-Beijing','UK-London','UAE-Dubai','Pakistan-Islamabad','Russia-Moscow']
    data = []
    for region in regions:
        for year in range(2025, 2045):   # 20 years
            for month in range(1, 13):
                data.append([
                    len(data), year, month, region,
                    np.random.uniform(350, 450),  # co2_ppm
                    np.random.uniform(-1, 1),     # temperature_anomaly
                    np.random.uniform(0, 300),    # rainfall_mm
                    np.random.uniform(30, 90),    # humidity_pct
                    np.random.uniform(-2, 2),     # enso_index
                    np.random.uniform(0, 5),      # volcanic_activity
                    np.random.uniform(0, 5)       # ocean_heat_index
                ])
    df = pd.DataFrame(data, columns=[
        'time_index','year','month','region','co2_ppm','temperature_anomaly','rainfall_mm','humidity_pct',
        'enso_index','volcanic_activity','ocean_heat_index'
    ])
    df.to_csv(base_file, index=False)
    print(f"✅ Synthetic dataset created: {base_file}")

print("Columns:", df.columns.tolist())

# ------------------------------
# Step 2: Add slider columns
# ------------------------------
slider_cols = [
    'CO2_Reduction_Percent', 'Deforestation_Percent', 'Urban_Heat_Control_Percent',
    'Irrigation_Efficiency_Percent', 'Water_Conservation_Percent',
    'Renewable_Energy_Percent', 'Cloud_Seeding_Efficiency_Percent'
]

for col in slider_cols:
    if col not in df.columns:
        df[col] = np.random.uniform(0, 100, size=len(df))
        print(f"ℹ️ Added missing slider column '{col}' with random values.")

# ------------------------------
# Step 3: Compute scenario-adjusted values
# ------------------------------
df['Temperature_with_scenario'] = df['temperature_anomaly'] \
    - 0.02*df['CO2_Reduction_Percent'] + 0.01*df['Urban_Heat_Control_Percent']

df['CO2_with_scenario'] = df['co2_ppm'] \
    - 0.05*df['CO2_Reduction_Percent'] + 0.01*df['Deforestation_Percent']

df['Rainfall_with_scenario'] = df['rainfall_mm'] \
    + 0.03*df['Deforestation_Percent'] - 0.02*df['Cloud_Seeding_Efficiency_Percent']

# ------------------------------
# Step 4: Compute risk scores
# ------------------------------
df['FloodRisk_Score'] = 0.5*df['Rainfall_with_scenario'] + 0.3*df['Deforestation_Percent'] - 0.2*df['Water_Conservation_Percent']
df['DroughtRisk_Score'] = 0.4*df['Temperature_with_scenario'] - 0.3*df['Rainfall_with_scenario'] - 0.2*df['Irrigation_Efficiency_Percent']
df['HeatwaveRisk_Score'] = 0.6*df['Temperature_with_scenario'] - 0.4*df['Urban_Heat_Control_Percent']

# ------------------------------
# Step 5: Map scores → Low/Medium/High
# ------------------------------
def assign_risk_levels(col):
    """Assign Low/Medium/High based on 33% and 66% quantiles."""
    low_thresh = col.quantile(0.33)
    high_thresh = col.quantile(0.66)

    def mapper(x):
        if x <= low_thresh:
            return 'Low'
        elif x <= high_thresh:
            return 'Medium'
        else:
            return 'High'

    return col.apply(mapper)

df['FloodRisk_Level'] = assign_risk_levels(df['FloodRisk_Score'])
df['DroughtRisk_Level'] = assign_risk_levels(df['DroughtRisk_Score'])
df['HeatwaveRisk_Level'] = assign_risk_levels(df['HeatwaveRisk_Score'])

# ------------------------------
# Step 6: Optional - Train Random Forest models for risk prediction
# ------------------------------
# Here we create a simple example of RF for each risk
features = slider_cols + ['temperature_anomaly','co2_ppm','rainfall_mm','humidity_pct','enso_index','volcanic_activity','ocean_heat_index']
X = df[features]

risk_labels = {
    'FloodRisk_Label':'FloodRisk_Level',
    'DroughtRisk_Label':'DroughtRisk_Level',
    'HeatwaveRisk_Label':'HeatwaveRisk_Level'
}

for risk, label_col in risk_labels.items():
    y = df[label_col].map({'Low':0, 'Medium':1, 'High':2})
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    y_pred = rf.predict(X_test)
    print(f"\n📊 {risk.replace('_',' ')} Model Classification Report:")
    print(classification_report(y_test, y_pred))
    df[risk] = y  # store original label for dashboard

# ------------------------------
# Step 7: Save final scenario dataset
# ------------------------------
output_file = "scenario_dataset_with_risks_full.csv"
df.to_csv(output_file, index=False)
print(f"\n✅ Final scenario dataset with risks saved to: {output_file}")
print("Columns in final dataset:", df.columns.tolist())
