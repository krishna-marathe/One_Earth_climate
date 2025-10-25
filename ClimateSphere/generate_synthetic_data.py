#!/usr/bin/env python3
"""
Generate Synthetic Climate Dataset
Creates realistic climate data for ML model training and predictions
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os

def generate_synthetic_climate_data():
    """Generate synthetic climate dataset with realistic patterns"""
    
    print("🌍 Generating synthetic climate dataset...")
    
    # Set random seed for reproducibility
    np.random.seed(42)
    
    # Number of samples to generate
    n_samples = 2000
    
    # Regional climate parameters (based on real data)
    regions_data = {
        'mumbai': {'temp': 28.5, 'rain': 120, 'humidity': 75, 'co2': 420},
        'delhi': {'temp': 32, 'rain': 65, 'humidity': 60, 'co2': 450},
        'kolkata': {'temp': 30, 'rain': 140, 'humidity': 80, 'co2': 430},
        'gujarat': {'temp': 35, 'rain': 45, 'humidity': 55, 'co2': 440},
        'chennai': {'temp': 31, 'rain': 95, 'humidity': 78, 'co2': 425},
        'kashmir': {'temp': 18, 'rain': 180, 'humidity': 65, 'co2': 380},
        'california': {'temp': 22, 'rain': 85, 'humidity': 60, 'co2': 410},
        'texas': {'temp': 28, 'rain': 75, 'humidity': 65, 'co2': 415},
        'florida': {'temp': 26, 'rain': 130, 'humidity': 80, 'co2': 405},
        'newyork': {'temp': 15, 'rain': 110, 'humidity': 70, 'co2': 400},
        'beijing': {'temp': 14, 'rain': 60, 'humidity': 55, 'co2': 480},
        'shanghai': {'temp': 18, 'rain': 115, 'humidity': 75, 'co2': 470},
        'london': {'temp': 12, 'rain': 150, 'humidity': 75, 'co2': 390},
        'dubai': {'temp': 38, 'rain': 15, 'humidity': 45, 'co2': 450},
        'karachi': {'temp': 30, 'rain': 35, 'humidity': 70, 'co2': 435},
        'moscow': {'temp': 8, 'rain': 90, 'humidity': 70, 'co2': 420}
    }
    
    regions = list(regions_data.keys())
    
    # Generate synthetic data
    data = []
    
    for i in range(n_samples):
        # Select random region
        region = np.random.choice(regions)
        base_data = regions_data[region]
        
        # Generate date (last 5 years)
        days_back = np.random.randint(0, 365 * 5)
        date = datetime.now() - timedelta(days=days_back)
        
        # Add seasonal variations
        month = date.month
        seasonal_temp_adj = 5 * np.sin(2 * np.pi * (month - 3) / 12)  # Peak in summer
        seasonal_rain_adj = 30 * np.sin(2 * np.pi * (month - 6) / 12)  # Peak in monsoon
        
        # Add random variations
        temp_noise = np.random.normal(0, 2.5)
        rain_noise = np.random.normal(0, 15)
        humidity_noise = np.random.normal(0, 4)
        co2_noise = np.random.normal(0, 8)
        
        # Calculate final values
        temperature = base_data['temp'] + seasonal_temp_adj + temp_noise
        rainfall = max(0, base_data['rain'] + seasonal_rain_adj + rain_noise)
        humidity = max(10, min(100, base_data['humidity'] + humidity_noise))
        co2_level = max(300, base_data['co2'] + co2_noise)
        
        # Calculate derived features
        soil_moisture = max(0, min(100, humidity * 0.8 + rainfall * 0.1))
        wind_speed = max(0, np.random.normal(15, 5))
        evaporation = max(0, temperature * 0.3 + wind_speed * 0.1)
        rainfall_lag = rainfall * np.random.uniform(0.7, 0.9)
        
        # Calculate risk labels (for ML training)
        flood_risk = 1 if (rainfall > 150 and temperature > 25) else 0
        drought_risk = 1 if (rainfall < 50 and temperature > 30) else 0
        heatwave_risk = 1 if (temperature > 35 and humidity < 50) else 0
        
        # Add record
        data.append({
            'Date': date.strftime('%Y-%m-%d'),
            'Region': region,
            'Rainfall_mm': round(rainfall, 2),
            'Temperature_C': round(temperature, 2),
            'Soil_Moisture': round(soil_moisture, 2),
            'Humidity_%': round(humidity, 2),
            'Wind_Speed_mps': round(wind_speed, 2),
            'CO2_ppm': round(co2_level, 2),
            'Evaporation_mm_day': round(evaporation, 2),
            'Rainfall_Lag_mm': round(rainfall_lag, 2),
            'Flood_Risk': flood_risk,
            'Drought_Risk': drought_risk,
            'Heatwave_Risk': heatwave_risk
        })
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Save to CSV
    output_file = 'synthetic_climate_dataset.csv'
    df.to_csv(output_file, index=False)
    
    print(f"✅ Generated {len(data)} synthetic climate records")
    print(f"📁 Dataset saved as: {output_file}")
    
    # Generate summary statistics
    print("\n📊 Dataset Summary:")
    print(f"Regions: {len(regions)}")
    print(f"Date range: {df['Date'].min()} to {df['Date'].max()}")
    print(f"Temperature range: {df['Temperature_C'].min():.1f}°C to {df['Temperature_C'].max():.1f}°C")
    print(f"Rainfall range: {df['Rainfall_mm'].min():.1f}mm to {df['Rainfall_mm'].max():.1f}mm")
    print(f"CO2 range: {df['CO2_ppm'].min():.1f}ppm to {df['CO2_ppm'].max():.1f}ppm")
    
    # Risk distribution
    print(f"\n⚠️ Risk Distribution:")
    print(f"Flood Risk: {df['Flood_Risk'].sum()} records ({df['Flood_Risk'].mean()*100:.1f}%)")
    print(f"Drought Risk: {df['Drought_Risk'].sum()} records ({df['Drought_Risk'].mean()*100:.1f}%)")
    print(f"Heatwave Risk: {df['Heatwave_Risk'].sum()} records ({df['Heatwave_Risk'].mean()*100:.1f}%)")
    
    return df

def create_regional_data_json():
    """Create regional data JSON for API"""
    
    regional_data = {
        'mumbai': {'temperature': 28.5, 'rainfall': 120, 'humidity': 75, 'co2_level': 420},
        'delhi': {'temperature': 32, 'rainfall': 65, 'humidity': 60, 'co2_level': 450},
        'kolkata': {'temperature': 30, 'rainfall': 140, 'humidity': 80, 'co2_level': 430},
        'gujarat': {'temperature': 35, 'rainfall': 45, 'humidity': 55, 'co2_level': 440},
        'chennai': {'temperature': 31, 'rainfall': 95, 'humidity': 78, 'co2_level': 425},
        'kashmir': {'temperature': 18, 'rainfall': 180, 'humidity': 65, 'co2_level': 380},
        'california': {'temperature': 22, 'rainfall': 85, 'humidity': 60, 'co2_level': 410},
        'texas': {'temperature': 28, 'rainfall': 75, 'humidity': 65, 'co2_level': 415},
        'florida': {'temperature': 26, 'rainfall': 130, 'humidity': 80, 'co2_level': 405},
        'newyork': {'temperature': 15, 'rainfall': 110, 'humidity': 70, 'co2_level': 400},
        'beijing': {'temperature': 14, 'rainfall': 60, 'humidity': 55, 'co2_level': 480},
        'shanghai': {'temperature': 18, 'rainfall': 115, 'humidity': 75, 'co2_level': 470},
        'london': {'temperature': 12, 'rainfall': 150, 'humidity': 75, 'co2_level': 390},
        'dubai': {'temperature': 38, 'rainfall': 15, 'humidity': 45, 'co2_level': 450},
        'karachi': {'temperature': 30, 'rainfall': 35, 'humidity': 70, 'co2_level': 435},
        'moscow': {'temperature': 8, 'rainfall': 90, 'humidity': 70, 'co2_level': 420}
    }
    
    with open('regional_climate_data.json', 'w') as f:
        json.dump(regional_data, f, indent=2)
    
    print("📁 Regional data saved as: regional_climate_data.json")

if __name__ == "__main__":
    try:
        # Generate synthetic dataset
        df = generate_synthetic_climate_data()
        
        # Create regional data JSON
        create_regional_data_json()
        
        print("\n🎉 Synthetic data generation completed successfully!")
        print("Files created:")
        print("- synthetic_climate_dataset.csv (ML training data)")
        print("- regional_climate_data.json (API reference data)")
        
    except Exception as e:
        print(f"❌ Error generating synthetic data: {e}")
        import traceback
        traceback.print_exc()