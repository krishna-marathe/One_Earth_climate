import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor
import matplotlib.pyplot as plt
import joblib


# -------------------------------
# STEP 1: Load Dataset
# -------------------------------
data = pd.read_csv("climate_cleaned.csv")
print("✅ Data Loaded Successfully")
print(data.head())

# -------------------------------
# STEP 2: Feature Engineering
# -------------------------------

# Cyclic encoding for months
data['month_sin'] = np.sin(2 * np.pi * data['month'] / 12)
data['month_cos'] = np.cos(2 * np.pi * data['month'] / 12)

# Detect region columns automatically (like region_Tropics, region_Arctic, etc.)
region_columns = [col for col in data.columns if col.startswith("region_")]

# -------------------------------
# STEP 3: Define Features and Target
# -------------------------------
features = [
    'co2_ppm',
    'enso_index',
    'volcanic_activity',
    'ocean_heat_index',
    'rainfall_mm',
    'humidity_pct',
    'month_sin',
    'month_cos',
    'temp_lag1',
    'co2_lag1',
    'rainfall_lag1',
    'temp_roll3',
    'rain_roll3'
] + region_columns  # include all region columns dynamically

target = 'temperature_anomaly'

X = data[features]
y = data[target]

# -------------------------------
# STEP 4: Train-Test Split
# -------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -------------------------------
# STEP 5: Feature Scaling
# -------------------------------
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# -------------------------------
# STEP 6: Train XGBoost Model
# -------------------------------
model = XGBRegressor(
    n_estimators=400,
    learning_rate=0.05,
    max_depth=6,
    subsample=0.9,
    colsample_bytree=0.9,
    random_state=42
)
model.fit(X_train, y_train)

# -------------------------------
# STEP 7: Evaluate Model
# -------------------------------
y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print("\n📊 Model Evaluation Metrics:")
print(f"Mean Absolute Error (MAE): {mae:.4f}")
print(f"Root Mean Squared Error (RMSE): {rmse:.4f}")
print(f"R² Score: {r2:.4f}")

# -------------------------------
# STEP 8: Visualization
# -------------------------------
plt.figure(figsize=(6, 6))
plt.scatter(y_test, y_pred, alpha=0.5)
plt.xlabel("Actual Temperature Anomaly")
plt.ylabel("Predicted Temperature Anomaly")
plt.title("Actual vs Predicted Temperature Anomaly")
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], color="red", linestyle="--")
plt.show()

# Feature importance
plt.figure(figsize=(8, 5))
importance = model.feature_importances_
plt.barh(features, importance)
plt.xlabel("Feature Importance")
plt.ylabel("Feature")
plt.title("Feature Importance in Temperature Prediction")
plt.show()

# -------------------------------
# STEP 9: Save Model + Scaler
# -------------------------------
joblib.dump(model, "model1_temperature_xgb.pkl")
joblib.dump(scaler, "model1_scaler.pkl")

print("\n✅ Model and Scaler saved successfully!")
