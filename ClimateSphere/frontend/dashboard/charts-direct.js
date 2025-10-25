/**
 * Direct Chart Implementation for ClimateSphere Dashboard
 * This script directly initializes charts without complex dependencies
 */

console.log('🚀 Loading ClimateSphere Charts...');

// Chart instances
let dashboardCharts = {
    temperature: null,
    rainfall: null,
    heat: null,
    humidity: null
};

// Generate realistic climate data
function generateLiveClimateData() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    
    // Seasonal and daily variations
    const seasonal = Math.sin((dayOfYear / 365) * Math.PI * 2);
    const daily = Math.sin((hour / 24) * Math.PI * 2);
    
    // Generate 24-hour data
    const hours = Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    
    const tempData = Array.from({length: 24}, (_, i) => {
        const base = 15 + seasonal * 8;
        const hourlyVariation = Math.sin((i / 24) * Math.PI * 2) * 6;
        return Math.round((base + hourlyVariation + (Math.random() - 0.5) * 3) * 10) / 10;
    });
    
    const rainData = Array.from({length: 24}, () => {
        return Math.random() < 0.3 ? Math.round(Math.random() * 8 * 10) / 10 : 0;
    });
    
    const heatData = Array.from({length: 24}, (_, i) => {
        const base = 25 + seasonal * 10;
        const hourlyVariation = Math.sin((i / 24) * Math.PI * 2) * 10;
        return Math.round((base + hourlyVariation + (Math.random() - 0.5) * 5) * 10) / 10;
    });
    
    const humidityData = Array.from({length: 24}, (_, i) => {
        const base = 65 + seasonal * 15;
        const hourlyVariation = Math.sin((i / 24) * Math.PI * 2 + Math.PI) * 20;
        return Math.max(20, Math.min(95, Math.round(base + hourlyVariation + (Math.random() - 0.5) * 10)));
    });
    
    return {
        labels: hours,
        temperature: {
            data: tempData,
            current: tempData[hour],
            min: Math.min(...tempData),
            max: Math.max(...tempData),
            trend: (Math.random() - 0.5) * 4
        },
        rainfall: {
            data: rainData,
            current: rainData[hour],
            total: rainData.reduce((a, b) => a + b, 0),
            max: Math.max(...rainData),
            trend: (Math.random() - 0.5) * 2
        },
        heat: {
            data: heatData,
            current: heatData[hour],
            extreme: Math.max(...heatData),
            safe: Math.min(...heatData),
            trend: (Math.random() - 0.5) * 6
        },
        humidity: {
            data: humidityData,
            current: humidityData[hour],
            min: Math.min(...humidityData),
            max: Math.max(...humidityData),
            trend: (Math.random() - 0.5) * 4
        }
    };
}

// Create temperature chart
function createDashboardTemperatureChart(data) {
    const ctx = document.getElementById('temperatureChart');
    if (!ctx) {
        console.error('❌ Temperature chart canvas not found');
        return;
    }
    
    console.log('📊 Creating temperature chart');
    
    if (dashboardCharts.temperature) {
        dashboardCharts.temperature.destroy();
    }
    
    dashboardCharts.temperature = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: data.temperature.data,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { 
                    beginAtZero: false,
                    ticks: { callback: value => value + '°C' }
                }
            }
        }
    });
}

// Create rainfall chart
function createDashboardRainfallChart(data) {
    const ctx = document.getElementById('rainfallChart');
    if (!ctx) {
        console.error('❌ Rainfall chart canvas not found');
        return;
    }
    
    console.log('📊 Creating rainfall chart');
    
    if (dashboardCharts.rainfall) {
        dashboardCharts.rainfall.destroy();
    }
    
    dashboardCharts.rainfall = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Rainfall (mm)',
                data: data.rainfall.data,
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { callback: value => value + 'mm' }
                }
            }
        }
    });
}

// Create heat chart
function createDashboardHeatChart(data) {
    const ctx = document.getElementById('heatChart');
    if (!ctx) {
        console.error('❌ Heat chart canvas not found');
        return;
    }
    
    console.log('📊 Creating heat chart');
    
    if (dashboardCharts.heat) {
        dashboardCharts.heat.destroy();
    }
    
    dashboardCharts.heat = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Heat Index (°C)',
                data: data.heat.data,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { 
                    beginAtZero: false,
                    ticks: { callback: value => value + '°C' }
                }
            }
        }
    });
}

// Create humidity chart
function createDashboardHumidityChart(data) {
    const ctx = document.getElementById('humidityChart');
    if (!ctx) {
        console.error('❌ Humidity chart canvas not found');
        return;
    }
    
    console.log('📊 Creating humidity chart');
    
    if (dashboardCharts.humidity) {
        dashboardCharts.humidity.destroy();
    }
    
    dashboardCharts.humidity = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Humidity (%)',
                data: data.humidity.data,
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
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
                    ticks: { callback: value => value + '%' }
                }
            }
        }
    });
}

// Update dashboard statistics
function updateDashboardStats(data) {
    console.log('📈 Updating dashboard statistics');
    
    // Temperature stats
    const tempValue = document.getElementById('tempValue');
    const tempTrend = document.getElementById('tempTrend');
    const tempMin = document.getElementById('tempMin');
    const tempMax = document.getElementById('tempMax');
    const tempVariance = document.getElementById('tempVariance');
    
    if (tempValue) tempValue.textContent = data.temperature.current + '°C';
    if (tempTrend) tempTrend.textContent = (data.temperature.trend > 0 ? '+' : '') + data.temperature.trend.toFixed(1) + '°C';
    if (tempMin) tempMin.textContent = data.temperature.min + '°C';
    if (tempMax) tempMax.textContent = data.temperature.max + '°C';
    if (tempVariance) tempVariance.textContent = '±' + (data.temperature.max - data.temperature.min).toFixed(1) + '°C';
    
    // Rainfall stats
    const rainfallValue = document.getElementById('rainfallValue');
    const rainfallTrend = document.getElementById('rainfallTrend');
    const rainfallMin = document.getElementById('rainfallMin');
    const rainfallMax = document.getElementById('rainfallMax');
    const rainfallTotal = document.getElementById('rainfallTotal');
    
    if (rainfallValue) rainfallValue.textContent = data.rainfall.current + 'mm';
    if (rainfallTrend) rainfallTrend.textContent = (data.rainfall.trend > 0 ? '+' : '') + data.rainfall.trend.toFixed(1) + 'mm';
    if (rainfallMin) rainfallMin.textContent = '0.0mm';
    if (rainfallMax) rainfallMax.textContent = data.rainfall.max + 'mm';
    if (rainfallTotal) rainfallTotal.textContent = data.rainfall.total.toFixed(1) + 'mm';
    
    // Heat stats
    const heatValue = document.getElementById('heatValue');
    const heatTrend = document.getElementById('heatTrend');
    const heatExtreme = document.getElementById('heatExtreme');
    const heatModerate = document.getElementById('heatModerate');
    const heatSafe = document.getElementById('heatSafe');
    
    if (heatValue) heatValue.textContent = data.heat.current + '°C';
    if (heatTrend) heatTrend.textContent = (data.heat.trend > 0 ? '+' : '') + data.heat.trend.toFixed(1) + '°C';
    if (heatExtreme) heatExtreme.textContent = data.heat.extreme + '°C';
    if (heatModerate) heatModerate.textContent = ((data.heat.extreme + data.heat.safe) / 2).toFixed(1) + '°C';
    if (heatSafe) heatSafe.textContent = data.heat.safe + '°C';
    
    // Humidity stats
    const humidityValue = document.getElementById('humidityValue');
    const humidityTrend = document.getElementById('humidityTrend');
    const humidityMin = document.getElementById('humidityMin');
    const humidityMax = document.getElementById('humidityMax');
    
    if (humidityValue) humidityValue.textContent = data.humidity.current + '%';
    if (humidityTrend) humidityTrend.textContent = (data.humidity.trend > 0 ? '+' : '') + data.humidity.trend.toFixed(1) + '%';
    if (humidityMin) humidityMin.textContent = data.humidity.min + '%';
    if (humidityMax) humidityMax.textContent = data.humidity.max + '%';
    
    // Update timestamp
    const lastUpdated = document.querySelector('.last-updated');
    if (lastUpdated) {
        lastUpdated.textContent = 'Last updated: ' + new Date().toLocaleTimeString();
    }
}

// Initialize all dashboard charts
function initializeDashboardCharts() {
    console.log('🌍 Initializing ClimateSphere Dashboard Charts');
    
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js not loaded');
        setTimeout(initializeDashboardCharts, 1000);
        return;
    }
    
    // Generate live data
    const data = generateLiveClimateData();
    
    // Create all charts
    createDashboardTemperatureChart(data);
    createDashboardRainfallChart(data);
    createDashboardHeatChart(data);
    createDashboardHumidityChart(data);
    
    // Update statistics
    updateDashboardStats(data);
    
    // Set current date
    const dateInput = document.getElementById('analysisDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    console.log('✅ Dashboard charts initialized successfully');
}

// Update charts with new data
function updateDashboardCharts() {
    console.log('🔄 Updating dashboard charts with live data');
    
    const data = generateLiveClimateData();
    
    // Update chart data
    if (dashboardCharts.temperature) {
        dashboardCharts.temperature.data.datasets[0].data = data.temperature.data;
        dashboardCharts.temperature.update('none');
    }
    
    if (dashboardCharts.rainfall) {
        dashboardCharts.rainfall.data.datasets[0].data = data.rainfall.data;
        dashboardCharts.rainfall.update('none');
    }
    
    if (dashboardCharts.heat) {
        dashboardCharts.heat.data.datasets[0].data = data.heat.data;
        dashboardCharts.heat.update('none');
    }
    
    if (dashboardCharts.humidity) {
        dashboardCharts.humidity.data.datasets[0].data = data.humidity.data;
        dashboardCharts.humidity.update('none');
    }
    
    // Update statistics
    updateDashboardStats(data);
}

// Initialize when DOM is ready
function startDashboardCharts() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initializeDashboardCharts, 1000);
        });
    } else {
        setTimeout(initializeDashboardCharts, 1000);
    }
    
    // Set up auto-refresh every 30 seconds
    setInterval(updateDashboardCharts, 30000);
    
    // Add event listener for manual update button
    setTimeout(() => {
        const updateBtn = document.getElementById('updateChartsBtn');
        if (updateBtn) {
            updateBtn.addEventListener('click', updateDashboardCharts);
        }
    }, 2000);
}

// Expose functions globally
window.initializeDashboardCharts = initializeDashboardCharts;
window.updateDashboardCharts = updateDashboardCharts;

// Start the charts
startDashboardCharts();

console.log('✅ ClimateSphere Charts module loaded');