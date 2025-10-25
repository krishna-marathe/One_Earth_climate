# ------------------------------------------------------------
# Climate Risk Analysis, Prediction & Visualization Script
# with .pkl Model Saving
# Author: Krishna Marathe
# ------------------------------------------------------------

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

# -----------------------------
# 1️⃣ Load Cleaned Dataset
# -----------------------------
df = pd.read_csv("perfect_realistic_climate_risk_cleaned.csv")
print("✅ Dataset loaded")
print(df.head())

# -----------------------------
# 2️⃣ Feature Engineering
# -----------------------------

# 2a. Season based on Month (simulate month if not present)
np.random.seed(42)
df['Month'] = np.random.randint(1,13, size=len(df))

def get_season(month):
    if month in [12,1,2]:
        return 'Winter'
    elif month in [3,4,5]:
        return 'Spring'
    elif month in [6,7,8]:
        return 'Summer'
    else:
        return 'Autumn'

df['Season'] = df['Month'].apply(get_season)

# 2b. Region-specific averages
region_avg = df.groupby('Region')[['Rainfall_mm','Temperature_C']].transform('mean')
df['Rainfall_Avg_Region'] = region_avg['Rainfall_mm']
df['Temp_Avg_Region'] = region_avg['Temperature_C']

# 2c. Anomaly flags
df['Rainfall_Anomaly'] = df['Rainfall_mm'] > (df['Rainfall_Avg_Region'] + 2*df['Rainfall_mm'].std())
df['Temperature_Anomaly'] = df['Temperature_C'] > (df['Temp_Avg_Region'] + 2*df['Temperature_C'].std())

# -----------------------------
# 3️⃣ Split Data & Train ML Models
# -----------------------------
features = ['Rainfall_mm','Temperature_C','Soil_Moisture','Humidity_%',
            'Wind_Speed_mps','CO2_ppm','Evaporation_mm_day','Month',
            'Rainfall_Avg_Region','Temp_Avg_Region']
target_columns = ['FloodRisk_Level','DroughtRisk_Level','HeatwaveRisk_Level']

X = df[features]

# Store models and predictions
models = {}
predictions = {}

for target in target_columns:
    y = df[target]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train Random Forest Classifier
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    
    # Save model as .pkl
    model_filename = f"{target.replace('Risk_Level','')}_Model.pkl"
    joblib.dump(rf, model_filename)
    print(f"✅ {model_filename} saved.")
    
    # Store model and predictions
    models[target] = rf
    predictions[target] = rf.predict(X_test)
    
    # Evaluation
    print(f"\n--- {target} Classification Report ---")
    print(classification_report(y_test, predictions[target]))
    
    # Confusion Matrix Heatmap
    cm = confusion_matrix(y_test, predictions[target], labels=['Low','Medium','High'])
    plt.figure(figsize=(6,5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='coolwarm', xticklabels=['Low','Medium','High'], yticklabels=['Low','Medium','High'])
    plt.title(f'Confusion Matrix: {target}')
    plt.ylabel('Actual')
    plt.xlabel('Predicted')
    plt.show()

# -----------------------------
# 4️⃣ Visualization of Trends
# -----------------------------

# 4a. Risk Level Distribution
for target in target_columns:
    plt.figure(figsize=(6,4))
    sns.countplot(x=target, data=df, order=['Low','Medium','High'], palette='viridis')
    plt.title(f'{target} Distribution')
    plt.show()

# 4b. Temperature vs Heatwave Risk
plt.figure(figsize=(8,5))
sns.scatterplot(x='Temperature_C', y='HeatwaveRisk_Score', hue='HeatwaveRisk_Level', data=df, palette={'Low':'green','Medium':'orange','High':'red'})
plt.title('Temperature vs Heatwave Risk')
plt.show()

# 4c. Rainfall vs Flood Risk
plt.figure(figsize=(8,5))
sns.scatterplot(x='Rainfall_mm', y='FloodRisk_Score', hue='FloodRisk_Level', data=df, palette={'Low':'green','Medium':'orange','High':'red'})
plt.title('Rainfall vs Flood Risk')
plt.show()

# 4d. Correlation Heatmap
plt.figure(figsize=(10,8))
sns.heatmap(df[['Rainfall_mm','Temperature_C','Soil_Moisture','Humidity_%','Wind_Speed_mps','CO2_ppm','Evaporation_mm_day',
                'FloodRisk_Score','DroughtRisk_Score','HeatwaveRisk_Score']].corr(), annot=True, cmap='coolwarm')
plt.title('Feature Correlation Heatmap')
plt.show()

print("✅ Analysis, prediction, visualizations, and .pkl models completed")
