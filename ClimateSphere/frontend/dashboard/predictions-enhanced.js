/**
 * Enhanced Predictions & Scenario Simulator
 * Dynamic climate predictions with real-time slider updates
 */

console.log('🔮 Loading Enhanced Predictions System...');

// Global state
let trendsChart = null;
let riskChart = null;
let currentScenario = null;
let simulationData = null;
let updateTimeout = null;

// Initialize the predictions system
document.addEventListener('DOMContentLoaded', () => {
    initializePredictionsSystem();
});

function initializePredictionsSystem() {
    console.log('🚀 Initializing Enhanced Predictions System...');
    
    // Test ML API connection first
    testMLAPIConnection();
    
    setupSliderListeners();
    setupButtonListeners();
    setupFilterListeners();
    initializeCharts();
    loadInitialData();
    
    console.log('✅ Enhanced Predictions System initialized');
}

// Test ML API connection
async function testMLAPIConnection() {
    try {
        const response = await fetch('http://localhost:5000/health');
        if (response.ok) {
            const data = await response.json();
            console.log('✅ ML API connected:', data.models_loaded);
            updateStatus('complete', `ML API connected - Models: ${data.models_loaded.join(', ')}`);
        } else {
            console.warn('⚠️ ML API health check failed');
            updateStatus('error', 'ML API connection issues');
        }
    } catch (error) {
        console.error('❌ ML API not accessible:', error);
        updateStatus('error', 'ML API offline - using fallback calculations');
    }
}

// Setup dynamic slider system
function setupSliderListeners() {
    // Initialize with default data type (temperature)
    updateSlidersForDataType('temperature');
}

// Update sliders based on selected data type
function updateSlidersForDataType(dataType) {
    console.log('🎛️ Updating sliders for data type:', dataType);
    
    const sliderConfigs = getSliderConfigsForDataType(dataType);
    const slidersContainer = document.getElementById('dynamicSliders');
    const dataTypeDisplay = document.getElementById('currentDataType');
    
    if (!slidersContainer) return;
    
    // Update data type display
    if (dataTypeDisplay) {
        dataTypeDisplay.textContent = getDataTypeDisplayName(dataType);
    }
    
    // Clear existing sliders
    slidersContainer.innerHTML = '';
    
    // Create new sliders
    sliderConfigs.forEach((config, index) => {
        const sliderGroup = createSliderElement(config, index);
        slidersContainer.appendChild(sliderGroup);
    });
    
    // Set up event listeners for new sliders
    setupDynamicSliderListeners();
}

// Get slider configurations for specific data type
function getSliderConfigsForDataType(dataType) {
    const sliderConfigs = {
        'temperature': [
            {
                id: 'co2Reduction',
                label: 'CO₂ Reduction',
                icon: 'fas fa-leaf',
                min: 0, max: 100, value: 20, step: 5, suffix: '%',
                description: 'Percentage reduction in CO₂ emissions to lower temperature'
            },
            {
                id: 'renewableEnergy',
                label: 'Renewable Energy',
                icon: 'fas fa-solar-panel',
                min: 0, max: 200, value: 50, step: 10, suffix: '%',
                description: 'Increase in renewable energy adoption'
            },
            {
                id: 'urbanHeatControl',
                label: 'Urban Heat Control',
                icon: 'fas fa-city',
                min: 0, max: 100, value: 30, step: 5, suffix: '%',
                description: 'Urban heat island mitigation measures'
            }
        ],
        'co2': [
            {
                id: 'industrialReduction',
                label: 'Industrial Emission Reduction',
                icon: 'fas fa-industry',
                min: 0, max: 100, value: 25, step: 5, suffix: '%',
                description: 'Reduction in industrial CO₂ emissions'
            },
            {
                id: 'forestExpansion',
                label: 'Forest Expansion',
                icon: 'fas fa-tree',
                min: 0, max: 150, value: 40, step: 10, suffix: '%',
                description: 'Increase in forest cover for carbon absorption'
            },
            {
                id: 'renewableAdoption',
                label: 'Renewable Energy Adoption',
                icon: 'fas fa-wind',
                min: 0, max: 200, value: 60, step: 10, suffix: '%',
                description: 'Adoption rate of renewable energy sources'
            }
        ],
        'rainfall': [
            {
                id: 'deforestationRate',
                label: 'Deforestation',
                icon: 'fas fa-cut',
                min: -50, max: 50, value: 0, step: 5, suffix: '%',
                description: 'Change in deforestation rate (negative = reforestation)'
            },
            {
                id: 'cloudSeeding',
                label: 'Cloud Seeding Efficiency',
                icon: 'fas fa-cloud-rain',
                min: 0, max: 100, value: 15, step: 5, suffix: '%',
                description: 'Effectiveness of cloud seeding programs'
            },
            {
                id: 'waterConservation',
                label: 'Water Conservation',
                icon: 'fas fa-tint',
                min: 0, max: 100, value: 35, step: 5, suffix: '%',
                description: 'Water conservation and management efficiency'
            }
        ],
        'drought': [
            {
                id: 'waterRecycling',
                label: 'Water Recycling',
                icon: 'fas fa-recycle',
                min: 0, max: 100, value: 40, step: 5, suffix: '%',
                description: 'Water recycling and reuse efficiency'
            },
            {
                id: 'deforestationImpact',
                label: 'Deforestation',
                icon: 'fas fa-tree',
                min: -80, max: 20, value: -10, step: 5, suffix: '%',
                description: 'Change in deforestation affecting water cycles'
            },
            {
                id: 'irrigationEfficiency',
                label: 'Irrigation Efficiency',
                icon: 'fas fa-seedling',
                min: 0, max: 100, value: 45, step: 5, suffix: '%',
                description: 'Improvement in irrigation system efficiency'
            }
        ],
        'deforestation': [
            {
                id: 'reforestation',
                label: 'Reforestation',
                icon: 'fas fa-tree',
                min: 0, max: 200, value: 50, step: 10, suffix: '%',
                description: 'Reforestation and afforestation programs'
            },
            {
                id: 'industrialExpansion',
                label: 'Industrial Expansion',
                icon: 'fas fa-industry',
                min: -30, max: 100, value: 10, step: 5, suffix: '%',
                description: 'Change in industrial land use'
            },
            {
                id: 'wildlifeProtection',
                label: 'Wildlife Protection',
                icon: 'fas fa-paw',
                min: 0, max: 100, value: 60, step: 5, suffix: '%',
                description: 'Wildlife habitat protection measures'
            }
        ]
    };
    
    // Default sliders for other data types
    const defaultSliders = [
        {
            id: 'generalImpact1',
            label: 'Environmental Policy',
            icon: 'fas fa-balance-scale',
            min: 0, max: 100, value: 30, step: 5, suffix: '%',
            description: 'Strength of environmental policy implementation'
        },
        {
            id: 'generalImpact2',
            label: 'Technology Adoption',
            icon: 'fas fa-microchip',
            min: 0, max: 100, value: 40, step: 5, suffix: '%',
            description: 'Adoption rate of green technologies'
        },
        {
            id: 'generalImpact3',
            label: 'Conservation Efforts',
            icon: 'fas fa-shield-alt',
            min: 0, max: 100, value: 35, step: 5, suffix: '%',
            description: 'Conservation and protection efforts'
        }
    ];
    
    return sliderConfigs[dataType] || defaultSliders;
}

// Create slider HTML element
function createSliderElement(config, index) {
    const sliderGroup = document.createElement('div');
    sliderGroup.className = 'slider-group';
    
    sliderGroup.innerHTML = `
        <div class="slider-label">
            <i class="${config.icon}"></i> ${config.label}
        </div>
        <div class="slider-container">
            <input type="range" id="${config.id}" class="scenario-slider" 
                   min="${config.min}" max="${config.max}" value="${config.value}" step="${config.step}">
            <div class="slider-value" id="${config.id}Value">${config.value}${config.suffix}</div>
        </div>
        <div class="slider-description">
            ${config.description}
        </div>
    `;
    
    return sliderGroup;
}

// Setup event listeners for dynamic sliders
function setupDynamicSliderListeners() {
    const sliders = document.querySelectorAll('.scenario-slider');
    
    sliders.forEach(slider => {
        const valueElement = document.getElementById(slider.id + 'Value');
        
        if (valueElement) {
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const suffix = valueElement.textContent.match(/[%°C]/g)?.[0] || '';
                valueElement.textContent = value + suffix;
                
                // Debounced update to prevent too many API calls
                clearTimeout(updateTimeout);
                updateTimeout = setTimeout(() => {
                    updatePredictions();
                }, 500);
            });
        }
    });
}

// Get display name for data type
function getDataTypeDisplayName(dataType) {
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
    
    return displayNames[dataType] || dataType;
}

// Setup button event listeners
function setupButtonListeners() {
    document.getElementById('runSimulationBtn').addEventListener('click', runFullSimulation);
    document.getElementById('saveScenarioBtn').addEventListener('click', saveCurrentScenario);
    document.getElementById('downloadReportBtn').addEventListener('click', downloadReport);
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
}

// Setup filter change listeners
function setupFilterListeners() {
    const filters = ['regionSelect', 'periodSelect', 'targetSelect', 'confidenceSelect'];
    
    filters.forEach(filterId => {
        const element = document.getElementById(filterId);
        if (element) {
            element.addEventListener('change', () => {
                // Special handling for data type change
                if (filterId === 'targetSelect') {
                    updateSlidersForDataType(element.value);
                }
                updatePredictions();
            });
        }
    });
}

// Initialize Chart.js charts
function initializeCharts() {
    console.log('📊 Initializing enhanced charts...');
    
    // 1. Prediction Chart with Confidence Interval
    const predictionCtx = document.getElementById('predictionChart').getContext('2d');
    trendsChart = new Chart(predictionCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Value'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time Period'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
    
    // 2. Risk Bar Chart
    const riskBarCtx = document.getElementById('riskBarChart').getContext('2d');
    riskChart = new Chart(riskBarCtx, {
        type: 'bar',
        data: {
            labels: ['Flood Risk', 'Drought Risk', 'Heatwave Risk'],
            datasets: [{
                label: 'Risk Probability (%)',
                data: [0, 0, 0],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(245, 158, 11, 0.8)', 
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    '#3b82f6',
                    '#f59e0b',
                    '#ef4444'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Probability (%)'
                    }
                }
            }
        }
    });
    
    // 3. Scenario Impact Chart
    const impactCtx = document.getElementById('impactChart').getContext('2d');
    window.impactChart = new Chart(impactCtx, {
        type: 'horizontalBar',
        data: {
            labels: [],
            datasets: [{
                label: 'Impact (%)',
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
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Impact (%)'
                    }
                }
            }
        }
    });
    
    // Initialize gauge charts
    initializeGaugeCharts();
    
    // Add some initial data to prevent empty chart
    setTimeout(() => {
        if (trendsChart && trendsChart.data.datasets.length === 0) {
            console.log('📊 Adding initial chart data...');
            const initialData = {
                labels: ['Year 1'],
                datasets: [{
                    label: 'Temperature',
                    data: [25],
                    borderColor: '#ef4444',
                    backgroundColor: '#ef444420',
                    tension: 0.4,
                    fill: false
                }]
            };
            trendsChart.data = initialData;
            trendsChart.update();
        }
    }, 500);
    
    console.log('✅ Enhanced charts initialized');
}

// Initialize gauge charts for risk indicators
function initializeGaugeCharts() {
    const gaugeOptions = {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
        }
    };
    
    // Flood Risk Gauge
    const floodGaugeCtx = document.getElementById('floodGaugeChart').getContext('2d');
    window.floodGaugeChart = new Chart(floodGaugeCtx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [0, 100],
                backgroundColor: ['#3b82f6', '#e5e7eb'],
                borderWidth: 0,
                cutout: '70%'
            }]
        },
        options: gaugeOptions
    });
    
    // Drought Risk Gauge
    const droughtGaugeCtx = document.getElementById('droughtGaugeChart').getContext('2d');
    window.droughtGaugeChart = new Chart(droughtGaugeCtx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [0, 100],
                backgroundColor: ['#f59e0b', '#e5e7eb'],
                borderWidth: 0,
                cutout: '70%'
            }]
        },
        options: gaugeOptions
    });
    
    // Heatwave Risk Gauge
    const heatwaveGaugeCtx = document.getElementById('heatwaveGaugeChart').getContext('2d');
    window.heatwaveGaugeChart = new Chart(heatwaveGaugeCtx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [0, 100],
                backgroundColor: ['#ef4444', '#e5e7eb'],
                borderWidth: 0,
                cutout: '70%'
            }]
        },
        options: gaugeOptions
    });
}

// Load initial data and run first prediction
async function loadInitialData() {
    console.log('📊 Loading initial prediction data...');
    
    // Check for uploaded data from previous analysis
    const uploadedData = localStorage.getItem('climateSphere_uploadedData');
    if (uploadedData) {
        try {
            const parsedData = JSON.parse(uploadedData);
            console.log('📁 Found uploaded data:', parsedData.length, 'records');
            simulationData = parsedData;
        } catch (e) {
            console.warn('⚠️ Failed to parse uploaded data:', e);
        }
    }
    
    // Initialize with default data type sliders
    const defaultDataType = document.getElementById('targetSelect')?.value || 'temperature';
    updateSlidersForDataType(defaultDataType);
    
    // Add a small delay to ensure charts are fully initialized
    setTimeout(async () => {
        console.log('🚀 Running initial ML prediction...');
        await updatePredictions();
    }, 1000);
}

// Main function to update predictions based on current settings
async function updatePredictions() {
    console.log('🔄 Updating predictions...');
    
    const scenario = getCurrentScenario();
    const filters = getCurrentFilters();
    
    console.log('📊 Current scenario:', scenario);
    console.log('🎯 Current filters:', filters);
    
    try {
        // Show loading indicators
        showLoading(true);
        updateStatus('running', 'Running simulation...');
        
        // Get predictions from API or fallback
        const predictions = await getPredictions(scenario, filters);
        
        console.log('📈 Got predictions:', predictions);
        
        if (!predictions) {
            throw new Error('No predictions received');
        }
        
        // Update all charts and displays
        if (predictions.trends) {
            updateTrendsChart(predictions.trends);
        } else {
            console.error('❌ No trends data in predictions');
        }
        
        if (predictions.risks) {
            updateRiskChart(predictions.risks);
            updateScenarioImpactChart(scenario, predictions.risks);
            updateRiskIndicators(predictions.risks);
        } else {
            console.error('❌ No risks data in predictions');
        }
        
        // Store current results
        currentScenario = { scenario, filters, predictions, timestamp: new Date().toISOString() };
        
        updateStatus('complete', 'Simulation complete');
        
    } catch (error) {
        console.error('❌ Prediction update failed:', error);
        updateStatus('error', 'Simulation failed: ' + error.message);
        
        // Try to show some default data so chart isn't empty
        showDefaultChartData();
    } finally {
        showLoading(false);
    }
}

// Show default data when prediction fails
function showDefaultChartData() {
    console.log('📊 Showing default chart data...');
    
    const filters = getCurrentFilters();
    const dataType = filters.target;
    
    // Create basic default data
    const defaultData = {
        trends: {
            labels: ['Year 1'],
            datasets: [{
                label: getDataTypeDisplayName(dataType),
                data: [getRegionalDefault(filters.region, getDataTypeMapping(dataType))],
                borderColor: getDataTypeColor(dataType),
                backgroundColor: getDataTypeColor(dataType) + '20',
                tension: 0.4,
                fill: false
            }]
        },
        risks: {
            flood: 30,
            drought: 25,
            heatwave: 35
        }
    };
    
    updateTrendsChart(defaultData.trends);
    updateRiskChart(defaultData.risks);
}

// Get current scenario parameters from dynamic sliders
function getCurrentScenario() {
    const scenario = {};
    const sliders = document.querySelectorAll('.scenario-slider');
    
    sliders.forEach(slider => {
        const value = parseFloat(slider.value);
        scenario[slider.id] = value;
    });
    
    // Also include the selected data type for context
    const targetSelect = document.getElementById('targetSelect');
    if (targetSelect) {
        scenario.dataType = targetSelect.value;
    }
    
    return scenario;
}

// Get current filter settings
function getCurrentFilters() {
    return {
        region: document.getElementById('regionSelect').value,
        period: parseInt(document.getElementById('periodSelect').value),
        target: document.getElementById('targetSelect').value,
        confidence: document.getElementById('confidenceSelect').value
    };
}

// Get predictions from API or use fallback calculation
async function getPredictions(scenario, filters) {
    console.log('🔬 Getting predictions for scenario:', scenario, 'filters:', filters);
    
    // First, get base climate data for the region and data type
    const baseData = getBaseClimateData(filters);
    
    try {
        // Call the ML API with real climate parameters
        const response = await fetch('http://localhost:5000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                temperature: baseData.temperature,
                rainfall: baseData.rainfall,
                humidity: baseData.humidity,
                co2_level: baseData.co2_level
            })
        });
        
        if (response.ok) {
            const apiData = await response.json();
            console.log('✅ Got ML API predictions:', apiData);
            
            // Process the real ML predictions
            return processMLPredictions(apiData, scenario, filters, baseData);
        }
    } catch (error) {
        console.warn('⚠️ ML API call failed:', error);
    }
    
    // If API fails, try the scenario endpoint
    try {
        const response = await fetch('http://localhost:5000/scenario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...scenario,
                ...filters,
                uploadedData: simulationData
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Got scenario API predictions:', data);
            return processPredictionData(data, filters);
        }
    } catch (error) {
        console.warn('⚠️ Scenario API call failed:', error);
    }
    
    // Last resort: use uploaded data or realistic fallback
    return calculateRealisticPredictions(scenario, filters);
}

// Get base climate data for region and data type
function getBaseClimateData(filters) {
    // Use uploaded data if available
    if (simulationData && simulationData.length > 0) {
        const tempData = extractColumnData(simulationData, ['temperature', 'temp']);
        const rainData = extractColumnData(simulationData, ['rainfall', 'rain', 'precipitation']);
        const humidData = extractColumnData(simulationData, ['humidity', 'humid']);
        const co2Data = extractColumnData(simulationData, ['co2', 'CO2', 'carbon']);
        
        return {
            temperature: tempData.length > 0 ? tempData[tempData.length - 1] : getRegionalDefault(filters.region, 'temperature'),
            rainfall: rainData.length > 0 ? rainData[rainData.length - 1] : getRegionalDefault(filters.region, 'rainfall'),
            humidity: humidData.length > 0 ? humidData[humidData.length - 1] : getRegionalDefault(filters.region, 'humidity'),
            co2_level: co2Data.length > 0 ? co2Data[co2Data.length - 1] : getRegionalDefault(filters.region, 'co2')
        };
    }
    
    // Use regional defaults based on real climate data
    return {
        temperature: getRegionalDefault(filters.region, 'temperature'),
        rainfall: getRegionalDefault(filters.region, 'rainfall'),
        humidity: getRegionalDefault(filters.region, 'humidity'),
        co2_level: getRegionalDefault(filters.region, 'co2')
    };
}

// Get realistic regional climate defaults
function getRegionalDefault(region, parameter) {
    const regionalData = {
        'india-mumbai': { temperature: 28.5, rainfall: 120, humidity: 75, co2: 420 },
        'india-delhi': { temperature: 32, rainfall: 65, humidity: 60, co2: 450 },
        'india-kolkata': { temperature: 30, rainfall: 140, humidity: 80, co2: 430 },
        'india-gujarat': { temperature: 35, rainfall: 45, humidity: 55, co2: 440 },
        'india-chennai': { temperature: 31, rainfall: 95, humidity: 78, co2: 425 },
        'india-kashmir': { temperature: 18, rainfall: 180, humidity: 65, co2: 380 },
        'usa-california': { temperature: 22, rainfall: 85, humidity: 60, co2: 410 },
        'usa-texas': { temperature: 28, rainfall: 75, humidity: 65, co2: 415 },
        'usa-florida': { temperature: 26, rainfall: 130, humidity: 80, co2: 405 },
        'usa-newyork': { temperature: 15, rainfall: 110, humidity: 70, co2: 400 },
        'china-beijing': { temperature: 14, rainfall: 60, humidity: 55, co2: 480 },
        'china-shanghai': { temperature: 18, rainfall: 115, humidity: 75, co2: 470 },
        'china-guangzhou': { temperature: 24, rainfall: 165, humidity: 80, co2: 460 },
        'uk-london': { temperature: 12, rainfall: 150, humidity: 75, co2: 390 },
        'uk-manchester': { temperature: 10, rainfall: 170, humidity: 80, co2: 385 },
        'uk-edinburgh': { temperature: 9, rainfall: 160, humidity: 78, co2: 380 },
        'uae-dubai': { temperature: 38, rainfall: 15, humidity: 45, co2: 450 },
        'uae-abudhabi': { temperature: 37, rainfall: 12, humidity: 50, co2: 445 },
        'pakistan-karachi': { temperature: 30, rainfall: 35, humidity: 70, co2: 435 },
        'pakistan-lahore': { temperature: 28, rainfall: 55, humidity: 65, co2: 440 },
        'pakistan-islamabad': { temperature: 25, rainfall: 85, humidity: 60, co2: 425 },
        'russia-moscow': { temperature: 8, rainfall: 90, humidity: 70, co2: 420 },
        'russia-stpetersburg': { temperature: 6, rainfall: 95, humidity: 75, co2: 415 },
        'russia-novosibirsk': { temperature: 2, rainfall: 70, humidity: 65, co2: 410 }
    };
    
    const defaults = regionalData[region] || { temperature: 25, rainfall: 100, humidity: 65, co2: 410 };
    return defaults[parameter];
}

// Process ML API predictions into chart format
function processMLPredictions(apiData, scenario, filters, baseData) {
    console.log('🔄 Processing ML predictions with scenario adjustments...');
    console.log('📊 API Data:', apiData);
    console.log('🎯 Base Data:', baseData);
    
    const years = Math.ceil(filters.period);
    const isMonthly = filters.period < 1;
    const timeUnit = isMonthly ? 'Month' : 'Year';
    const labels = Array.from({length: years}, (_, i) => `${timeUnit} ${i + 1}`);
    
    // Get base predictions from ML API
    const basePredictions = apiData.predictions || {};
    
    // Apply scenario adjustments to base data
    const adjustedData = applyScenarioAdjustments(baseData, scenario, filters.target);
    
    console.log('🔧 Adjusted Data:', adjustedData);
    
    // Generate time series predictions
    const predictions = generateTimeSeriesFromML(adjustedData, years, filters.target, isMonthly);
    
    console.log('📈 Generated predictions:', predictions);
    
    // Ensure we have valid prediction data
    if (!predictions || predictions.length === 0) {
        console.warn('⚠️ No predictions generated, using fallback');
        const fallbackValue = getRegionalDefault(filters.region, getDataTypeMapping(filters.target));
        predictions = Array.from({length: years}, () => fallbackValue);
    }
    
    // Calculate adjusted risks based on ML predictions and scenario
    const adjustedRisks = calculateAdjustedRisks(basePredictions, scenario, adjustedData);
    
    const result = {
        trends: {
            labels: labels,
            datasets: [{
                label: getDataTypeDisplayName(filters.target),
                data: predictions,
                borderColor: getDataTypeColor(filters.target),
                backgroundColor: getDataTypeColor(filters.target) + '20',
                tension: 0.4,
                fill: false
            }]
        },
        risks: adjustedRisks
    };
    
    console.log('✅ Processed ML predictions result:', result);
    return result;
}

// Apply scenario adjustments to base climate data
function applyScenarioAdjustments(baseData, scenario, dataType) {
    const adjusted = { ...baseData };
    
    // Apply scenario impacts based on data type and sliders
    Object.keys(scenario).forEach(sliderKey => {
        if (sliderKey === 'dataType' || typeof scenario[sliderKey] !== 'number') return;
        
        const impact = calculateSliderImpact(sliderKey, scenario[sliderKey], dataType);
        
        // Apply impacts to relevant climate parameters
        if (sliderKey.includes('co2') || sliderKey.includes('industrial') || sliderKey.includes('renewable')) {
            adjusted.co2_level += impact.co2 || 0;
            adjusted.temperature += impact.temperature || 0;
        }
        
        if (sliderKey.includes('forest') || sliderKey.includes('deforestation')) {
            adjusted.rainfall += impact.rainfall || 0;
            adjusted.temperature += impact.temperature || 0;
        }
        
        if (sliderKey.includes('water') || sliderKey.includes('irrigation')) {
            adjusted.rainfall += impact.rainfall || 0;
            adjusted.humidity += impact.humidity || 0;
        }
    });
    
    // Ensure values stay within realistic bounds
    adjusted.temperature = Math.max(-10, Math.min(50, adjusted.temperature));
    adjusted.rainfall = Math.max(0, Math.min(500, adjusted.rainfall));
    adjusted.humidity = Math.max(10, Math.min(100, adjusted.humidity));
    adjusted.co2_level = Math.max(300, Math.min(800, adjusted.co2_level));
    
    return adjusted;
}

// Calculate specific slider impacts
function calculateSliderImpact(sliderKey, value, dataType) {
    const impacts = {
        // Temperature-related sliders
        'co2Reduction': { co2: -value * 2, temperature: -value * 0.02 },
        'renewableEnergy': { co2: -value * 1.5, temperature: -value * 0.015 },
        'urbanHeatControl': { temperature: -value * 0.01 },
        
        // CO2-related sliders
        'industrialReduction': { co2: -value * 3, temperature: -value * 0.025 },
        'forestExpansion': { co2: -value * 2.5, rainfall: value * 0.5, temperature: -value * 0.01 },
        'renewableAdoption': { co2: -value * 2, temperature: -value * 0.02 },
        
        // Rainfall-related sliders
        'deforestationRate': { rainfall: -value * 0.8, temperature: value * 0.01 },
        'cloudSeeding': { rainfall: value * 0.3 },
        'waterConservation': { rainfall: value * 0.1, humidity: value * 0.1 },
        
        // Drought-related sliders
        'waterRecycling': { rainfall: value * 0.2, humidity: value * 0.15 },
        'deforestationImpact': { rainfall: -value * 0.6, temperature: value * 0.015 },
        'irrigationEfficiency': { rainfall: value * 0.15, humidity: value * 0.1 },
        
        // Deforestation-related sliders
        'reforestation': { co2: -value * 1.8, rainfall: value * 0.4, temperature: -value * 0.008 },
        'industrialExpansion': { co2: value * 2, temperature: value * 0.02, rainfall: -value * 0.2 },
        'wildlifeProtection': { rainfall: value * 0.1, temperature: -value * 0.005 }
    };
    
    return impacts[sliderKey] || { co2: 0, temperature: 0, rainfall: 0, humidity: 0 };
}

// Generate time series from adjusted data
function generateTimeSeriesFromML(adjustedData, years, dataType, isMonthly) {
    const baseValue = adjustedData[getDataTypeMapping(dataType)];
    const timeStep = isMonthly ? 1/12 : 1;
    const data = [];
    
    // Calculate growth rate based on climate trends
    const growthRate = getClimateGrowthRate(dataType, adjustedData);
    
    let currentValue = baseValue;
    for (let i = 0; i < years; i++) {
        currentValue += growthRate * timeStep + (Math.random() - 0.5) * 0.5; // Add realistic noise
        data.push(Math.round(currentValue * 100) / 100);
    }
    
    return data;
}

// Get data type mapping to climate parameters
function getDataTypeMapping(dataType) {
    const mapping = {
        'temperature': 'temperature',
        'co2': 'co2_level',
        'rainfall': 'rainfall',
        'drought': 'rainfall', // Inverse relationship
        'deforestation': 'rainfall', // Affects rainfall
        'globalwarming': 'temperature',
        'ecologicalshifts': 'temperature',
        'disasterimpacts': 'temperature'
    };
    
    return mapping[dataType] || 'temperature';
}

// Get climate growth rates based on current conditions
function getClimateGrowthRate(dataType, adjustedData) {
    const rates = {
        'temperature': 0.1 + (adjustedData.co2_level - 400) * 0.001,
        'co2': 2.5 - (adjustedData.rainfall / 100) * 0.5,
        'rainfall': -0.5 - (adjustedData.temperature - 25) * 0.1,
        'drought': 0.3 + (adjustedData.temperature - 25) * 0.05,
        'deforestation': 0.2 + (adjustedData.temperature - 25) * 0.02,
        'globalwarming': 0.05 + (adjustedData.co2_level - 400) * 0.0001,
        'ecologicalshifts': 0.8 + (adjustedData.temperature - 25) * 0.1,
        'disasterimpacts': 1.2 + (adjustedData.temperature - 25) * 0.15
    };
    
    return rates[dataType] || 0.1;
}

// Calculate adjusted risks from ML predictions
function calculateAdjustedRisks(basePredictions, scenario, adjustedData) {
    const baseRisks = {
        flood: (basePredictions.flood?.risk_probability || 0.3) * 100,
        drought: (basePredictions.drought?.risk_probability || 0.3) * 100,
        heatwave: (basePredictions.heatwave?.risk_probability || 0.3) * 100
    };
    
    // Apply scenario adjustments to risks
    const adjustments = calculateRiskAdjustments(scenario, adjustedData);
    
    return {
        flood: Math.max(0, Math.min(100, baseRisks.flood + adjustments.flood)),
        drought: Math.max(0, Math.min(100, baseRisks.drought + adjustments.drought)),
        heatwave: Math.max(0, Math.min(100, baseRisks.heatwave + adjustments.heatwave))
    };
}

// Calculate risk adjustments based on scenario
function calculateRiskAdjustments(scenario, adjustedData) {
    let floodAdj = 0, droughtAdj = 0, heatwaveAdj = 0;
    
    // Temperature effects
    const tempDiff = adjustedData.temperature - 25;
    heatwaveAdj += tempDiff * 2;
    floodAdj += tempDiff * 0.5;
    
    // Rainfall effects
    const rainDiff = adjustedData.rainfall - 100;
    floodAdj += rainDiff * 0.3;
    droughtAdj -= rainDiff * 0.4;
    
    // CO2 effects
    const co2Diff = adjustedData.co2_level - 410;
    heatwaveAdj += co2Diff * 0.1;
    droughtAdj += co2Diff * 0.05;
    
    return { flood: floodAdj, drought: droughtAdj, heatwave: heatwaveAdj };
}

// Get color for data type
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

// Process API prediction data
function processPredictionData(apiData, filters) {
    const years = filters.period;
    const labels = Array.from({length: years}, (_, i) => `Year ${i + 1}`);
    
    return {
        trends: {
            labels: labels,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: generateTrendData(apiData.projected_conditions?.temperature || 25, years, 0.1),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Rainfall (mm)',
                    data: generateTrendData(apiData.projected_conditions?.rainfall || 100, years, -0.5),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'CO₂ (ppm)',
                    data: generateTrendData(apiData.projected_conditions?.co2_level || 400, years, 2.5),
                    borderColor: '#6b7280',
                    backgroundColor: 'rgba(107, 114, 128, 0.1)',
                    tension: 0.4
                }
            ]
        },
        risks: {
            flood: (apiData.risk_predictions?.flood || 0.5) * 100,
            drought: (apiData.risk_predictions?.drought || 0.5) * 100,
            heatwave: (apiData.risk_predictions?.heatwave || 0.5) * 100
        }
    };
}

// Realistic prediction calculation when API is unavailable
function calculateRealisticPredictions(scenario, filters) {
    console.log('🔄 Calculating fallback predictions for:', filters);
    
    const years = Math.ceil(filters.period); // Handle fractional years (months)
    const isMonthly = filters.period < 1;
    const timeUnit = isMonthly ? 'Month' : 'Year';
    const labels = Array.from({length: years}, (_, i) => `${timeUnit} ${i + 1}`);
    
    // Get filtered data based on region and data type
    const filteredData = getFilteredData(filters);
    
    // Base values from filtered data or defaults
    let baseValues = getBaseValues(filteredData, filters.target);
    
    // Apply regional adjustments
    baseValues = applyRegionalAdjustments(baseValues, filters.region);
    
    // Calculate scenario impacts
    const impacts = calculateScenarioImpacts(scenario, filters.target);
    
    // Generate predictions based on selected data type
    const predictions = generateDataTypePredictions(filters.target, baseValues, years, impacts, isMonthly);
    
    // Calculate risks based on predictions and scenario
    const risks = calculateRisksFromPredictions(predictions, scenario, filters);
    
    return {
        trends: {
            labels: labels,
            datasets: predictions.datasets
        },
        risks: risks
    };
}

// Get filtered data based on region and uploaded data
function getFilteredData(filters) {
    if (!simulationData || simulationData.length === 0) {
        return null;
    }
    
    // Filter by region if region-specific data is available
    let filteredData = simulationData;
    
    // Look for region column in data
    const regionColumns = ['region', 'location', 'city', 'country'];
    const regionColumn = regionColumns.find(col => 
        simulationData[0] && simulationData[0].hasOwnProperty(col)
    );
    
    if (regionColumn) {
        const regionName = filters.region.split('-')[1]; // Extract city/state name
        filteredData = simulationData.filter(row => 
            row[regionColumn] && row[regionColumn].toLowerCase().includes(regionName.toLowerCase())
        );
        
        if (filteredData.length === 0) {
            filteredData = simulationData; // Fallback to all data
        }
    }
    
    console.log(`📊 Filtered data: ${filteredData.length} records for region ${filters.region}`);
    return filteredData;
}

// Get base values for specific data type
function getBaseValues(filteredData, dataType) {
    const dataTypeMapping = {
        'temperature': ['temperature', 'temp', 'Temperature'],
        'co2': ['co2', 'CO2', 'carbon', 'Carbon'],
        'rainfall': ['rainfall', 'rain', 'precipitation', 'Rainfall'],
        'drought': ['drought', 'dryness', 'aridity'],
        'deforestation': ['deforestation', 'forest_loss', 'tree_cover'],
        'globalwarming': ['global_warming', 'warming', 'temperature_anomaly'],
        'ecologicalshifts': ['ecological_shift', 'biodiversity', 'species_change'],
        'disasterimpacts': ['disaster', 'damage', 'impact', 'loss']
    };
    
    const defaultValues = {
        'temperature': 25,
        'co2': 400,
        'rainfall': 100,
        'drought': 30,
        'deforestation': 15,
        'globalwarming': 1.2,
        'ecologicalshifts': 25,
        'disasterimpacts': 20
    };
    
    if (filteredData) {
        const columns = dataTypeMapping[dataType] || [dataType];
        const data = extractColumnData(filteredData, columns);
        
        if (data.length > 0) {
            return {
                current: data[data.length - 1],
                average: data.reduce((a, b) => a + b, 0) / data.length,
                trend: calculateTrendFromData(data)
            };
        }
    }
    
    return {
        current: defaultValues[dataType],
        average: defaultValues[dataType],
        trend: 0.1
    };
}

// Apply regional climate adjustments
function applyRegionalAdjustments(baseValues, region) {
    const regionalFactors = {
        // India regions
        'india-mumbai': { temp: 1.05, rainfall: 1.2, co2: 1.1 },
        'india-delhi': { temp: 1.1, rainfall: 0.8, co2: 1.15 },
        'india-kolkata': { temp: 1.0, rainfall: 1.3, co2: 1.05 },
        'india-gujarat': { temp: 1.15, rainfall: 0.7, co2: 1.2 },
        'india-chennai': { temp: 1.08, rainfall: 1.1, co2: 1.0 },
        'india-kashmir': { temp: 0.7, rainfall: 1.5, co2: 0.8 },
        
        // USA regions
        'usa-california': { temp: 1.0, rainfall: 0.8, co2: 1.05 },
        'usa-texas': { temp: 1.2, rainfall: 0.9, co2: 1.1 },
        'usa-florida': { temp: 1.1, rainfall: 1.4, co2: 1.0 },
        'usa-newyork': { temp: 0.9, rainfall: 1.0, co2: 1.05 },
        
        // Other regions
        'china-beijing': { temp: 0.95, rainfall: 0.9, co2: 1.3 },
        'uk-london': { temp: 0.8, rainfall: 1.2, co2: 0.95 },
        'uae-dubai': { temp: 1.4, rainfall: 0.3, co2: 1.2 },
        'russia-moscow': { temp: 0.6, rainfall: 1.0, co2: 1.1 }
    };
    
    const factors = regionalFactors[region] || { temp: 1.0, rainfall: 1.0, co2: 1.0 };
    
    return {
        current: baseValues.current * (factors.temp || factors.rainfall || factors.co2 || 1.0),
        average: baseValues.average * (factors.temp || factors.rainfall || factors.co2 || 1.0),
        trend: baseValues.trend
    };
}

// Calculate scenario impacts for specific data type using dynamic sliders
function calculateScenarioImpacts(scenario, dataType) {
    console.log('🧮 Calculating impacts for', dataType, 'with scenario:', scenario);
    
    let totalImpact = 0;
    
    // Data type specific impact calculations
    switch (dataType) {
        case 'temperature':
            totalImpact += (scenario.co2Reduction || 0) * -0.02; // CO₂ reduction lowers temperature
            totalImpact += (scenario.renewableEnergy || 0) * -0.01; // Renewable energy helps
            totalImpact += (scenario.urbanHeatControl || 0) * -0.015; // Urban heat control
            break;
            
        case 'co2':
            totalImpact += (scenario.industrialReduction || 0) * -2.0; // Industrial reduction
            totalImpact += (scenario.forestExpansion || 0) * -1.5; // Forest expansion absorbs CO₂
            totalImpact += (scenario.renewableAdoption || 0) * -1.0; // Renewable adoption
            break;
            
        case 'rainfall':
            totalImpact += (scenario.deforestationRate || 0) * -0.3; // Deforestation affects rainfall
            totalImpact += (scenario.cloudSeeding || 0) * 0.2; // Cloud seeding increases rainfall
            totalImpact += (scenario.waterConservation || 0) * 0.1; // Conservation helps maintain cycles
            break;
            
        case 'drought':
            totalImpact += (scenario.waterRecycling || 0) * -0.4; // Water recycling reduces drought
            totalImpact += (scenario.deforestationImpact || 0) * 0.3; // Deforestation worsens drought
            totalImpact += (scenario.irrigationEfficiency || 0) * -0.25; // Efficient irrigation helps
            break;
            
        case 'deforestation':
            totalImpact += (scenario.reforestation || 0) * -0.8; // Reforestation reduces deforestation
            totalImpact += (scenario.industrialExpansion || 0) * 0.4; // Industrial expansion increases it
            totalImpact += (scenario.wildlifeProtection || 0) * -0.3; // Protection reduces deforestation
            break;
            
        case 'globalwarming':
            totalImpact += (scenario.generalImpact1 || 0) * -0.02; // Environmental policy
            totalImpact += (scenario.generalImpact2 || 0) * -0.015; // Technology adoption
            totalImpact += (scenario.generalImpact3 || 0) * -0.01; // Conservation efforts
            break;
            
        case 'ecologicalshifts':
            totalImpact += (scenario.generalImpact1 || 0) * -0.3; // Environmental policy
            totalImpact += (scenario.generalImpact2 || 0) * -0.2; // Technology adoption
            totalImpact += (scenario.generalImpact3 || 0) * -0.4; // Conservation efforts
            break;
            
        case 'disasterimpacts':
            totalImpact += (scenario.generalImpact1 || 0) * -0.25; // Environmental policy
            totalImpact += (scenario.generalImpact2 || 0) * -0.2; // Technology adoption
            totalImpact += (scenario.generalImpact3 || 0) * -0.3; // Conservation efforts
            break;
            
        default:
            // Generic calculation for unknown data types
            Object.keys(scenario).forEach(key => {
                if (key !== 'dataType' && typeof scenario[key] === 'number') {
                    totalImpact += scenario[key] * -0.01; // Assume positive actions reduce negative impacts
                }
            });
    }
    
    return totalImpact / 100; // Normalize the impact
}

// Generate predictions for specific data type
function generateDataTypePredictions(dataType, baseValues, years, impact, isMonthly) {
    const growthRate = baseValues.trend + impact / years;
    const timeStep = isMonthly ? 1/12 : 1;
    
    const data = generateTrendData(baseValues.current, years, growthRate * timeStep);
    
    const dataTypeConfig = {
        'temperature': { label: 'Temperature (°C)', color: '#ef4444' },
        'co2': { label: 'CO₂ (ppm)', color: '#6b7280' },
        'rainfall': { label: 'Rainfall (mm)', color: '#3b82f6' },
        'drought': { label: 'Drought Index (%)', color: '#f59e0b' },
        'deforestation': { label: 'Deforestation Rate (%)', color: '#10b981' },
        'globalwarming': { label: 'Global Warming (°C)', color: '#dc2626' },
        'ecologicalshifts': { label: 'Ecological Shift Index', color: '#059669' },
        'disasterimpacts': { label: 'Disaster Impact Index', color: '#7c2d12' }
    };
    
    const config = dataTypeConfig[dataType] || { label: dataType, color: '#6b7280' };
    
    return {
        datasets: [{
            label: config.label,
            data: data,
            borderColor: config.color,
            backgroundColor: config.color + '20',
            tension: 0.4,
            fill: true
        }]
    };
}

// Calculate trend from historical data
function calculateTrendFromData(data) {
    if (data.length < 2) return 0.1;
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    return (secondAvg - firstAvg) / firstHalf.length;
}

// Calculate risks from predictions
function calculateRisksFromPredictions(predictions, scenario, filters) {
    const finalValue = predictions.datasets[0].data[predictions.datasets[0].data.length - 1];
    
    // Base risk calculation varies by data type
    let floodRisk, droughtRisk, heatwaveRisk;
    
    switch (filters.target) {
        case 'temperature':
            floodRisk = Math.min(100, Math.max(0, (finalValue > 30 ? 60 : 20) + scenario.deforestationChange));
            droughtRisk = Math.min(100, Math.max(0, (finalValue > 35 ? 70 : 30) + scenario.co2Change / 2));
            heatwaveRisk = Math.min(100, Math.max(0, (finalValue > 32 ? 80 : 25) + scenario.industryChange));
            break;
            
        case 'rainfall':
            floodRisk = Math.min(100, Math.max(0, (finalValue > 150 ? 80 : 20) - scenario.renewableIncrease / 4));
            droughtRisk = Math.min(100, Math.max(0, (finalValue < 50 ? 90 : 15) + scenario.deforestationChange));
            heatwaveRisk = Math.min(100, Math.max(0, 40 + scenario.co2Change / 3));
            break;
            
        case 'co2':
            floodRisk = Math.min(100, Math.max(0, 30 + (finalValue > 450 ? 40 : 0)));
            droughtRisk = Math.min(100, Math.max(0, 25 + (finalValue > 500 ? 50 : 0)));
            heatwaveRisk = Math.min(100, Math.max(0, (finalValue > 450 ? 70 : 30) + scenario.industryChange));
            break;
            
        default:
            // Generic risk calculation for other data types
            floodRisk = Math.min(100, Math.max(0, 30 + finalValue / 3 + scenario.deforestationChange));
            droughtRisk = Math.min(100, Math.max(0, 25 + finalValue / 4 + scenario.co2Change / 2));
            heatwaveRisk = Math.min(100, Math.max(0, 35 + finalValue / 2 + scenario.industryChange));
    }
    
    return {
        flood: Math.round(floodRisk),
        drought: Math.round(droughtRisk),
        heatwave: Math.round(heatwaveRisk)
    };
}

// Generate trend data with growth rate
function generateTrendData(baseValue, years, growthRate) {
    const data = [];
    let currentValue = baseValue;
    
    for (let i = 0; i < years; i++) {
        currentValue += growthRate + (Math.random() - 0.5) * 0.5; // Add some noise
        data.push(Math.round(currentValue * 100) / 100);
    }
    
    return data;
}

// Extract column data from uploaded dataset
function extractColumnData(data, possibleColumns) {
    for (const col of possibleColumns) {
        if (data[0] && data[0].hasOwnProperty(col)) {
            return data
                .map(row => parseFloat(row[col]))
                .filter(val => !isNaN(val));
        }
    }
    return [];
}

// Update prediction chart with confidence intervals
function updateTrendsChart(trendsData) {
    console.log('📈 Updating trends chart with data:', trendsData);
    
    if (!trendsChart) {
        console.error('❌ Trends chart not initialized!');
        return;
    }
    
    if (!trendsData || !trendsData.datasets || trendsData.datasets.length === 0) {
        console.error('❌ No trends data provided!');
        return;
    }
    
    // Update chart title based on data type
    const dataType = getCurrentFilters().target;
    const chartTitle = document.getElementById('predictionChartTitle');
    if (chartTitle) {
        chartTitle.textContent = `${getDataTypeDisplayName(dataType)} Prediction with Confidence Interval`;
    }
    
    // Add confidence interval datasets
    const mainDataset = trendsData.datasets[0];
    if (!mainDataset || !mainDataset.data || mainDataset.data.length === 0) {
        console.error('❌ Main dataset is empty!');
        return;
    }
    
    console.log('📊 Main dataset:', mainDataset);
    
    const confidenceDatasets = generateConfidenceIntervals(mainDataset);
    
    trendsChart.data.labels = trendsData.labels;
    trendsChart.data.datasets = [mainDataset, ...confidenceDatasets];
    
    // Force chart update
    trendsChart.update('active');
    
    console.log('✅ Prediction chart updated successfully with', trendsChart.data.datasets.length, 'datasets');
}

// Update risk bar chart
function updateRiskChart(risks) {
    if (!riskChart) return;
    
    riskChart.data.datasets[0].data = [risks.flood, risks.drought, risks.heatwave];
    riskChart.update('active');
    
    // Update gauge charts
    updateGaugeCharts(risks);
    
    console.log('📊 Risk bar chart updated');
}

// Generate confidence interval datasets
function generateConfidenceIntervals(mainDataset) {
    const upperBound = mainDataset.data.map(value => value * 1.15); // +15% confidence
    const lowerBound = mainDataset.data.map(value => value * 0.85); // -15% confidence
    
    return [
        {
            label: 'Upper Confidence (85%)',
            data: upperBound,
            borderColor: mainDataset.borderColor + '40',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            borderWidth: 1,
            pointRadius: 0,
            tension: 0.4
        },
        {
            label: 'Lower Confidence (85%)',
            data: lowerBound,
            borderColor: mainDataset.borderColor + '40',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            borderWidth: 1,
            pointRadius: 0,
            tension: 0.4,
            fill: '-1'
        }
    ];
}

// Update gauge charts
function updateGaugeCharts(risks) {
    const gauges = [
        { chart: window.floodGaugeChart, value: risks.flood, valueEl: 'floodGaugeValue', changeEl: 'floodChange' },
        { chart: window.droughtGaugeChart, value: risks.drought, valueEl: 'droughtGaugeValue', changeEl: 'droughtChange' },
        { chart: window.heatwaveGaugeChart, value: risks.heatwave, valueEl: 'heatwaveGaugeValue', changeEl: 'heatwaveChange' }
    ];
    
    gauges.forEach(gauge => {
        if (gauge.chart) {
            const value = Math.round(gauge.value);
            gauge.chart.data.datasets[0].data = [value, 100 - value];
            gauge.chart.update('none');
            
            // Update value display
            const valueEl = document.getElementById(gauge.valueEl);
            if (valueEl) {
                valueEl.textContent = `${value}%`;
            }
            
            // Update change indicator (compare with baseline)
            const changeEl = document.getElementById(gauge.changeEl);
            if (changeEl) {
                const baseline = 30; // Assume 30% baseline risk
                const change = value - baseline;
                
                if (Math.abs(change) < 5) {
                    changeEl.textContent = 'No significant change';
                    changeEl.className = 'gauge-change neutral';
                } else if (change > 0) {
                    changeEl.textContent = `↑ ${change.toFixed(1)}% increase`;
                    changeEl.className = 'gauge-change positive';
                } else {
                    changeEl.textContent = `↓ ${Math.abs(change).toFixed(1)}% decrease`;
                    changeEl.className = 'gauge-change negative';
                }
            }
        }
    });
}

// Update scenario impact chart
function updateScenarioImpactChart(scenario, risks) {
    if (!window.impactChart) return;
    
    const impacts = calculateScenarioImpacts(scenario, risks);
    
    window.impactChart.data.labels = impacts.labels;
    window.impactChart.data.datasets[0].data = impacts.values;
    window.impactChart.data.datasets[0].backgroundColor = impacts.colors;
    window.impactChart.data.datasets[0].borderColor = impacts.borderColors;
    window.impactChart.update('active');
    
    // Update impact summary
    updateImpactSummary(impacts);
    
    console.log('📊 Scenario impact chart updated');
}

// Calculate scenario impacts for visualization
function calculateScenarioImpacts(scenario, risks) {
    const impacts = {
        labels: [],
        values: [],
        colors: [],
        borderColors: [],
        summaryItems: []
    };
    
    // Analyze each slider's impact
    Object.keys(scenario).forEach(key => {
        if (key === 'dataType' || typeof scenario[key] !== 'number') return;
        
        const value = scenario[key];
        const impact = calculateIndividualImpact(key, value);
        
        if (Math.abs(impact) > 1) { // Only show significant impacts
            impacts.labels.push(formatSliderName(key));
            impacts.values.push(impact);
            
            // Color based on impact direction
            if (impact > 0) {
                impacts.colors.push('rgba(239, 68, 68, 0.8)'); // Red for negative impact
                impacts.borderColors.push('#ef4444');
            } else {
                impacts.colors.push('rgba(16, 185, 129, 0.8)'); // Green for positive impact
                impacts.borderColors.push('#10b981');
            }
            
            // Add to summary
            impacts.summaryItems.push({
                action: `${formatSliderName(key)}: ${value > 0 ? '+' : ''}${value}%`,
                result: `${impact > 0 ? '+' : ''}${impact.toFixed(1)}% risk change`,
                isPositive: impact < 0
            });
        }
    });
    
    return impacts;
}

// Calculate individual slider impact
function calculateIndividualImpact(sliderKey, value) {
    const impactFactors = {
        // Temperature sliders
        'co2Reduction': -0.3,
        'renewableEnergy': -0.2,
        'urbanHeatControl': -0.25,
        
        // CO2 sliders
        'industrialReduction': -0.4,
        'forestExpansion': -0.35,
        'renewableAdoption': -0.3,
        
        // Rainfall sliders
        'deforestationRate': 0.4,
        'cloudSeeding': -0.2,
        'waterConservation': -0.15,
        
        // Drought sliders
        'waterRecycling': -0.35,
        'deforestationImpact': 0.3,
        'irrigationEfficiency': -0.25,
        
        // Deforestation sliders
        'reforestation': -0.5,
        'industrialExpansion': 0.3,
        'wildlifeProtection': -0.2,
        
        // General sliders
        'generalImpact1': -0.2,
        'generalImpact2': -0.15,
        'generalImpact3': -0.25
    };
    
    const factor = impactFactors[sliderKey] || -0.1;
    return value * factor;
}

// Format slider name for display
function formatSliderName(sliderKey) {
    const nameMap = {
        'co2Reduction': 'CO₂ Reduction',
        'renewableEnergy': 'Renewable Energy',
        'urbanHeatControl': 'Urban Heat Control',
        'industrialReduction': 'Industrial Reduction',
        'forestExpansion': 'Forest Expansion',
        'renewableAdoption': 'Renewable Adoption',
        'deforestationRate': 'Deforestation Rate',
        'cloudSeeding': 'Cloud Seeding',
        'waterConservation': 'Water Conservation',
        'waterRecycling': 'Water Recycling',
        'deforestationImpact': 'Deforestation Impact',
        'irrigationEfficiency': 'Irrigation Efficiency',
        'reforestation': 'Reforestation',
        'industrialExpansion': 'Industrial Expansion',
        'wildlifeProtection': 'Wildlife Protection',
        'generalImpact1': 'Environmental Policy',
        'generalImpact2': 'Technology Adoption',
        'generalImpact3': 'Conservation Efforts'
    };
    
    return nameMap[sliderKey] || sliderKey;
}

// Update impact summary display
function updateImpactSummary(impacts) {
    const summaryContainer = document.getElementById('impactItems');
    if (!summaryContainer) return;
    
    if (impacts.summaryItems.length === 0) {
        summaryContainer.innerHTML = '<div class="impact-item"><span class="impact-action">No significant impacts detected</span></div>';
        return;
    }
    
    const summaryHTML = impacts.summaryItems.map(item => `
        <div class="impact-item">
            <span class="impact-action">${item.action}</span>
            <span class="impact-result ${item.isPositive ? '' : 'negative'}">${item.result}</span>
        </div>
    `).join('');
    
    summaryContainer.innerHTML = summaryHTML;
}

// Update risk indicator cards
function updateRiskIndicators(risks) {
    updateRiskCard('flood', risks.flood);
    updateRiskCard('drought', risks.drought);
    updateRiskCard('heatwave', risks.heatwave);
}

// Update individual risk card
function updateRiskCard(type, value) {
    const card = document.getElementById(`${type}Risk`);
    const valueEl = document.getElementById(`${type}Value`);
    const levelEl = document.getElementById(`${type}Level`);
    
    if (!card || !valueEl || !levelEl) return;
    
    // Update value
    valueEl.textContent = `${Math.round(value)}%`;
    
    // Determine risk level and styling
    let level, className;
    if (value >= 70) {
        level = 'High';
        className = 'high';
    } else if (value >= 40) {
        level = 'Medium';
        className = 'medium';
    } else {
        level = 'Low';
        className = 'low';
    }
    
    levelEl.textContent = level;
    
    // Update card styling
    card.className = `risk-card ${className}`;
}

// Show/hide loading indicators
function showLoading(show) {
    const loadingElements = ['predictionLoading', 'riskBarLoading', 'impactLoading'];
    loadingElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = show ? 'flex' : 'none';
        }
    });
}

// Update status indicator
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

// Run full simulation (button click)
async function runFullSimulation() {
    console.log('🚀 Running full simulation...');
    await updatePredictions();
}

// Save current scenario
function saveCurrentScenario() {
    if (!currentScenario) {
        alert('Please run a simulation first');
        return;
    }
    
    const scenarioName = prompt('Enter a name for this scenario:');
    if (!scenarioName) return;
    
    const savedScenarios = JSON.parse(localStorage.getItem('climateSphere_scenarios') || '[]');
    savedScenarios.push({
        name: scenarioName,
        ...currentScenario
    });
    
    localStorage.setItem('climateSphere_scenarios', JSON.stringify(savedScenarios));
    alert(`Scenario "${scenarioName}" saved successfully!`);
    
    console.log('💾 Scenario saved:', scenarioName);
}

// Download comprehensive report
function downloadReport() {
    if (!currentScenario) {
        alert('Please run a simulation first');
        return;
    }
    
    const report = {
        title: 'ClimateSphere Prediction Report',
        generatedAt: new Date().toISOString(),
        scenario: currentScenario.scenario,
        filters: currentScenario.filters,
        predictions: currentScenario.predictions,
        summary: generateReportSummary(currentScenario)
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `climate-prediction-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    
    console.log('📥 Report downloaded');
}

// Export data in CSV format
function exportData() {
    if (!currentScenario) {
        alert('Please run a simulation first');
        return;
    }
    
    const trends = currentScenario.predictions.trends;
    const risks = currentScenario.predictions.risks;
    
    let csv = 'Year,Temperature,Rainfall,CO2,FloodRisk,DroughtRisk,HeatwaveRisk\n';
    
    for (let i = 0; i < trends.labels.length; i++) {
        const temp = trends.datasets[0].data[i] || '';
        const rainfall = trends.datasets[1].data[i] || '';
        const co2 = trends.datasets[2].data[i] || '';
        
        csv += `${i + 1},${temp},${rainfall},${co2},${risks.flood},${risks.drought},${risks.heatwave}\n`;
    }
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `climate-prediction-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    
    console.log('📊 Data exported');
}

// Generate report summary
function generateReportSummary(scenario) {
    const risks = scenario.predictions.risks;
    const highestRisk = Object.keys(risks).reduce((a, b) => risks[a] > risks[b] ? a : b);
    
    return {
        highestRisk: highestRisk,
        averageRisk: (risks.flood + risks.drought + risks.heatwave) / 3,
        scenarioImpact: analyzeScenarioImpact(scenario.scenario),
        recommendations: generateRecommendations(risks, scenario.scenario)
    };
}

// Analyze scenario impact
function analyzeScenarioImpact(scenario) {
    const impacts = [];
    
    if (scenario.co2Change > 20) impacts.push('High CO₂ increase will significantly worsen climate conditions');
    if (scenario.deforestationChange > 10) impacts.push('Increased deforestation will reduce carbon absorption');
    if (scenario.renewableIncrease > 100) impacts.push('High renewable adoption will help mitigate climate change');
    if (scenario.industryChange > 50) impacts.push('Industrial growth will increase emissions');
    
    return impacts;
}

// Generate recommendations
function generateRecommendations(risks, scenario) {
    const recommendations = [];
    
    if (risks.flood > 60) recommendations.push('Implement flood management infrastructure');
    if (risks.drought > 60) recommendations.push('Develop water conservation strategies');
    if (risks.heatwave > 60) recommendations.push('Prepare heat emergency response systems');
    
    if (scenario.co2Change > 0) recommendations.push('Reduce CO₂ emissions through policy changes');
    if (scenario.renewableIncrease < 50) recommendations.push('Increase renewable energy investment');
    
    return recommendations;
}

console.log('✅ Enhanced Predictions System loaded');