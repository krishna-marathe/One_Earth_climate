# ------------------------------------------------------------
# Perfect Realistic Synthetic Climate Risk Dataset Generator (1920–2024)
# Model 2: Risk Probability (Flood, Drought, Heatwave)
# Author: Krishna Marathe
# ------------------------------------------------------------

import numpy as np
import pandas as pd
import random

# -----------------------------
# 1️⃣ Base Configurations
# -----------------------------
np.random.seed(42)
random.seed(42)

countries = [
    'India', 'USA', 'China', 'Brazil', 'Australia', 'Russia',
    'UK', 'France', 'Germany', 'South Africa', 'Japan'
]

country_coords = {
    'India': [20.59, 78.96],
    'USA': [37.09, -95.71],
    'China': [35.86, 104.19],
    'Brazil': [-14.23, -51.92],
    'Australia': [-25.27, 133.77],
    'Russia': [61.52, 105.32],
    'UK': [55.37, -3.43],
    'France': [46.23, 2.21],
    'Germany': [51.17, 10.45],
    'South Africa': [-30.56, 22.94],
    'Japan': [36.20, 138.25]
}

country_states_cities = {
    'India': ['Maharashtra-Mumbai', 'Karnataka-Bangalore', 'Delhi-Delhi', 'Tamil Nadu-Chennai', 'West Bengal-Kolkata'],
    'USA': ['California-Los Angeles', 'Texas-Houston', 'New York-New York City', 'Florida-Miami', 'Illinois-Chicago'],
    'China': ['Beijing-Beijing', 'Shanghai-Shanghai', 'Guangdong-Guangzhou', 'Sichuan-Chengdu', 'Zhejiang-Hangzhou'],
    'Brazil': ['Sao Paulo-Sao Paulo', 'Rio de Janeiro-Rio', 'Bahia-Salvador', 'Parana-Curitiba', 'Minas Gerais-Belo Horizonte'],
    'Australia': ['New South Wales-Sydney', 'Victoria-Melbourne', 'Queensland-Brisbane', 'Western Australia-Perth', 'South Australia-Adelaide'],
    'Russia': ['Moscow-Moscow', 'Saint Petersburg-Saint Petersburg', 'Novosibirsk-Novosibirsk', 'Yekaterinburg-Yekaterinburg', 'Kazan-Kazan'],
    'UK': ['England-London', 'Scotland-Edinburgh', 'Wales-Cardiff', 'Northern Ireland-Belfast', 'Greater London-London'],
    'France': ['Île-de-France-Paris', 'Provence-Marseille', 'Auvergne-Rhône-Alpes-Lyon', 'Nouvelle-Aquitaine-Bordeaux', 'Occitanie-Toulouse'],
    'Germany': ['Bavaria-Munich', 'Berlin-Berlin', 'North Rhine-Westphalia-Cologne', 'Hesse-Frankfurt', 'Saxony-Dresden'],
    'South Africa': ['Gauteng-Johannesburg', 'Western Cape-Cape Town', 'KwaZulu-Natal-Durban', 'Eastern Cape-Port Elizabeth', 'Free State-Bloemfontein'],
    'Japan': ['Tokyo-Tokyo', 'Osaka-Osaka', 'Hokkaido-Sapporo', 'Fukuoka-Fukuoka', 'Aichi-Nagoya']
}

years = list(range(1920, 2025))

# -----------------------------
# 2️⃣ Risk Classification
# -----------------------------
def classify_risk(score):
    if score < 35:
        return 'Low'
    elif score < 70:
        return 'Medium'
    else:
        return 'High'

# -----------------------------
# 3️⃣ Generate Realistic Synthetic Data
# -----------------------------
data = []

for country in countries:
    base_lat, base_lon = country_coords[country]
    states_cities = country_states_cities[country]

    for year in years:
        for region in states_cities:
            # Regional coordinates with slight variation
            lat = base_lat + np.random.uniform(-0.5, 0.5)
            lon = base_lon + np.random.uniform(-0.5, 0.5)

            # Climate features with realistic trends
            temperature = np.random.normal(20 + 0.03*(year-1920), 8)  # warming trend
            rainfall = np.random.normal(150, 60)
            rainfall = max(rainfall, 10)
            soil_moisture = np.clip(0.05 + 0.005*rainfall + np.random.normal(0,0.05), 0.05, 0.7)
            humidity = np.clip(30 + 0.2*rainfall + np.random.normal(0,10), 20, 95)
            wind_speed = np.clip(np.random.normal(10,5), 0, 25)
            co2_level = 280 + 0.5*(year-1920) + np.random.normal(0,5)
            evaporation = max(np.random.normal(5,2), 0.5)
            rainfall_lag = rainfall - np.random.normal(0, 15)

            # Introduce region-specific variation factors
            region_factor = np.random.uniform(0.8, 1.5)
            year_factor = 1 + 0.005*(year-1920)

            # Risk Scores (Realistic fluctuations)
            flood_risk = np.clip((rainfall * soil_moisture / (evaporation+0.1)) * region_factor + np.random.normal(0,5), 0, 100)
            drought_risk = np.clip((temperature / (rainfall+1) * (1-soil_moisture) * 10) * region_factor + np.random.normal(0,5), 0, 100)
            heatwave_risk = np.clip((temperature * (1-humidity/100) * (co2_level/400) * 5) * region_factor * year_factor + np.random.normal(0,5), 0, 100)

            data.append([
                country, region, year, lat, lon,
                round(rainfall,2), round(temperature,2), round(soil_moisture,3),
                round(humidity,2), round(wind_speed,2), round(co2_level,2),
                round(evaporation,2), round(rainfall_lag,2),
                round(flood_risk,2), classify_risk(flood_risk),
                round(drought_risk,2), classify_risk(drought_risk),
                round(heatwave_risk,2), classify_risk(heatwave_risk)
            ])

# -----------------------------
# 4️⃣ Columns
# -----------------------------
columns = [
    'Country', 'Region', 'Year', 'Latitude', 'Longitude',
    'Rainfall_mm', 'Temperature_C', 'Soil_Moisture', 'Humidity_%', 'Wind_Speed_mps', 'CO2_ppm', 'Evaporation_mm_day', 'Rainfall_Lag_mm',
    'FloodRisk_Score', 'FloodRisk_Level',
    'DroughtRisk_Score', 'DroughtRisk_Level',
    'HeatwaveRisk_Score', 'HeatwaveRisk_Level'
]

df = pd.DataFrame(data, columns=columns)

# -----------------------------
# 5️⃣ Save Dataset
# -----------------------------
df.to_csv("perfect_realistic_climate_risk.csv", index=False)
print("✅ Perfect dataset saved as 'perfect_realistic_climate_risk.csv'")
print(df.head())
