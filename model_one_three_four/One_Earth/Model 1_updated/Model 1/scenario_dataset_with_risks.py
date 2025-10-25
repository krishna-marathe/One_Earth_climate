import pandas as pd
import numpy as np
import os

# ------------------------------
# File paths
# ------------------------------
script_dir = os.path.dirname(os.path.abspath(__file__))
base_dataset_path = os.path.join(script_dir, "smart_synthetic_climate_10k.csv")
output_dataset_path = os.path.join(script_dir, "scenario_dataset_with_risks.csv")

# ------------------------------
# Load base dataset
# ------------------------------
if not os.path.exists(base_dataset_path):
    raise FileNotFoundError(f"Base dataset not found: {base_dataset_path}")

df = pd.read_csv(base_dataset_path)
print(f"✅ Loaded base dataset: {base_dataset_path}")
print(f"Columns in base dataset: {df.columns.tolist()}")

# ------------------------------
# Add missing slider columns with default/random values
# ------------------------------
slider_cols = [
    'CO2_Reduction_Percent',
    'Deforestation_Percent',
    'Urban_Heat_Control_Percent',
    'Irrigation_Efficiency_Percent',
    'Water_Conservation_Percent',
    'Renewable_Energy_Percent',
    'Cloud_Seeding_Efficiency_Percent'
]

for col in slider_cols:
    if col not in df.columns:
        df[col] = np.random.randint(0, 101, size=len(df))
        print(f"ℹ️ Added missing slider column '{col}' with random values.")

# ------------------------------
# Scenario-adjusted predictions
# ------------------------------
df['Temperature_with_scenario'] = df['temperature_anomaly'] \
    - 0.02*df['CO2_Reduction_Percent'] + 0.01*df['Urban_Heat_Control_Percent']

df['CO2_with_scenario'] = df['co2_ppm'] \
    - 0.05*df['CO2_Reduction_Percent'] + 0.01*df['Deforestation_Percent']

df['Rainfall_with_scenario'] = df['rainfall_mm'] \
    + 0.03*df['Deforestation_Percent'] - 0.02*df['Deforestation_Percent']

# ------------------------------
# Compute risk scores (rule-based)
# ------------------------------
df['FloodRisk_Score'] = 0.5*df['Rainfall_with_scenario'] + \
                        0.3*df['Deforestation_Percent'] - \
                        0.2*df['Water_Conservation_Percent']

df['DroughtRisk_Score'] = 0.4*df['Temperature_with_scenario'] - \
                          0.3*df['Rainfall_with_scenario'] - \
                          0.2*df['Irrigation_Efficiency_Percent']

df['HeatwaveRisk_Score'] = 0.6*df['Temperature_with_scenario'] - \
                           0.4*df['Urban_Heat_Control_Percent']

# ------------------------------
# Map scores → Low/Medium/High using quantiles
# ------------------------------
def map_risk(score, q66, q33):
    if score <= q33:
        return 'Low'
    elif score <= q66:
        return 'Medium'
    else:
        return 'High'

# Compute quantiles for each risk type
flood_q33, flood_q66 = df['FloodRisk_Score'].quantile([0.33, 0.66])
drought_q33, drought_q66 = df['DroughtRisk_Score'].quantile([0.33, 0.66])
heatwave_q33, heatwave_q66 = df['HeatwaveRisk_Score'].quantile([0.33, 0.66])

# Apply mapping
df['FloodRisk_Level'] = df['FloodRisk_Score'].apply(lambda x: map_risk(x, flood_q66, flood_q33))
df['DroughtRisk_Level'] = df['DroughtRisk_Score'].apply(lambda x: map_risk(x, drought_q66, drought_q33))
df['HeatwaveRisk_Level'] = df['HeatwaveRisk_Score'].apply(lambda x: map_risk(x, heatwave_q66, heatwave_q33))

# ------------------------------
# Save final dataset
# ------------------------------
df.to_csv(output_dataset_path, index=False)
print(f"✅ Scenario dataset with risks saved to: {output_dataset_path}")
print(f"Columns in final dataset: {df.columns.tolist()}")
