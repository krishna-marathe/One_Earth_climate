# whatif_model_training.py
"""
MODEL 4: What-If Simulator / Scenario Surrogate Model
------------------------------------------------------
Predicts temperature change and risk index based on
synthetic climate and human activity parameters.

Features include:
- CO2 change %
- Deforestation %
- Renewable energy %
- Industrial growth, urbanization, etc.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor
import matplotlib.pyplot as plt
import joblib

# -------------------------------
# STEP 1: Load Cleaned Dataset
# -------------------------------
data = pd.read_csv("whatif_simulator_cleaned.csv")
print("✅ Data Loaded Successfully")
print("Shape:", data.shape)
print(data.head())

# -------------------------------
# STEP 2: Define Features & Targets
# -------------------------------
features = [
    col for col in data.columns
    if col not in ["year", "temperature_change", "risk_index"]
]
X = data[features]
y_temp = data["temperature_change"]
y_risk = data["risk_index"]

# -------------------------------
# STEP 3: Train-Test Split
# -------------------------------
X_train, X_test, y_temp_train, y_temp_test = train_test_split(
    X, y_temp, test_size=0.2, random_state=42
)
_, _, y_risk_train, y_risk_test = train_test_split(
    X, y_risk, test_size=0.2, random_state=42
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))

# -------------------------------
# STEP 4: Train Two Models
# -------------------------------
print("\n🚀 Training Temperature Model...")
temp_model = XGBRegressor(
    n_estimators=400,
    learning_rate=0.05,
    max_depth=7,
    subsample=0.8,
    colsample_bytree=0.8,
    reg_lambda=1.0,
    random_state=42
)
temp_model.fit(X_train, y_temp_train)

print("🚀 Training Risk Model...")
risk_model = XGBRegressor(
    n_estimators=400,
    learning_rate=0.05,
    max_depth=7,
    subsample=0.8,
    colsample_bytree=0.8,
    reg_lambda=1.0,
    random_state=42
)
risk_model.fit(X_train, y_risk_train)

# -------------------------------
# STEP 5: Evaluate Models
# -------------------------------
y_temp_pred = temp_model.predict(X_test)
y_risk_pred = risk_model.predict(X_test)

def evaluate(y_true, y_pred, label):
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    print(f"\n📊 {label} Model Evaluation:")
    print(f"MAE: {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"R² Score: {r2:.4f}")
    return mae, rmse, r2

evaluate(y_temp_test, y_temp_pred, "Temperature")
evaluate(y_risk_test, y_risk_pred, "Risk Index")

# -------------------------------
# STEP 6: Visualization
# -------------------------------
plt.figure(figsize=(6, 6))
plt.scatter(y_temp_test, y_temp_pred, alpha=0.5, label="Temperature")
plt.scatter(y_risk_test, y_risk_pred, alpha=0.5, label="Risk Index")
plt.xlabel("Actual Values")
plt.ylabel("Predicted Values")
plt.title("Actual vs Predicted (Temperature & Risk Index)")
plt.legend()
plt.show()

# -------------------------------
# STEP 7: Feature Importance
# -------------------------------
plt.figure(figsize=(8, 6))
importance = temp_model.feature_importances_
sorted_idx = np.argsort(importance)
plt.barh(np.array(features)[sorted_idx][-10:], importance[sorted_idx][-10:])
plt.xlabel("Feature Importance")
plt.title("Top 10 Important Features for Temperature Prediction")
plt.show()

# -------------------------------
# STEP 8: Save Models
# -------------------------------
joblib.dump(temp_model, "whatif_temperature_model.pkl")
joblib.dump(risk_model, "whatif_risk_model.pkl")

print("\n✅ Models saved successfully:")
print("   - whatif_temperature_model.pkl")
print("   - whatif_risk_model.pkl")
