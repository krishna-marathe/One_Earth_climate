/**
 * Complete Working Chart System
 * Combines all functionality with proper initialization
 */

console.log('🚀 Loading Complete Working Chart System...');

// Global state
let globalCharts = {
    prediction: null,
    risk: null,
    impact: null,
    initialized: false
};

let currentScenario = {};
let updateTimeout = null;

// Initialize system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📋 DOM loaded, initializing system...');
    setTimeout(initializeCompleteSystem, 1000);
});

function initializeCompleteSystem() {
    console.log('🎯 Initializing Complete Working System...');
    
    try {
        // 1. Verify Chart.js is loaded
        if (typeof Chart === 'undefined') {
            throw new Error('Chart.js not loaded');
        }
        
        // 2. Initialize charts
        initializeAllCharts();
        
        // 3. Setup sliders for default data type
        setupDynamicSliders();
        
        // 4. Setup event listeners
        setupAllEventListeners();
        
        // 5. Load initial data
        loadInitialData();
        
        globalCharts.initialized = true;
        updateStatus('complete', 'System ready');
        
        // Additional check for risk chart
        setTimeout(() => {
            if (!globalCharts.risk) {
                console.warn('⚠️ Risk chart missing after initialization, attempting fix...');
                reinitializeRiskChart();
            }
        }, 1000);
        
        console.log('✅ Complete Working System initialized successfully');
        
    } catch (error) {
        console.error('❌ System initialization failed:', error);
        updateStatus('error', 'System initialization failed: ' + error.message);
    }
}

function initializeAllCharts() {
    console.log('📊 Initializing all charts...');
    
    // 1. Prediction Chart
    const predictionCanvas = document.getElementById('predictionChart');
    if (predictionCanvas) {
        const ctx = predictionCanvas.getContext('2d');
        globalCharts.prediction = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Year 1'],
                datasets: [{
                    label: 'Climate Prediction',
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
                    legend: { display: true, position: 'top' }
                },
                scales: {
                    y: { beginAtZero: false, title: { display: true, text: 'Value' } },
                    x: { title: { display: true, text: 'Time Period' } }
                }
            }
        });
        console.log('✅ Prediction chart created');
    }
    
    // 2. Risk Chart
    const riskCanvas = document.getElementById('riskBarChart');
    if (riskCanvas) {
        console.log('📊 Found risk chart canvas, creating chart...');
        const ctx = riskCanvas.getContext('2d');
        globalCharts.risk = new Chart(ctx, {
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
                plugins: { 
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Climate Risk Assessment'
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        max: 100, 
                        title: { display: true, text: 'Probability (%)' },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        title: { display: true, text: 'Risk Types' }
                    }
                },
                animation: {
                    duration: 1000
                }
            }
        });
        console.log('✅ Risk chart created successfully');
    } else {
        console.error('❌ Risk chart canvas not found!');
    }
    
    // 3. Impact Chart
    const impactCanvas = document.getElementById('impactChart');
    if (impactCanvas) {
        const ctx = impactCanvas.getContext('2d');
        globalCharts.impact = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['No Impacts'],
                datasets: [{
                    label: 'Scenario Impact (%)',
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
        console.log('✅ Impact chart created');
    }
    
    // 4. Initialize gauge charts
    initializeGaugeCharts();
}

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
    const floodCanvas = document.getElementById('floodGaugeChart');
    if (floodCanvas) {
        const ctx = floodCanvas.getContext('2d');
        window.floodGaugeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [30, 70],
                    backgroundColor: ['#3b82f6', '#e5e7eb'],
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: gaugeOptions
        });
    }
    
    // Drought Risk Gauge
    const droughtCanvas = document.getElementById('droughtGaugeChart');
    if (droughtCanvas) {
        const ctx = droughtCanvas.getContext('2d');
        window.droughtGaugeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [25, 75],
                    backgroundColor: ['#f59e0b', '#e5e7eb'],
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: gaugeOptions
        });
    }
    
    // Heatwave Risk Gauge
    const heatwaveCanvas = document.getElementById('heatwaveGaugeChart');
    if (heatwaveCanvas) {
        const ctx = heatwaveCanvas.getContext('2d');
        window.heatwaveGaugeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [35, 65],
                    backgroundColor: ['#ef4444', '#e5e7eb'],
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: gaugeOptions
        });
    }
    
    console.log('✅ Gauge charts initialized');
}

function setupDynamicSliders() {
    console.log('🎛️ Setting up dynamic sliders...');
    
    const targetSelect = document.getElementById('targetSelect');
    const initialDataType = targetSelect ? targetSelect.value : 'temperature';
    
    updateSlidersForDataType(initialDataType);
}

function updateSlidersForDataType(dataType) {
    console.log('🔄 Updating sliders for data type:', dataType);
    
    const sliderConfigs = getSliderConfigsForDataType(dataType);
    const slidersContainer = document.getElementById('dynamicSliders');
    const dataTypeDisplay = document.getElementById('currentDataType');
    
    if (!slidersContainer) {
        console.error('❌ Sliders container not found');
        return;
    }
    
    // Update data type display
    if (dataTypeDisplay) {
        dataTypeDisplay.textContent = getDataTypeDisplayName(dataType);
    }
    
    // Clear existing sliders
    slidersContainer.innerHTML = '';
    
    // Create new sliders
    sliderConfigs.forEach((config, index) => {
        const sliderGroup = createSliderElement(config);
        slidersContainer.appendChild(sliderGroup);
    });
    
    // Setup event listeners for new sliders
    setupSliderEventListeners();
    
    console.log('✅ Sliders updated for', dataType);
}

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
                label: 'Deforestation Control',
                icon: 'fas fa-cut',
                min: -50, max: 50, value: -10, step: 5, suffix: '%',
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
                id: 'irrigationEfficiency',
                label: 'Irrigation Efficiency',
                icon: 'fas fa-seedling',
                min: 0, max: 100, value: 45, step: 5, suffix: '%',
                description: 'Improvement in irrigation system efficiency'
            },
            {
                id: 'droughtResistance',
                label: 'Drought-Resistant Crops',
                icon: 'fas fa-wheat-awn',
                min: 0, max: 100, value: 25, step: 5, suffix: '%',
                description: 'Adoption of drought-resistant crop varieties'
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
                label: 'Industrial Expansion Control',
                icon: 'fas fa-industry',
                min: -30, max: 100, value: -10, step: 5, suffix: '%',
                description: 'Control of industrial land use expansion'
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
            id: 'environmentalPolicy',
            label: 'Environmental Policy',
            icon: 'fas fa-balance-scale',
            min: 0, max: 100, value: 30, step: 5, suffix: '%',
            description: 'Strength of environmental policy implementation'
        },
        {
            id: 'technologyAdoption',
            label: 'Technology Adoption',
            icon: 'fas fa-microchip',
            min: 0, max: 100, value: 40, step: 5, suffix: '%',
            description: 'Adoption rate of green technologies'
        },
        {
            id: 'conservationEfforts',
            label: 'Conservation Efforts',
            icon: 'fas fa-shield-alt',
            min: 0, max: 100, value: 35, step: 5, suffix: '%',
            description: 'Conservation and protection efforts'
        }
    ];
    
    return sliderConfigs[dataType] || defaultSliders;
}

function createSliderElement(config) {
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

function setupSliderEventListeners() {
    const sliders = document.querySelectorAll('.scenario-slider');
    
    sliders.forEach(slider => {
        const valueElement = document.getElementById(slider.id + 'Value');
        
        if (valueElement) {
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const suffix = valueElement.textContent.match(/[%°C]/g)?.[0] || '';
                valueElement.textContent = value + suffix;
                
                // Update current scenario
                currentScenario[slider.id] = value;
                
                // Debounced update
                clearTimeout(updateTimeout);
                updateTimeout = setTimeout(() => {
                    updateAllCharts();
                }, 500);
            });
        }
    });
    
    console.log('✅ Slider event listeners setup');
}

function setupAllEventListeners() {
    console.log('🎯 Setting up all event listeners...');
    
    // Filter listeners
    const filters = ['regionSelect', 'periodSelect', 'targetSelect', 'confidenceSelect'];
    filters.forEach(filterId => {
        const element = document.getElementById(filterId);
        if (element) {
            element.addEventListener('change', (e) => {
                console.log('🔄 Filter changed:', filterId, '=', e.target.value);
                
                if (filterId === 'targetSelect') {
                    updateSlidersForDataType(e.target.value);
                }
                
                clearTimeout(updateTimeout);
                updateTimeout = setTimeout(() => {
                    updateAllCharts();
                }, 300);
            });
        }
    });
    
    // Button listeners
    const runBtn = document.getElementById('runSimulationBtn');
    if (runBtn) {
        runBtn.addEventListener('click', () => {
            console.log('🚀 Running simulation...');
            updateAllCharts();
        });
    }
    
    const saveBtn = document.getElementById('saveScenarioBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveCurrentScenario);
    }
    
    const downloadBtn = document.getElementById('downloadReportBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadReport);
    }
    
    const exportBtn = document.getElementById('exportDataBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    console.log('✅ All event listeners setup');
}

function loadInitialData() {
    console.log('📊 Loading initial data...');
    
    // Initialize current scenario with default values
    const sliders = document.querySelectorAll('.scenario-slider');
    sliders.forEach(slider => {
        currentScenario[slider.id] = parseFloat(slider.value);
    });
    
    // Update charts with initial data
    setTimeout(() => {
        updateAllCharts();
        
        // Force refresh risk chart to ensure it displays
        if (globalCharts.risk) {
            console.log('🔄 Force refreshing risk chart...');
            globalCharts.risk.update('active');
        }
    }, 500);
}

async function updateAllCharts() {
    if (!globalCharts.initialized) {
        console.log('⏳ Charts not initialized yet');
        return;
    }
    
    console.log('🔄 Updating all charts...');
    
    try {
        updateStatus('running', 'Running ML prediction...');
        
        // Get current settings
        const settings = getCurrentSettings();
        console.log('📊 Current settings:', settings);
        
        // Get predictions
        const predictions = await getPredictions(settings);
        console.log('🤖 Predictions:', predictions);
        
        // Update all charts
        updatePredictionChart(predictions.trends, settings);
        
        // Ensure risk chart is properly updated
        if (predictions.risks) {
            updateRiskChart(predictions.risks);
        } else {
            console.warn('⚠️ No risk data, using defaults');
            updateRiskChart({ flood: 30, drought: 25, heatwave: 35 });
        }
        
        updateImpactChart(settings.scenario);
        updateGauges(predictions.risks);
        
        updateStatus('complete', 'Prediction complete');
        
    } catch (error) {
        console.error('❌ Chart update failed:', error);
        updateStatus('error', 'Prediction failed: ' + error.message);
        showFallbackData();
    }
}

function getCurrentSettings() {
    return {
        region: document.getElementById('regionSelect')?.value || 'india-mumbai',
        period: parseFloat(document.getElementById('periodSelect')?.value || '1'),
        dataType: document.getElementById('targetSelect')?.value || 'temperature',
        confidence: document.getElementById('confidenceSelect')?.value || 'medium',
        scenario: { ...currentScenario }
    };
}

async function getPredictions(settings) {
    console.log('🔬 Getting predictions...');
    
    try {
        // Get base climate data for region
        const baseData = getRegionalClimateData(settings.region);
        
        // Apply scenario adjustments
        const adjustedData = applyScenarioAdjustments(baseData, settings.scenario, settings.dataType);
        
        // Try ML API first
        const mlResponse = await callMLAPI(adjustedData);
        
        // Generate time series
        const timeSeriesData = generateTimeSeries(adjustedData, settings, mlResponse);
        
        return timeSeriesData;
        
    } catch (error) {
        console.warn('⚠️ ML API failed, using fallback:', error);
        return generateFallbackPredictions(settings);
    }
}

function getRegionalClimateData(region) {
    const regionalData = {
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
        'china-guangzhou': { temperature: 24, rainfall: 165, humidity: 80, co2_level: 460 },
        'uk-london': { temperature: 12, rainfall: 150, humidity: 75, co2_level: 390 },
        'uk-manchester': { temperature: 10, rainfall: 170, humidity: 80, co2_level: 385 },
        'uk-edinburgh': { temperature: 9, rainfall: 160, humidity: 78, co2_level: 380 },
        'uae-dubai': { temperature: 38, rainfall: 15, humidity: 45, co2_level: 450 },
        'uae-abudhabi': { temperature: 37, rainfall: 12, humidity: 50, co2_level: 445 },
        'pakistan-karachi': { temperature: 30, rainfall: 35, humidity: 70, co2_level: 435 },
        'pakistan-lahore': { temperature: 28, rainfall: 55, humidity: 65, co2_level: 440 },
        'pakistan-islamabad': { temperature: 25, rainfall: 85, humidity: 60, co2_level: 425 },
        'russia-moscow': { temperature: 8, rainfall: 90, humidity: 70, co2_level: 420 },
        'russia-stpetersburg': { temperature: 6, rainfall: 95, humidity: 75, co2_level: 415 },
        'russia-novosibirsk': { temperature: 2, rainfall: 70, humidity: 65, co2_level: 410 }
    };
    
    return regionalData[region] || { temperature: 25, rainfall: 100, humidity: 65, co2_level: 410 };
}

function applyScenarioAdjustments(baseData, scenario, dataType) {
    console.log('🎛️ Applying scenario adjustments to base data:', baseData);
    console.log('📊 Current scenario values:', scenario);
    
    const adjusted = { ...baseData };
    const totalImpacts = { temperature: 0, rainfall: 0, humidity: 0, co2_level: 0 };
    
    Object.keys(scenario).forEach(sliderKey => {
        const value = scenario[sliderKey];
        if (typeof value !== 'number') return;
        
        const impact = getSliderImpact(sliderKey, value);
        
        // Track individual impacts
        if (Math.abs(impact.temperature || 0) > 0.001) {
            console.log(`🌡️ ${sliderKey} (${value}) → Temperature: ${(impact.temperature || 0).toFixed(3)}°C`);
        }
        if (Math.abs(impact.rainfall || 0) > 0.001) {
            console.log(`🌧️ ${sliderKey} (${value}) → Rainfall: ${(impact.rainfall || 0).toFixed(3)}mm`);
        }
        if (Math.abs(impact.co2_level || 0) > 0.001) {
            console.log(`💨 ${sliderKey} (${value}) → CO₂: ${(impact.co2_level || 0).toFixed(3)}ppm`);
        }
        
        adjusted.temperature += impact.temperature || 0;
        adjusted.rainfall += impact.rainfall || 0;
        adjusted.humidity += impact.humidity || 0;
        adjusted.co2_level += impact.co2_level || 0;
        
        totalImpacts.temperature += impact.temperature || 0;
        totalImpacts.rainfall += impact.rainfall || 0;
        totalImpacts.humidity += impact.humidity || 0;
        totalImpacts.co2_level += impact.co2_level || 0;
    });
    
    // Keep values in realistic bounds
    const beforeBounds = { ...adjusted };
    adjusted.temperature = Math.max(-20, Math.min(60, adjusted.temperature));
    adjusted.rainfall = Math.max(0, Math.min(1000, adjusted.rainfall));
    adjusted.humidity = Math.max(5, Math.min(100, adjusted.humidity));
    adjusted.co2_level = Math.max(280, Math.min(1000, adjusted.co2_level));
    
    console.log('📈 Total scenario impacts:', totalImpacts);
    console.log('🔄 Base → Adjusted:', {
        temperature: `${baseData.temperature.toFixed(1)} → ${adjusted.temperature.toFixed(1)}°C`,
        rainfall: `${baseData.rainfall.toFixed(1)} → ${adjusted.rainfall.toFixed(1)}mm`,
        humidity: `${baseData.humidity.toFixed(1)} → ${adjusted.humidity.toFixed(1)}%`,
        co2_level: `${baseData.co2_level.toFixed(1)} → ${adjusted.co2_level.toFixed(1)}ppm`
    });
    
    return adjusted;
}

function getSliderImpact(sliderId, value) {
    const impacts = {
        'co2Reduction': { temperature: -value * 0.01, co2_level: -value * 1.5 },
        'renewableEnergy': { temperature: -value * 0.008, co2_level: -value * 1.2 },
        'urbanHeatControl': { temperature: -value * 0.005 },
        'industrialReduction': { temperature: -value * 0.015, co2_level: -value * 2 },
        'forestExpansion': { temperature: -value * 0.01, rainfall: value * 0.3, co2_level: -value * 1.8 },
        'renewableAdoption': { temperature: -value * 0.01, co2_level: -value * 1.5 },
        'deforestationRate': { temperature: value * 0.008, rainfall: -value * 0.5 },
        'cloudSeeding': { rainfall: value * 0.4 },
        'waterConservation': { rainfall: value * 0.2, humidity: value * 0.1 },
        'waterRecycling': { rainfall: value * 0.15, humidity: value * 0.1 },
        'irrigationEfficiency': { rainfall: value * 0.1, humidity: value * 0.08 },
        'droughtResistance': { rainfall: value * 0.05 },
        'reforestation': { temperature: -value * 0.008, rainfall: value * 0.4, co2_level: -value * 1.5 },
        'industrialExpansion': { temperature: value * 0.01, rainfall: -value * 0.2, co2_level: value * 1.5 },
        'wildlifeProtection': { rainfall: value * 0.1, temperature: -value * 0.003 },
        'environmentalPolicy': { temperature: -value * 0.005, co2_level: -value * 0.8 },
        'technologyAdoption': { temperature: -value * 0.006, co2_level: -value * 1.0 },
        'conservationEfforts': { temperature: -value * 0.004, rainfall: value * 0.1 }
    };
    
    return impacts[sliderId] || { temperature: 0, rainfall: 0, humidity: 0, co2_level: 0 };
}

async function callMLAPI(climateData) {
    console.log('🔬 Calling ML API with climate data:', climateData);
    
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
        console.log('✅ ML API response received:', result);
        console.log('📊 Risk probabilities:', {
            flood: result.predictions?.flood?.risk_probability,
            drought: result.predictions?.drought?.risk_probability,
            heatwave: result.predictions?.heatwave?.risk_probability
        });
        return result;
        
    } catch (error) {
        console.error('❌ ML API call failed:', error);
        throw error;
    }
}

function generateTimeSeries(climateData, settings, mlResponse) {
    console.log('📊 Generating ML-based time series with data:', climateData);
    console.log('🤖 ML Response:', mlResponse);
    
    const { period, dataType, scenario } = settings;
    const years = Math.ceil(period);
    const labels = Array.from({length: years}, (_, i) => `Year ${i + 1}`);
    
    // Get base value for the data type
    const baseValue = getDataTypeValue(climateData, dataType);
    console.log('📈 Base value for', dataType, ':', baseValue);
    
    // Generate ML-influenced predictions
    const predictions = generateMLInfluencedPredictions(baseValue, years, dataType, climateData, scenario, mlResponse);
    
    // Extract ML risks with scenario influence
    const risks = calculateMLInfluencedRisks(mlResponse, climateData, scenario);
    
    console.log('📊 Generated predictions:', predictions);
    console.log('⚠️ Calculated risks:', risks);
    
    return {
        trends: {
            labels: labels,
            datasets: [{
                label: getDataTypeDisplayName(dataType),
                data: predictions,
                borderColor: getDataTypeColor(dataType),
                backgroundColor: getDataTypeColor(dataType) + '20',
                tension: 0.4,
                fill: false,
                borderWidth: 3
            }]
        },
        risks: risks
    };
}

function generateMLInfluencedPredictions(baseValue, years, dataType, climateData, scenario, mlResponse) {
    const predictions = [];
    let current = baseValue;
    
    // Calculate scenario impact on growth rate
    const scenarioImpact = calculateScenarioImpactOnGrowth(scenario, dataType);
    console.log('🎛️ Scenario impact on growth:', scenarioImpact);
    
    // Base growth rate influenced by climate conditions
    let baseGrowthRate = getMLInfluencedGrowthRate(dataType, climateData, mlResponse);
    
    // Apply scenario impact to growth rate
    const adjustedGrowthRate = baseGrowthRate + scenarioImpact;
    console.log('📈 Adjusted growth rate:', adjustedGrowthRate, '(base:', baseGrowthRate, '+ scenario:', scenarioImpact, ')');
    
    for (let i = 0; i < years; i++) {
        // Add year-over-year variation based on ML predictions and scenario
        const yearlyVariation = getYearlyVariation(i, dataType, climateData, scenario);
        const mlInfluence = getMLInfluenceForYear(i, mlResponse, dataType);
        
        current += adjustedGrowthRate + yearlyVariation + mlInfluence;
        predictions.push(Math.round(current * 100) / 100);
    }
    
    return predictions;
}

function calculateScenarioImpactOnGrowth(scenario, dataType) {
    let totalImpact = 0;
    
    Object.keys(scenario).forEach(sliderKey => {
        const value = scenario[sliderKey];
        if (typeof value !== 'number') return;
        
        const impact = getSliderGrowthImpact(sliderKey, value, dataType);
        totalImpact += impact;
    });
    
    return totalImpact;
}

function getSliderGrowthImpact(sliderId, value, dataType) {
    // Define how each slider affects the growth rate for different data types
    const impactMatrix = {
        'temperature': {
            'co2Reduction': -value * 0.002,
            'renewableEnergy': -value * 0.0015,
            'urbanHeatControl': -value * 0.001,
            'industrialReduction': -value * 0.003,
            'forestExpansion': -value * 0.002,
            'renewableAdoption': -value * 0.0018
        },
        'co2': {
            'co2Reduction': -value * 0.05,
            'renewableEnergy': -value * 0.03,
            'industrialReduction': -value * 0.08,
            'forestExpansion': -value * 0.06,
            'renewableAdoption': -value * 0.04
        },
        'rainfall': {
            'deforestationRate': -value * 0.01,
            'cloudSeeding': value * 0.008,
            'waterConservation': value * 0.005,
            'reforestation': value * 0.012,
            'forestExpansion': value * 0.01
        },
        'drought': {
            'waterRecycling': -value * 0.015,
            'irrigationEfficiency': -value * 0.012,
            'droughtResistance': -value * 0.02,
            'deforestationRate': value * 0.018,
            'reforestation': -value * 0.01
        }
    };
    
    const dataTypeImpacts = impactMatrix[dataType] || {};
    return dataTypeImpacts[sliderId] || 0;
}

function getMLInfluencedGrowthRate(dataType, climateData, mlResponse) {
    // Base rates influenced by current climate conditions
    const baseRates = {
        'temperature': 0.05 + (climateData.co2_level - 400) * 0.0008,
        'co2': 1.8 - (climateData.rainfall / 150) * 0.5,
        'rainfall': -0.3 - (climateData.temperature - 25) * 0.08,
        'drought': 0.2 + (climateData.temperature - 25) * 0.04,
        'deforestation': 0.15 + (climateData.temperature - 25) * 0.015
    };
    
    let baseRate = baseRates[dataType] || 0.05;
    
    // Adjust based on ML risk predictions
    if (mlResponse?.predictions) {
        const avgRisk = (
            (mlResponse.predictions.flood?.risk_probability || 0) +
            (mlResponse.predictions.drought?.risk_probability || 0) +
            (mlResponse.predictions.heatwave?.risk_probability || 0)
        ) / 3;
        
        // Higher ML-predicted risks increase negative trends for climate parameters
        if (dataType === 'temperature' || dataType === 'co2' || dataType === 'drought') {
            baseRate += avgRisk * 0.1; // Increase negative trends
        } else if (dataType === 'rainfall') {
            baseRate -= avgRisk * 0.1; // Decrease rainfall with higher risks
        }
    }
    
    return baseRate;
}

function getYearlyVariation(year, dataType, climateData, scenario) {
    // Add realistic yearly variations based on climate patterns
    const variationFactors = {
        'temperature': 0.1 + Math.sin(year * 0.5) * 0.05,
        'co2': 0.2 + Math.cos(year * 0.3) * 0.1,
        'rainfall': Math.sin(year * 0.8) * 0.3,
        'drought': Math.cos(year * 0.6) * 0.2
    };
    
    return variationFactors[dataType] || 0;
}

function getMLInfluenceForYear(year, mlResponse, dataType) {
    if (!mlResponse?.predictions) return 0;
    
    // ML predictions influence future years more strongly
    const yearFactor = Math.min(year * 0.1, 0.5);
    
    const riskInfluence = {
        'temperature': (mlResponse.predictions.heatwave?.risk_probability || 0) * yearFactor * 0.5,
        'rainfall': -(mlResponse.predictions.drought?.risk_probability || 0) * yearFactor * 2,
        'drought': (mlResponse.predictions.drought?.risk_probability || 0) * yearFactor * 3,
        'co2': ((mlResponse.predictions.flood?.risk_probability || 0) + 
               (mlResponse.predictions.heatwave?.risk_probability || 0)) * yearFactor * 1
    };
    
    return riskInfluence[dataType] || 0;
}

function calculateMLInfluencedRisks(mlResponse, climateData, scenario) {
    // Start with ML base predictions
    let risks = {
        flood: (mlResponse?.predictions?.flood?.risk_probability || 0.3) * 100,
        drought: (mlResponse?.predictions?.drought?.risk_probability || 0.3) * 100,
        heatwave: (mlResponse?.predictions?.heatwave?.risk_probability || 0.3) * 100
    };
    
    // Apply scenario adjustments to risks
    const scenarioRiskAdjustments = calculateScenarioRiskAdjustments(scenario, climateData);
    
    risks.flood = Math.max(0, Math.min(100, risks.flood + scenarioRiskAdjustments.flood));
    risks.drought = Math.max(0, Math.min(100, risks.drought + scenarioRiskAdjustments.drought));
    risks.heatwave = Math.max(0, Math.min(100, risks.heatwave + scenarioRiskAdjustments.heatwave));
    
    console.log('🎯 ML base risks:', {
        flood: (mlResponse?.predictions?.flood?.risk_probability || 0.3) * 100,
        drought: (mlResponse?.predictions?.drought?.risk_probability || 0.3) * 100,
        heatwave: (mlResponse?.predictions?.heatwave?.risk_probability || 0.3) * 100
    });
    console.log('🎛️ Scenario adjustments:', scenarioRiskAdjustments);
    console.log('📊 Final risks:', risks);
    
    return risks;
}

function calculateScenarioRiskAdjustments(scenario, climateData) {
    let floodAdj = 0, droughtAdj = 0, heatwaveAdj = 0;
    
    Object.keys(scenario).forEach(sliderKey => {
        const value = scenario[sliderKey];
        if (typeof value !== 'number') return;
        
        // Define how each slider affects each risk type
        const riskAdjustments = {
            'co2Reduction': { flood: -value * 0.2, drought: -value * 0.15, heatwave: -value * 0.3 },
            'renewableEnergy': { flood: -value * 0.15, drought: -value * 0.1, heatwave: -value * 0.25 },
            'urbanHeatControl': { heatwave: -value * 0.4, flood: -value * 0.1 },
            'industrialReduction': { flood: -value * 0.25, drought: -value * 0.2, heatwave: -value * 0.35 },
            'forestExpansion': { flood: -value * 0.3, drought: -value * 0.4, heatwave: -value * 0.2 },
            'deforestationRate': { flood: value * 0.25, drought: value * 0.35, heatwave: value * 0.15 },
            'cloudSeeding': { drought: -value * 0.3, flood: value * 0.1 },
            'waterRecycling': { drought: -value * 0.4, flood: -value * 0.1 },
            'irrigationEfficiency': { drought: -value * 0.35 },
            'reforestation': { flood: -value * 0.3, drought: -value * 0.4, heatwave: -value * 0.2 }
        };
        
        const adjustments = riskAdjustments[sliderKey] || {};
        floodAdj += adjustments.flood || 0;
        droughtAdj += adjustments.drought || 0;
        heatwaveAdj += adjustments.heatwave || 0;
    });
    
    return { flood: floodAdj, drought: droughtAdj, heatwave: heatwaveAdj };
}

function getDataTypeValue(climateData, dataType) {
    const mapping = {
        'temperature': climateData.temperature,
        'co2': climateData.co2_level,
        'rainfall': climateData.rainfall,
        'drought': Math.max(0, 100 - climateData.rainfall),
        'deforestation': Math.max(5, 35 - climateData.rainfall / 8)
    };
    
    return mapping[dataType] || climateData.temperature;
}

function getGrowthRate(dataType, climateData) {
    const rates = {
        'temperature': 0.1 + (climateData.co2_level - 400) * 0.001,
        'co2': 2.5 - (climateData.rainfall / 200),
        'rainfall': -0.5 - (climateData.temperature - 25) * 0.03,
        'drought': 0.4 + (climateData.temperature - 25) * 0.02,
        'deforestation': 0.3 + (climateData.temperature - 25) * 0.015
    };
    
    return rates[dataType] || 0.1;
}

function generateFallbackPredictions(settings) {
    const years = Math.ceil(settings.period);
    const labels = Array.from({length: years}, (_, i) => `Year ${i + 1}`);
    
    const baseData = getRegionalClimateData(settings.region);
    const baseValue = getDataTypeValue(baseData, settings.dataType);
    
    const predictions = [];
    let current = baseValue;
    
    for (let i = 0; i < years; i++) {
        current += 0.1 + (Math.random() - 0.5) * 0.2;
        predictions.push(Math.round(current * 100) / 100);
    }
    
    return {
        trends: {
            labels: labels,
            datasets: [{
                label: getDataTypeDisplayName(settings.dataType),
                data: predictions,
                borderColor: getDataTypeColor(settings.dataType),
                backgroundColor: getDataTypeColor(settings.dataType) + '20',
                tension: 0.4,
                fill: false,
                borderWidth: 3
            }]
        },
        risks: { flood: 30, drought: 25, heatwave: 35 }
    };
}

function updatePredictionChart(trendsData, settings) {
    if (!globalCharts.prediction || !trendsData) return;
    
    // Update chart title
    const chartTitle = document.getElementById('predictionChartTitle');
    if (chartTitle) {
        chartTitle.textContent = `${getDataTypeDisplayName(settings.dataType)} Prediction with Confidence Interval`;
    }
    
    globalCharts.prediction.data.labels = trendsData.labels;
    globalCharts.prediction.data.datasets = trendsData.datasets;
    globalCharts.prediction.update();
    
    console.log('✅ Prediction chart updated');
}

function updateRiskChart(risks) {
    console.log('🔄 Updating risk chart with risks:', risks);
    
    if (!globalCharts.risk) {
        console.warn('⚠️ Risk chart not initialized, attempting to reinitialize...');
        reinitializeRiskChart();
        
        if (!globalCharts.risk) {
            console.error('❌ Failed to reinitialize risk chart!');
            return;
        }
    }
    
    const riskValues = [
        Math.round(risks.flood || 0),
        Math.round(risks.drought || 0),
        Math.round(risks.heatwave || 0)
    ];
    
    console.log('📊 Setting risk values:', riskValues);
    
    try {
        globalCharts.risk.data.datasets[0].data = riskValues;
        globalCharts.risk.update('active');
        console.log('✅ Risk chart updated successfully');
    } catch (error) {
        console.error('❌ Error updating risk chart:', error);
        
        // Try to reinitialize and update again
        reinitializeRiskChart();
        if (globalCharts.risk) {
            globalCharts.risk.data.datasets[0].data = riskValues;
            globalCharts.risk.update('active');
            console.log('✅ Risk chart updated after reinitialization');
        }
    }
}

function updateImpactChart(scenario) {
    if (!globalCharts.impact) return;
    
    const impacts = [];
    const labels = [];
    const colors = [];
    
    Object.keys(scenario).forEach(sliderId => {
        const value = scenario[sliderId];
        if (Math.abs(value) > 5) {
            const impact = value * 0.5;
            impacts.push(impact);
            labels.push(getSliderDisplayName(sliderId));
            colors.push(impact > 0 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)');
        }
    });
    
    if (impacts.length === 0) {
        impacts.push(0);
        labels.push('No significant impacts');
        colors.push('rgba(107, 114, 128, 0.8)');
    }
    
    globalCharts.impact.data.labels = labels;
    globalCharts.impact.data.datasets[0].data = impacts;
    globalCharts.impact.data.datasets[0].backgroundColor = colors;
    globalCharts.impact.update();
    
    console.log('✅ Impact chart updated');
}

function updateGauges(risks) {
    const gauges = [
        { chart: window.floodGaugeChart, value: risks.flood, valueEl: 'floodGaugeValue' },
        { chart: window.droughtGaugeChart, value: risks.drought, valueEl: 'droughtGaugeValue' },
        { chart: window.heatwaveGaugeChart, value: risks.heatwave, valueEl: 'heatwaveGaugeValue' }
    ];
    
    gauges.forEach(gauge => {
        if (gauge.chart) {
            const value = Math.round(gauge.value);
            gauge.chart.data.datasets[0].data = [value, 100 - value];
            gauge.chart.update();
            
            const valueEl = document.getElementById(gauge.valueEl);
            if (valueEl) {
                valueEl.textContent = `${value}%`;
            }
        }
    });
    
    console.log('✅ Gauges updated');
}

function showFallbackData() {
    console.log('📊 Showing fallback data...');
    
    const settings = getCurrentSettings();
    const fallbackData = generateFallbackPredictions(settings);
    
    updatePredictionChart(fallbackData.trends, settings);
    updateRiskChart(fallbackData.risks);
    updateGauges(fallbackData.risks);
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

function getSliderDisplayName(sliderId) {
    const names = {
        'co2Reduction': 'CO₂ Reduction',
        'renewableEnergy': 'Renewable Energy',
        'urbanHeatControl': 'Urban Heat Control',
        'industrialReduction': 'Industrial Reduction',
        'forestExpansion': 'Forest Expansion',
        'renewableAdoption': 'Renewable Adoption',
        'deforestationRate': 'Deforestation Control',
        'cloudSeeding': 'Cloud Seeding',
        'waterConservation': 'Water Conservation',
        'waterRecycling': 'Water Recycling',
        'irrigationEfficiency': 'Irrigation Efficiency',
        'droughtResistance': 'Drought Resistance',
        'reforestation': 'Reforestation',
        'industrialExpansion': 'Industrial Control',
        'wildlifeProtection': 'Wildlife Protection',
        'environmentalPolicy': 'Environmental Policy',
        'technologyAdoption': 'Technology Adoption',
        'conservationEfforts': 'Conservation Efforts'
    };
    return names[sliderId] || sliderId;
}

function updateStatus(status, message) {
    const indicator = document.getElementById('statusIndicator');
    const text = document.getElementById('statusText');
    
    if (indicator) indicator.className = `status-indicator ${status}`;
    if (text) text.textContent = message;
}

// Button functions
function saveCurrentScenario() {
    const scenario = {
        settings: getCurrentSettings(),
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('climateSphere_savedScenario', JSON.stringify(scenario));
    alert('Scenario saved successfully!');
}

function downloadReport() {
    const settings = getCurrentSettings();
    const reportData = {
        scenario: settings,
        timestamp: new Date().toISOString(),
        charts: 'Generated charts and predictions'
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `climate_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function exportData() {
    const settings = getCurrentSettings();
    const exportData = {
        settings: settings,
        scenario: currentScenario,
        timestamp: new Date().toISOString()
    };
    
    const csv = convertToCSV(exportData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `climate_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function convertToCSV(data) {
    const headers = ['Parameter', 'Value'];
    const rows = [headers.join(',')];
    
    Object.keys(data.settings).forEach(key => {
        rows.push(`${key},${data.settings[key]}`);
    });
    
    Object.keys(data.scenario).forEach(key => {
        rows.push(`${key},${data.scenario[key]}`);
    });
    
    return rows.join('\n');
}

// Function to reinitialize risk chart if needed
function reinitializeRiskChart() {
    console.log('🔄 Reinitializing risk chart...');
    
    const riskCanvas = document.getElementById('riskBarChart');
    if (riskCanvas && !globalCharts.risk) {
        const ctx = riskCanvas.getContext('2d');
        globalCharts.risk = new Chart(ctx, {
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
                plugins: { 
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Climate Risk Assessment'
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        max: 100, 
                        title: { display: true, text: 'Probability (%)' },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        title: { display: true, text: 'Risk Types' }
                    }
                }
            }
        });
        console.log('✅ Risk chart reinitialized');
    }
}

// Test function for risk chart
function testRiskChart() {
    console.log('🧪 Testing risk chart...');
    
    if (!globalCharts.risk) {
        console.log('🔄 Risk chart not found, reinitializing...');
        reinitializeRiskChart();
    }
    
    if (globalCharts.risk) {
        const testRisks = { flood: 45, drought: 60, heatwave: 75 };
        updateRiskChart(testRisks);
        console.log('✅ Risk chart test completed');
    } else {
        console.error('❌ Risk chart still not available after reinitialization');
    }
}

// Diagnostic function
function diagnoseCharts() {
    console.log('🔍 Chart Diagnosis:');
    console.log('- Prediction chart:', globalCharts.prediction ? '✅ OK' : '❌ Missing');
    console.log('- Risk chart:', globalCharts.risk ? '✅ OK' : '❌ Missing');
    console.log('- Impact chart:', globalCharts.impact ? '✅ OK' : '❌ Missing');
    
    // Check canvas elements
    const predictionCanvas = document.getElementById('predictionChart');
    const riskCanvas = document.getElementById('riskBarChart');
    const impactCanvas = document.getElementById('impactChart');
    
    console.log('- Prediction canvas:', predictionCanvas ? '✅ Found' : '❌ Missing');
    console.log('- Risk canvas:', riskCanvas ? '✅ Found' : '❌ Missing');
    console.log('- Impact canvas:', impactCanvas ? '✅ Found' : '❌ Missing');
    
    if (riskCanvas) {
        console.log('- Risk canvas dimensions:', riskCanvas.width, 'x', riskCanvas.height);
        console.log('- Risk canvas style:', riskCanvas.style.cssText);
    }
}

// Test ML integration function
async function testMLIntegration() {
    console.log('🧪 Testing ML Integration...');
    
    try {
        // Test 1: High CO2 scenario
        console.log('📊 Test 1: High CO2 scenario');
        const highCO2Data = { temperature: 35, rainfall: 50, humidity: 60, co2_level: 500 };
        const highCO2Response = await callMLAPI(highCO2Data);
        
        // Test 2: Low CO2 scenario  
        console.log('📊 Test 2: Low CO2 scenario');
        const lowCO2Data = { temperature: 25, rainfall: 100, humidity: 70, co2_level: 350 };
        const lowCO2Response = await callMLAPI(lowCO2Data);
        
        console.log('📈 Comparison:');
        console.log('High CO2 risks:', {
            flood: (highCO2Response.predictions.flood.risk_probability * 100).toFixed(1) + '%',
            drought: (highCO2Response.predictions.drought.risk_probability * 100).toFixed(1) + '%',
            heatwave: (highCO2Response.predictions.heatwave.risk_probability * 100).toFixed(1) + '%'
        });
        console.log('Low CO2 risks:', {
            flood: (lowCO2Response.predictions.flood.risk_probability * 100).toFixed(1) + '%',
            drought: (lowCO2Response.predictions.drought.risk_probability * 100).toFixed(1) + '%',
            heatwave: (lowCO2Response.predictions.heatwave.risk_probability * 100).toFixed(1) + '%'
        });
        
        console.log('✅ ML Integration test completed');
        
    } catch (error) {
        console.error('❌ ML Integration test failed:', error);
    }
}

// Make functions available globally for debugging
window.testRiskChart = testRiskChart;
window.reinitializeRiskChart = reinitializeRiskChart;
window.diagnoseCharts = diagnoseCharts;
window.testMLIntegration = testMLIntegration;
window.globalCharts = globalCharts;

console.log('✅ Complete Working Chart System loaded');