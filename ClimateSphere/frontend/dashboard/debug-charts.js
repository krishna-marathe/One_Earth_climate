// Debug script for chart issues
console.log('=== ClimateSphere Chart Debug ===');

// Check if Chart.js is loaded
console.log('Chart.js loaded:', typeof Chart !== 'undefined');
if (typeof Chart !== 'undefined') {
    console.log('Chart.js version:', Chart.version);
}

// Check if canvas elements exist
const canvases = ['temperatureChart', 'rainfallChart', 'heatChart', 'humidityChart'];
canvases.forEach(id => {
    const canvas = document.getElementById(id);
    console.log(`Canvas ${id}:`, canvas ? 'Found' : 'Not found');
    if (canvas) {
        console.log(`  - Width: ${canvas.width}, Height: ${canvas.height}`);
        console.log(`  - Parent: ${canvas.parentElement ? canvas.parentElement.className : 'No parent'}`);
    }
});

// Check if dashboard JavaScript is loaded
console.log('Dashboard functions available:');
console.log('  - initializeClimateCharts:', typeof initializeClimateCharts !== 'undefined');
console.log('  - createTemperatureChart:', typeof createTemperatureChart !== 'undefined');

// Try to initialize charts manually
if (typeof initializeClimateCharts !== 'undefined') {
    console.log('Attempting to initialize charts...');
    try {
        initializeClimateCharts();
        console.log('Charts initialized successfully');
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
} else {
    console.error('initializeClimateCharts function not found');
}

console.log('=== Debug Complete ===');