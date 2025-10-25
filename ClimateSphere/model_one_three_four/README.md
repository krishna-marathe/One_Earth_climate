# 🌍 Climate Risk Analysis & Prediction System

## 📋 Overview

This is a complete Climate Risk Analysis and Prediction System that processes climate data, trains machine learning models, and predicts future climate risks for Flood, Drought, and Heatwave scenarios.

## 📁 Project Structure

```
model_one_three_four/
├── model2_dataset/
│   ├── clean.py                    # Data cleaning and preprocessing
│   ├── explore_analyze.py          # Data exploration and analysis
│   ├── new_multi.py               # Main training and prediction script
│   └── uploads/
│       └── perfect_realistic_climate_risk_cleaned.csv
├── FloodRisk_Model.pkl            # Trained flood risk model
├── DroughtRisk_Model.pkl          # Trained drought risk model
├── HeatwaveRisk_Model.pkl         # Trained heatwave risk model
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites

Install required Python packages:
```bash
pip install pandas numpy matplotlib seaborn scikit-learn joblib
```

### Running the System

1. **Data Cleaning** (optional - data is already cleaned):
```bash
cd ClimateSphere/model_one_three_four/model2_dataset
python clean.py
```

2. **Data Exploration** (optional):
```bash
python explore_analyze.py
```

3. **Train Models and Generate Predictions**:
```bash
python new_multi.py
```

## 🎯 What the System Does

### 1. Data Processing
- Loads climate dataset with multiple variables
- Performs feature engineering (seasons, regional averages, anomalies)
- Prepares data for machine learning

### 2. Model Training
- Trains 3 RandomForest models for:
  - **Flood Risk** prediction
  - **Drought Risk** prediction  
  - **Heatwave Risk** prediction
- Uses 10 features including rainfall, temperature, humidity, CO₂, etc.

### 3. Model Evaluation
- Displays accuracy scores for each model
- Shows detailed classification reports
- Generates confusion matrices with visualizations
- Creates correlation heatmaps

### 4. Future Predictions
- Predicts climate risks for future scenarios (e.g., 2030)
- Uses trained models to assess risk levels (Low/Medium/High)

## 📊 Features Used

The models use these 10 key features:
- `Rainfall_mm` - Rainfall amount
- `Temperature_C` - Temperature in Celsius
- `Soil_Moisture` - Soil moisture percentage
- `Humidity_%` - Humidity percentage
- `Wind_Speed_mps` - Wind speed in m/s
- `CO2_ppm` - CO₂ concentration in ppm
- `Evaporation_mm_day` - Daily evaporation
- `Month` - Month of the year
- `Rainfall_Avg_Region` - Regional rainfall average
- `Temp_Avg_Region` - Regional temperature average

## 🎯 Model Performance

Expected accuracy ranges:
- **Flood Risk Model**: ~85-90%
- **Drought Risk Model**: ~80-85%
- **Heatwave Risk Model**: ~88-92%

## 📈 Outputs

When you run `new_multi.py`, you'll get:

1. **Console Output**:
   - Dataset loading confirmation
   - Model accuracy scores
   - Classification reports
   - 2030 risk predictions

2. **Visualizations**:
   - Confusion matrices for each model
   - Feature correlation heatmap

3. **Saved Models**:
   - `FloodRisk_Model.pkl`
   - `DroughtRisk_Model.pkl`
   - `HeatwaveRisk_Model.pkl`

## 🔮 Future Predictions Example

The system predicts 2030 climate risks using sample future conditions:
- Temperature: 34°C
- Rainfall: 350mm
- CO₂: 460ppm
- And other environmental factors

## 🛠️ Customization

You can modify the future prediction parameters in `new_multi.py`:

```python
future_data = pd.DataFrame({
    'Rainfall_mm': [YOUR_VALUE],
    'Temperature_C': [YOUR_VALUE],
    'CO2_ppm': [YOUR_VALUE],
    # ... other parameters
})
```

## 📝 Notes

- Models are trained using RandomForest with 150 estimators
- Data is split 80/20 for training/testing
- All models use the same feature set for consistency
- Risk levels are categorized as Low, Medium, or High

## 🔧 Troubleshooting

If you encounter issues:

1. **Missing data file**: Ensure `perfect_realistic_climate_risk_cleaned.csv` exists in the `uploads/` folder
2. **Import errors**: Install missing packages with `pip install package_name`
3. **Memory issues**: Reduce dataset size or use a machine with more RAM

## 📊 Integration

These trained models can be integrated with:
- Web applications (like the ClimateSphere frontend)
- APIs for real-time predictions
- Climate monitoring systems
- Policy decision support tools

---

**Author**: Krishna Marathe  
**Last Updated**: October 2025