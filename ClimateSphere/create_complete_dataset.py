#!/usr/bin/env python3
"""
Create Complete Climate Dataset
Generates comprehensive climate data for all regions and scenarios
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os

def create_complete_climate_dataset():
    """Create a comprehensive climate dataset with all required features"""
    
    print("🌍 Creating complete climate dataset...")
    
    # Set random seed for reproducibility
    np.random.seed(42)
    
    # Extended regional data (matching frontend regions)
    regions_data = {
        'mumbai': {'temp': 28.5, 'rain': 120, 'humidity': 75, 'co2': 420, 'country': 'India'},
        'delhi': {'temp': 32, 'rain': 65, 'humidity': 60, 'co2': 450, 'country': 'India'},
        'kolkata': {'temp': 30, 'rain': 140, 'humidity': 80, 'co2': 430, 'country': 'India'},
        'gujarat': {'temp': 35, 'rain': 45, 'humidity': 55, 'co2': 440, 'country': 'India'},
        'chennai': {'temp': 31, 'rain': 95, 'humidity': 78, 'co2': 425, 'country': 'India'},
        'kashmir': {'temp': 18, 'rain': 180, 'humidity': 65, 'co2': 380, 'country': 'India'},
        'california': {'temp': 22, 'rain': 85, 'humidity': 60, 'co2': 410, 'country': 'USA'},
        'texas': {'temp': 28, 'rain': 75, 'humidity': 65, 'co2': 415, 'country': 'USA'},
        'florida': {'temp': 26, 'rain': 130, 'humidity': 80, 'co2': 405, 'country': 'USA'},
        'newyork': {'temp': 15, 'rain': 110, 'humidity': 70, 'co2': 400, 'country': 'USA'},
        'beijing': {'temp': 14, 'rain': 60, 'humidity': 55, 'co2': 480, 'country': 'China'},
        'shanghai': {'temp': 18, 'rain': 115, 'humidity': 75, 'co2': 470, 'country': 'China'},
        'guangzhou': {'temp': 24, 'rain': 165, 'humidity': 80, 'co2': 460, 'country': 'China'},
        'london': {'temp': 12, 'rain': 150, 'humidity': 75, 'co2': 390, 'country': 'UK'},
        'manchester': {'temp': 10, 'rain': 170, 'humidity': 80, 'co2': 385, 'country': 'UK'},
        'edinburgh': {'temp': 9, 'rain': 160, 'humidity': 78, 'co2': 380, 'country': 'UK'},
        'dubai': {'temp': 38, 'rain': 15, 'humidity': 45, 'co2': 450, 'country': 'UAE'},
        'abudhabi': {'temp': 37, 'rain': 12, 'humidity': 50, 'co2': 445, 'country': 'UAE'},
        'karachi': {'temp': 30, 'rain': 35, 'humidity': 70, 'co2': 435, 'country': 'Pakistan'},
        'lahore': {'temp': 28, 'rain': 55, 'humidity': 65, 'co2': 440, 'country': 'Pakistan'},
        'islamabad': {'temp': 25, 'rain': 85, 'humidity': 60, 'co2': 425, 'country': 'Pakistan'},
        'moscow': {'temp': 8, 'rain': 90, 'humidity': 70, 'co2': 420, 'country': 'Russia'},
        'stpetersburg': {'temp': 6, 'rain': 95, 'humidity': 75, 'co2': 415, 'country': 'Russia'},
        'novosibirsk': {'temp': 2, 'rain': 70, 'humidity': 65, 'co2': 410, 'country': 'Russia'}
    }
    
    # Generate comprehensive dataset
    n_samples = 5000  # Increased sample size
    data = []
    
    print(f"Generating {n_samples} climate records for {len(regions_data)} regions...")
    
    for i in range(n_samples):
        # Select random region
        region = np.random.choice(list(regions_data.keys()))
        base_data = regions_data[region]
        
        # Generate date (last 10 years for more data)
        days_back = np.random.randint(0, 365 * 10)
        date = datetime.now() - timedelta(days=days_back)
        
        # Seasonal variations
        month = date.month
        day_of_year = date.timetuple().tm_yday
        
        # Temperature seasonal pattern
        seasonal_temp = 8 * np.sin(2 * np.pi * (day_of_year - 80) / 365)
        
        # Rainfall seasonal pattern (varies by region)
        if base_data['country'] in ['India']:
            # Monsoon pattern
            monsoon_factor = 2 if 6 <= month <= 9 else 0.3
            seasonal_rain = base_data['rain'] * monsoon_factor * np.sin(2 * np.pi * (day_of_year - 150) / 365)
        else:
            # General seasonal pattern
            seasonal_rain = base_data['rain'] * 0.5 * np.sin(2 * np.pi * (day_of_year - 30) / 365)
        
        # Add climate change trend (gradual increase over years)
        years_from_2015 = (date.year - 2015)
        climate_trend_temp = years_from_2015 * 0.1  # 0.1°C per year
        climate_trend_co2 = years_from_2015 * 2.5   # 2.5 ppm per year
        
        # Random variations
        temp_noise = np.random.normal(0, 3)
        rain_noise = np.random.normal(0, 20)
        humidity_noise = np.random.normal(0, 5)
        co2_noise = np.random.normal(0, 10)
        
        # Calculate final values
        temperature = base_data['temp'] + seasonal_temp + climate_trend_temp + temp_noise
        rainfall = max(0, base_data['rain'] + seasonal_rain + rain_noise)
        humidity = max(10, min(100, base_data['humidity'] + humidity_noise))
        co2_level = max(300, base_data['co2'] + climate_trend_co2 + co2_noise)
        
        # Calculate derived features for ML models
        soil_moisture = max(0, min(100, humidity * 0.7 + rainfall * 0.08 + np.random.normal(0, 5)))
        wind_speed = max(0, np.random.normal(12, 4))
        evaporation = max(0, temperature * 0.25 + wind_speed * 0.15 + np.random.normal(0, 1))
        rainfall_lag = rainfall * np.random.uniform(0.6, 0.95)
        
        # Additional climate indicators
        heat_index = temperature + (humidity / 100) * 5
        drought_index = max(0, 100 - rainfall - (humidity / 2))
        flood_potential = rainfall + (temperature - 20) * 2 if temperature > 20 else rainfall
        
        # Calculate risk labels based on realistic thresholds
        flood_risk = 1 if (rainfall > 150 and temperature > 25) or flood_potential > 180 else 0
        drought_risk = 1 if (rainfall < 30 and temperature > 32) or drought_index > 70 else 0
        heatwave_risk = 1 if (temperature > 38 and humidity < 40) or heat_index > 45 else 0
        
        # Extreme weather events (rare but important)
        extreme_event = 0
        if np.random.random() < 0.02:  # 2% chance of extreme event
            if np.random.random() < 0.4:  # 40% flood
                rainfall *= 3
                flood_risk = 1
                extreme_event = 1
            elif np.random.random() < 0.6:  # 60% of remaining = drought
                rainfall *= 0.1
                temperature += 5
                drought_risk = 1
                extreme_event = 2
            else:  # Heatwave
                temperature += 8
                humidity *= 0.7
                heatwave_risk = 1
                extreme_event = 3
        
        # Add record
        record = {
            'Date': date.strftime('%Y-%m-%d'),
            'Region': region,
            'Country': base_data['country'],
            'Rainfall_mm': round(rainfall, 2),
            'Temperature_C': round(temperature, 2),
            'Soil_Moisture': round(soil_moisture, 2),
            'Humidity_%': round(humidity, 2),
            'Wind_Speed_mps': round(wind_speed, 2),
            'CO2_ppm': round(co2_level, 2),
            'Evaporation_mm_day': round(evaporation, 2),
            'Rainfall_Lag_mm': round(rainfall_lag, 2),
            'Heat_Index': round(heat_index, 2),
            'Drought_Index': round(drought_index, 2),
            'Flood_Potential': round(flood_potential, 2),
            'Extreme_Event': extreme_event,
            'Flood_Risk': flood_risk,
            'Drought_Risk': drought_risk,
            'Heatwave_Risk': heatwave_risk,
            'Month': month,
            'Year': date.year,
            'Season': get_season(month)
        }
        
        data.append(record)
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Add additional derived features
    df['Temperature_Anomaly'] = df.groupby('Region')['Temperature_C'].transform(lambda x: x - x.mean())
    df['Rainfall_Anomaly'] = df.groupby('Region')['Rainfall_mm'].transform(lambda x: x - x.mean())
    df['Climate_Risk_Score'] = (df['Flood_Risk'] + df['Drought_Risk'] + df['Heatwave_Risk']) * 100 / 3
    
    # Save main dataset
    output_file = 'complete_climate_dataset.csv'
    df.to_csv(output_file, index=False)
    
    print(f"✅ Generated {len(data)} comprehensive climate records")
    print(f"📁 Dataset saved as: {output_file}")
    
    # Generate summary statistics
    print_dataset_summary(df)
    
    # Create regional summary
    create_regional_summary(df, regions_data)
    
    # Create time series data for predictions
    create_time_series_data(df)
    
    return df

def get_season(month):
    """Get season from month"""
    if month in [12, 1, 2]:
        return 'Winter'
    elif month in [3, 4, 5]:
        return 'Spring'
    elif month in [6, 7, 8]:
        return 'Summer'
    else:
        return 'Autumn'

def print_dataset_summary(df):
    """Print comprehensive dataset summary"""
    print("\n📊 Complete Dataset Summary:")
    print(f"Total Records: {len(df):,}")
    print(f"Regions: {df['Region'].nunique()}")
    print(f"Countries: {df['Country'].nunique()}")
    print(f"Date Range: {df['Date'].min()} to {df['Date'].max()}")
    print(f"Years Covered: {df['Year'].max() - df['Year'].min() + 1}")
    
    print(f"\n🌡️ Temperature Statistics:")
    print(f"Range: {df['Temperature_C'].min():.1f}°C to {df['Temperature_C'].max():.1f}°C")
    print(f"Mean: {df['Temperature_C'].mean():.1f}°C")
    print(f"Std: {df['Temperature_C'].std():.1f}°C")
    
    print(f"\n🌧️ Rainfall Statistics:")
    print(f"Range: {df['Rainfall_mm'].min():.1f}mm to {df['Rainfall_mm'].max():.1f}mm")
    print(f"Mean: {df['Rainfall_mm'].mean():.1f}mm")
    print(f"Std: {df['Rainfall_mm'].std():.1f}mm")
    
    print(f"\n💨 CO2 Statistics:")
    print(f"Range: {df['CO2_ppm'].min():.1f}ppm to {df['CO2_ppm'].max():.1f}ppm")
    print(f"Mean: {df['CO2_ppm'].mean():.1f}ppm")
    print(f"Std: {df['CO2_ppm'].std():.1f}ppm")
    
    print(f"\n⚠️ Risk Distribution:")
    print(f"Flood Risk: {df['Flood_Risk'].sum():,} events ({df['Flood_Risk'].mean()*100:.1f}%)")
    print(f"Drought Risk: {df['Drought_Risk'].sum():,} events ({df['Drought_Risk'].mean()*100:.1f}%)")
    print(f"Heatwave Risk: {df['Heatwave_Risk'].sum():,} events ({df['Heatwave_Risk'].mean()*100:.1f}%)")
    print(f"Extreme Events: {(df['Extreme_Event'] > 0).sum():,} events ({(df['Extreme_Event'] > 0).mean()*100:.1f}%)")

def create_regional_summary(df, regions_data):
    """Create regional climate summary"""
    print("\n🌍 Creating regional summary...")
    
    regional_summary = df.groupby('Region').agg({
        'Temperature_C': ['mean', 'min', 'max', 'std'],
        'Rainfall_mm': ['mean', 'min', 'max', 'std'],
        'Humidity_%': ['mean', 'min', 'max'],
        'CO2_ppm': ['mean', 'min', 'max'],
        'Flood_Risk': 'sum',
        'Drought_Risk': 'sum',
        'Heatwave_Risk': 'sum',
        'Date': 'count'
    }).round(2)
    
    regional_summary.columns = ['_'.join(col).strip() for col in regional_summary.columns]
    regional_summary = regional_summary.reset_index()
    
    # Save regional summary
    regional_summary.to_csv('regional_climate_summary.csv', index=False)
    
    # Create JSON for API
    regional_json = {}
    for region in regions_data.keys():
        region_data = df[df['Region'] == region]
        if len(region_data) > 0:
            regional_json[region] = {
                'temperature': float(region_data['Temperature_C'].mean()),
                'rainfall': float(region_data['Rainfall_mm'].mean()),
                'humidity': float(region_data['Humidity_%'].mean()),
                'co2_level': float(region_data['CO2_ppm'].mean()),
                'flood_events': int(region_data['Flood_Risk'].sum()),
                'drought_events': int(region_data['Drought_Risk'].sum()),
                'heatwave_events': int(region_data['Heatwave_Risk'].sum()),
                'total_records': int(len(region_data))
            }
    
    with open('regional_climate_data.json', 'w') as f:
        json.dump(regional_json, f, indent=2)
    
    print("📁 Regional summary saved as: regional_climate_summary.csv")
    print("📁 Regional JSON saved as: regional_climate_data.json")

def create_time_series_data(df):
    """Create time series data for predictions"""
    print("\n📈 Creating time series data...")
    
    # Monthly aggregates by region
    df['YearMonth'] = pd.to_datetime(df['Date']).dt.to_period('M')
    
    monthly_data = df.groupby(['Region', 'YearMonth']).agg({
        'Temperature_C': 'mean',
        'Rainfall_mm': 'sum',
        'Humidity_%': 'mean',
        'CO2_ppm': 'mean',
        'Flood_Risk': 'max',
        'Drought_Risk': 'max',
        'Heatwave_Risk': 'max'
    }).reset_index()
    
    monthly_data['Date'] = monthly_data['YearMonth'].astype(str)
    monthly_data = monthly_data.drop('YearMonth', axis=1)
    
    # Save time series data
    monthly_data.to_csv('monthly_climate_timeseries.csv', index=False)
    print("📁 Time series data saved as: monthly_climate_timeseries.csv")

if __name__ == "__main__":
    try:
        # Create complete dataset
        df = create_complete_climate_dataset()
        
        print("\n🎉 Complete dataset creation finished!")
        print("\nFiles created:")
        print("- complete_climate_dataset.csv (Main dataset)")
        print("- regional_climate_summary.csv (Regional statistics)")
        print("- regional_climate_data.json (API data)")
        print("- monthly_climate_timeseries.csv (Time series data)")
        
        print(f"\n📊 Dataset ready for ML training with {len(df):,} records!")
        
    except Exception as e:
        print(f"❌ Error creating dataset: {e}")
        import traceback
        traceback.print_exc()