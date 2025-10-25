import pandas as pd

# Load the cleaned dataset
df = pd.read_csv("perfect_realistic_climate_risk_cleaned.csv")

# Basic info
print(df.info())
print(df.describe())

# Check risk levels distribution
print(df['FloodRisk_Level'].value_counts())
print(df['DroughtRisk_Level'].value_counts())
print(df['HeatwaveRisk_Level'].value_counts())
