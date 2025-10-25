"""
Enhanced Model 1 Training Script - Climate Trend Forecasting
This script creates an improved XGBoost model for temperature anomaly prediction
with better feature engineering, hyperparameter tuning, and validation.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor
import matplotlib.pyplot as plt
import joblib
import warnings
warnings.filterwarnings('ignore')

def create_enhanced_features(df):
    """
    Create enhanced features for climate trend forecasting.
    """
    df_enhanced = df.copy()
    
    # Cyclic encoding for months (better than linear)
    df_enhanced['month_sin'] = np.sin(2 * np.pi * df_enhanced['month'] / 12)
    df_enhanced['month_cos'] = np.cos(2 * np.pi * df_enhanced['month'] / 12)
    
    # Detect region columns automatically
    region_columns = [col for col in df_enhanced.columns if col.startswith("region_")]
    
    # Sort by time_index to ensure proper lag calculation
    if "time_index" in df_enhanced.columns:
        df_enhanced = df_enhanced.sort_values(by="time_index").reset_index(drop=True)
        
        # Enhanced lag features (multiple lags for better temporal modeling)
        for col in ["temperature_anomaly", "co2_ppm", "rainfall_mm"]:
            if col in df_enhanced.columns:
                df_enhanced[f"{col.split('_')[0]}_lag1"] = df_enhanced[col].shift(1)
                df_enhanced[f"{col.split('_')[0]}_lag3"] = df_enhanced[col].shift(3)
        
        # Rolling statistics (multiple windows)
        if "temperature_anomaly" in df_enhanced.columns:
            df_enhanced["temp_roll3"] = df_enhanced["temperature_anomaly"].rolling(3, min_periods=1).mean()
            df_enhanced["temp_roll6"] = df_enhanced["temperature_anomaly"].rolling(6, min_periods=1).mean()
            df_enhanced["temp_std3"] = df_enhanced["temperature_anomaly"].rolling(3, min_periods=1).std()
            
        if "rainfall_mm" in df_enhanced.columns:
            df_enhanced["rain_roll3"] = df_enhanced["rainfall_mm"].rolling(3, min_periods=1).mean()
            df_enhanced["rain_roll6"] = df_enhanced["rainfall_mm"].rolling(6, min_periods=1).mean()
        
        # Trend features
        if "co2_ppm" in df_enhanced.columns:
            df_enhanced["co2_trend"] = df_enhanced["co2_ppm"].diff()
            df_enhanced["co2_trend3"] = df_enhanced["co2_ppm"].diff(3)
        
        # Fill NaN values
        df_enhanced = df_enhanced.fillna(method="bfill")
        df_enhanced = df_enhanced.fillna(method="ffill")
        
        # Remove time_index as it's not needed for prediction
        df_enhanced.drop(columns=["time_index"], inplace=True, errors="ignore")
    
    # Interaction features (climate system interactions)
    if "co2_ppm" in df_enhanced.columns and "enso_index" in df_enhanced.columns:
        df_enhanced["co2_enso_interaction"] = df_enhanced["co2_ppm"] * df_enhanced["enso_index"]
    
    if "volcanic_activity" in df_enhanced.columns and "enso_index" in df_enhanced.columns:
        df_enhanced["volcano_enso_interaction"] = df_enhanced["volcanic_activity"] * df_enhanced["enso_index"]
    
    # Seasonal CO2 variation (important for climate modeling)
    if "month" in df_enhanced.columns and "co2_ppm" in df_enhanced.columns:
        df_enhanced["co2_seasonal"] = df_enhanced["co2_ppm"] * df_enhanced["month_sin"]
    
    return df_enhanced

def get_feature_order():
    """
    Return the exact feature order expected by the model.
    """
    return [
        'co2_ppm', 'enso_index', 'volcanic_activity', 'ocean_heat_index',
        'rainfall_mm', 'humidity_pct', 'month_sin', 'month_cos', 'temp_lag1',
        'co2_lag1', 'rainfall_lag1', 'temp_roll3', 'rain_roll3', 'region_Inland',
        'region_Polar', 'region_Temperate', 'region_Tropics'
    ]

def train_enhanced_model():
    """
    Train an enhanced XGBoost model with better hyperparameters and validation.
    """
    print("Loading and preprocessing data...")
    
    # Load data
    data = pd.read_csv("climate_cleaned.csv")
    print(f"Loaded data shape: {data.shape}")
    
    # Create enhanced features
    data_enhanced = create_enhanced_features(data)
    print(f"Enhanced data shape: {data_enhanced.shape}")
    
    # Define target and features
    target = 'temperature_anomaly'
    
    # Get the exact feature order
    expected_features = get_feature_order()
    
    # Filter features to only include those that exist in the data
    available_features = [f for f in expected_features if f in data_enhanced.columns]
    print(f"Available features: {len(available_features)}")
    print(f"Features: {available_features}")
    
    X = data_enhanced[available_features]
    y = data_enhanced[target]
    
    # Handle any remaining NaN values
    X = X.fillna(X.median())
    y = y.fillna(y.median())
    
    print(f"Final feature matrix shape: {X.shape}")
    print(f"Target shape: {y.shape}")
    
    # Train-test split with temporal consideration
    # Use last 20% for testing to simulate future prediction
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    print(f"Training set: {X_train.shape}")
    print(f"Test set: {X_test.shape}")
    
    # Feature scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Enhanced XGBoost model with better hyperparameters
    print("\nTraining enhanced XGBoost model...")
    
    # Define parameter grid for hyperparameter tuning (simplified for faster training)
    param_grid = {
        'n_estimators': [300, 500],
        'learning_rate': [0.05, 0.1],
        'max_depth': [4, 6],
        'subsample': [0.8, 0.9],
        'colsample_bytree': [0.8, 0.9]
    }
    
    # Use a smaller grid for faster training, but still comprehensive
    base_model = XGBRegressor(
        random_state=42,
        n_jobs=-1
    )
    
    # Grid search with cross-validation
    print("Performing hyperparameter tuning...")
    grid_search = GridSearchCV(
        base_model,
        param_grid,
        cv=3,
        scoring='neg_mean_squared_error',
        n_jobs=-1,
        verbose=1
    )
    
    grid_search.fit(X_train_scaled, y_train)
    
    # Get best model
    best_model = grid_search.best_estimator_
    print(f"Best parameters: {grid_search.best_params_}")
    print(f"Best CV score: {-grid_search.best_score_:.4f}")
    
    # Make predictions
    y_pred = best_model.predict(X_test_scaled)
    
    # Calculate metrics
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    print("\nEnhanced Model Performance:")
    print(f"Mean Absolute Error (MAE): {mae:.4f}")
    print(f"Root Mean Squared Error (RMSE): {rmse:.4f}")
    print(f"R² Score: {r2:.4f}")
    
    # Cross-validation score
    cv_scores = cross_val_score(best_model, X_train_scaled, y_train, cv=5, scoring='neg_mean_squared_error')
    print(f"Cross-validation RMSE: {np.sqrt(-cv_scores.mean()):.4f} (+/- {np.sqrt(cv_scores.std() * 2):.4f})")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': available_features,
        'importance': best_model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\nTop 10 Most Important Features:")
    print(feature_importance.head(10))
    
    # Visualizations
    plt.figure(figsize=(15, 5))
    
    # Actual vs Predicted
    plt.subplot(1, 3, 1)
    plt.scatter(y_test, y_pred, alpha=0.5)
    plt.xlabel("Actual Temperature Anomaly")
    plt.ylabel("Predicted Temperature Anomaly")
    plt.title("Actual vs Predicted")
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
    
    # Residuals
    plt.subplot(1, 3, 2)
    residuals = y_test - y_pred
    plt.scatter(y_pred, residuals, alpha=0.5)
    plt.xlabel("Predicted Temperature Anomaly")
    plt.ylabel("Residuals")
    plt.title("Residual Plot")
    plt.axhline(y=0, color='r', linestyle='--')
    
    # Feature importance
    plt.subplot(1, 3, 3)
    top_features = feature_importance.head(10)
    plt.barh(range(len(top_features)), top_features['importance'])
    plt.yticks(range(len(top_features)), top_features['feature'])
    plt.xlabel("Feature Importance")
    plt.title("Top 10 Feature Importance")
    plt.gca().invert_yaxis()
    
    plt.tight_layout()
    plt.show()
    
    # Save the enhanced model and scaler
    joblib.dump(best_model, "model1_temperature_xgb.pkl")
    joblib.dump(scaler, "model1_scaler.pkl")
    
    print("\nEnhanced model and scaler saved successfully!")
    
    return best_model, scaler, feature_importance

if __name__ == "__main__":
    model, scaler, importance = train_enhanced_model()
