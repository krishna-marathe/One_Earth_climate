import pandas as pd
import numpy as np
import os

# -----------------------------
# CONFIG
# -----------------------------
base_dataset_path = "smart_synthetic_climate_10k.csv"  # base Model 1 dataset
output_dataset_path = "synthetic_scenario_dataset.csv"  # new dataset

# Regions and cities for dropdown
regions_cities = {
    "India": ["Mumbai", "Delhi", "Kolkata", "Chennai", "Gujarat", "Kashmir"],
    "USA": ["California", "New York", "Texas", "Florida", "Illinois"],
    "China": ["Beijing", "Shanghai", "Guangzhou"],
    "UK": ["London", "Manchester", "Edinburgh"],
    "UAE": ["Dubai", "Abu Dhabi"],
    "Pakistan": ["Karachi", "Lahore"],
    "Russia": ["Moscow", "St. Petersburg"]
}

# Years & months
years = list(range(2025, 2046))  # 2025 → 2045
months = list(range(1, 13))      # 1 → 12

# Slider ranges
slider_columns = [
    "CO2_Reduction_Percent",
    "Deforestation_Reduction_Percent",
    "Renewable_Energy_Adoption_Percent",
    "Urban_Heat_Control_Percent",
    "Industrial_Emission_Reduction_Percent",
    "Forest_Expansion_Percent",
    "Water_Recycling_Efficiency_Percent",
    "Irrigation_Efficiency_Percent",
    "Cloud_Seeding_Efficiency_Percent",
    "Wildlife_Protection_Percent",
    "Industrial_Expansion_Percent",
    "Reforestation_Percent",
    "Water_Conservation_Percent"
]

# -----------------------------
# LOAD BASE DATA
# -----------------------------
df_base = pd.read_csv(base_dataset_path)

# For simplicity, pick columns from base dataset
# Ensure it has 'Pred_Temperature_C', 'Pred_CO2_ppm', 'Pred_Rainfall_mm'
if not all(col in df_base.columns for col in ["Pred_Temperature_C", "Pred_CO2_ppm", "Pred_Rainfall_mm"]):
    raise ValueError("Base dataset must contain 'Pred_Temperature_C', 'Pred_CO2_ppm', 'Pred_Rainfall_mm'")

# -----------------------------
# GENERATE SYNTHETIC SCENARIO DATA
# -----------------------------
rows = []

for country, cities in regions_cities.items():
    for city in cities:
        for year in years:
            for month in months:
                # pick random base row from Model 1 dataset
                base_row = df_base.sample(1).iloc[0]

                # random slider values
                sliders = {col: np.random.uniform(0, 100) for col in slider_columns}

                # compute scenario impact
                ΔTemp = -0.02 * sliders["CO2_Reduction_Percent"] + 0.01 * sliders["Urban_Heat_Control_Percent"]
                ΔCO2 = -0.05 * sliders["CO2_Reduction_Percent"] + 0.01 * sliders["Forest_Expansion_Percent"]
                ΔRainfall = 0.03 * sliders["Reforestation_Percent"] - 0.02 * sliders["Deforestation_Reduction_Percent"]

                # predicted outputs
                Pred_Temperature_C = base_row["Pred_Temperature_C"] + ΔTemp
                Pred_CO2_ppm = base_row["Pred_CO2_ppm"] + ΔCO2
                Pred_Rainfall_mm = base_row["Pred_Rainfall_mm"] + ΔRainfall

                row = {
                    "Country": country,
                    "State/City": city,
                    "Year": year,
                    "Month": month,
                    **sliders,
                    "Pred_Temperature_C": Pred_Temperature_C,
                    "Pred_CO2_ppm": Pred_CO2_ppm,
                    "Pred_Rainfall_mm": Pred_Rainfall_mm,
                }

                rows.append(row)

# create dataframe
df_synthetic = pd.DataFrame(rows)

# save
df_synthetic.to_csv(output_dataset_path, index=False)
print(f"✅ Synthetic scenario dataset saved at {output_dataset_path}")
print(f"Shape: {df_synthetic.shape}")
