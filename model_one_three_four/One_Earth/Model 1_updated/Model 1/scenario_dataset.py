import os
import pandas as pd

# Paths
script_dir = os.path.dirname(os.path.abspath(__file__))
base_dataset_path = os.path.join(script_dir, "smart_synthetic_climate_10k.csv")
scenario_dataset_path = os.path.join(script_dir, "scenario_dataset_with_sliders.csv")

# Check if base dataset exists
if not os.path.exists(base_dataset_path):
    print(f"⚠️ Base dataset not found: {base_dataset_path}")
    exit(1)

# Load base dataset
print(f"✅ Loaded base dataset: {base_dataset_path}")
df_base = pd.read_csv(base_dataset_path)
print(f"Columns in base dataset: {df_base.columns.tolist()}")

# Update required columns to match actual dataset
required_cols = ['temperature_anomaly', 'co2_ppm', 'rainfall_mm']

for col in required_cols:
    if col not in df_base.columns:
        raise ValueError(f"Column missing in base dataset: {col}")

# Add default slider-adjusted parameters if not already present
slider_cols = [
    'CO2_Reduction_Percent',
    'Deforestation_Percent',
    'Renewable_Energy_Percent',
    'Urban_Heat_Control_Percent',
    'Water_Conservation_Percent',
    'Irrigation_Efficiency_Percent'
]

for col in slider_cols:
    if col not in df_base.columns:
        df_base[col] = 0.0  # default 0% change

# Scenario-adjusted calculations
df_base['Temperature_with_scenario'] = df_base['temperature_anomaly'] \
    - 0.02*df_base['CO2_Reduction_Percent'] + 0.01*df_base['Urban_Heat_Control_Percent']

df_base['CO2_with_scenario'] = df_base['co2_ppm'] \
    - 0.05*df_base['CO2_Reduction_Percent'] + 0.01*df_base['Deforestation_Percent']

df_base['Rainfall_with_scenario'] = df_base['rainfall_mm'] \
    + 0.03*df_base['Deforestation_Percent'] - 0.02*df_base['Deforestation_Percent']

# Save scenario dataset
df_base.to_csv(scenario_dataset_path, index=False)
print(f"✅ Scenario dataset generated and saved: {scenario_dataset_path}")
print(f"Columns in scenario dataset: {df_base.columns.tolist()}")
