/**
 * Simple Predictions Fix - Direct chart implementation
 * Bypasses complex system and directly updates charts
 */

console.log('🔧 Loading Simple Predictions Fix...');

let simpleCharts = {};
let updateTimer = null;

// Wait for page to load, then fix everything
setTimeout(() => {
    initializeSimpleCharts();
    setupSimpleListeners();
    loadSimpleData();
}, 3000);

function initializeSimpleCharts() {
    console.log('📊 Initializing simple charts...');
    
    try {
        // Main prediction chart
        const predictionCtx = document.getElementById('predictionChart');
        if (predictionCtx) {
            simpleCharts.prediction = new Chart(predictionCtx, {
                type: 'line',
                data: {
                    labels: ['Year 1'],
                    datasets: [{
                        label: 'Temperature (°C)',
                        data: [25],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'top' }
                    },
                    scales: {
                        y: { beginAtZero: false, title: { display: true, text: 'Value' } },
                        x: { title: { display: true, text: 'Time Period' } }
                    }
                }
            });
        }
        
        // Risk bar chart
        const riskCtx = document.getElementById('riskBarChart');
        if (riskCtx) {
            simpleCharts.risk = new Chart(riskCtx, {
                type: 'bar',
                data: {
                    labels: ['Flood Risk', 'Drought Risk', 'Heatwave Risk'],
                    datasets: [{
                        label: 'Risk Probability (%)',
                        data: [30, 25, 35],
                        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(239, 68, 68, 0.8)'],
                        borderColor: ['#3b82f6', '#f59e0b', '#ef4444'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, max: 100, title: { display: true, text: 'Probability (%)' } }
                    }
                }
            });
        }
        
        // Impact chart
        const impactCtx = document.getElementById('impactChart');
        if (impactCtx) {
            simpleCharts.impact = new Chart(impactCtx, {
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
                        x: { beginAtZero: true, title: { display: true, text: 'Impact (%)' } }
                    }
                }
            });
        }
        
        console.log('✅ Simple charts initialized');
        
    } catch (error) {
        console.error('❌ Chart initialization failed:', error);
    }
}

function setupSimpleListeners() {
    console.log('🎛️ Setting up simple listeners...');
    
    // Filter listeners
    const regionSelect = document.getElementById('regionSelect');
    const periodSelect = document.getElementById('periodSelect');
    const targetSelect = document.getElementById('targetSelect');
    
    if (regionSelect) regionSelect.addEventListener('change', updateSimpleCharts);
    if (periodSelect) periodSelect.addEventListener('change', updateSimpleCharts);
    if (targetSelect) {
        targetSelect.addEventListener('change', () => {
            updateDataTypeDisplay();
            updateSimpleCharts();
        });
    }
    
    // Slider listeners
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('scenario-slider')) {
            updateSliderValue(e.target);
            
            clearTimeout(updateTimer);
            updateTimer = setTimeout(updateSimpleCharts, 300);
        }
    });
    
    console.log('✅ Simple listeners set up');
}

function updateSliderValue(slider) {
    const valueEl = document.getElementById(slider.id + 'Value');
    if (valueEl) {
        const suffix = valueEl.textContent.match(/[%°C]/g)?.[0] || '%';
        valueEl.textContent = slider.value + suffix;
    }
}

function updateDataTypeDisplay() {
    const targetSelect = document.getElementById('targetSelect');
    const dataTypeDisplay = document.getElementById('currentDataType');
    const chartTitle = document.getElementById('predictionChartTitle');
    
    if (targetSelect && dataTypeDisplay) {
        const dataType = targetSelect.value;
        const displayName = getDataTypeDisplayName(dataType);
        dataTypeDisplay.textContent = displayName;
        
        if (chartTitle) {
            chartTitle.textContent = `${displayName} Prediction with Confidence Interval`;
        }
    }
}

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

function loadSimpleData() {
    console.log('📊 Loading simple data...');
    updateDataTypeDisplay();
    updateSimpleCharts();
}

function updateSimpleCharts() {
    console.log('🔄 Updating simple charts...');
    
    try {
        // Get current settings
        const region = document.getElementById('regionSelect')?.value || 'india-mumbai';
        const period = parseInt(document.getElementById('periodSelect')?.value || '1');
        const dataType = document.getElementById('targetSelect')?.value || 'temperature';
        
        // Get slider values
        const sliders = document.querySelectorAll('.scenario-slider');
        const sliderValues = {};
        sliders.forEach(slider => {
            sliderValues[slider.id] = parseFloat(slider.value) || 0;
        });
        
        // Get base data for region
        const baseData = getRegionalData(region);
        
        // Apply slider impacts
        const adjustedData = applySliderImpacts(baseData, sliderValues, dataType);
        
        // Generate predictions
        const predictions = generatePredictions(adjustedData, period, dataType);
        
        // Update charts
        updatePredictionChart(predictions, dataType, period);
        updateRiskChart(predictions.risks);
        updateImpactChart(sliderValues);
        updateGaugeValues(predictions.risks);
        
        // Update status
        updateStatus('complete', 'Simulation complete');
        
        console.log('✅ Charts updated successfully');
        
    } catch (error) {
        console.error('❌ Chart update failed:', error);
        updateStatus('error', 'Update failed: ' + error.message);
    }
}

function getRegionalData(region) {
    const data = {
        'india-mumbai': { temp: 28.5, rain: 120, humidity: 75, co2: 420 },
        'india-delhi': { temp: 32, rain: 65, humidity: 60, co2: 450 },
        'india-kolkata': { temp: 30, rain: 140, humidity: 80, co2: 430 },
        'india-gujarat': { temp: 35, rain: 45, humidity: 55, co2: 440 },
        'india-chennai': { temp: 31, rain: 95, humidity: 78, co2: 425 },
        'india-kashmir': { temp: 18, rain: 180, humidity: 65, co2: 380 },
        'usa-california': { temp: 22, rain: 85, humidity: 60, co2: 410 },
        'usa-texas': { temp: 28, rain: 75, humidity: 65, co2: 415 },
        'usa-florida': { temp: 26, rain: 130, humidity: 80, co2: 405 },
        'usa-newyork': { temp: 15, rain: 110, humidity: 70, co2: 400 },
        'china-beijing': { temp: 14, rain: 60, humidity: 55, co2: 480 },
        'china-shanghai': { temp: 18, rain: 115, humidity: 75, co2: 470 },
        'uk-london': { temp: 12, rain: 150, humidity: 75, co2: 390 },
        'uae-dubai': { temp: 38, rain: 15, humidity: 45, co2: 450 },
        'pakistan-karachi': { temp: 30, rain: 35, humidity: 70, co2: 435 },
        'russia-moscow': { temp: 8, rain: 90, humidity: 70, co2: 420 }
    };
    
    return data[region] || { temp: 25, rain: 100, humidity: 65, co2: 410 };
}

function applySliderImpacts(baseData, sliders, dataType) {
    const adjusted = { ...baseData };
    
    // Apply each slider's impact
    Object.keys(sliders).forEach(sliderId => {
        const value = sliders[sliderId];
        if (Math.abs(value) > 0) {
            const impact = getSliderImpact(sliderId, value);
            adjusted.temp += impact.temp || 0;
            adjusted.rain += impact.rain || 0;
            adjusted.humidity += impact.humidity || 0;
            adjusted.co2 += impact.co2 || 0;
        }
    });
    
    // Keep in bounds
    adjusted.temp = Math.max(-10, Math.min(50, adjusted.temp));
    adjusted.rain = Math.max(0, Math.min(500, adjusted.rain));
    adjusted.humidity = Math.max(10, Math.min(100, adjusted.humidity));
    adjusted.co2 = Math.max(300, Math.min(800, adjusted.co2));
    
    return adjusted;
}

function getSliderImpact(sliderId, value) {
    const impacts = {
        'reforestation': { temp: -value * 0.01, rain: value * 0.3, co2: -value * 1.5 },
        'industrialExpansion': { temp: value * 0.02, rain: -value * 0.2, co2: value * 2 },
        'wildlifeProtection': { temp: -value * 0.005, rain: value * 0.1 },
        'co2Reduction': { temp: -value * 0.015, co2: -value * 2 },
        'renewableEnergy': { temp: -value * 0.01, co2: -value * 1.2 },
        'renewableAdoption': { temp: -value * 0.01, co2: -value * 1.2 },
        'urbanHeatControl': { temp: -value * 0.008 },
        'industrialReduction': { temp: -value * 0.02, co2: -value * 2.5 },
        'forestExpansion': { temp: -value * 0.008, rain: value * 0.25, co2: -value * 1.8 },
        'deforestationRate': { temp: value * 0.01, rain: -value * 0.5 },
        'cloudSeeding': { rain: value * 0.2 },
        'waterConservation': { rain: value * 0.1, humidity: value * 0.05 },
        'waterRecycling': { rain: value * 0.15, humidity: value * 0.1 },
        'deforestationImpact': { temp: value * 0.01, rain: -value * 0.5 },
        'irrigationEfficiency': { rain: value * 0.08, humidity: value * 0.08 }
    };
    
    return impacts[sliderId] || { temp: 0, rain: 0, humidity: 0, co2: 0 };
}

function generatePredictions(data, period, dataType) {
    const years = Math.ceil(period);
    const labels = Array.from({length: years}, (_, i) => `Year ${i + 1}`);
    
    // Get base value for data type
    const baseValue = getBaseValue(data, dataType);
    
    // Generate time series
    const values = [];
    let current = baseValue;
    const growthRate = getGrowthRate(dataType, data);
    
    for (let i = 0; i < years; i++) {
        current += growthRate + (Math.random() - 0.5) * 0.3;
        values.push(Math.round(current * 100) / 100);
    }
    
    // Calculate risks
    const risks = calculateRisks(data, values[values.length - 1]);
    
    return {
        labels: labels,
        values: values,
        risks: risks
    };
}

function getBaseValue(data, dataType) {
    const mapping = {
        'temperature': data.temp,
        'co2': data.co2,
        'rainfall': data.rain,
        'drought': Math.max(0, 100 - data.rain),
        'deforestation': Math.max(5, 30 - data.rain / 10),
        'globalwarming': Math.max(0, data.temp - 15),
        'ecologicalshifts': Math.abs(data.temp - 25) + Math.abs(data.rain - 100) / 10,
        'disasterimpacts': Math.max(0, (data.temp - 20) + (100 - data.rain) / 5)
    };
    
    return mapping[dataType] || data.temp;
}

function getGrowthRate(dataType, data) {
    const rates = {
        'temperature': 0.1 + (data.co2 - 400) * 0.001,
        'co2': 2.5 - (data.rain / 200),
        'rainfall': -0.5 - (data.temp - 25) * 0.05,
        'drought': 0.3 + (data.temp - 25) * 0.02,
        'deforestation': 0.2 + (data.temp - 25) * 0.01,
        'globalwarming': 0.05 + (data.co2 - 400) * 0.0001,
        'ecologicalshifts': 0.8 + (data.temp - 25) * 0.05,
        'disasterimpacts': 1.2 + (data.temp - 25) * 0.08
    };
    
    return rates[dataType] || 0.1;
}

function calculateRisks(data, finalValue) {
    let flood = 20 + (data.rain > 150 ? 30 : 0) + (data.temp > 30 ? 15 : 0);
    let drought = 15 + (data.rain < 50 ? 40 : 0) + (data.temp > 35 ? 20 : 0);
    let heatwave = 10 + (data.temp > 30 ? 35 : 0) + (data.co2 > 450 ? 20 : 0);
    
    return {
        flood: Math.max(5, Math.min(95, Math.round(flood))),
        drought: Math.max(5, Math.min(95, Math.round(drought))),
        heatwave: Math.max(5, Math.min(95, Math.round(heatwave)))
    };
}

function updatePredictionChart(predictions, dataType, period) {
    if (!simpleCharts.prediction) return;
    
    const color = getDataTypeColor(dataType);
    const label = getDataTypeLabel(dataType);
    
    // Main dataset
    const mainDataset = {
        label: label,
        data: predictions.values,
        borderColor: color,
        backgroundColor: color + '20',
        tension: 0.4,
        fill: false
    };
    
    // Confidence intervals
    const upperBound = predictions.values.map(v => v * 1.15);
    const lowerBound = predictions.values.map(v => v * 0.85);
    
    simpleCharts.prediction.data.labels = predictions.labels;
    simpleCharts.prediction.data.datasets = [
        mainDataset,
        {
            label: 'Upper Confidence (85%)',
            data: upperBound,
            borderColor: color + '60',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            borderWidth: 1,
            pointRadius: 0,
            tension: 0.4
        },
        {
            label: 'Lower Confidence (85%)',
            data: lowerBound,
            borderColor: color + '60',
            backgroundColor: color + '20',
            borderDash: [5, 5],
            borderWidth: 1,
            pointRadius: 0,
            tension: 0.4,
            fill: '-1'
        }
    ];
    
    simpleCharts.prediction.update();
}

function updateRiskChart(risks) {
    if (!simpleCharts.risk) return;
    
    simpleCharts.risk.data.datasets[0].data = [risks.flood, risks.drought, risks.heatwave];
    simpleCharts.risk.update();
}

function updateImpactChart(sliders) {
    if (!simpleCharts.impact) return;
    
    const impacts = [];
    const labels = [];
    const colors = [];
    
    Object.keys(sliders).forEach(sliderId => {
        const value = sliders[sliderId];
        if (Math.abs(value) > 5) {
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
    
    simpleCharts.impact.data.labels = labels;
    simpleCharts.impact.data.datasets[0].data = impacts;
    simpleCharts.impact.data.datasets[0].backgroundColor = colors;
    simpleCharts.impact.update();
}

function updateGaugeValues(risks) {
    // Update gauge value displays
    const gaugeValues = [
        { id: 'floodGaugeValue', value: risks.flood },
        { id: 'droughtGaugeValue', value: risks.drought },
        { id: 'heatwaveGaugeValue', value: risks.heatwave }
    ];
    
    gaugeValues.forEach(gauge => {
        const element = document.getElementById(gauge.id);
        if (element) {
            element.textContent = `${gauge.value}%`;
        }
    });
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

console.log('✅ Simple Predictions Fix loaded');