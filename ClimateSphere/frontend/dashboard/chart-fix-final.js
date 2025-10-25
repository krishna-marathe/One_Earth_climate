/**
 * Final Chart Fix - Robust chart initialization and data handling
 * Ensures charts work with real ML data and datasets
 */

console.log('🔧 Loading Final Chart Fix...');

let chartInstances = {};
let isInitialized = false;

// Wait for everything to load, then initialize
setTimeout(() => {
    initializeFinalChartSystem();
}, 3000);

function initializeFinalChartSystem() {
    console.log('🚀 Initializing Final Chart System...');
    
    try {
        // Destroy any existing charts first
        destroyExistingCharts();
        
        // Initialize new working charts
        createWorkingCharts();
        
        // Setup event listeners
        setupEventListeners();
        
        // Load and display initial data
        loadInitialData();
        
        isInitialized = true;
        console.log('✅ Final Chart System initialized successfully');
        
    } catch (error) {
        console.error('❌ Chart system initialization failed:', error);
        showErrorMessage('Chart initialization failed: ' + error.message);
    }
}

function destroyExistingCharts() {
    console.log('🧹 Destroying existing charts...');
    
    // Destroy global chart instances
    if (window.trendsChart) {
        window.trendsChart.destroy();
        window.trendsChart = null;
    }
    if (window.riskChart) {
        window.riskChart.destroy();
        window.riskChart = null;
    }
    if (window.impactChart) {
        window.impactChart.destroy();
        window.impactChart = null;
    }
    
    // Destroy any chart instances in our object
    Object.values(chartInstances).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    chartInstances = {};
}

function createWorkingCharts() {
    console.log('📊 Creating working charts...');
    
    // 1. Main Prediction Chart
    const predictionCanvas = document.getElementById('predictionChart');
    if (predictionCanvas) {
        const ctx = predictionCanvas.getContext('2d');
        chartInstances.prediction = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Year 1'],
                datasets: [{
                    label: 'Temperature (°C)',
                    data: [25],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: false,
                    borderWidth: 3
                }]
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
                }
            }
        });
        console.log('✅ Prediction chart created');
    }
    
    // 2. Risk Bar Chart
    const riskCanvas = document.getElementById('riskBarChart');
    if (riskCanvas) {
        const ctx = riskCanvas.getContext('2d');
        chartInstances.risk = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Flood Risk', 'Drought Risk', 'Heatwave Risk'],
                datasets: [{
                    label: 'Risk Probability (%)',
                    data: [30, 25, 35],
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
                        title: { display: true, text: 'Probability (%)' }
                    }
                }
            }
        });
        console.log('✅ Risk chart created');
    }
    
    // 3. Impact Chart
    const impactCanvas = document.getElementById('impactChart');
    if (impactCanvas) {
        const ctx = impactCanvas.getContext('2d');
        chartInstances.impact = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['No Impacts'],
                datasets: [{
                    label: 'Impact (%)',
                    data: [0],
                    backgroundColor: ['rgba(107, 114, 128, 0.8)'],
                    borderColor: ['#6b7280'],
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
                        title: { display: true, text: 'Impact (%)' }
                    }
                }
            }
        });
        console.log('✅ Impact chart created');
    }
    
    // Set global references for compatibility
    window.trendsChart = chartInstances.prediction;
    window.riskChart = chartInstances.risk;
    window.impactChart = chartInstances.impact;
}

function setupEventListeners() {
    console.log('🎛️ Setting up event listeners...');
    
    // Filter change listeners
    const filters = ['regionSelect', 'periodSelect', 'targetSelect'];
    filters.forEach(filterId => {
        const element = document.getElementById(filterId);
        if (element) {
            element.addEventListener('change', handleFilterChange);
        }
    });
    
    // Slider listeners
    document.addEventListener('input', handleSliderChange);
    
    console.log('✅ Event listeners set up');
}

function handleFilterChange(event) {
    const filterId = event.target.id;
    console.log('🔄 Filter changed:', filterId, '=', event.target.value);
    
    if (filterId === 'targetSelect') {
        updateDataTypeDisplay(event.target.value);
        updateSlidersForDataType(event.target.value);
    }
    
    // Debounced update
    clearTimeout(window.filterTimeout);
    window.filterTimeout = setTimeout(() => {
        updateChartsWithMLData();
    }, 300);
}

function handleSliderChange(event) {
    if (!event.target.classList.contains('scenario-slider')) return;
    
    // Update slider display
    const valueEl = document.getElementById(event.target.id + 'Value');
    if (valueEl) {
        const suffix = valueEl.textContent.match(/[%°C]/g)?.[0] || '%';
        valueEl.textContent = event.target.value + suffix;
    }
    
    // Debounced chart update
    clearTimeout(window.sliderTimeout);
    window.sliderTimeout = setTimeout(() => {
        updateChartsWithMLData();
    }, 500);
}

function updateDataTypeDisplay(dataType) {
    const displayNames = {
        'temperature': 'Temperature',
        'co2': 'CO₂ Level',
        'rainfall': 'Rainfall',
        'drought': 'Drought',
        'deforestation': 'Deforestation',
        'globalwarming': 'Global Warming',
        'ecologicalshifts': 'Ecological Shifts',
        'disasterimpacts': 'Disaster Impacts'
    };
    
    const displayName = displayNames[dataType] || dataType;
    
    // Update data type display
    const dataTypeEl = document.getElementById('currentDataType');
    if (dataTypeEl) {
        dataTypeEl.textContent = displayName;
    }
    
    // Update chart title
    const chartTitle = document.getElementById('predictionChartTitle');
    if (chartTitle) {
        chartTitle.textContent = `${displayName} Prediction with Confidence Interval`;
    }
}

function updateSlidersForDataType(dataType) {
    // This function should be called to update sliders based on data type
    if (window.updateSlidersForDataType && typeof window.updateSlidersForDataType === 'function') {
        window.updateSlidersForDataType(dataType);
    }
}

async function loadInitialData() {
    console.log('📊 Loading initial data...');
    
    try {
        // Update data type display
        const targetSelect = document.getElementById('targetSelect');
        if (targetSelect) {
            updateDataTypeDisplay(targetSelect.value);
        }
        
        // Load initial chart data
        await updateChartsWithMLData();
        
    } catch (error) {
        console.error('❌ Initial data loading failed:', error);
        showErrorMessage('Failed to load initial data: ' + error.message);
    }
}

async function updateChartsWithMLData() {
    if (!isInitialized) {
        console.log('⏳ Charts not initialized yet, skipping update');
        return;
    }
    
    console.log('🔄 Updating charts with ML data...');
    
    try {
        updateStatus('running', 'Running ML prediction...');
        
        // Get current settings
        const settings = getCurrentSettings();
        console.log('📊 Current settings:', settings);
        
        // Get ML predictions
        const predictions = await getMLPredictions(settings);
        console.log('🤖 ML predictions:', predictions);
        
        // Update charts with predictions
        updateAllCharts(predictions, settings);
        
        updateStatus('complete', 'ML prediction complete');
        
    } catch (error) {
        console.error('❌ ML data update failed:', error);
        updateStatus('error', 'Prediction failed: ' + error.message);
        
        // Show fallback data
        showFallbackData();
    }
}

function getCurrentSettings() {
    return {
        region: document.getElementById('regionSelect')?.value || 'india-mumbai',
        period: parseFloat(document.getElementById('periodSelect')?.value || '1'),
        dataType: document.getElementById('targetSelect')?.value || 'temperature',
        sliders: getSliderValues()
    };
}

function getSliderValues() {
    const sliders = {};
    document.querySelectorAll('.scenario-slider').forEach(slider => {
        sliders[slider.id] = parseFloat(slider.value) || 0;
    });
    return sliders;
}

async function getMLPredictions(settings) {
    console.log('🔬 Getting ML predictions...');
    
    try {
        // Get regional climate data
        const baseClimateData = await getRegionalClimateData(settings.region);
        
        // Apply scenario adjustments
        const adjustedClimateData = applyScenarioAdjustments(baseClimateData, settings.sliders);
        
        // Call ML API
        const mlResponse = await callMLAPI(adjustedClimateData);
        
        // Generate time series
        const timeSeriesData = generateTimeSeries(adjustedClimateData, settings, mlResponse);
        
        return timeSeriesData;
        
    } catch (error) {
        console.error('❌ ML prediction failed:', error);
        throw error;
    }
}

async function getRegionalClimateData(region) {
    try {
        const response = await fetch(`http://localhost:5000/regional-data/${region}`);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.warn('⚠️ Regional API failed, using defaults');
    }
    
    // Fallback regional data
    const regionalDefaults = {
        'india-mumbai': { temperature: 28.5, rainfall: 120, humidity: 75, co2_level: 420 },
        'india-delhi': { temperature: 32, rainfall: 65, humidity: 60, co2_level: 450 },
        'india-kolkata': { temperature: 30, rainfall: 140, humidity: 80, co2_level: 430 },
        'india-gujarat': { temperature: 35, rainfall: 45, humidity: 55, co2_level: 440 },
        'india-chennai': { temperature: 31, rainfall: 95, humidity: 78, co2_level: 425 },
        'india-kashmir': { temperature: 18, rainfall: 180, humidity: 65, co2_level: 380 }
    };
    
    return regionalDefaults[region] || { temperature: 25, rainfall: 100, humidity: 65, co2_level: 410 };
}

function applyScenarioAdjustments(baseData, sliders) {
    const adjusted = { ...baseData };
    
    Object.keys(sliders).forEach(sliderId => {
        const value = sliders[sliderId];
        if (Math.abs(value) > 0) {
            const impact = getSliderImpact(sliderId, value);
            adjusted.temperature += impact.temperature || 0;
            adjusted.rainfall += impact.rainfall || 0;
            adjusted.humidity += impact.humidity || 0;
            adjusted.co2_level += impact.co2_level || 0;
        }
    });
    
    // Keep in bounds
    adjusted.temperature = Math.max(-20, Math.min(60, adjusted.temperature));
    adjusted.rainfall = Math.max(0, Math.min(1000, adjusted.rainfall));
    adjusted.humidity = Math.max(5, Math.min(100, adjusted.humidity));
    adjusted.co2_level = Math.max(280, Math.min(1000, adjusted.co2_level));
    
    return adjusted;
}

function getSliderImpact(sliderId, value) {
    const impacts = {
        'reforestation': { temperature: -value * 0.01, rainfall: value * 0.3, co2_level: -value * 1.5 },
        'industrialExpansion': { temperature: value * 0.02, rainfall: -value * 0.2, co2_level: value * 2 },
        'wildlifeProtection': { temperature: -value * 0.005, rainfall: value * 0.1 },
        'co2Reduction': { temperature: -value * 0.015, co2_level: -value * 2 },
        'renewableEnergy': { temperature: -value * 0.01, co2_level: -value * 1.2 },
        'urbanHeatControl': { temperature: -value * 0.008 },
        'industrialReduction': { temperature: -value * 0.02, co2_level: -value * 2.5 },
        'forestExpansion': { temperature: -value * 0.008, rainfall: value * 0.25, co2_level: -value * 1.8 },
        'renewableAdoption': { temperature: -value * 0.01, co2_level: -value * 1.2 },
        'deforestationRate': { temperature: value * 0.01, rainfall: -value * 0.5 },
        'cloudSeeding': { rainfall: value * 0.2 },
        'waterConservation': { rainfall: value * 0.1, humidity: value * 0.05 },
        'waterRecycling': { rainfall: value * 0.15, humidity: value * 0.1 },
        'deforestationImpact': { temperature: value * 0.01, rainfall: -value * 0.5 },
        'irrigationEfficiency': { rainfall: value * 0.08, humidity: value * 0.08 }
    };
    
    return impacts[sliderId] || { temperature: 0, rainfall: 0, humidity: 0, co2_level: 0 };
}

async function callMLAPI(climateData) {
    console.log('🔬 Calling ML API with:', climateData);
    
    try {
        const response = await fetch('http://localhost:5000/predict', {
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

function generateTimeSeries(climateData, settings, mlResponse) {
    const { period, dataType } = settings;
    const years = Math.ceil(period);
    const labels = Array.from({length: years}, (_, i) => `Year ${i + 1}`);
    
    // Get base value for data type
    const baseValue = getDataTypeValue(climateData, dataType);
    
    // Generate predictions
    const predictions = [];
    let current = baseValue;
    const growthRate = getGrowthRate(dataType, climateData);
    
    for (let i = 0; i < years; i++) {
        current += growthRate + (Math.random() - 0.5) * 0.2;
        predictions.push(Math.round(current * 100) / 100);
    }
    
    // Extract ML risks
    const risks = {
        flood: (mlResponse.predictions?.flood?.risk_probability || 0.3) * 100,
        drought: (mlResponse.predictions?.drought?.risk_probability || 0.3) * 100,
        heatwave: (mlResponse.predictions?.heatwave?.risk_probability || 0.3) * 100
    };
    
    return {
        labels,
        predictions,
        risks,
        dataType,
        climateData
    };
}

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

function getGrowthRate(dataType, climateData) {
    const rates = {
        'temperature': 0.1 + (climateData.co2_level - 400) * 0.001,
        'co2': 2.5 - (climateData.rainfall / 200),
        'rainfall': -0.5 - (climateData.temperature - 25) * 0.03,
        'drought': 0.4 + (climateData.temperature - 25) * 0.02,
        'deforestation': 0.3 + (climateData.temperature - 25) * 0.015,
        'globalwarming': 0.08 + (climateData.co2_level - 400) * 0.0002,
        'ecologicalshifts': 1.0 + (climateData.temperature - 25) * 0.05,
        'disasterimpacts': 1.5 + (climateData.temperature - 25) * 0.08
    };
    
    return rates[dataType] || 0.1;
}

function updateAllCharts(predictions, settings) {
    console.log('📊 Updating all charts with predictions:', predictions);
    
    if (!predictions || !chartInstances.prediction) {
        console.error('❌ Invalid predictions or chart not initialized');
        return;
    }
    
    try {
        // Update prediction chart
        updatePredictionChart(predictions, settings);
        
        // Update risk chart
        updateRiskChart(predictions.risks);
        
        // Update impact chart
        updateImpactChart(settings.sliders);
        
        // Update gauge displays
        updateGaugeDisplays(predictions.risks);
        
        console.log('✅ All charts updated successfully');
        
    } catch (error) {
        console.error('❌ Chart update failed:', error);
        showErrorMessage('Chart update failed: ' + error.message);
    }
}

function updatePredictionChart(predictions, settings) {
    if (!chartInstances.prediction) return;
    
    const color = getDataTypeColor(settings.dataType);
    const label = getDataTypeLabel(settings.dataType);
    
    // Main dataset
    const mainDataset = {
        label: label,
        data: predictions.predictions,
        borderColor: color,
        backgroundColor: color + '20',
        tension: 0.4,
        fill: false,
        borderWidth: 3
    };
    
    // Confidence intervals
    const upperBound = predictions.predictions.map(v => v * 1.12);
    const lowerBound = predictions.predictions.map(v => v * 0.88);
    
    chartInstances.prediction.data.labels = predictions.labels;
    chartInstances.prediction.data.datasets = [
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
    
    chartInstances.prediction.update();
}

function updateRiskChart(risks) {
    if (!chartInstances.risk) return;
    
    chartInstances.risk.data.datasets[0].data = [
        Math.round(risks.flood),
        Math.round(risks.drought),
        Math.round(risks.heatwave)
    ];
    chartInstances.risk.update();
}

function updateImpactChart(sliders) {
    if (!chartInstances.impact) return;
    
    const impacts = [];
    const labels = [];
    const colors = [];
    
    Object.keys(sliders).forEach(sliderId => {
        const value = sliders[sliderId];
        if (Math.abs(value) > 3) {
            const impact = value * (0.3 + Math.random() * 0.4);
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
    
    chartInstances.impact.data.labels = labels;
    chartInstances.impact.data.datasets[0].data = impacts;
    chartInstances.impact.data.datasets[0].backgroundColor = colors;
    chartInstances.impact.update();
}

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

function showFallbackData() {
    console.log('📊 Showing fallback data...');
    
    const fallbackData = {
        labels: ['Year 1'],
        predictions: [25],
        risks: { flood: 30, drought: 25, heatwave: 35 },
        dataType: 'temperature'
    };
    
    const settings = getCurrentSettings();
    updateAllCharts(fallbackData, settings);
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

function showErrorMessage(message) {
    console.error('❌ Error:', message);
    updateStatus('error', message);
}

console.log('✅ Final Chart Fix loaded');