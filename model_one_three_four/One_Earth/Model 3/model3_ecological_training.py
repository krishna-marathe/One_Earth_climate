# ===============================================================
# 🌱 MODEL 3: Ecological Shift Predictor
# Predicts NDVI (vegetation health proxy) using climate & environment data
# ===============================================================

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor
import matplotlib.pyplot as plt
import joblib

# -------------------------------
# STEP 1: Load Preprocessed Dataset
# -------------------------------
data = pd.read_csv("ecological_cleaned.csv")
print("✅ Data Loaded Successfully")
print("Shape:", data.shape)
print(data.head())

# -------------------------------
# STEP 2: Encode Categorical Columns
# -------------------------------
# Automatically detect and encode all object (string) columns
cat_cols = data.select_dtypes(include=["object"]).columns.tolist()
if cat_cols:
    print(f"\n🔤 Encoding categorical columns: {cat_cols}")
    for col in cat_cols:
        le = LabelEncoder()
        data[col] = le.fit_transform(data[col])
        joblib.dump(le, f"label_encoder_{col}.pkl")  # save encoders for later
else:
    print("\n✅ No categorical columns to encode.")

# -------------------------------
# STEP 3: Define Features and Target
# -------------------------------
target = "ndvi"
exclude_cols = ["ndvi", "site_id", "year", "month"]
features = [col for col in data.columns if col not in exclude_cols]

X = data[features]
y = data[target]

print("\nFeature count:", len(features))
print("Features:", features[:10], "...")

# Ensure all features are numeric
X = X.select_dtypes(include=[np.number])

# -------------------------------
# STEP 4: Split Data
# -------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))

# -------------------------------
# STEP 5: Train Model
# -------------------------------
model = XGBRegressor(
    n_estimators=400,
    learning_rate=0.05,
    max_depth=8,
    subsample=0.8,
    colsample_bytree=0.8,
    reg_lambda=1.2,
    random_state=42,
    enable_categorical=True  # safety for categorical support
)

print("\n🚀 Training model...")
model.fit(X_train, y_train)

# -------------------------------
# STEP 6: Evaluate Model
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
# STEP 7: Visualization
# -------------------------------
plt.figure(figsize=(6, 6))
plt.scatter(y_test, y_pred, alpha=0.4, label="Predicted vs Actual")
plt.xlabel("Actual NDVI")
plt.ylabel("Predicted NDVI")
plt.title("NDVI Prediction - Actual vs Predicted")
plt.plot([0, 1], [0, 1], transform=plt.gca().transAxes, color="red", linestyle="--")
plt.legend()
plt.show()

# -------------------------------
# STEP 8: Feature Importance
# -------------------------------
plt.figure(figsize=(8, 6))
importance = model.feature_importances_
sorted_idx = np.argsort(importance)
plt.barh(np.array(features)[sorted_idx][-15:], importance[sorted_idx][-15:])
plt.xlabel("Feature Importance")
plt.title("Top 15 Important Features for NDVI Prediction")
plt.show()

# -------------------------------
# STEP 9: Save Model
# -------------------------------
joblib.dump(model, "ecological_ndvi_model_xgb.pkl")
print("\n✅ Model saved as 'ecological_ndvi_model_xgb.pkl'")
