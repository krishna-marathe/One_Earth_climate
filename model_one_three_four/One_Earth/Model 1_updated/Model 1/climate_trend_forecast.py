"""
Enhanced Climate Trend Forecasting Script
Provides predictions for different time horizons: 1 month, 1 year, 5 years
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import joblib
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class ClimateTrendForecaster:
    def __init__(self, model_path="model1_temperature_xgb.pkl", scaler_path="model1_scaler.pkl"):
        """
        Initialize the climate trend forecaster.
        """
        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
        self.feature_order = [
            'co2_ppm', 'enso_index', 'volcanic_activity', 'ocean_heat_index',
            'rainfall_mm', 'humidity_pct', 'month_sin', 'month_cos', 'temp_lag1',
            'co2_lag1', 'rainfall_lag1', 'temp_roll3', 'rain_roll3', 'region_Inland',
            'region_Polar', 'region_Temperate', 'region_Tropics'
        ]
        
    def prepare_features(self, data_row, historical_data=None):
        """
        Prepare features for prediction based on current data and historical context.
        """
        features = {}
        
        # Basic climate variables
        features['co2_ppm'] = data_row.get('co2_ppm', 400)  # Default current CO2 level
        features['enso_index'] = data_row.get('enso_index', 0)
        features['volcanic_activity'] = data_row.get('volcanic_activity', 0)
        features['ocean_heat_index'] = data_row.get('ocean_heat_index', 0)
        features['rainfall_mm'] = data_row.get('rainfall_mm', 100)
        features['humidity_pct'] = data_row.get('humidity_pct', 70)
        
        # Seasonal features
        month = data_row.get('month', 1)
        features['month_sin'] = np.sin(2 * np.pi * month / 12)
        features['month_cos'] = np.cos(2 * np.pi * month / 12)
        
        # Region features (one-hot encoded)
        region = data_row.get('region', 'Temperate')
        for region_feature in ['region_Inland', 'region_Polar', 'region_Temperate', 'region_Tropics']:
            features[region_feature] = 1 if region_feature == f'region_{region}' else 0
        
        # Lag features (use historical data if available)
        if historical_data is not None and len(historical_data) > 0:
            last_row = historical_data.iloc[-1]
            features['temp_lag1'] = last_row.get('temperature_anomaly', 0)
            features['co2_lag1'] = last_row.get('co2_ppm', 400)
            features['rainfall_lag1'] = last_row.get('rainfall_mm', 100)
            
            # Rolling averages
            if len(historical_data) >= 3:
                features['temp_roll3'] = historical_data['temperature_anomaly'].tail(3).mean()
                features['rain_roll3'] = historical_data['rainfall_mm'].tail(3).mean()
            else:
                features['temp_roll3'] = last_row.get('temperature_anomaly', 0)
                features['rain_roll3'] = last_row.get('rainfall_mm', 100)
        else:
            # Default values when no historical data
            features['temp_lag1'] = 0
            features['co2_lag1'] = 400
            features['rainfall_lag1'] = 100
            features['temp_roll3'] = 0
            features['rain_roll3'] = 100
        
        # Create feature vector in correct order
        feature_vector = np.array([features[f] for f in self.feature_order])
        return feature_vector.reshape(1, -1)
    
    def predict_temperature_anomaly(self, data_row, historical_data=None):
        """
        Predict temperature anomaly for a single time point.
        """
        features = self.prepare_features(data_row, historical_data)
        features_scaled = self.scaler.transform(features)
        prediction = self.model.predict(features_scaled)[0]
        return prediction
    
    def forecast_trend(self, initial_data, months_ahead, scenario_params=None):
        """
        Forecast temperature anomaly trend for specified months ahead.
        
        Args:
            initial_data: Dictionary with initial climate conditions
            months_ahead: Number of months to forecast
            scenario_params: Dictionary with scenario parameters (CO2 growth rate, etc.)
        """
        if scenario_params is None:
            scenario_params = {
                'co2_growth_rate': 0.02,  # 2% annual growth
                'enso_cycle_period': 60,  # 5-year ENSO cycle
                'volcanic_probability': 0.02,  # 2% chance per month
                'seasonal_amplitude': 1.0
            }
        
        predictions = []
        current_data = initial_data.copy()
        historical_data = pd.DataFrame([current_data])
        
        for month in range(months_ahead):
            # Update time-dependent variables
            current_month = (current_data.get('month', 1) + month - 1) % 12 + 1
            current_data['month'] = current_month
            
            # Update seasonal features
            current_data['month_sin'] = np.sin(2 * np.pi * current_month / 12)
            current_data['month_cos'] = np.cos(2 * np.pi * current_month / 12)
            
            # Project CO2 growth
            if month > 0:
                current_data['co2_ppm'] *= (1 + scenario_params['co2_growth_rate'] / 12)
            
            # Simulate ENSO cycle
            enso_phase = 2 * np.pi * month / scenario_params['enso_cycle_period']
            current_data['enso_index'] = np.sin(enso_phase) + np.random.normal(0, 0.2)
            
            # Simulate volcanic activity
            if np.random.random() < scenario_params['volcanic_probability']:
                current_data['volcanic_activity'] = np.random.choice([0.3, 0.6, 1.0])
            else:
                current_data['volcanic_activity'] = 0
            
            # Update ocean heat index (correlated with CO2 and ENSO)
            current_data['ocean_heat_index'] = (
                0.01 * current_data['co2_ppm'] + 
                0.8 * current_data['enso_index'] + 
                np.random.normal(0, 0.2)
            )
            
            # Add seasonal variation to rainfall and humidity
            seasonal_factor = scenario_params['seasonal_amplitude'] * np.sin(2 * np.pi * current_month / 12)
            current_data['rainfall_mm'] += seasonal_factor * 20
            current_data['humidity_pct'] += seasonal_factor * 5
            current_data['humidity_pct'] = np.clip(current_data['humidity_pct'], 0, 100)
            
            # Make prediction
            prediction = self.predict_temperature_anomaly(current_data, historical_data)
            predictions.append({
                'month': current_month,
                'months_ahead': month + 1,
                'temperature_anomaly': prediction,
                'co2_ppm': current_data['co2_ppm'],
                'enso_index': current_data['enso_index'],
                'volcanic_activity': current_data['volcanic_activity']
            })
            
            # Update historical data for next iteration
            current_data['temperature_anomaly'] = prediction
            historical_data = pd.concat([historical_data, pd.DataFrame([current_data])], ignore_index=True)
        
        return pd.DataFrame(predictions)
    
    def generate_scenarios(self, initial_data, months_ahead=60):
        """
        Generate multiple climate scenarios for comparison.
        """
        scenarios = {}
        
        # Baseline scenario
        scenarios['Baseline'] = self.forecast_trend(
            initial_data, months_ahead,
            {'co2_growth_rate': 0.02, 'enso_cycle_period': 60, 'volcanic_probability': 0.02, 'seasonal_amplitude': 1.0}
        )
        
        # High CO2 scenario
        scenarios['High CO2'] = self.forecast_trend(
            initial_data, months_ahead,
            {'co2_growth_rate': 0.04, 'enso_cycle_period': 60, 'volcanic_probability': 0.02, 'seasonal_amplitude': 1.0}
        )
        
        # Low CO2 scenario
        scenarios['Low CO2'] = self.forecast_trend(
            initial_data, months_ahead,
            {'co2_growth_rate': 0.01, 'enso_cycle_period': 60, 'volcanic_probability': 0.02, 'seasonal_amplitude': 1.0}
        )
        
        # High volcanic activity scenario
        scenarios['High Volcanic'] = self.forecast_trend(
            initial_data, months_ahead,
            {'co2_growth_rate': 0.02, 'enso_cycle_period': 60, 'volcanic_probability': 0.05, 'seasonal_amplitude': 1.0}
        )
        
        return scenarios
    
    def plot_forecasts(self, scenarios, title="Climate Trend Forecasts"):
        """
        Plot multiple scenario forecasts.
        """
        plt.figure(figsize=(15, 10))
        
        # Temperature anomaly plot
        plt.subplot(2, 2, 1)
        for scenario_name, data in scenarios.items():
            plt.plot(data['months_ahead'], data['temperature_anomaly'], 
                    label=scenario_name, linewidth=2)
        plt.xlabel('Months Ahead')
        plt.ylabel('Temperature Anomaly (°C)')
        plt.title('Temperature Anomaly Forecasts')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # CO2 levels plot
        plt.subplot(2, 2, 2)
        for scenario_name, data in scenarios.items():
            plt.plot(data['months_ahead'], data['co2_ppm'], 
                    label=scenario_name, linewidth=2)
        plt.xlabel('Months Ahead')
        plt.ylabel('CO2 Concentration (ppm)')
        plt.title('CO2 Concentration Projections')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # ENSO index plot
        plt.subplot(2, 2, 3)
        for scenario_name, data in scenarios.items():
            plt.plot(data['months_ahead'], data['enso_index'], 
                    label=scenario_name, linewidth=2)
        plt.xlabel('Months Ahead')
        plt.ylabel('ENSO Index')
        plt.title('ENSO Cycle Projections')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # Volcanic activity plot
        plt.subplot(2, 2, 4)
        for scenario_name, data in scenarios.items():
            plt.plot(data['months_ahead'], data['volcanic_activity'], 
                    label=scenario_name, linewidth=2)
        plt.xlabel('Months Ahead')
        plt.ylabel('Volcanic Activity Index')
        plt.title('Volcanic Activity Projections')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        plt.suptitle(title, fontsize=16)
        plt.tight_layout()
        plt.show()

def main():
    """
    Main function to demonstrate climate trend forecasting.
    """
    print("Climate Trend Forecasting System")
    print("=" * 50)
    
    # Initialize forecaster
    forecaster = ClimateTrendForecaster()
    
    # Define initial conditions (example)
    initial_conditions = {
        'co2_ppm': 420,
        'enso_index': 0.5,
        'volcanic_activity': 0,
        'ocean_heat_index': 3.5,
        'rainfall_mm': 120,
        'humidity_pct': 70,
        'month': 1,
        'region': 'Temperate'
    }
    
    print(f"Initial Conditions:")
    for key, value in initial_conditions.items():
        print(f"  {key}: {value}")
    
    # Generate scenarios
    print("\nGenerating climate scenarios...")
    scenarios = forecaster.generate_scenarios(initial_conditions, months_ahead=60)
    
    # Display results
    print("\nForecast Results:")
    print("-" * 30)
    
    for scenario_name, data in scenarios.items():
        print(f"\n{scenario_name} Scenario:")
        print(f"  1 Month: {data.iloc[0]['temperature_anomaly']:.3f}°C")
        print(f"  1 Year:  {data.iloc[11]['temperature_anomaly']:.3f}°C")
        print(f"  5 Years: {data.iloc[59]['temperature_anomaly']:.3f}°C")
        
        # Calculate trend
        trend_5yr = data.iloc[59]['temperature_anomaly'] - data.iloc[0]['temperature_anomaly']
        print(f"  5-Year Trend: {trend_5yr:+.3f}°C")
    
    # Plot results
    forecaster.plot_forecasts(scenarios, "Climate Trend Forecasts - Model 1")
    
    print("\nForecasting completed successfully!")
    
    return scenarios

if __name__ == "__main__":
    scenarios = main()