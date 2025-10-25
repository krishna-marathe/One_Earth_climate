from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# Load pre-trained models
models = {}
model_files = {
    'flood': 'FloodRisk_Model.pkl',
    'drought': 'DroughtRisk_Model.pkl', 
    'heatwave': 'HeatwaveRisk_Model.pkl'
}

def load_models():
    """Load all ML models"""
    global models
    for model_name, filename in model_files.items():
        try:
            # Try to load from current directory first, then parent directories
            model_path = None
            for path in [filename, f'../../{filename}', f'../../../{filename}']:
                if os.path.exists(path):
                    model_path = path
                    break
            
            if model_path:
                models[model_name] = joblib.load(model_path)
                print(f"✅ Loaded {model_name} model from {model_path}")
            else:
                print(f"⚠️ Model file {filename} not found")
        except Exception as e:
            print(f"❌ Error loading {model_name} model: {e}")

# Load models on startup
load_models()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': list(models.keys()),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict_risk():
    """Predict climate risks based on input parameters"""
    try:
        data = request.get_json()
        
        # Extract parameters
        temperature = float(data.get('temperature', 25))
        rainfall = float(data.get('rainfall', 100))
        humidity = float(data.get('humidity', 60))
        co2_level = float(data.get('co2_level', 400))
        
        # Normalize values to match training data (0-1 scale)
        rainfall_norm = rainfall / 300.0  # Assuming max rainfall 300mm
        temperature_norm = temperature / 50.0  # Assuming max temp 50°C
        humidity_norm = humidity / 100.0  # Already in percentage
        co2_norm = co2_level / 600.0  # Assuming max CO2 600ppm
        
        # Create feature vector with all 10 features expected by the model
        # Based on the CSV: Rainfall_mm, Temperature_C, Soil_Moisture, Humidity_%, Wind_Speed_mps, CO2_ppm, Evaporation_mm_day, Rainfall_Lag_mm, plus derived features
        features = np.array([[
            rainfall_norm,           # Rainfall_mm (normalized)
            temperature_norm,        # Temperature_C (normalized) 
            0.5,                    # Soil_Moisture (default)
            humidity_norm,          # Humidity_% (normalized)
            0.3,                    # Wind_Speed_mps (default)
            co2_norm,               # CO2_ppm (normalized)
            0.4,                    # Evaporation_mm_day (default)
            rainfall_norm * 0.8,    # Rainfall_Lag_mm (derived)
            temperature_norm * humidity_norm,  # Interaction feature
            rainfall_norm * temperature_norm   # Interaction feature
        ]])
        
        predictions = {}
        
        # Make predictions with available models
        for model_name, model in models.items():
            try:
                if hasattr(model, 'predict_proba'):
                    prob = model.predict_proba(features)[0]
                    predictions[model_name] = {
                        'risk_probability': float(prob[1]) if len(prob) > 1 else float(prob[0]),
                        'risk_level': 'High' if (prob[1] if len(prob) > 1 else prob[0]) > 0.7 else 'Medium' if (prob[1] if len(prob) > 1 else prob[0]) > 0.4 else 'Low'
                    }
                else:
                    pred = model.predict(features)[0]
                    predictions[model_name] = {
                        'risk_probability': float(pred),
                        'risk_level': 'High' if pred > 0.7 else 'Medium' if pred > 0.4 else 'Low'
                    }
            except Exception as e:
                print(f"Error predicting with {model_name}: {e}")
                predictions[model_name] = {
                    'risk_probability': 0.5,
                    'risk_level': 'Unknown',
                    'error': str(e)
                }
        
        return jsonify({
            'predictions': predictions,
            'input_parameters': {
                'temperature': temperature,
                'rainfall': rainfall,
                'humidity': humidity,
                'co2_level': co2_level
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/future', methods=['POST'])
def predict_future():
    """Predict climate trends for future years"""
    try:
        data = request.get_json()
        target_year = int(data.get('year', 2030))
        current_year = datetime.now().year
        years_ahead = target_year - current_year
        
        # Base parameters
        base_temp = float(data.get('base_temperature', 25))
        base_rainfall = float(data.get('base_rainfall', 100))
        base_humidity = float(data.get('base_humidity', 60))
        base_co2 = float(data.get('base_co2', 400))
        
        # Project future values (simplified climate model)
        temp_increase_per_year = 0.1  # 0.1°C per year
        co2_increase_per_year = 2.5   # 2.5 ppm per year
        rainfall_change_per_year = -0.5  # -0.5mm per year
        
        future_temp = base_temp + (temp_increase_per_year * years_ahead)
        future_co2 = base_co2 + (co2_increase_per_year * years_ahead)
        future_rainfall = max(0, base_rainfall + (rainfall_change_per_year * years_ahead))
        future_humidity = base_humidity  # Assume humidity stays relatively stable
        
        # Normalize future values
        rainfall_norm = future_rainfall / 300.0
        temp_norm = future_temp / 50.0
        humidity_norm = future_humidity / 100.0
        co2_norm = future_co2 / 600.0
        
        # Make predictions for future scenario with 10 features
        features = np.array([[
            rainfall_norm,
            temp_norm,
            0.5,  # Soil_Moisture
            humidity_norm,
            0.3,  # Wind_Speed
            co2_norm,
            0.4,  # Evaporation
            rainfall_norm * 0.8,  # Rainfall_Lag
            temp_norm * humidity_norm,  # Interaction
            rainfall_norm * temp_norm   # Interaction
        ]])
        
        future_predictions = {}
        for model_name, model in models.items():
            try:
                if hasattr(model, 'predict_proba'):
                    prob = model.predict_proba(features)[0]
                    future_predictions[model_name] = float(prob[1]) if len(prob) > 1 else float(prob[0])
                else:
                    pred = model.predict(features)[0]
                    future_predictions[model_name] = float(pred)
            except Exception as e:
                future_predictions[model_name] = 0.5
        
        return jsonify({
            'target_year': target_year,
            'projected_conditions': {
                'temperature': future_temp,
                'rainfall': future_rainfall,
                'humidity': future_humidity,
                'co2_level': future_co2
            },
            'risk_predictions': future_predictions,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/scenario', methods=['POST'])
def scenario_simulation():
    """Simulate what-if scenarios based on user inputs"""
    try:
        data = request.get_json()
        
        # Get scenario parameters
        co2_change_percent = float(data.get('co2_change', 0))  # % change
        deforestation_percent = float(data.get('deforestation', 0))  # % deforestation
        renewable_energy_percent = float(data.get('renewable_energy', 50))  # % renewable
        
        # Base conditions
        base_temp = 25
        base_rainfall = 100
        base_humidity = 60
        base_co2 = 400
        
        # Calculate scenario impacts
        co2_multiplier = 1 + (co2_change_percent / 100)
        temp_impact = (co2_change_percent / 100) * 2  # 2°C per 100% CO2 increase
        rainfall_impact = -(deforestation_percent / 100) * 20  # 20mm reduction per 100% deforestation
        renewable_impact = -(renewable_energy_percent / 100) * 0.5  # 0.5°C reduction per 100% renewable
        
        scenario_temp = base_temp + temp_impact + renewable_impact
        scenario_co2 = base_co2 * co2_multiplier
        scenario_rainfall = max(0, base_rainfall + rainfall_impact)
        scenario_humidity = base_humidity
        
        # Normalize scenario values
        rainfall_norm = scenario_rainfall / 300.0
        temp_norm = scenario_temp / 50.0
        humidity_norm = scenario_humidity / 100.0
        co2_norm = scenario_co2 / 600.0
        
        # Make predictions for scenario with 10 features
        features = np.array([[
            rainfall_norm,
            temp_norm,
            0.5,  # Soil_Moisture
            humidity_norm,
            0.3,  # Wind_Speed
            co2_norm,
            0.4,  # Evaporation
            rainfall_norm * 0.8,  # Rainfall_Lag
            temp_norm * humidity_norm,  # Interaction
            rainfall_norm * temp_norm   # Interaction
        ]])
        
        scenario_predictions = {}
        for model_name, model in models.items():
            try:
                if hasattr(model, 'predict_proba'):
                    prob = model.predict_proba(features)[0]
                    scenario_predictions[model_name] = {
                        'risk_probability': float(prob[1]) if len(prob) > 1 else float(prob[0]),
                        'risk_level': 'High' if (prob[1] if len(prob) > 1 else prob[0]) > 0.7 else 'Medium' if (prob[1] if len(prob) > 1 else prob[0]) > 0.4 else 'Low'
                    }
                else:
                    pred = model.predict(features)[0]
                    scenario_predictions[model_name] = {
                        'risk_probability': float(pred),
                        'risk_level': 'High' if pred > 0.7 else 'Medium' if pred > 0.4 else 'Low'
                    }
            except Exception as e:
                scenario_predictions[model_name] = {
                    'risk_probability': 0.5,
                    'risk_level': 'Unknown'
                }
        
        return jsonify({
            'scenario_parameters': {
                'co2_change_percent': co2_change_percent,
                'deforestation_percent': deforestation_percent,
                'renewable_energy_percent': renewable_energy_percent
            },
            'projected_conditions': {
                'temperature': scenario_temp,
                'rainfall': scenario_rainfall,
                'humidity': scenario_humidity,
                'co2_level': scenario_co2
            },
            'risk_predictions': scenario_predictions,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/regional-data/<region>', methods=['GET'])
def get_regional_data(region):
    """Get regional climate data"""
    try:
        # Load regional data from JSON file
        import json
        try:
            with open('../../regional_climate_data.json', 'r') as f:
                regional_data = json.load(f)
        except FileNotFoundError:
            # Fallback regional data
            regional_data = {
                'mumbai': {'temperature': 28.5, 'rainfall': 120, 'humidity': 75, 'co2_level': 420},
                'delhi': {'temperature': 32, 'rainfall': 65, 'humidity': 60, 'co2_level': 450},
                'kolkata': {'temperature': 30, 'rainfall': 140, 'humidity': 80, 'co2_level': 430},
                'gujarat': {'temperature': 35, 'rainfall': 45, 'humidity': 55, 'co2_level': 440},
                'chennai': {'temperature': 31, 'rainfall': 95, 'humidity': 78, 'co2_level': 425},
                'kashmir': {'temperature': 18, 'rainfall': 180, 'humidity': 65, 'co2_level': 380}
            }
        
        # Extract region name from full region string (e.g., 'india-mumbai' -> 'mumbai')
        region_name = region.split('-')[-1] if '-' in region else region
        
        if region_name in regional_data:
            return jsonify(regional_data[region_name])
        else:
            # Return default data
            return jsonify({'temperature': 25, 'rainfall': 100, 'humidity': 65, 'co2_level': 410})
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/dataset-info', methods=['GET'])
def get_dataset_info():
    """Get information about the available dataset"""
    try:
        import pandas as pd
        
        # Try to load synthetic dataset
        try:
            df = pd.read_csv('../../synthetic_climate_dataset.csv')
            
            info = {
                'dataset_available': True,
                'total_records': len(df),
                'regions': df['Region'].unique().tolist() if 'Region' in df.columns else [],
                'date_range': {
                    'start': df['Date'].min() if 'Date' in df.columns else None,
                    'end': df['Date'].max() if 'Date' in df.columns else None
                },
                'features': df.columns.tolist(),
                'temperature_range': {
                    'min': float(df['Temperature_C'].min()) if 'Temperature_C' in df.columns else None,
                    'max': float(df['Temperature_C'].max()) if 'Temperature_C' in df.columns else None
                },
                'risk_distribution': {
                    'flood': int(df['Flood_Risk'].sum()) if 'Flood_Risk' in df.columns else 0,
                    'drought': int(df['Drought_Risk'].sum()) if 'Drought_Risk' in df.columns else 0,
                    'heatwave': int(df['Heatwave_Risk'].sum()) if 'Heatwave_Risk' in df.columns else 0
                }
            }
            
        except FileNotFoundError:
            info = {
                'dataset_available': False,
                'message': 'Synthetic dataset not found. Run generate_synthetic_data.py to create it.'
            }
        
        return jsonify(info)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/refine', methods=['POST'])
def refine_models():
    """Endpoint to trigger model retraining (placeholder)"""
    try:
        # This would typically retrain models with new data
        # For now, just return a success message
        return jsonify({
            'message': 'Model refinement initiated',
            'status': 'success',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting ClimateSphere ML API...")
    print(f"📊 Loaded models: {list(models.keys())}")
    app.run(host='0.0.0.0', port=5000, debug=True)