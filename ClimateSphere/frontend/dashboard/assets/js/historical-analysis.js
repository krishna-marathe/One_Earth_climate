/**
 * ClimateSphere Historical Analysis - Main JavaScript
 * Handles data analysis, chart generation, and user interactions
 */

// Global variables
let trendsChart = null;
let co2Chart = null;
let currentData = null;
let analysisConfig = {
    region: 'all',
    startYear: 2015,
    endYear: 2023,
    dataTypes: {
        temperature: true,
        rainfall: true,
        co2: true,
        humidity: false,
        drought: false,
        deforestation: false
    }
};

// Sample historical data (in production, this would come from API)
const HISTORICAL_DATA = {
    years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
    temperature: [24.2, 24.8, 25.1, 25.6, 26.2, 25.9, 26.4, 26.8, 27.1],
    rainfall: [1320, 1280, 1245, 1190, 1456, 1234, 1167, 1089, 1098],
    co2: [398, 402, 405, 408, 411, 414, 416, 418, 421],
    humidity: [68, 67, 66, 65, 69, 67, 64, 63, 62],
    drought: [0.2, 0.3, 0.4, 0.5, 0.2, 0.4, 0.6, 0.7, 0.8],
    deforestation: [2.1, 2.3, 2.5, 2.8, 3.1, 2.9, 3.2, 3.5, 3.8]
};

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadInitialData();
    createCharts();
    updateAnalysisCards();
    
    console.log('[Historical Analysis] Application initialized successfully');
});

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Control panel listeners
    document.getElementById('regionSelect').addEventListener('change', handleRegionChange);
    document.getElementById('startYear').addEventListener('change', handleYearChange);
    document.getElementById('endYear').addEventListener('change', handleYearChange);
    
    // Data type checkboxes
    document.getElementById('temperatureCheck').addEventListener('change', handleDataTypeChange);
    document.getElementById('rainfallCheck').addEventListener('change', handleDataTypeChange);
    document.getElementById('co2Check').addEventListener('change', handleDataTypeChange);
    document.getElementById('humidityCheck').addEventListener('change', handleDataTypeChange);
    document.getElementById('droughtCheck').addEventListener('change', handleDataTypeChange);
    document.getElementById('deforestationCheck').addEventListener('change', handleDataTypeChange);
    
    // Export buttons
    document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV);
    document.getElementById('exportPngBtn').addEventListener('click', exportChartsToPNG);
    document.getElementById('exportPdfBtn').addEventListener('click', exportToPDF);
    
    // Save buttons
    document.getElementById('saveCurrentBtn').addEventListener('click', saveCurrentAnalysis);
    document.getElementById('addToDashboardBtn').addEventListener('click', addToDashboard);
    
    // Chart controls
    document.getElementById('fullscreenChart1').addEventListener('click', () => fullscreenChart('trendsChart'));
    document.getElementById('downloadChart1').addEventListener('click', () => downloadChart('trendsChart'));
    document.getElementById('fullscreenChart2').addEventListener('click', () => fullscreenChart('co2Chart'));
    document.getElementById('downloadChart2').addEventListener('click', () => downloadChart('co2Chart'));
    
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    console.log('[Historical Analysis] Event listeners initialized');
}

/**
 * Load initial data and populate controls
 */
function loadInitialData() {
    showLoading();
    
    // Simulate API call delay
    setTimeout(() => {
        currentData = processHistoricalData(HISTORICAL_DATA);
        updateStatistics();
        updateCharts();
        hideLoading();
    }, 1000);
}

/**
 * Process historical data based on current configuration
 */
function processHistoricalData(rawData) {
    const startIdx = rawData.years.indexOf(analysisConfig.startYear);
    const endIdx = rawData.years.indexOf(analysisConfig.endYear);
    
    if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) {
        console.warn('Invalid year range');
        return rawData;
    }
    
    const processedData = {
        years: rawData.years.slice(startIdx, endIdx + 1),
        temperature: rawData.temperature.slice(startIdx, endIdx + 1),
        rainfall: rawData.rainfall.slice(startIdx, endIdx + 1),
        co2: rawData.co2.slice(startIdx, endIdx + 1),
        humidity: rawData.humidity.slice(startIdx, endIdx + 1),
        drought: rawData.drought.slice(startIdx, endIdx + 1),
        deforestation: rawData.deforestation.slice(startIdx, endIdx + 1)
    };
    
    return processedData;
}

/**
 * Create initial charts
 */
function createCharts() {
    createTrendsChart();
    createCO2Chart();
}

/**
 * Create the climate trends chart
 */
function createTrendsChart() {
    const ctx = document.getElementById('trendsChart').getContext('2d');
    
    if (trendsChart) {
        trendsChart.destroy();
    }
    
    const datasets = [];
    
    if (analysisConfig.dataTypes.temperature) {
        datasets.push({
            label: 'Temperature (°C)',
            data: currentData ? currentData.temperature : HISTORICAL_DATA.temperature,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            yAxisID: 'y'
        });
    }
    
    if (analysisConfig.dataTypes.rainfall) {
        datasets.push({
            label: 'Rainfall (mm)',
            data: currentData ? currentData.rainfall : HISTORICAL_DATA.rainfall,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            yAxisID: 'y1'
        });
    }
    
    if (analysisConfig.dataTypes.humidity) {
        datasets.push({
            label: 'Humidity (%)',
            data: currentData ? currentData.humidity : HISTORICAL_DATA.humidity,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            yAxisID: 'y2'
        });
    }
    
    trendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: currentData ? currentData.years : HISTORICAL_DATA.years,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#1f2937',
                    bodyColor: '#6b7280',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Year',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    type: 'linear',
                    display: analysisConfig.dataTypes.temperature,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temperature (°C)',
                        color: '#ef4444',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(239, 68, 68, 0.1)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: analysisConfig.dataTypes.rainfall,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Rainfall (mm)',
                        color: '#3b82f6',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                },
                y2: {
                    type: 'linear',
                    display: analysisConfig.dataTypes.humidity,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Humidity (%)',
                        color: '#10b981',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

/**
 * Create the CO2 levels chart
 */
function createCO2Chart() {
    const ctx = document.getElementById('co2Chart').getContext('2d');
    
    if (co2Chart) {
        co2Chart.destroy();
    }
    
    co2Chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: currentData ? currentData.years : HISTORICAL_DATA.years,
            datasets: [{
                label: 'CO₂ Levels (ppm)',
                data: currentData ? currentData.co2 : HISTORICAL_DATA.co2,
                backgroundColor: [
                    '#22c55e', '#22c55e', '#eab308', '#eab308', 
                    '#f97316', '#f97316', '#ef4444', '#ef4444', '#ef4444'
                ],
                borderColor: [
                    '#16a34a', '#16a34a', '#ca8a04', '#ca8a04',
                    '#ea580c', '#ea580c', '#dc2626', '#dc2626', '#dc2626'
                ],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
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
                            if (value < 400) return 'Status: Safe';
                            if (value < 410) return 'Status: Moderate';
                            if (value < 420) return 'Status: High';
                            return 'Status: Critical';
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Year',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'CO₂ Concentration (ppm)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    beginAtZero: false
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

/**
 * Update charts with current data
 */
function updateCharts() {
    if (trendsChart) {
        createTrendsChart();
    }
    if (co2Chart) {
        createCO2Chart();
    }
}

/**
 * Update statistics in sidebar
 */
function updateStatistics() {
    if (!currentData) return;
    
    const totalRecords = currentData.years.length * 12; // Assuming monthly data
    const avgTemp = (currentData.temperature.reduce((a, b) => a + b, 0) / currentData.temperature.length).toFixed(1);
    const avgCo2 = Math.round(currentData.co2.reduce((a, b) => a + b, 0) / currentData.co2.length);
    
    document.getElementById('totalRecords').textContent = totalRecords;
    document.getElementById('avgTemp').textContent = `${avgTemp}°C`;
    document.getElementById('avgCo2').textContent = `${avgCo2} ppm`;
}

/**
 * Update analysis cards with calculated metrics
 */
function updateAnalysisCards() {
    if (!currentData) return;
    
    // Temperature analysis
    const avgTemp = (currentData.temperature.reduce((a, b) => a + b, 0) / currentData.temperature.length).toFixed(1);
    const minTemp = Math.min(...currentData.temperature).toFixed(1);
    const maxTemp = Math.max(...currentData.temperature).toFixed(1);
    const tempTrend = (currentData.temperature[currentData.temperature.length - 1] - currentData.temperature[0]).toFixed(1);
    
    document.getElementById('avgTempMetric').textContent = `${avgTemp}°C`;
    document.getElementById('tempRangeMetric').textContent = `${minTemp}°C - ${maxTemp}°C`;
    document.getElementById('tempTrendMetric').innerHTML = `
        <i class="fas fa-arrow-${tempTrend > 0 ? 'up' : 'down'}"></i> 
        ${Math.abs(tempTrend)}°C over period
    `;
    document.getElementById('tempTrendMetric').className = `metric-value trend-${tempTrend > 0 ? 'up' : 'down'}`;
    
    // Rainfall analysis
    const avgRainfall = Math.round(currentData.rainfall.reduce((a, b) => a + b, 0) / currentData.rainfall.length);
    const maxRainfallYear = currentData.years[currentData.rainfall.indexOf(Math.max(...currentData.rainfall))];
    const maxRainfall = Math.max(...currentData.rainfall);
    const rainfallTrend = ((currentData.rainfall[currentData.rainfall.length - 1] - currentData.rainfall[0]) / currentData.rainfall[0] * 100).toFixed(1);
    
    document.getElementById('avgRainfallMetric').textContent = `${avgRainfall} mm/year`;
    document.getElementById('wettestYearMetric').textContent = `${maxRainfallYear} (${maxRainfall} mm)`;
    document.getElementById('rainfallTrendMetric').innerHTML = `
        <i class="fas fa-arrow-${rainfallTrend > 0 ? 'up' : 'down'}"></i> 
        ${Math.abs(rainfallTrend)}% over period
    `;
    document.getElementById('rainfallTrendMetric').className = `metric-value trend-${rainfallTrend > 0 ? 'up' : 'down'}`;
    
    // CO2 analysis
    const avgCo2 = Math.round(currentData.co2.reduce((a, b) => a + b, 0) / currentData.co2.length);
    const peakCo2 = Math.max(...currentData.co2);
    const peakCo2Year = currentData.years[currentData.co2.indexOf(peakCo2)];
    const co2Trend = ((currentData.co2[currentData.co2.length - 1] - currentData.co2[0]) / (currentData.years.length - 1)).toFixed(1);
    
    document.getElementById('avgCo2Metric').textContent = `${avgCo2} ppm`;
    document.getElementById('peakCo2Metric').textContent = `${peakCo2} ppm (${peakCo2Year})`;
    document.getElementById('co2TrendMetric').innerHTML = `
        <i class="fas fa-arrow-up"></i> 
        +${co2Trend} ppm/year
    `;
}

/**
 * Handle region selection change
 */
function handleRegionChange(event) {
    analysisConfig.region = event.target.value;
    console.log('[Historical Analysis] Region changed to:', analysisConfig.region);
    
    // In a real application, this would fetch new data for the selected region
    showLoading();
    setTimeout(() => {
        currentData = processHistoricalData(HISTORICAL_DATA);
        updateCharts();
        updateStatistics();
        updateAnalysisCards();
        hideLoading();
    }, 500);
}

/**
 * Handle year range change
 */
function handleYearChange() {
    const startYear = parseInt(document.getElementById('startYear').value);
    const endYear = parseInt(document.getElementById('endYear').value);
    
    if (startYear >= endYear) {
        alert('Start year must be before end year');
        return;
    }
    
    analysisConfig.startYear = startYear;
    analysisConfig.endYear = endYear;
    
    console.log('[Historical Analysis] Year range changed:', startYear, '-', endYear);
    
    showLoading();
    setTimeout(() => {
        currentData = processHistoricalData(HISTORICAL_DATA);
        updateCharts();
        updateStatistics();
        updateAnalysisCards();
        hideLoading();
    }, 500);
}

/**
 * Handle data type checkbox changes
 */
function handleDataTypeChange(event) {
    const dataType = event.target.id.replace('Check', '');
    analysisConfig.dataTypes[dataType] = event.target.checked;
    
    console.log('[Historical Analysis] Data type toggled:', dataType, event.target.checked);
    
    updateCharts();
}

/**
 * Export data to CSV
 */
function exportToCSV() {
    if (!currentData) return;
    
    let csvContent = 'Year,Temperature,Rainfall,CO2,Humidity,Drought Index,Deforestation\n';
    
    for (let i = 0; i < currentData.years.length; i++) {
        csvContent += `${currentData.years[i]},${currentData.temperature[i]},${currentData.rainfall[i]},${currentData.co2[i]},${currentData.humidity[i]},${currentData.drought[i]},${currentData.deforestation[i]}\n`;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `climate_data_${analysisConfig.startYear}-${analysisConfig.endYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('CSV exported successfully!', 'success');
}

/**
 * Export charts to PNG
 */
function exportChartsToPNG() {
    if (trendsChart) {
        const url = trendsChart.toBase64Image();
        const a = document.createElement('a');
        a.href = url;
        a.download = 'climate_trends_chart.png';
        a.click();
    }
    
    if (co2Chart) {
        setTimeout(() => {
            const url = co2Chart.toBase64Image();
            const a = document.createElement('a');
            a.href = url;
            a.download = 'co2_levels_chart.png';
            a.click();
        }, 100);
    }
    
    showNotification('Charts exported successfully!', 'success');
}

/**
 * Export analysis to PDF
 */
function exportToPDF() {
    // This would integrate with a PDF library like jsPDF
    showNotification('PDF export feature coming soon!', 'info');
}

/**
 * Save current analysis
 */
function saveCurrentAnalysis() {
    const analysis = {
        config: analysisConfig,
        data: currentData,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('saved_climate_analysis', JSON.stringify(analysis));
    showNotification('Analysis saved successfully!', 'success');
}

/**
 * Add analysis to dashboard
 */
function addToDashboard() {
    showNotification('Added to dashboard successfully!', 'success');
}

/**
 * Handle search functionality
 */
function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    console.log('[Historical Analysis] Search query:', query);
    
    // In a real application, this would filter data or regions
    // For now, just show a placeholder message
    if (query.length > 2) {
        showNotification(`Searching for: ${query}`, 'info');
    }
}

/**
 * Fullscreen chart functionality
 */
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

/**
 * Download individual chart
 */
function downloadChart(chartId) {
    const chart = chartId === 'trendsChart' ? trendsChart : co2Chart;
    if (chart) {
        const url = chart.toBase64Image();
        const a = document.createElement('a');
        a.href = url;
        a.download = `${chartId}.png`;
        a.click();
        
        showNotification('Chart downloaded successfully!', 'success');
    }
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
 * Show notification message
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#2563eb'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: inherit;
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
    }
`;
document.head.appendChild(style);

console.log('[Historical Analysis] JavaScript loaded successfully');