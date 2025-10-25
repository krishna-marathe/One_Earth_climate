# main.py
"""
MODEL 1 - CLIMATE IMPACT PREDICTOR (Unified Runner)
Usage:
    python main.py "path_to_dataset.csv"
"""

import sys
import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import joblib
from preprocess_climate_data import preprocess_data  # Function-based preprocessing

# -------------------------------
# STEP 0: Get dataset path from command line
# -------------------------------
if len(sys.argv) < 2:
    print("ERROR: Please provide the dataset path as a command-line argument.")
    print("Usage: python main.py \"path_to_dataset.csv\"")
    sys.exit(1)

dataset_path = sys.argv[1]

# Automatically handle backslashes
dataset_path = os.path.normpath(dataset_path)

if not os.path.exists(dataset_path):
    print(f"ERROR: Dataset file not found: {dataset_path}")
    sys.exit(1)

# -------------------------------
# STEP 1: Load dataset
# -------------------------------
print(f"\nLoading dataset: {dataset_path}")
try:
    data = pd.read_csv(dataset_path)
except Exception as e:
    print(f"ERROR: Failed to load dataset: {e}")
    sys.exit(1)

print("SUCCESS: Dataset loaded:", data.shape)

# -------------------------------
# STEP 2: Preprocess dataset
# -------------------------------
print("\nPreprocessing data...")
try:
    data_cleaned = preprocess_data(data)
except Exception as e:
    print(f"ERROR: Preprocessing failed: {e}")
    sys.exit(1)

print("SUCCESS: Preprocessing done. Cleaned data shape:", data_cleaned.shape)

# -------------------------------
# STEP 3: Load trained model and scaler
# -------------------------------
model_path = "model1_temperature_xgb.pkl"
scaler_path = "model1_scaler.pkl"

if not os.path.exists(model_path) or not os.path.exists(scaler_path):
    print("ERROR: Trained model or scaler not found. Please train the model first.")
    sys.exit(1)

print("\nLoading trained model and scaler...")
model = joblib.load(model_path)
scaler = joblib.load(scaler_path)

# -------------------------------
# STEP 4: Prepare features for prediction
# -------------------------------
target = "temperature_anomaly"
exclude_cols = [target, "year", "month"] if "year" in data_cleaned.columns else [target]
features = [col for col in data_cleaned.columns if col not in exclude_cols]

X = data_cleaned[features]

# Scale features
try:
    X_scaled = scaler.transform(X)
except Exception as e:
    print(f"ERROR: Scaling failed: {e}")
    sys.exit(1)

# -------------------------------
# STEP 5: Predict
# -------------------------------
print("\nPredicting temperature anomaly...")
try:
    y_pred = model.predict(X_scaled)
except Exception as e:
    print(f"ERROR: Prediction failed: {e}")
    sys.exit(1)

# -------------------------------
# STEP 6: Show predictions
# -------------------------------
print("\nPredictions for first 10 samples:")
for i, pred in enumerate(y_pred[:10], 1):
    print(f"Sample {i}: {pred:.3f}")

# -------------------------------
# STEP 7: Visualization
# -------------------------------
plt.figure(figsize=(6, 6))
plt.scatter(range(len(y_pred)), y_pred, alpha=0.5, color='blue')
plt.xlabel("Sample Index")
plt.ylabel("Predicted Temperature Anomaly")
plt.title("Predicted Temperature Anomaly")
plt.show()

print("\nSUCCESS: Prediction and visualization completed successfully!")