#!/usr/bin/env python3
"""
ClimateSphere Model Testing Script
Tests all ML models and API endpoints
"""
import requests
import json
from datetime import datetime

def test_endpoint(name, url, method='GET', data=None):
    """Test an API endpoint"""
    try:
        if method == 'POST':
            response = requests.post(url, json=data, timeout=10)
        else:
            response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ {name}: SUCCESS")
            return True, result
        else:
            print(f"❌ {name}: FAILED ({response.status_code})")
            return False, None
    except Exception as e:
        print(f"❌ {name}: ERROR - {str(e)}")
        return False, None

def main():
    print("🧪 ClimateSphere Model Testing")
    print("=" * 50)
    print(f"⏰ Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test ML API Health
    print("🔍 Testing ML API Health...")
    success, health_data = test_endpoint("ML API Health", "http://localhost:5000/health")
    if success and health_data:
        print(f"   📊 Models loaded: {', '.join(health_data.get('models_loaded', []))}")
        print(f"   📈 Status: {health_data.get('status', 'unknown')}")
    print()
    
    # Test Risk Prediction
    print("🔮 Testing Risk Prediction...")
    test_data = {
        "temperature": 30,
        "rainfall": 50,
        "humidity": 70,
        "co2_level": 450
    }
    success, pred_data = test_endpoint("Risk Prediction", "http://localhost:5000/predict", "POST", test_data)
    if success and pred_data:
        predictions = pred_data.get('predictions', {})
        for risk_type, prediction in predictions.items():
            if isinstance(prediction, dict):
                prob = prediction.get('risk_probability', 'N/A')
                level = prediction.get('risk_level', 'N/A')
                prob_str = f"{prob:.2f}" if isinstance(prob, (int, float)) else str(prob)
                print(f"   🌊 {risk_type.capitalize()}: {prob_str} ({level})")
            else:
                print(f"   🌊 {risk_type.capitalize()}: {prediction}")
    print()
    
    # Test Future Prediction
    print("🔮 Testing Future Prediction...")
    future_data = {
        "year": 2030,
        "base_temperature": 25,
        "base_rainfall": 100,
        "base_humidity": 60,
        "base_co2": 420
    }
    success, future_result = test_endpoint("Future Prediction", "http://localhost:5000/future", "POST", future_data)
    if success and future_result:
        conditions = future_result.get('projected_conditions', {})
        print(f"   🌡️ Temperature: {conditions.get('temperature', 'N/A')}°C")
        print(f"   🌧️ Rainfall: {conditions.get('rainfall', 'N/A')}mm")
        print(f"   💨 CO₂: {conditions.get('co2_level', 'N/A')}ppm")
    print()
    
    # Test Scenario Simulation
    print("🎯 Testing Scenario Simulation...")
    scenario_data = {
        "co2_change": 20,
        "deforestation": 10,
        "renewable_energy": 60
    }
    success, scenario_result = test_endpoint("Scenario Simulation", "http://localhost:5000/scenario", "POST", scenario_data)
    if success and scenario_result:
        conditions = scenario_result.get('projected_conditions', {})
        print(f"   🌡️ Scenario Temperature: {conditions.get('temperature', 'N/A')}°C")
        print(f"   🌧️ Scenario Rainfall: {conditions.get('rainfall', 'N/A')}mm")
    print()
    
    # Test Backend API
    print("🔧 Testing Backend API...")
    test_endpoint("Backend Health", "http://localhost:3000/health")
    print()
    
    # Test Frontend
    print("🌐 Testing Frontend...")
    test_endpoint("Frontend", "http://localhost:8000/dashboard_simple.html")
    test_endpoint("Predictions Page", "http://localhost:8000/predictions.html")
    test_endpoint("Upload Page", "http://localhost:8000/upload.html")
    print()
    
    print("🎉 Model testing completed!")
    print("💡 If all tests show ✅, your models are working correctly!")

if __name__ == "__main__":
    main()