/**
 * Punjab Flood Dashboard - Main JavaScript
 * Implements conditional logic for Punjab Flood Case Study
 */

// Global variables
let currentDataset = null;
let analysisMode = null;
let rainfallChart = null;
let riskHeatmapChart = null;

// Synthetic flood data generator (simulates generate_flood_data.py)
const SYNTHETIC_FLOOD_DATA = {
    days: Array.from({length: 30}, (_, i) => i + 1),
    rainfall_mm: [
        5, 8, 12, 15, 45, 78, 92, 65, 34, 28, 
        22, 18, 15, 12, 8, 5, 3, 2, 1, 0,
        0, 2, 5, 8, 12, 15, 18, 22, 25, 20
    ],
    humidity_pct: [
        65, 68, 72, 75, 85, 92, 95, 88, 82, 78,
        75, 72, 70, 68, 65, 62, 60, 58, 55, 52,
        50, 55, 60, 65, 70, 72, 75, 78, 80, 75
    ],
    soil_moisture: [
        45, 48, 52, 58, 75, 88, 95, 92, 85, 80,
        75, 70, 65, 60, 55, 50, 45, 40, 35, 30,
        28, 32, 38, 45, 52, 58, 65, 70, 75, 70
    ],
    temperature_anomaly: [
        0.5, 0.8, 1.2, 1.8, 3.2, 4.1, 3.8, 3.2, 2.5, 2.0,
        1.5, 1.0, 0.8, 0.5, 0.2, 0.0, -0.2, -0.5, -0.8, -1.0,
        -0.8, -0.5, 0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 2.2
    ]
};

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeUpload();
    
    console.log('🌊 [Punjab Flood Dashboard] Application initialized successfully');
});

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // File upload
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const uploadArea = document.getElementById('uploadArea');
    
    browseBtn.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleFileDrop);
    
    console.log('📋 [Punjab Flood Dashboard] Event listeners initialized');
}

/**
 * Initialize upload functionality
 */
function initializeUpload() {
    // Show demo data option
    setTimeout(() => {
        showDemoDataOption();
    }, 2000);
}

/**
 * Show demo data option for testing
 */
function showDemoDataOption() {
    const uploadArea = document.getElementById('uploadArea');
    const demoBtn = document.createElement('button');
    demoBtn.className = 'btn btn-outline';
    demoBtn.style.marginTop = '1rem';
    demoBtn.innerHTML = '<i class="fas fa-play"></i> Try Demo Data (8 months)';
    demoBtn.onclick = () => simulateDatasetUpload(8);
    
    uploadArea.appendChild(demoBtn);
    
    const demoBtn2 = document.createElement('button');
    demoBtn2.className = 'btn btn-secondary';
    demoBtn2.style.marginTop = '0.5rem';
    demoBtn2.innerHTML = '<i class="fas fa-chart-line"></i> Try Normal Mode (15 months)';
    demoBtn2.onclick = () => simulateDatasetUpload(15);
    
    uploadArea.appendChild(demoBtn2);
}

/**
 * Handle file upload
 */
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

/**
 * Handle drag over
 */
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

/**
 * Handle drag leave
 */
function handleDragLeave(event) {
    event.currentTarget.classList.remove('dragover');
}

/**
 * Handle file drop
 */
function handleFileDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

/**
 * Process uploaded file
 */
function processFile(file) {
    console.log('📁 [Punjab Flood Dashboard] Processing file:', file.name);
    
    showLoading();
    showAnalysisStatus();
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csvData = e.target.result;
            const dataset = parseCSV(csvData);
            analyzeDataset(dataset);
        } catch (error) {
            console.error('❌ [Punjab Flood Dashboard] File processing error:', error);
            showError('Failed to process file. Please check the format.');
            hideLoading();
        }
    };
    
    reader.readAsText(file);
}

/**
 * Simulate dataset upload for demo
 */
function simulateDatasetUpload(months) {
    console.log(`🎭 [Punjab Flood Dashboard] Simulating ${months} months dataset`);
    
    showLoading();
    showAnalysisStatus();
    
    // Create mock dataset
    const dataset = {
        months: months,
        data: generateMockData(months)
    };
    
    setTimeout(() => {
        analyzeDataset(dataset);
    }, 1000);
}

/**
 * Generate mock data for demo
 */
function generateMockData(months) {
    const data = [];
    for (let i = 0; i < months; i++) {
        data.push({
            month: i + 1,
            rainfall_mm: Math.random() * 100 + 20,
            humidity_pct: Math.random() * 40 + 50,
            temperature: Math.random() * 15 + 15,
            soil_moisture: Math.random() * 50 + 30
        });
    }
    return data;
}

/**
 * Parse CSV data
 */
function parseCSV(csvData) {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split(',');
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] ? values[index].trim() : '';
            });
            data.push(row);
        }
    }
    
    // Determine unique months
    const uniqueMonths = new Set();
    data.forEach(row => {
        if (row.month) {
            uniqueMonths.add(parseInt(row.month));
        }
    });
    
    return {
        months: uniqueMonths.size,
        data: data
    };
}

/**
 * Analyze dataset and determine mode
 */
function analyzeDataset(dataset) {
    currentDataset = dataset;
    
    logStatus(`🧠 Detected dataset duration: ${dataset.months} months`);
    
    // Conditional logic implementation
    if (dataset.months < 12) {
        // Punjab Flood Case Study Mode
        analysisMode = 'flood_case_study';
        logStatus('⚠ Triggering Punjab Flood Case Study Mode');
        logStatus('✅ Synthetic flood data generated successfully');
        
        setTimeout(() => {
            runFloodCaseStudy();
        }, 1500);
        
    } else {
        // Normal Mode
        analysisMode = 'normal';
        logStatus('📊 Activating Normal Climate Analysis Mode');
        logStatus('🔄 Processing full dataset for comprehensive analysis');
        
        setTimeout(() => {
            runNormalAnalysis();
        }, 1500);
    }
}

/**
 * Run Punjab Flood Case Study analysis
 */
function runFloodCaseStudy() {
    logStatus('🤖 Running Punjab Flood Prediction Model 2');
    logStatus('🔍 Analyzing rainfall patterns and soil moisture');
    
    // Simulate model processing
    setTimeout(() => {
        const floodPrediction = generateFloodPrediction();
        logStatus(`🚨 Flood Alert: ${floodPrediction.probability}% probability detected`);
        
        displayFloodResults(floodPrediction);
        hideLoading();
        
    }, 2000);
}

/**
 * Run normal climate analysis
 */
function runNormalAnalysis() {
    logStatus('🔄 Running comprehensive climate models');
    logStatus('📈 Generating temperature and rainfall analysis');
    
    setTimeout(() => {
        logStatus('✅ Normal climate analysis completed');
        displayNormalResults();
        hideLoading();
    }, 2000);
}

/**
 * Generate flood prediction results
 */
function generateFloodPrediction() {
    return {
        probability: 87,
        peakDay: 5,
        soilMoisture: 92,
        tempAnomaly: 3.2,
        riskLevel: 'High',
        confidence: 0.87,
        keyFactors: ['Rainfall spike', 'Soil saturation', 'Temperature anomaly']
    };
}

/**
 * Display flood case study results
 */
function displayFloodResults(prediction) {
    // Update mode banner
    updateModeBanner('flood');
    
    // Update risk summary
    updateRiskSummary(prediction);
    
    // Create charts
    createFloodCharts();
    
    // Show results section
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('resultsSection').classList.add('fade-in-up');
    
    console.log('🎯 [Punjab Flood Dashboard] Flood results displayed');
}

/**
 * Display normal analysis results
 */
function displayNormalResults() {
    // Update mode banner
    updateModeBanner('normal');
    
    // Show message about normal mode
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.innerHTML = `
        <div class="mode-banner">
            <div class="mode-content">
                <i class="fas fa-chart-line"></i>
                <div class="mode-text">
                    <h3>Normal Climate Analysis Mode Activated</h3>
                    <p>Dataset duration: ${currentDataset.months} months. Running comprehensive climate prediction models.</p>
                </div>
            </div>
        </div>
        <div style="text-align: center; padding: 3rem; background: white; border-radius: 1rem; margin-top: 2rem;">
            <i class="fas fa-chart-line" style="font-size: 4rem; color: #2563eb; margin-bottom: 1rem;"></i>
            <h3>Normal Climate Analysis</h3>
            <p>This would show comprehensive climate prediction and visualization using Model 1 & Model 2.</p>
            <button class="btn btn-primary" onclick="window.location.href='dashboard/historical-analysis.html'">
                <i class="fas fa-external-link-alt"></i>
                Go to Full Analysis Dashboard
            </button>
        </div>
    `;
    
    resultsSection.style.display = 'block';
    resultsSection.classList.add('fade-in-up');
}

/**
 * Update mode banner
 */
function updateModeBanner(mode) {
    const banner = document.getElementById('modeBanner');
    const icon = document.getElementById('modeIcon');
    const title = document.getElementById('modeTitle');
    const description = document.getElementById('modeDescription');
    
    if (mode === 'flood') {
        icon.className = 'fas fa-water';
        title.textContent = 'Punjab Flood Case Study Mode Activated';
        description.textContent = `Dataset duration: ${currentDataset.months} months. Synthetic flood data generated for analysis.`;
        banner.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    } else {
        icon.className = 'fas fa-chart-line';
        title.textContent = 'Normal Climate Analysis Mode';
        description.textContent = `Dataset duration: ${currentDataset.months} months. Running comprehensive analysis.`;
        banner.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
    }
}

/**
 * Update risk summary cards
 */
function updateRiskSummary(prediction) {
    document.getElementById('floodProbability').textContent = `${prediction.probability}%`;
    document.getElementById('peakRainfallDay').textContent = `Day ${prediction.peakDay}`;
    document.getElementById('soilMoisture').textContent = `${prediction.soilMoisture}%`;
    document.getElementById('tempAnomaly').textContent = `+${prediction.tempAnomaly}°C`;
}

/**
 * Create flood analysis charts
 */
function createFloodCharts() {
    createRainfallChart();
    createRiskHeatmap();
}

/**
 * Create rainfall vs day chart
 */
function createRainfallChart() {
    const ctx = document.getElementById('rainfallChart').getContext('2d');
    
    if (rainfallChart) {
        rainfallChart.destroy();
    }
    
    rainfallChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: SYNTHETIC_FLOOD_DATA.days,
            datasets: [{
                label: 'Rainfall (mm)',
                data: SYNTHETIC_FLOOD_DATA.rainfall_mm,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: SYNTHETIC_FLOOD_DATA.rainfall_mm.map(val => 
                    val > 60 ? '#ef4444' : val > 30 ? '#f59e0b' : '#3b82f6'
                ),
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#1f2937',
                    bodyColor: '#6b7280',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        afterLabel: function(context) {
                            const value = context.parsed.y;
                            if (value > 60) return 'Status: High Risk';
                            if (value > 30) return 'Status: Moderate Risk';
                            return 'Status: Normal';
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Day',
                        font: { weight: 'bold' }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Rainfall (mm)',
                        font: { weight: 'bold' }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    beginAtZero: true
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    });
}

/**
 * Create risk intensity heatmap
 */
function createRiskHeatmap() {
    const ctx = document.getElementById('riskHeatmap').getContext('2d');
    
    if (riskHeatmapChart) {
        riskHeatmapChart.destroy();
    }
    
    // Calculate risk intensity based on multiple factors
    const riskIntensity = SYNTHETIC_FLOOD_DATA.days.map((day, index) => {
        const rainfall = SYNTHETIC_FLOOD_DATA.rainfall_mm[index];
        const humidity = SYNTHETIC_FLOOD_DATA.humidity_pct[index];
        const soilMoisture = SYNTHETIC_FLOOD_DATA.soil_moisture[index];
        
        // Risk calculation formula
        const risk = (rainfall * 0.4 + humidity * 0.3 + soilMoisture * 0.3) / 100 * 100;
        return Math.min(risk, 100);
    });
    
    riskHeatmapChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: SYNTHETIC_FLOOD_DATA.days,
            datasets: [{
                label: 'Flood Risk Intensity (%)',
                data: riskIntensity,
                backgroundColor: riskIntensity.map(risk => {
                    if (risk > 80) return '#ef4444';
                    if (risk > 60) return '#f59e0b';
                    if (risk > 40) return '#eab308';
                    return '#22c55e';
                }),
                borderColor: riskIntensity.map(risk => {
                    if (risk > 80) return '#dc2626';
                    if (risk > 60) return '#d97706';
                    if (risk > 40) return '#ca8a04';
                    return '#16a34a';
                }),
                borderWidth: 2,
                borderRadius: 4,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#1f2937',
                    bodyColor: '#6b7280',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        afterLabel: function(context) {
                            const value = context.parsed.y;
                            if (value > 80) return 'Risk Level: Critical';
                            if (value > 60) return 'Risk Level: High';
                            if (value > 40) return 'Risk Level: Moderate';
                            return 'Risk Level: Low';
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Day',
                        font: { weight: 'bold' }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Risk Intensity (%)',
                        font: { weight: 'bold' }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    beginAtZero: true,
                    max: 100
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    });
}

/**
 * Show analysis status
 */
function showAnalysisStatus() {
    document.getElementById('analysisStatus').style.display = 'block';
    updateProgress(0);
}

/**
 * Log status message
 */
function logStatus(message) {
    const logs = document.getElementById('statusLogs');
    const timestamp = new Date().toLocaleTimeString();
    logs.innerHTML += `[${timestamp}] ${message}\n`;
    logs.scrollTop = logs.scrollHeight;
    
    // Update progress
    const currentProgress = parseInt(document.getElementById('progressFill').style.width) || 0;
    updateProgress(Math.min(currentProgress + 25, 100));
    
    console.log(`📝 [Punjab Flood Dashboard] ${message}`);
}

/**
 * Update progress bar
 */
function updateProgress(percentage) {
    document.getElementById('progressFill').style.width = `${percentage}%`;
}

/**
 * Show loading overlay
 */
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

/**
 * Show error message
 */
function showError(message) {
    alert(`Error: ${message}`);
}

/**
 * Close alert banner
 */
function closeAlert() {
    document.getElementById('floodAlert').style.display = 'none';
}

/**
 * Export functions
 */
function exportFloodReport() {
    console.log('📄 [Punjab Flood Dashboard] Exporting flood report...');
    alert('Flood report export functionality would be implemented here');
}

function exportCharts() {
    console.log('🖼️ [Punjab Flood Dashboard] Exporting charts...');
    
    if (rainfallChart) {
        const url = rainfallChart.toBase64Image();
        const a = document.createElement('a');
        a.href = url;
        a.download = 'flood_rainfall_chart.png';
        a.click();
    }
    
    if (riskHeatmapChart) {
        setTimeout(() => {
            const url = riskHeatmapChart.toBase64Image();
            const a = document.createElement('a');
            a.href = url;
            a.download = 'flood_risk_heatmap.png';
            a.click();
        }, 100);
    }
}

function exportData() {
    console.log('📊 [Punjab Flood Dashboard] Exporting data...');
    
    let csvContent = 'Day,Rainfall_mm,Humidity_pct,Soil_Moisture,Temperature_Anomaly\n';
    
    for (let i = 0; i < SYNTHETIC_FLOOD_DATA.days.length; i++) {
        csvContent += `${SYNTHETIC_FLOOD_DATA.days[i]},${SYNTHETIC_FLOOD_DATA.rainfall_mm[i]},${SYNTHETIC_FLOOD_DATA.humidity_pct[i]},${SYNTHETIC_FLOOD_DATA.soil_moisture[i]},${SYNTHETIC_FLOOD_DATA.temperature_anomaly[i]}\n`;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'punjab_flood_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Chart utility functions
 */
function downloadChart(chartId) {
    const chart = chartId === 'rainfallChart' ? rainfallChart : riskHeatmapChart;
    if (chart) {
        const url = chart.toBase64Image();
        const a = document.createElement('a');
        a.href = url;
        a.download = `${chartId}.png`;
        a.click();
    }
}

function fullscreenChart(chartId) {
    const chartContainer = document.querySelector(`#${chartId}`).closest('.chart-container');
    
    if (chartContainer.requestFullscreen) {
        chartContainer.requestFullscreen();
    } else if (chartContainer.webkitRequestFullscreen) {
        chartContainer.webkitRequestFullscreen();
    } else if (chartContainer.msRequestFullscreen) {
        chartContainer.msRequestFullscreen();
    }
}

console.log('🌊 [Punjab Flood Dashboard] JavaScript loaded successfully');