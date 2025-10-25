#!/usr/bin/env python3
"""
Complete ML Model Training System
Trains all climate prediction models with the comprehensive dataset
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

def train_climate_models():
    """Train all climate prediction models"""
    
    print("🤖 Starting Complete ML Model Training...")
    
    # Load the complete dataset
    try:
        df = pd.read_csv('complete_climate_dataset.csv')
        print(f"✅ Loaded dataset with {len(df)} records")
    except FileNotFoundError:
        print("❌ Dataset not found. Creating it first...")
        os.system('python create_complete_dataset.py')
        df = pd.read_csv('complete_climate_dataset.csv')
    
    # Prepare features for ML models
    feature_columns = [
        'Rainfall_mm', 'Temperature_C', 'Soil_Moisture', 'Humidity_%',
        'Wind_Speed_mps', 'CO2_ppm', 'Evaporation_mm_day', 'Rainfall_Lag_mm',
        'Heat_Index', 'Drought_Index'
    ]
    
    X = df[feature_columns]
    
    # Train individual models
    models = {}
    
    # 1. Flood Risk Model
    print("\n🌊 Training Flood Risk Model...")
    y_flood = df['Flood_Risk']
    models['flood'] = train_individual_model(X, y_flood, 'FloodRisk_Model.pkl')
    
    # 2. Drought Risk Model  
    print("\n🏜️ Training Drought Risk Model...")
    y_drought = df['Drought_Risk']
    models['drought'] = train_individual_model(X, y_drought, 'DroughtRisk_Model.pkl')
    
    # 3. Heatwave Risk Model
    print("\n🔥 Training Heatwave Risk Model...")
    y_heatwave = df['Heatwave_Risk']
    models['heatwave'] = train_individual_model(X, y_heatwave, 'HeatwaveRisk_Model.pkl')
    
    print("\n✅ All models trained successfully!")
    return models

def train_individual_model(X, y, model_filename):
    """Train an individual model"""
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Model Accuracy: {accuracy:.3f}")
    
    # Save model and scaler
    joblib.dump(model, model_filename)
    scaler_filename = model_filename.replace('.pkl', '_scaler.pkl')
    joblib.dump(scaler, scaler_filename)
    
    print(f"✅ Saved: {model_filename}")
    
    return {'model': model, 'scaler': scaler, 'accuracy': accuracy}

if __name__ == "__main__":
    train_climate_models()