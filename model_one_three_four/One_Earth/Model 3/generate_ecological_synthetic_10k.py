# generate_ecological_synthetic_10k.py
"""
Generates synthetic ecological dataset (~10,000 rows) for:
 - NDVI (monthly-like values)
 - landcover (Forest, Grassland, Urban)
 - species presence (binary) for one example species
 - climate drivers: temp, rainfall, co2, enso, human_disturbance
Includes controlled noise, missing values, and outliers.
Output: ecological_synthetic_10k.csv
"""

import numpy as np
import pandas as pd

np.random.seed(42)

n = 10000  # total rows (site-month records, or aggregated samples)
time_idx = np.arange(n)
# Simulate site ids to mimic multiple spatial points (e.g., 200 sites repeated in time)
n_sites = 200
site_ids = np.tile(np.arange(n_sites), int(np.ceil(n / n_sites)))[:n]
years = 2000 + (time_idx // 12)  # approximate years
months = (time_idx % 12) + 1

# Regions/types for sites (assign 200 sites across ecoregions)
ecoregions = ['Tropical', 'Temperate', 'Boreal', 'Savanna', 'Mediterranean']
site_region = {i: np.random.choice(ecoregions) for i in range(n_sites)}
regions = [site_region[s] for s in site_ids]

# Baseline per-region NDVI and seasonal amplitude
region_ndvi_base = {'Tropical': 0.6, 'Temperate': 0.45, 'Boreal': 0.35, 'Savanna': 0.4, 'Mediterranean': 0.38}
region_ndvi_amp = {'Tropical': 0.05, 'Temperate': 0.12, 'Boreal': 0.08, 'Savanna': 0.2, 'Mediterranean': 0.15}

# Climate drivers (global-ish but with per-site noise)
co2 = 380 + 0.02 * time_idx + np.random.normal(0, 1.0, n)            # ppm
enso = np.sin(2 * np.pi * time_idx / 60.0) + np.random.normal(0, 0.2, n)
temp = 14 + 0.01 * time_idx / 12.0 + 0.5 * enso + np.random.normal(0, 0.8, n)  # local mean temp
rainfall = 100 + 20 * np.sin(2 * np.pi * months / 12.0) + np.random.normal(0, 15, n)

# Human disturbance index per site (0 no-disturbance - 1 high disturbance)
site_human_base = {i: np.clip(np.random.beta(2, 5), 0, 1) for i in range(n_sites)}
human_disturbance = np.array([site_human_base[s] for s in site_ids]) + np.random.normal(0, 0.05, n)
human_disturbance = np.clip(human_disturbance, 0.0, 1.0)

# Landcover baseline probabilities per region
land_probs = {
    'Tropical': [0.7, 0.1, 0.2],     # Forest, Grassland, Urban
    'Temperate': [0.5, 0.3, 0.2],
    'Boreal': [0.8, 0.15, 0.05],
    'Savanna': [0.3, 0.6, 0.1],
    'Mediterranean':[0.4,0.4,0.2]
}
land_types = ['Forest', 'Grassland', 'Urban']

rows = []
for i in range(n):
    s = site_ids[i]
    reg = regions[i]
    base_ndvi = region_ndvi_base[reg]
    amp = region_ndvi_amp[reg]

    # Seasonality
    season = amp * np.sin(2 * np.pi * (months[i] - 1) / 12.0)

    # Trend: NDVI may slowly decline with rising human_disturbance & temp anomalies
    ndvi_trend = -0.0005 * (years[i] - 2000) * (site_human_base[s] + 0.5)  # slow decline for disturbed sites

    # instantaneous NDVI influenced by rainfall (positive), temp (neg if too hot), human disturbance (neg)
    ndvi = base_ndvi + season + 0.001 * (rainfall[i] - 100) - 0.002 * (temp[i] - 14) - 0.2 * human_disturbance[i] + ndvi_trend + np.random.normal(0, 0.03)

    ndvi = float(np.clip(ndvi, -0.1, 0.95))

    # Landcover: start from baseline region probs, but more disturbed sites are more likely to be Grassland/Urban
    p = np.array(land_probs[reg])
    p = p * (1 - 0.6 * human_disturbance[i])  # reduce forest prob with disturbance
    # add small random fluctuations
    p = p + np.random.normal(0, 0.02, 3)
    p = np.clip(p, 0.001, None)
    p = p / p.sum()
    land = np.random.choice(land_types, p=p)

    # Species suitability (example species prefers forest + moderate temp + high NDVI)
    suit = 0.0
    if land == 'Forest':
        suit += 0.6
    suit += 0.2 * (1 - abs((temp[i] - 18) / 6))   # prefers around 18C (tolerance)
    suit += 0.4 * ndvi
    suit -= 0.5 * human_disturbance[i]
    species_prob = 1 / (1 + np.exp(-5 * (suit - 0.5)))  # logistic squeeze
    species_presence = np.random.rand() < species_prob

    rows.append({
        'site_id': int(s),
        'year': int(years[i]),
        'month': int(months[i]),
        'region': reg,
        'co2_ppm': round(float(co2[i]), 2),
        'enso': round(float(enso[i]), 3),
        'temp_c': round(float(temp[i]), 2),
        'rainfall_mm': round(float(rainfall[i]), 2),
        'human_disturbance': round(float(human_disturbance[i]), 3),
        'ndvi': round(ndvi, 3),
        'landcover': land,
        'species_presence': int(species_presence)
    })

df = pd.DataFrame(rows)

# Inject controlled corruption (3% rows) to make pipeline robust
num_corrupt = int(0.03 * n)
idxs = np.random.choice(df.index, size=num_corrupt, replace=False)
# set some ndvi to nan
df.loc[idxs[: num_corrupt//3], 'ndvi'] = np.nan
# set some rainfall to negative sentinel
df.loc[idxs[num_corrupt//3: 2*num_corrupt//3], 'rainfall_mm'] *= -1
# set some co2 to huge sentinel
df.loc[idxs[2*num_corrupt//3:], 'co2_ppm'] = 9999.0

# Shuffle rows (simulate arbitrary uploads)
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

out = "ecological_synthetic_10k.csv"
df.to_csv(out, index=False)
print(f"✅ Saved synthetic ecological dataset to {out}. Shape: {df.shape}")
print(df.head(10))
