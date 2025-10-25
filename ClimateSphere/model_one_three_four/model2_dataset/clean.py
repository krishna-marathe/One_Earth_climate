# ------------------------------------------------------------
# Dynamic Climate Data Cleaning and Preprocessing System
# Author: Krishna Marathe
# ------------------------------------------------------------

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler, LabelEncoder
import warnings
warnings.filterwarnings('ignore')

class ClimateDataCleaner:
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_columns = []
        self.target_columns = ['FloodRisk_Level', 'DroughtRisk_Level', 'HeatwaveRisk_Level']
        
    def load_data(self, file_path=None, data=None):
        """
        Load data from file or DataFrame
        """
        if data is not None:
            df = data.copy()
            print(f"✅ Data loaded from DataFrame: {df.shape}")
        elif file_path:
            try:
                if file_path.endswith('.csv'):
                    df = pd.read_csv(file_path)
                elif file_path.endswith(('.xlsx', '.xls')):
                    df = pd.read_excel(file_path)
                else:
                    raise ValueError("Unsupported file format. Use CSV or Excel.")
                print(f"✅ Data loaded from {file_path}: {df.shape}")
            except Exception as e:
                print(f"❌ Error loading data: {e}")
                return None
        else:
            raise ValueError("Either file_path or data must be provided")
            
        return df
    
    def detect_and_create_features(self, df):
        """
        Intelligently detect and create climate features
        """
        print("🔍 Detecting and creating climate features...")
        
        # Standard climate features to look for
        feature_mapping = {
            'temperature': ['Temperature_C', 'temp', 'temperature', 'Temperature', 'TEMP'],
            'rainfall': ['Rainfall_mm', 'rain', 'rainfall', 'precipitation', 'Rainfall', 'RAIN'],
            'humidity': ['Humidity_%', 'humidity', 'Humidity', 'HUMIDITY', 'rh'],
            'wind_speed': ['Wind_Speed_mps', 'wind', 'windspeed', 'Wind_Speed', 'WIND'],
            'co2': ['CO2_ppm', 'co2', 'CO2', 'carbon_dioxide', 'CO2_LEVEL'],
            'soil_moisture': ['Soil_Moisture', 'soil', 'moisture', 'SOIL_MOISTURE'],
            'evaporation': ['Evaporation_mm_day', 'evap', 'evaporation', 'EVAP']
        }
        
        # Find existing columns
        found_features = {}
        for feature_type, possible_names in feature_mapping.items():
            for col in df.columns:
                if col in possible_names:
                    found_features[feature_type] = col
                    break
        
        print(f"📊 Found features: {list(found_features.keys())}")
        
        # Create missing features with synthetic data if needed
        if 'temperature' not in found_features:
            df['Temperature_C'] = np.random.normal(25, 5, len(df))
            found_features['temperature'] = 'Temperature_C'
            print("🔧 Created synthetic temperature data")
            
        if 'rainfall' not in found_features:
            df['Rainfall_mm'] = np.random.exponential(100, len(df))
            found_features['rainfall'] = 'Rainfall_mm'
            print("🔧 Created synthetic rainfall data")
            
        if 'humidity' not in found_features:
            df['Humidity_%'] = np.random.normal(60, 15, len(df))
            found_features['humidity'] = 'Humidity_%'
            print("🔧 Created synthetic humidity data")
            
        if 'wind_speed' not in found_features:
            df['Wind_Speed_mps'] = np.random.exponential(3, len(df))
            found_features['wind_speed'] = 'Wind_Speed_mps'
            print("🔧 Created synthetic wind speed data")
            
        if 'co2' not in found_features:
            df['CO2_ppm'] = np.random.normal(420, 30, len(df))
            found_features['co2'] = 'CO2_ppm'
            print("🔧 Created synthetic CO2 data")
            
        if 'soil_moisture' not in found_features:
            df['Soil_Moisture'] = np.random.uniform(10, 80, len(df))
            found_features['soil_moisture'] = 'Soil_Moisture'
            print("🔧 Created synthetic soil moisture data")
            
        if 'evaporation' not in found_features:
            df['Evaporation_mm_day'] = np.random.uniform(2, 8, len(df))
            found_features['evaporation'] = 'Evaporation_mm_day'
            print("🔧 Created synthetic evaporation data")
        
        # Add temporal features
        if 'Year' not in df.columns:
            df['Year'] = np.random.randint(2000, 2024, len(df))
        if 'Month' not in df.columns:
            df['Month'] = np.random.randint(1, 13, len(df))
        if 'Day' not in df.columns:
            df['Day'] = np.random.randint(1, 29, len(df))
            
        # Add regional features if not present
        if 'Region' not in df.columns:
            regions = ['North', 'South', 'East', 'West', 'Central']
            df['Region'] = np.random.choice(regions, len(df))
            
        return df, found_features
    
    def create_risk_levels(self, df, found_features):
        """
        Create risk levels based on climate conditions
        """
        print("⚠️ Creating risk level classifications...")
        
        temp_col = found_features.get('temperature', 'Temperature_C')
        rain_col = found_features.get('rainfall', 'Rainfall_mm')
        humidity_col = found_features.get('humidity', 'Humidity_%')
        
        # Flood Risk Logic
        flood_conditions = (
            (df[rain_col] > df[rain_col].quantile(0.7)) & 
            (df[humidity_col] > df[humidity_col].quantile(0.6))
        )
        df['FloodRisk_Score'] = np.where(flood_conditions, 
                                       np.random.uniform(0.6, 1.0, len(df)),
                                       np.random.uniform(0.0, 0.6, len(df)))
        
        # Drought Risk Logic
        drought_conditions = (
            (df[rain_col] < df[rain_col].quantile(0.3)) & 
            (df[temp_col] > df[temp_col].quantile(0.7))
        )
        df['DroughtRisk_Score'] = np.where(drought_conditions,
                                         np.random.uniform(0.6, 1.0, len(df)),
                                         np.random.uniform(0.0, 0.6, len(df)))
        
        # Heatwave Risk Logic
        heatwave_conditions = (
            (df[temp_col] > df[temp_col].quantile(0.8)) & 
            (df[humidity_col] < df[humidity_col].quantile(0.4))
        )
        df['HeatwaveRisk_Score'] = np.where(heatwave_conditions,
                                          np.random.uniform(0.6, 1.0, len(df)),
                                          np.random.uniform(0.0, 0.6, len(df)))
        
        # Convert scores to levels
        def score_to_level(score):
            if score < 0.33:
                return 'Low'
            elif score < 0.67:
                return 'Medium'
            else:
                return 'High'
        
        df['FloodRisk_Level'] = df['FloodRisk_Score'].apply(score_to_level)
        df['DroughtRisk_Level'] = df['DroughtRisk_Score'].apply(score_to_level)
        df['HeatwaveRisk_Level'] = df['HeatwaveRisk_Score'].apply(score_to_level)
        
        return df
    
    def clean_and_preprocess(self, df):
        """
        Comprehensive data cleaning and preprocessing
        """
        print("🧹 Starting data cleaning and preprocessing...")
        
        # Remove duplicates
        initial_count = len(df)
        df = df.drop_duplicates()
        print(f"🔄 Removed {initial_count - len(df)} duplicate records")
        
        # Handle missing values
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        for col in numeric_columns:
            if df[col].isnull().sum() > 0:
                df[col] = df[col].fillna(df[col].median())
                print(f"🔧 Filled {df[col].isnull().sum()} missing values in {col}")
        
        # Handle categorical missing values
        categorical_columns = df.select_dtypes(include=['object']).columns
        for col in categorical_columns:
            if df[col].isnull().sum() > 0:
                df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'Unknown')
        
        # Remove outliers using IQR method
        for col in numeric_columns:
            if col not in ['Year', 'Month', 'Day']:  # Don't remove outliers from date columns
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                outliers_count = len(df[(df[col] < lower_bound) | (df[col] > upper_bound)])
                if outliers_count > 0:
                    df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]
                    print(f"🎯 Removed {outliers_count} outliers from {col}")
        
        # Encode categorical variables
        for col in categorical_columns:
            if col not in self.target_columns:
                le = LabelEncoder()
                df[col + '_encoded'] = le.fit_transform(df[col])
                self.label_encoders[col] = le
        
        return df
    
    def engineer_features(self, df, found_features):
        """
        Create additional engineered features
        """
        print("⚙️ Engineering additional features...")
        
        temp_col = found_features.get('temperature', 'Temperature_C')
        rain_col = found_features.get('rainfall', 'Rainfall_mm')
        humidity_col = found_features.get('humidity', 'Humidity_%')
        
        # Seasonal features
        df['Season'] = df['Month'].apply(lambda x: 'Winter' if x in [12,1,2] else
                                                  'Spring' if x in [3,4,5] else
                                                  'Summer' if x in [6,7,8] else 'Autumn')
        
        # Regional averages
        if 'Region' in df.columns:
            regional_stats = df.groupby('Region')[temp_col].transform('mean')
            df['Temp_Regional_Avg'] = regional_stats
            
            regional_rain = df.groupby('Region')[rain_col].transform('mean')
            df['Rain_Regional_Avg'] = regional_rain
        
        # Climate indices
        df['Heat_Index'] = df[temp_col] * (df[humidity_col] / 100)
        df['Aridity_Index'] = df[temp_col] / (df[rain_col] + 1)  # +1 to avoid division by zero
        
        # Anomaly detection
        df['Temp_Anomaly'] = (df[temp_col] - df[temp_col].mean()) / df[temp_col].std()
        df['Rain_Anomaly'] = (df[rain_col] - df[rain_col].mean()) / df[rain_col].std()
        
        return df
    
    def prepare_features(self, df):
        """
        Prepare final feature set for modeling
        """
        print("📋 Preparing final feature set...")
        
        # Define feature columns (exclude target and intermediate columns)
        exclude_cols = ['FloodRisk_Score', 'DroughtRisk_Score', 'HeatwaveRisk_Score'] + self.target_columns
        exclude_cols += [col for col in df.columns if col.endswith('_Level') or col.endswith('_Score')]
        
        # Select numeric features
        numeric_features = df.select_dtypes(include=[np.number]).columns
        self.feature_columns = [col for col in numeric_features if col not in exclude_cols]
        
        print(f"📊 Selected {len(self.feature_columns)} features for modeling")
        print(f"Features: {self.feature_columns}")
        
        return df[self.feature_columns], df[self.target_columns]
    
    def process_data(self, file_path=None, data=None):
        """
        Complete data processing pipeline
        """
        print("🚀 Starting complete data processing pipeline...")
        
        # Load data
        df = self.load_data(file_path, data)
        if df is None:
            return None, None
        
        # Detect and create features
        df, found_features = self.detect_and_create_features(df)
        
        # Create risk levels
        df = self.create_risk_levels(df, found_features)
        
        # Clean and preprocess
        df = self.clean_and_preprocess(df)
        
        # Engineer features
        df = self.engineer_features(df, found_features)
        
        # Prepare final features
        X, y = self.prepare_features(df)
        
        print(f"✅ Data processing completed!")
        print(f"📊 Final dataset shape: {df.shape}")
        print(f"🎯 Features shape: {X.shape}")
        print(f"⚠️ Targets shape: {y.shape}")
        
        return X, y, df

if __name__ == "__main__":
    # Test the cleaner
    cleaner = ClimateDataCleaner()
    
    # Try to load existing data or create synthetic data
    try:
        X, y, df = cleaner.process_data("uploads/perfect_realistic_climate_risk_cleaned.csv")
    except:
        print("📝 Creating synthetic test data...")
        # Create synthetic data for testing
        synthetic_data = pd.DataFrame({
            'Temperature_C': np.random.normal(25, 5, 1000),
            'Rainfall_mm': np.random.exponential(100, 1000),
            'Humidity_%': np.random.normal(60, 15, 1000)
        })
        X, y, df = cleaner.process_data(data=synthetic_data)
    
    if X is not None:
        print("✅ Data cleaning test completed successfully!")
    else:
        print("❌ Data cleaning test failed!")