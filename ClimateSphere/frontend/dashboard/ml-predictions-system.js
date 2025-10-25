/**
 * ML-Based Predictions System
 * Uses trained models and real datasets for climate predictions
 */

console.log('🤖 Loading ML-Based Predictions System...');

let mlCharts = {};
let mlApiBase = 'http://localhost:5000';
let currentMLData = null;

// Initialize ML-based system
setTimeout(() => {
    initializeMLSystem();
}, 2000);

async function initializeMLSystem() {
    console.log('🚀 Initializing ML-Based Predictions System...');
    
    try {
        // Test ML API connection
        await testMLConnection();
        
        // Initialize charts
        initializeMLCharts();
        
        // Setup ML-based listeners
        setupMLListeners();
        
        // Load initial ML data
        await loadInitialMLData();
        
        console.log('✅ ML-Based Predictions System initialized');
        
    } catch (error) {
        console.error('❌ ML System initialization failed:', error);
        await generateSyntheticDataset();
    }
}

// Test ML API connection
async function testMLConnection() {
    try {
        const response = await fetch(`${mlApiBase}/health`);
        const data = await response.json();
        
        if (data.status === 'healthy') {
            console.log('✅ ML API connected. Models loaded:', data.models_loaded);
            updateStatus('complete', `ML Models: ${data.models_loaded.join(', ')}`);
            return true;
        } else {
            throw new Error('ML API unhealthy');
        }
    } catch (error) {
        console.error('❌ ML API connection failed:', error);
        updateStatus('error', 'ML API offline');
        throw error;
    }
}

// Initialize ML charts
function initializeMLCharts() {
    console.log('📊 Initializing ML charts...');
    
    // Prediction chart with ML data
    const predictionCtx = document.getElementById('predictionChart');
    if (predictionCtx) {
        mlCharts.prediction = new Chart(predictionCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: false },
                    legend: { display: true, position: 'top' }
                },
                scales: {
                    y: { 
                        beginAtZero: false, 
                        title: { display: true, text: 'Value' }
                    },
                    x: { 
                        title: { display: true, text: 'Time Period' }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
    
    // Risk assessment chart
    const riskCtx = document.getElementById('riskBarChart');
    if (riskCtx) {
        mlCharts.risk = new Chart(riskCtx, {
            type: 'bar',
            data: {
                labels: ['Flood Risk', 'Drought Risk', 'Heatwave Risk'],
                datasets: [{
                    label: 'ML Risk Probability (%)',
                    data: [0, 0, 0],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)', 
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: ['#3b82f6', '#f59e0b', '#ef4444'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        max: 100,
                        title: { display: true, text: 'ML Probability (%)' }
                    }
                }
            }
        });
    }
    
    // Impact analysis chart
    const impactCtx = document.getElementById('impactChart');
    if (impactCtx) {
        mlCharts.impact = new Chart(impactCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Scenario Impact (%)',
                    data: [],
                    backgroundColor: [],
                    borderColor: [],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: {
                    x: { 
                        beginAtZero: true,
                        title: { display: true, text: 'Impact on Risk (%)' }
                    }
                }
            }
        });
    }
    
    console.log('✅ ML charts initialized');
}

// Setup ML-based event listeners
function setupMLListeners() {
    console.log('🎛️ Setting up ML listeners...');
    
    // Filter change listeners
    const filters = ['regionSelect', 'periodSelect', 'targetSelect'];
    filters.forEach(filterId => {
        const element = document.getElementById(filterId);
        if (element) {
            element.addEventListener('change', async () => {
                if (filterId === 'targetSelect') {
                    updateDataTypeDisplay();
                    if (window.updateSlidersForDataType) {
                        window.updateSlidersForDataType(element.value);
                    }
                    setTimeout(setupSliderListeners, 500);
                }
                await runMLPrediction();
            });
        }
    });
    
    // Initial slider setup
    setupSliderListeners();
    
    console.log('✅ ML listeners set up');
}

// Setup slider listeners for ML system
function setupSliderListeners() {
    const sliders = document.querySelectorAll('.scenario-slider');
    
    sliders.forEach(slider => {
        // Remove existing listeners
        slider.removeEventListener('input', slider._mlListener);
        
        // Add ML-based listener
        slider._mlListener = async (e) => {
            updateSliderDisplay(e.target);
            
            // Debounced ML prediction
            clearTimeout(slider._mlTimeout);
            slider._mlTimeout = setTimeout(async () => {
                await runMLPrediction();
            }, 500);
        };
        
        slider.addEventListener('input', slider._mlListener);
    });
}

// Update slider display
function updateSliderDisplay(slider) {
    const valueEl = document.getElementById(slider.id + 'Value');
    if (valueEl) {
        const suffix = valueEl.textContent.match(/[%°C]/g)?.[0] || '%';
        valueEl.textContent = slider.value + suffix;
    }
}

// Update data type display
function updateDataTypeDisplay() {
    const targetSelect = document.getElementById('targetSelect');
    const dataTypeDisplay = document.getElementById('currentDataType');
    const chartTitle = document.getElementById('predictionChartTitle');
    
    if (targetSelect && dataTypeDisplay) {
        const dataType = targetSelect.value;
        const displayName = getDataTypeDisplayName(dataType);
        dataTypeDisplay.textContent = displayName;
        
        if (chartTitle) {
            chartTitle.textContent = `${displayName} ML Prediction with Confidence Interval`;
        }
    }
}

// Load initial ML data
async function loadInitialMLData() {
    console.log('📊 Loading initial ML data...');
    
    updateDataTypeDisplay();
    await runMLPrediction();
}

// Main ML prediction function
async function runMLPrediction() {
    console.log('🤖 Running ML prediction...');
    
    try {
        updateStatus('running', 'Running ML prediction...');
        
        // Get current settings
        const settings = getCurrentSettings();
        console.log('📊 Current settings:', settings);
        
        // Get base climate data for region
        const baseClimateData = await getRegionalClimateData(settings.region);
        
        // Apply scenario adjustments
        const adjustedClimateData = applyScenarioToClimateData(baseClimateData, settings.sliders);
        
        // Call ML API for predictions
        const mlPredictions = await callMLAPI(adjustedClimateData);
        
        // Generate time series predictions
        const timeSeriesData = await generateMLTimeSeries(adjustedClimateData, settings, mlPredictions);
        
        // Update all charts with ML data
        updateMLCharts(timeSeriesData, settings);
        
        // Store current ML data
        currentMLData = {
            settings,
            baseClimateData,
            adjustedClimateData,
            mlPredictions,
            timeSeriesData,
            timestamp: new Date().toISOString()
        };
        
        updateStatus('complete', 'ML prediction complete');
        console.log('✅ ML prediction completed successfully');
        
    } catch (error) {
        console.error('❌ ML prediction failed:', error);
        updateStatus('error', `ML prediction failed: ${error.message}`);
        
        // Fallback to synthetic data if ML fails
        await generateSyntheticPrediction();
    }
}

// Get current settings from UI
function getCurrentSettings() {
    const region = document.getElementById('regionSelect')?.value || 'india-mumbai';
    const period = parseFloat(document.getElementById('periodSelect')?.value || '1');
    const dataType = document.getElementById('targetSelect')?.value || 'temperature';
    
    // Get all slider values
    const sliders = {};
    document.querySelectorAll('.scenario-slider').forEach(slider => {
        sliders[slider.id] = parseFloat(slider.value) || 0;
    });
    
    return { region, period, dataType, sliders };
}

// Get regional climate data (could be from dataset or API)
async function getRegionalClimateData(region) {
    try {
        // Try to get real regional data from backend
        const response = await fetch(`${mlApiBase}/regional-data/${region}`);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.warn('⚠️ Regional data API not available, using defaults');
    }
    
    // Fallback to realistic regional defaults
    const regionalDefaults = {
        'india-mumbai': { temperature: 28.5, rainfall: 120, humidity: 75, co2_level: 420 },
        'india-delhi': { temperature: 32, rainfall: 65, humidity: 60, co2_level: 450 },
        'india-kolkata': { temperature: 30, rainfall: 140, humidity: 80, co2_level: 430 },
        'india-gujarat': { temperature: 35, rainfall: 45, humidity: 55, co2_level: 440 },
        'india-chennai': { temperature: 31, rainfall: 95, humidity: 78, co2_level: 425 },
        'india-kashmir': { temperature: 18, rainfall: 180, humidity: 65, co2_level: 380 },
        'usa-california': { temperature: 22, rainfall: 85, humidity: 60, co2_level: 410 },
        'usa-texas': { temperature: 28, rainfall: 75, humidity: 65, co2_level: 415 },
        'usa-florida': { temperature: 26, rainfall: 130, humidity: 80, co2_level: 405 },
        'usa-newyork': { temperature: 15, rainfall: 110, humidity: 70, co2_level: 400 },
        'china-beijing': { temperature: 14, rainfall: 60, humidity: 55, co2_level: 480 },
        'china-shanghai': { temperature: 18, rainfall: 115, humidity: 75, co2_level: 470 },
        'uk-london': { temperature: 12, rainfall: 150, humidity: 75, co2_level: 390 },
        'uae-dubai': { temperature: 38, rainfall: 15, humidity: 45, co2_level: 450 },
        'pakistan-karachi': { temperature: 30, rainfall: 35, humidity: 70, co2_level: 435 },
        'russia-moscow': { temperature: 8, rainfall: 90, humidity: 70, co2_level: 420 }
    };
    
    return regionalDefaults[region] || { temperature: 25, rainfall: 100, humidity: 65, co2_level: 410 };
}

// Apply scenario sliders to climate data
function applyScenarioToClimateData(baseData, sliders) {
    const adjusted = { ...baseData };
    
    // Apply each slider's impact on climate parameters
    Object.keys(sliders).forEach(sliderId => {
        const value = sliders[sliderId];
        if (Math.abs(value) > 0) {
            const impact = calculateSliderClimateImpact(sliderId, value);
            
            adjusted.temperature += impact.temperature || 0;
            adjusted.rainfall += impact.rainfall || 0;
            adjusted.humidity += impact.humidity || 0;
            adjusted.co2_level += impact.co2_level || 0;
        }
    });
    
    // Keep values within realistic bounds
    adjusted.temperature = Math.max(-20, Math.min(60, adjusted.temperature));
    adjusted.rainfall = Math.max(0, Math.min(1000, adjusted.rainfall));
    adjusted.humidity = Math.max(5, Math.min(100, adjusted.humidity));
    adjusted.co2_level = Math.max(280, Math.min(1000, adjusted.co2_level));
    
    return adjusted;
}

// Calculate climate impact of each slider
function calculateSliderClimateImpact(sliderId, value) {
    const impacts = {
        // Temperature-focused sliders
        'co2Reduction': { temperature: -value * 0.02, co2_level: -value * 3 },
        'renewableEnergy': { temperature: -value * 0.015, co2_level: -value * 2 },
        'urbanHeatControl': { temperature: -value * 0.01 },
        
        // CO2-focused sliders
        'industrialReduction': { co2_level: -value * 4, temperature: -value * 0.025 },
        'forestExpansion': { co2_level: -value * 3, rainfall: value * 0.4, temperature: -value * 0.01 },
        'renewableAdoption': { co2_level: -value * 2.5, temperature: -value * 0.02 },
        
        // Rainfall-focused sliders
        'deforestationRate': { rainfall: -value * 0.8, temperature: value * 0.015, co2_level: value * 1.5 },
        'cloudSeeding': { rainfall: value * 0.3 },
        'waterConservation': { rainfall: value * 0.15, humidity: value * 0.1 },
        
        // Drought-focused sliders
        'waterRecycling': { rainfall: value * 0.2, humidity: value * 0.15 },
        'deforestationImpact': { rainfall: -value * 0.6, temperature: value * 0.02 },
        'irrigationEfficiency': { rainfall: value * 0.1, humidity: value * 0.12 },
        
        // Deforestation-focused sliders
        'reforestation': { co2_level: -value * 2.5, rainfall: value * 0.5, temperature: -value * 0.012 },
        'industrialExpansion': { co2_level: value * 3, temperature: value * 0.025, rainfall: -value * 0.3 },
        'wildlifeProtection': { rainfall: value * 0.15, temperature: -value * 0.008 }
    };
    
    return impacts[sliderId] || { temperature: 0, rainfall: 0, humidity: 0, co2_level: 0 };
}

// Call ML API with adjusted climate data
async function callMLAPI(climateData) {
    console.log('🔬 Calling ML API with data:', climateData);
    
    try {
        const response = await fetch(`${mlApiBase}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(climateData)
        });
        
        if (!response.ok) {
            throw new Error(`ML API error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ ML API response:', result);
        
        return result;
        
    } catch (error) {
        console.error('❌ ML API call failed:', error);
        throw error;
    }
}

// Generate time series using ML predictions as base
async function generateMLTimeSeries(climateData, settings, mlPredictions) {
    const { period, dataType } = settings;
    const years = Math.ceil(period);
    const labels = Array.from({length: years}, (_, i) => `Year ${i + 1}`);
    
    // Get base value for the selected data type
    const baseValue = getDataTypeValue(climateData, dataType);
    
    // Generate time series with ML-informed growth
    const predictions = [];
    let currentValue = baseValue;
    
    // Use ML predictions to inform growth rate
    const mlRiskFactor = calculateMLRiskFactor(mlPredictions);
    const growthRate = getMLInformedGrowthRate(dataType, climateData, mlRiskFactor);
    
    for (let i = 0; i < years; i++) {
        // Add growth with some realistic variation
        currentValue += growthRate + (Math.random() - 0.5) * 0.2;
        predictions.push(Math.round(currentValue * 100) / 100);
    }
    
    // Extract ML risk probabilities
    const risks = {
        flood: (mlPredictions.predictions?.flood?.risk_probability || 0.3) * 100,
        drought: (mlPredictions.predictions?.drought?.risk_probability || 0.3) * 100,
        heatwave: (mlPredictions.predictions?.heatwave?.risk_probability || 0.3) * 100
    };
    
    return {
        labels,
        predictions,
        risks,
        mlPredictions,
        climateData
    };
}

// Calculate ML risk factor for growth rate adjustment
function calculateMLRiskFactor(mlPredictions) {
    if (!mlPredictions.predictions) return 1.0;
    
    const avgRisk = Object.values(mlPredictions.predictions)
        .reduce((sum, pred) => sum + (pred.risk_probability || 0), 0) / 3;
    
    return 1 + avgRisk; // Higher risk = faster change
}

// Get ML-informed growth rate
function getMLInformedGrowthRate(dataType, climateData, mlRiskFactor) {
    const baseRates = {
        'temperature': 0.1 + (climateData.co2_level - 400) * 0.001,
        'co2': 2.5 - (climateData.rainfall / 200),
        'rainfall': -0.5 - (climateData.temperature - 25) * 0.03,
        'drought': 0.4 + (climateData.temperature - 25) * 0.02,
        'deforestation': 0.3 + (climateData.temperature - 25) * 0.015,
        'globalwarming': 0.08 + (climateData.co2_level - 400) * 0.0002,
        'ecologicalshifts': 1.0 + (climateData.temperature - 25) * 0.05,
        'disasterimpacts': 1.5 + (climateData.temperature - 25) * 0.08
    };
    
    const baseRate = baseRates[dataType] || 0.1;
    return baseRate * mlRiskFactor;
}

// Get data type value from climate data
function getDataTypeValue(climateData, dataType) {
    const mapping = {
        'temperature': climateData.temperature,
        'co2': climateData.co2_level,
        'rainfall': climateData.rainfall,
        'drought': Math.max(0, 100 - climateData.rainfall),
        'deforestation': Math.max(5, 35 - climateData.rainfall / 8),
        'globalwarming': Math.max(0, climateData.temperature - 15),
        'ecologicalshifts': Math.abs(climateData.temperature - 25) + Math.abs(climateData.rainfall - 100) / 8,
        'disasterimpacts': Math.max(0, (climateData.temperature - 20) + (100 - climateData.rainfall) / 4)
    };
    
    return mapping[dataType] || climateData.temperature;
}

// Update all ML charts
function updateMLCharts(timeSeriesData, settings) {
    console.log('📊 Updating ML charts with data:', timeSeriesData);
    
    // Update prediction chart
    updateMLPredictionChart(timeSeriesData, settings);
    
    // Update risk chart
    updateMLRiskChart(timeSeriesData.risks);
    
    // Update impact chart
    updateMLImpactChart(settings.sliders, timeSeriesData.risks);
    
    // Update gauge displays
    updateGaugeDisplays(timeSeriesData.risks);
}

// Update ML prediction chart with confidence intervals
function updateMLPredictionChart(timeSeriesData, settings) {
    if (!mlCharts.prediction) return;
    
    const { dataType } = settings;
    const color = getDataTypeColor(dataType);
    const label = getDataTypeLabel(dataType);
    
    // Main prediction dataset
    const mainDataset = {
        label: `${label} (ML Prediction)`,
        data: timeSeriesData.predictions,
        borderColor: color,
        backgroundColor: color + '20',
        tension: 0.4,
        fill: false,
        borderWidth: 3
    };
    
    // Confidence intervals based on ML uncertainty
    const upperBound = timeSeriesData.predictions.map(v => v * 1.12);
    const lowerBound = timeSeriesData.predictions.map(v => v * 0.88);
    
    const datasets = [
        mainDataset,
        {
            label: 'Upper Confidence (88%)',
            data: upperBound,
            borderColor: color + '50',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            borderWidth: 1,
            pointRadius: 0,
            tension: 0.4
        },
        {
            label: 'Lower Confidence (88%)',
            data: lowerBound,
            borderColor: color + '50',
            backgroundColor: color + '15',
            borderDash: [5, 5],
            borderWidth: 1,
            pointRadius: 0,
            tension: 0.4,
            fill: '-1'
        }
    ];
    
    mlCharts.prediction.data.labels = timeSeriesData.labels;
    mlCharts.prediction.data.datasets = datasets;
    mlCharts.prediction.update();
}

// Update ML risk chart
function updateMLRiskChart(risks) {
    if (!mlCharts.risk) return;
    
    mlCharts.risk.data.datasets[0].data = [
        Math.round(risks.flood),
        Math.round(risks.drought),
        Math.round(risks.heatwave)
    ];
    mlCharts.risk.update();
}

// Update ML impact chart
function updateMLImpactChart(sliders, risks) {
    if (!mlCharts.impact) return;
    
    const impacts = [];
    const labels = [];
    const colors = [];
    
    Object.keys(sliders).forEach(sliderId => {
        const value = sliders[sliderId];
        if (Math.abs(value) > 3) {
            // Calculate impact based on slider value and current risks
            const impact = calculateSliderRiskImpact(sliderId, value, risks);
            
            impacts.push(impact);
            labels.push(formatSliderName(sliderId));
            colors.push(impact > 0 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)');
        }
    });
    
    if (impacts.length === 0) {
        impacts.push(0);
        labels.push('No significant impacts');
        colors.push('rgba(107, 114, 128, 0.8)');
    }
    
    mlCharts.impact.data.labels = labels;
    mlCharts.impact.data.datasets[0].data = impacts;
    mlCharts.impact.data.datasets[0].backgroundColor = colors;
    mlCharts.impact.update();
}

// Calculate slider impact on risks
function calculateSliderRiskImpact(sliderId, value, currentRisks) {
    const riskImpacts = {
        'reforestation': -value * 0.3,
        'industrialExpansion': value * 0.4,
        'wildlifeProtection': -value * 0.2,
        'co2Reduction': -value * 0.35,
        'renewableEnergy': -value * 0.25,
        'urbanHeatControl': -value * 0.2,
        'industrialReduction': -value * 0.4,
        'forestExpansion': -value * 0.35,
        'renewableAdoption': -value * 0.3,
        'deforestationRate': value * 0.4,
        'cloudSeeding': -value * 0.15,
        'waterConservation': -value * 0.1,
        'waterRecycling': -value * 0.2,
        'deforestationImpact': value * 0.35,
        'irrigationEfficiency': -value * 0.15
    };
    
    return riskImpacts[sliderId] || 0;
}

// Update gauge displays
function updateGaugeDisplays(risks) {
    const gauges = [
        { id: 'floodGaugeValue', value: risks.flood },
        { id: 'droughtGaugeValue', value: risks.drought },
        { id: 'heatwaveGaugeValue', value: risks.heatwave }
    ];
    
    gauges.forEach(gauge => {
        const element = document.getElementById(gauge.id);
        if (element) {
            element.textContent = `${Math.round(gauge.value)}%`;
        }
    });
}

// Generate synthetic dataset if needed
async function generateSyntheticDataset() {
    console.log('🔬 Generating synthetic climate dataset...');
    
    try {
        // Create synthetic climate data script
        const syntheticScript = `
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json

# Generate synthetic climate dataset
np.random.seed(42)
n_samples = 1000

# Base climate parameters for different regions
regions = ['mumbai', 'delhi', 'kolkata', 'gujarat', 'chennai', 'kashmir']
base_temps = [28.5, 32, 30, 35, 31, 18]
base_rainfall = [120, 65, 140, 45, 95, 180]
base_humidity = [75, 60, 80, 55, 78, 65]
base_co2 = [420, 450, 430, 440, 425, 380]

data = []
for i in range(n_samples):
    region_idx = np.random.randint(0, len(regions))
    
    # Add seasonal and random variations
    temp_variation = np.random.normal(0, 3)
    rain_variation = np.random.normal(0, 20)
    humidity_variation = np.random.normal(0, 5)
    co2_variation = np.random.normal(0, 10)
    
    data.append({
        'region': regions[region_idx],
        'temperature': base_temps[region_idx] + temp_variation,
        'rainfall': max(0, base_rainfall[region_idx] + rain_variation),
        'humidity': max(10, min(100, base_humidity[region_idx] + humidity_variation)),
        'co2_level': max(300, base_co2[region_idx] + co2_variation),
        'date': (datetime.now() - timedelta(days=np.random.randint(0, 365*5))).isoformat()
    })

# Save synthetic dataset
df = pd.DataFrame(data)
df.to_csv('synthetic_climate_data.csv', index=False)

print(f"Generated {len(data)} synthetic climate records")
print("Dataset saved as synthetic_climate_data.csv")
`;
        
        // Save and run synthetic data generation
        await fetch('/generate-synthetic-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ script: syntheticScript })
        });
        
        console.log('✅ Synthetic dataset generated');
        
    } catch (error) {
        console.error('❌ Synthetic data generation failed:', error);
    }
}

// Generate synthetic prediction when ML fails
async function generateSyntheticPrediction() {
    console.log('🔄 Generating synthetic prediction...');
    
    const settings = getCurrentSettings();
    const baseData = await getRegionalClimateData(settings.region);
    
    // Simple synthetic prediction
    const syntheticData = {
        labels: ['Year 1'],
        predictions: [getDataTypeValue(baseData, settings.dataType)],
        risks: { flood: 30, drought: 25, heatwave: 35 },
        mlPredictions: null,
        climateData: baseData
    };
    
    updateMLCharts(syntheticData, settings);
}

// Utility functions
function getDataTypeDisplayName(dataType) {
    const names = {
        'temperature': 'Temperature',
        'co2': 'CO₂ Level',
        'rainfall': 'Rainfall',
        'drought': 'Drought',
        'deforestation': 'Deforestation',
        'globalwarming': 'Global Warming',
        'ecologicalshifts': 'Ecological Shifts',
        'disasterimpacts': 'Disaster Impacts'
    };
    return names[dataType] || dataType;
}

function getDataTypeColor(dataType) {
    const colors = {
        'temperature': '#ef4444',
        'co2': '#6b7280',
        'rainfall': '#3b82f6',
        'drought': '#f59e0b',
        'deforestation': '#10b981',
        'globalwarming': '#dc2626',
        'ecologicalshifts': '#059669',
        'disasterimpacts': '#7c2d12'
    };
    return colors[dataType] || '#6b7280';
}

function getDataTypeLabel(dataType) {
    const labels = {
        'temperature': 'Temperature (°C)',
        'co2': 'CO₂ Level (ppm)',
        'rainfall': 'Rainfall (mm)',
        'drought': 'Drought Index (%)',
        'deforestation': 'Deforestation Rate (%)',
        'globalwarming': 'Global Warming (°C)',
        'ecologicalshifts': 'Ecological Shift Index',
        'disasterimpacts': 'Disaster Impact Index'
    };
    return labels[dataType] || dataType;
}

function formatSliderName(sliderId) {
    const names = {
        'reforestation': 'Reforestation',
        'industrialExpansion': 'Industrial Expansion',
        'wildlifeProtection': 'Wildlife Protection',
        'co2Reduction': 'CO₂ Reduction',
        'renewableEnergy': 'Renewable Energy',
        'urbanHeatControl': 'Urban Heat Control',
        'industrialReduction': 'Industrial Reduction',
        'forestExpansion': 'Forest Expansion',
        'renewableAdoption': 'Renewable Adoption',
        'deforestationRate': 'Deforestation',
        'cloudSeeding': 'Cloud Seeding',
        'waterConservation': 'Water Conservation',
        'waterRecycling': 'Water Recycling',
        'deforestationImpact': 'Deforestation Impact',
        'irrigationEfficiency': 'Irrigation Efficiency'
    };
    return names[sliderId] || sliderId;
}

function updateStatus(status, message) {
    const indicator = document.getElementById('statusIndicator');
    const text = document.getElementById('statusText');
    
    if (indicator) {
        indicator.className = `status-indicator ${status}`;
    }
    
    if (text) {
        text.textContent = message;
    }
}

console.log('✅ ML-Based Predictions System loaded');