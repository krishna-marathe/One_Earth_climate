# ------------------------------------------------------------
# Climate Risk Analysis, Training, Evaluation & Prediction
# Author: Krishna Marathe
# ------------------------------------------------------------

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# 1️⃣ Load Dataset
df = pd.read_csv("uploads/perfect_realistic_climate_risk_cleaned.csv")
print("✅ Dataset loaded successfully:", df.shape)

# 2️⃣ Feature Engineering
np.random.seed(42)
df['Month'] = np.random.randint(1,13,size=len(df))

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

region_avg = df.groupby('Region')[['Rainfall_mm','Temperature_C']].transform('mean')
df['Rainfall_Avg_Region'] = region_avg['Rainfall_mm']
df['Temp_Avg_Region'] = region_avg['Temperature_C']

df['Rainfall_Anomaly'] = df['Rainfall_mm'] > (df['Rainfall_Avg_Region'] + 2*df['Rainfall_mm'].std())
df['Temperature_Anomaly'] = df['Temperature_C'] > (df['Temp_Avg_Region'] + 2*df['Temperature_C'].std())

# 3️⃣ Split Data
features = ['Rainfall_mm','Temperature_C','Soil_Moisture','Humidity_%',
            'Wind_Speed_mps','CO2_ppm','Evaporation_mm_day','Month',
            'Rainfall_Avg_Region','Temp_Avg_Region']
targets = ['FloodRisk_Level','DroughtRisk_Level','HeatwaveRisk_Level']

X = df[features]

# 4️⃣ Train, Save & Evaluate Models
for target in targets:
    y = df[target]
    X_train, X_test, y_train, y_test = train_test_split(X, y,
                                                        test_size=0.2,
                                                        random_state=42)
    
    model = RandomForestClassifier(n_estimators=150, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    print(f"\n🔹 {target} Model Accuracy: {acc*100:.2f}%")
    
    model_filename = f"{target.replace('_Level','')}_Model.pkl"
    joblib.dump(model, model_filename)
    print(f"✅ Model saved as {model_filename}")
    
    print(f"--- {target} Report ---")
    print(classification_report(y_test, y_pred))
    
    cm = confusion_matrix(y_test, y_pred, labels=['Low','Medium','High'])
    plt.figure(figsize=(6,5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='coolwarm',
                xticklabels=['Low','Medium','High'],
                yticklabels=['Low','Medium','High'])
    plt.title(f'Confusion Matrix: {target}')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.show()

# 5️⃣ Visualization
plt.figure(figsize=(10,6))
sns.heatmap(df.corr(numeric_only=True), annot=True, cmap='coolwarm')
plt.title('Feature Correlation Heatmap')
plt.show()

# 6️⃣ Predict Future (e.g., Year 2030)
print("\n🌍 Predicting Climate Risks for 2030 Example...\n")

future_data = pd.DataFrame({
    'Rainfall_mm': [350],
    'Temperature_C': [34],
    'Soil_Moisture': [25],
    'Humidity_%': [65],
    'Wind_Speed_mps': [4],
    'CO2_ppm': [460],
    'Evaporation_mm_day': [6],
    'Month': [7],
    'Rainfall_Avg_Region': [300],
    'Temp_Avg_Region': [31]
})

for target in targets:
    model_name = f"{target.replace('_Level','')}_Model.pkl"
    model = joblib.load(model_name)
    prediction = model.predict(future_data)
    print(f"{target} (2030 Prediction): {prediction[0]}")

print("\n✅ All models trained, saved, evaluated, and 2030 predictions generated.")