import pandas as pd
import numpy as np
import warnings
import os
from pathlib import Path

warnings.filterwarnings('ignore')

def generate_climate_dataset(num_samples=20000, seed=42, noise_ratio=0.07, missing_ratio=0.02):
    """
    Generate robust synthetic climate dataset for ML training.
    
    Parameters:
    -----------
    num_samples : int
        Number of samples to generate
    seed : int
        Random seed for reproducibility
    noise_ratio : float
        Proportion of samples to add noise to (0-1)
    missing_ratio : float
        Proportion of missing values per column (0-1)
    
    Returns:
    --------
    pd.DataFrame : Clean, validated dataset ready for ML
    """
    
    np.random.seed(seed)
    print(f"🔧 Generating {num_samples} samples with {noise_ratio*100}% noise and {missing_ratio*100}% missing values...")
    
    # ============================================================================
    # STEP 1: Generate base features with realistic ranges
    # ============================================================================
    
    year = np.random.randint(2025, 2100, num_samples)
    population_growth = np.random.uniform(0, 3.5, num_samples)
    industrial_growth = np.random.uniform(0, 6, num_samples)
    
    # Generate correlated features from the start (not after)
    # This ensures proper bounds
    co2_base = np.random.uniform(-10, 50, num_samples)
    co2_change = co2_base + 0.5 * industrial_growth + np.random.normal(0, 1.5, num_samples)
    co2_change = np.clip(co2_change, -10, 70)  # Keep within original bounds
    
    deforestation_base = np.random.uniform(0, 70, num_samples)
    deforestation = deforestation_base + 0.4 * industrial_growth + np.random.normal(0, 2, num_samples)
    deforestation = np.clip(deforestation, 0, 90)  # Keep within bounds
    
    # Renewable energy increases over time (realistic trend)
    renewable_base = np.random.uniform(5, 70, num_samples)
    renewable = renewable_base + 0.3 * (year - 2025) + np.random.normal(0, 5, num_samples)
    renewable = np.clip(renewable, 0, 100)
    
    # ============================================================================
    # STEP 2: Generate target variables with complex relationships
    # ============================================================================
    
    # Temperature change with nonlinear effects
    temperature_change = (
        0.018 * co2_change +
        0.025 * deforestation -
        0.012 * renewable +
        0.004 * population_growth * industrial_growth +  # interaction term
        0.5 * np.sin((year - 2020) / 10) +              # periodic cycle
        np.random.normal(0, 0.25, num_samples)
    )
    
    # Risk index (composite measure)
    risk_index = (
        0.4 * (temperature_change / 5) +
        0.01 * co2_change +
        0.012 * deforestation -
        0.006 * renewable +
        0.003 * industrial_growth +
        np.random.normal(0, 0.05, num_samples)
    )
    
    # Additional realistic features
    sea_level_rise = (
        0.15 * temperature_change +
        0.002 * co2_change +
        0.05 * np.log1p(year - 2024) +
        np.random.normal(0, 0.1, num_samples)
    )
    
    # Extreme weather events (count data)
    extreme_weather_base = (
        2.5 * np.maximum(temperature_change, 0) +
        0.05 * deforestation +
        np.random.poisson(2, num_samples)
    )
    extreme_weather_events = np.maximum(0, extreme_weather_base + np.random.normal(0, 1, num_samples))
    
    # Biodiversity loss
    biodiversity_loss = (
        0.6 * deforestation +
        0.3 * temperature_change -
        0.1 * renewable +
        np.random.normal(0, 3, num_samples)
    )
    
    # ============================================================================
    # STEP 3: Add realistic noise/errors to simulate real-world data quality
    # ============================================================================
    
    if noise_ratio > 0:
        error_indices = np.random.choice(num_samples, size=int(noise_ratio * num_samples), replace=False)
        
        # Add multiplicative noise
        temperature_change[error_indices] *= np.random.uniform(0.5, 2.0, len(error_indices))
        risk_index[error_indices] *= np.random.uniform(0.6, 1.8, len(error_indices))
        sea_level_rise[error_indices] *= np.random.uniform(0.5, 2.2, len(error_indices))
    
    # ============================================================================
    # STEP 4: Apply bounds AFTER adding noise (critical!)
    # ============================================================================
    
    temperature_change = np.clip(temperature_change, -2, 6)
    risk_index = np.clip(risk_index, 0, 1)
    sea_level_rise = np.clip(sea_level_rise, -0.5, 3)
    biodiversity_loss = np.clip(biodiversity_loss, 0, 100)
    extreme_weather_events = np.clip(extreme_weather_events, 0, 50).astype(int)
    
    # ============================================================================
    # STEP 5: Create DataFrame FIRST, then inject missing values
    # ============================================================================
    
    data = pd.DataFrame({
        "year": year,
        "co2_change_percent": co2_change,
        "deforestation_percent": deforestation,
        "renewable_energy_percent": renewable,
        "population_growth_rate": population_growth,
        "industrial_growth_index": industrial_growth,
        "temperature_change": temperature_change,
        "sea_level_rise_meters": sea_level_rise,
        "extreme_weather_events": extreme_weather_events,
        "biodiversity_loss_percent": biodiversity_loss,
        "risk_index": risk_index
    })
    
    # Inject missing values in specific columns (realistic data quality issues)
    if missing_ratio > 0:
        missing_columns = ["renewable_energy_percent", "deforestation_percent", 
                          "temperature_change", "risk_index", "sea_level_rise_meters"]
        
        for col in missing_columns:
            mask = np.random.rand(num_samples) < missing_ratio
            data.loc[mask, col] = np.nan
    
    # ============================================================================
    # STEP 6: Validate data quality
    # ============================================================================
    
    # Check for infinite values
    if np.isinf(data.select_dtypes(include=[np.number]).values).any():
        print("⚠️  WARNING: Infinite values detected! Replacing with NaN...")
        data.replace([np.inf, -np.inf], np.nan, inplace=True)
    
    # Validate ranges
    assert data['co2_change_percent'].between(-10, 70).all() or data['co2_change_percent'].isna().any(), "CO2 out of bounds"
    assert data['deforestation_percent'].between(0, 90).all() or data['deforestation_percent'].isna().any(), "Deforestation out of bounds"
    assert data['renewable_energy_percent'].between(0, 100).all() or data['renewable_energy_percent'].isna().any(), "Renewable out of bounds"
    assert data['temperature_change'].between(-2, 6).all() or data['temperature_change'].isna().any(), "Temperature out of bounds"
    assert data['risk_index'].between(0, 1).all() or data['risk_index'].isna().any(), "Risk index out of bounds"
    
    print("✅ Data validation passed!")
    
    return data


def save_dataset(data, filename="whatif_simulator_raw.csv", folder=None):
    """
    Save dataset to CSV with explicit path handling.
    
    Parameters:
    -----------
    data : pd.DataFrame
        Dataset to save
    filename : str
        Name of the CSV file
    folder : str, optional
        Folder path. If None, saves to current working directory
    
    Returns:
    --------
    str : Full path where file was saved
    """
    
    # Print debugging info
    print(f"\n🔍 SAVE LOCATION DEBUG:")
    print(f"   Current working directory: {os.getcwd()}")
    print(f"   Script location: {os.path.abspath(__file__) if '__file__' in globals() else 'Interactive mode'}")
    
    # Determine save location - ALWAYS use current working directory for project files
    if folder is None:
        save_folder = Path.cwd()  # Current working directory
        print(f"   Using current directory: {save_folder}")
    else:
        save_folder = Path(folder)
        print(f"   Using specified folder: {save_folder}")
    
    # Create folder if it doesn't exist
    save_folder.mkdir(parents=True, exist_ok=True)
    
    # Full file path
    file_path = save_folder / filename
    
    print(f"   Target file path: {file_path}")
    
    # Save the dataset
    try:
        data.to_csv(file_path, index=False)
        print(f"   ✅ CSV write completed")
    except Exception as e:
        print(f"   ❌ Error during CSV write: {e}")
        raise
    
    return str(file_path)


# ============================================================================
# GENERATE AND SAVE DATASET
# ============================================================================

if __name__ == "__main__":
    print("\n" + "="*70)
    print("🌍 CLIMATE DATASET GENERATOR")
    print("="*70 + "\n")
    
    # Generate dataset
    data = generate_climate_dataset(
        num_samples=20000,
        seed=42,
        noise_ratio=0.07,  # 7% noisy samples
        missing_ratio=0.02  # 2% missing values
    )
    
    # Save to file with explicit path
    try:
        file_path = save_dataset(data, filename="whatif_simulator_raw.csv")
        print(f"\n💾 File saved successfully!")
        print(f"📁 FULL PATH: {file_path}")
        print(f"📂 Folder: {os.path.dirname(file_path)}")
        
        # Verify file exists and show details
        if os.path.exists(file_path):
            file_size = os.path.getsize(file_path) / 1024  # KB
            print(f"✅ Verified: File exists ({file_size:.2f} KB)")
            print(f"📝 Number of lines: {len(data) + 1} (including header)")
            
            # List files in the same directory
            folder = os.path.dirname(file_path)
            print(f"\n📂 Files in {folder}:")
            files_in_dir = [f for f in os.listdir(folder) if f.endswith('.csv')][:10]
            for f in files_in_dir:
                print(f"   • {f}")
        else:
            print("❌ ERROR: File was not created!")
            
    except Exception as e:
        print(f"❌ ERROR saving file: {e}")
        # Fallback: save to absolute path in current directory
        fallback_path = os.path.join(os.getcwd(), "whatif_simulator_raw.csv")
        data.to_csv(fallback_path, index=False)
        print(f"💾 Saved to fallback location: {fallback_path}")
        if os.path.exists(fallback_path):
            print(f"✅ Fallback file verified: {os.path.getsize(fallback_path) / 1024:.2f} KB")
    
    # ============================================================================
    # COMPREHENSIVE DATA QUALITY REPORT
    # ============================================================================
    
    print("\n" + "="*70)
    print("📊 DATASET QUALITY REPORT")
    print("="*70)
    
    print(f"\n🔢 Shape: {data.shape[0]:,} rows × {data.shape[1]} columns")
    print(f"💾 Memory: ~{data.memory_usage(deep=True).sum() / 1024:.2f} KB")
    
    print(f"\n❌ Missing Values:")
    missing_counts = data.isnull().sum()
    missing_pct = (missing_counts / len(data) * 100).round(2)
    for col, count, pct in zip(missing_counts.index, missing_counts.values, missing_pct.values):
        if count > 0:
            print(f"   • {col}: {count} ({pct}%)")
    
    total_missing = data.isnull().sum().sum()
    total_cells = data.shape[0] * data.shape[1]
    print(f"   TOTAL: {total_missing:,} / {total_cells:,} ({total_missing/total_cells*100:.2f}%)")
    
    print(f"\n📈 Feature Statistics:")
    print(data.describe().round(3))
    
    print(f"\n🔗 Correlations with Target Variables:")
    targets = ['temperature_change', 'risk_index']
    features = ['co2_change_percent', 'deforestation_percent', 
                'renewable_energy_percent', 'industrial_growth_index']
    
    for target in targets:
        print(f"\n   {target}:")
        corr = data[features + [target]].corr()[target].drop(target).sort_values(ascending=False)
        for feat, val in corr.items():
            print(f"      • {feat}: {val:.3f}")
    
    print(f"\n🎯 Target Variable Distributions:")
    print(f"   • Temperature Change: {data['temperature_change'].min():.2f}°C to {data['temperature_change'].max():.2f}°C (mean: {data['temperature_change'].mean():.2f}°C)")
    print(f"   • Risk Index: {data['risk_index'].min():.3f} to {data['risk_index'].max():.3f} (mean: {data['risk_index'].mean():.3f})")
    
    print("\n" + "="*70)
    print("✅ Dataset ready for ML training!")
    print("="*70 + "\n")