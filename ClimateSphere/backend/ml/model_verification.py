import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import StandardScaler
import xgboost as xgb
import warnings
warnings.filterwarnings('ignore')

class ModelVerification:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        
    def load_and_verify_models(self):
        """Load existing models and verify their performance"""
        model_files = {
            'flood': 'flood_model.pkl',
            'drought': 'drought_model.pkl', 
            'heatwave': 'heatwave_model.pkl'
        }
        
        for model_name, filename in model_files.items():
            try:
                model = joblib.load(filename)
                self.models[model_name] = model
                print(f"✅ Loaded {model_name} model")
            except FileNotFoundError:
                print(f"⚠️ {filename} not found, will create new model")
                self.models[model_name] = None
    
    def generate_synthetic_data(self, n_samples=1000):
        """Generate synthetic climate data for model training"""
        np.random.seed(42)
        
        # Generate features
        temperature = np.random.normal(25, 10, n_samples)  # Temperature in Celsius
        rainfall = np.random.exponential(100, n_samples)   # Rainfall in mm
        humidity = np.random.normal(60, 20, n_samples)     # Humidity %
        co2_level = np.random.normal(400, 50, n_samples)   # CO2 ppm
        
        # Clip values to realistic ranges
        temperature = np.clip(temperature, -10, 50)
        rainfall = np.clip(rainfall, 0, 500)
        humidity = np.clip(humidity, 0, 100)
        co2_level = np.clip(co2_level, 300, 600)
        
        # Create feature matrix
        X = np.column_stack([temperature, rainfall, humidity, co2_level])
        
        # Generate labels based on realistic climate relationships
        flood_risk = ((rainfall > 150) & (humidity > 70)).astype(int)
        drought_risk = ((rainfall < 50) & (temperature > 30)).astype(int)
        heatwave_risk = ((temperature > 35) & (humidity < 40)).astype(int)
        
        return X, {
            'flood': flood_risk,
            'drought': drought_risk,
            'heatwave': heatwave_risk
        }
    
    def train_model(self, X, y, model_type='random_forest'):
        """Train a new model"""
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        if model_type == 'random_forest':
            model = RandomForestClassifier(n_estimators=100, random_state=42)
        elif model_type == 'xgboost':
            model = xgb.XGBClassifier(random_state=42)
        else:
            raise ValueError("Unsupported model type")
        
        # Train model
        model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"Model Accuracy: {accuracy:.4f}")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred))
        print("\nConfusion Matrix:")
        print(confusion_matrix(y_test, y_pred))
        
        return model, scaler, accuracy
    
    def verify_and_retrain(self):
        """Main function to verify existing models or train new ones"""
        print("🔍 Starting Model Verification Process...")
        
        # Load existing models
        self.load_and_verify_models()
        
        # Generate training data
        print("\n📊 Generating synthetic training data...")
        X, y_dict = self.generate_synthetic_data()
        
        # Train/retrain models
        for model_name in ['flood', 'drought', 'heatwave']:
            print(f"\n🤖 Processing {model_name} model...")
            
            if self.models[model_name] is None:
                print(f"Training new {model_name} model...")
                model, scaler, accuracy = self.train_model(X, y_dict[model_name])
                
                # Save model and scaler
                joblib.dump(model, f'{model_name}_model.pkl')
                joblib.dump(scaler, f'{model_name}_scaler.pkl')
                
                self.models[model_name] = model
                self.scalers[model_name] = scaler
                
                print(f"✅ {model_name} model saved with accuracy: {accuracy:.4f}")
            else:
                print(f"✅ {model_name} model already exists and loaded")
        
        print("\n🎉 Model verification completed!")
        return self.models

if __name__ == "__main__":
    verifier = ModelVerification()
    models = verifier.verify_and_retrain()