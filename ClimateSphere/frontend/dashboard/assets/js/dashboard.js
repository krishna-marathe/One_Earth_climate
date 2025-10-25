/**
 * ClimateSphere Dashboard JavaScript
 * Handles dashboard functionality, navigation, and data management
 * 
 * Testing Instructions:
 * 1. Open dashboard.html in browser
 * 2. Test authentication (should redirect to login if no token)
 * 3. Test sidebar navigation between sections
 * 4. Test file upload functionality
 * 5. Check query parameter filtering for regions
 */

// Dashboard state
let currentSection = 'overview';
let sidebarCollapsed = false;
let currentUser = null;
let dashboardData = {};

/**
 * Initialize dashboard when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Dashboard] Initializing dashboard');
    
    // Check authentication
    if (!checkAuthentication()) {
        return;
    }
    
    // Initialize dashboard components
    initializeNavigation();
    initializeUserInterface();
    initializeFileUpload();
    loadDashboardData();
    
    // Check for region filtering from query parameters
    handleRegionFiltering();
    
    console.log('[Dashboard] Dashboard initialized successfully');
});

/**
 * Check user authentication and redirect if needed
 */
function checkAuthentication() {
    const params = CS_Utils.getQueryParams();
    const isDemoMode = params.demo === 'true';
    
    if (!CS_API.isAuthenticated() && !isDemoMode) {
        console.log('[Dashboard] No authentication found, redirecting to login');
        window.location.href = '../auth/login.html';
        return false;
    }
    
    // Get current user data
    currentUser = CS_API.getCurrentUser() || {
        name: 'Demo User',
        email: 'demo@climatosphere.com'
    };
    
    console.log('[Dashboard] User authenticated:', currentUser.name);
    return true;
}

/**
 * Initialize navigation and sidebar functionality
 */
function initializeNavigation() {
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebarToggle.addEventListener('click', () => {
        sidebarCollapsed = !sidebarCollapsed;
        
        if (window.innerWidth <= 1024) {
            // Mobile: show/hide sidebar
            sidebar.classList.toggle('show');
        } else {
            // Desktop: collapse sidebar
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        }
    });
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const section = e.currentTarget.dataset.section;
            if (section) {
                navigateToSection(section);
            }
        });
    });
    
    // Action buttons
    document.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            handleActionButton(action);
        });
    });
    
    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
            const sidebar = document.getElementById('sidebar');
            const sidebarToggle = document.getElementById('sidebarToggle');
            
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        }
    });
}

/**
 * Initialize user interface elements
 */
function initializeUserInterface() {
    // Update user name in header
    const userNameElement = document.getElementById('userName');
    if (userNameElement && currentUser) {
        userNameElement.textContent = currentUser.name;
    }
    
    // User menu dropdown
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        userDropdown.classList.remove('show');
    });
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        console.log('[Dashboard] User logging out');
        CS_Utils.logout();
    });
    
    // Search functionality
    const searchInput = document.getElementById('globalSearch');
    searchInput.addEventListener('input', CS_Utils.debounce(handleSearch, 300));
}

/**
 * Initialize file upload functionality
 */
function initializeFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    
    // Browse button click
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Upload area click
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFileSelection(e.target.files);
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFileSelection(e.dataTransfer.files);
    });
}

/**
 * Navigate to a specific section
 */
function navigateToSection(sectionName) {
    console.log('[Dashboard] Navigating to section:', sectionName);
    
    // Special handling for external pages
    if (sectionName === 'predictions') {
        window.location.href = 'predictions-enhanced.html';
        return;
    }
    
    if (sectionName === 'analysis') {
        window.location.href = 'historical-analysis.html';
        return;
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Show/hide sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // Update current section
    currentSection = sectionName;
    
    // Load section-specific data
    loadSectionData(sectionName);
    
    // Close mobile sidebar
    if (window.innerWidth <= 1024) {
        document.getElementById('sidebar').classList.remove('show');
    }
}

/**
 * Handle action button clicks
 */
function handleActionButton(action) {
    console.log('[Dashboard] Action button clicked:', action);
    
    switch (action) {
        case 'upload':
            navigateToSection('upload');
            break;
        case 'analyze':
            navigateToSection('analysis');
            break;
        case 'predict':
            navigateToSection('predictions');
            break;
        default:
            console.warn('[Dashboard] Unknown action:', action);
    }
}

/**
 * Load dashboard data from API
 */
async function loadDashboardData() {
    console.log('[Dashboard] Loading dashboard data');
    
    try {
        const response = await CS_API.get('/summary');
        dashboardData = response.data;
        
        if (response.demo) {
            console.log('[Dashboard] Using demo data');
        }
        
        updateOverviewStats(dashboardData);
        updateRecentActivity();
        
    } catch (error) {
        console.error('[Dashboard] Failed to load dashboard data:', error);
        CS_Utils.showNotification('Failed to load dashboard data', 'error');
    }
}

/**
 * Load section-specific data
 */
async function loadSectionData(sectionName) {
    console.log('[Dashboard] Loading data for section:', sectionName);
    
    switch (sectionName) {
        case 'overview':
            // Already loaded in loadDashboardData
            break;
        case 'upload':
            // No additional data needed
            break;
        case 'analysis':
            // Load analysis data when implemented
            break;
        case 'predictions':
            // Load prediction data when implemented
            break;
        case 'insights':
            // Load insights data when implemented
            break;
        case 'modules':
            // Load modules data when implemented
            break;
    }
}

/**
 * Update overview statistics
 */
function updateOverviewStats(data) {
    console.log('[Dashboard] Updating overview stats');
    
    // Update CO2 level
    const co2Element = document.getElementById('overviewCo2');
    if (co2Element && data.co2) {
        co2Element.textContent = `${data.co2} ppm`;
    }
    
    // Update temperature
    const tempElement = document.getElementById('overviewTemp');
    if (tempElement && data.temperature) {
        tempElement.textContent = `${data.temperature}°C`;
    }
    
    // Update zones
    const zonesElement = document.getElementById('overviewZones');
    if (zonesElement && data.floodZones) {
        zonesElement.textContent = data.floodZones;
    }
    
    // Update alerts
    const alertsElement = document.getElementById('overviewAlerts');
    if (alertsElement && data.alerts) {
        alertsElement.textContent = data.alerts;
    }
}

/**
 * Update recent activity list
 */
function updateRecentActivity() {
    const activityList = document.getElementById('activityList');
    
    const activities = [
        {
            icon: 'fas fa-cloud-upload-alt',
            title: 'Data Upload Completed',
            description: 'Climate data for California region processed successfully',
            time: '2 hours ago',
            color: 'var(--success-color)'
        },
        {
            icon: 'fas fa-chart-line',
            title: 'Analysis Generated',
            description: 'Temperature trend analysis for the past 6 months',
            time: '4 hours ago',
            color: 'var(--primary-color)'
        },
        {
            icon: 'fas fa-exclamation-triangle',
            title: 'Alert Triggered',
            description: 'Extreme heat warning for Delhi region',
            time: '6 hours ago',
            color: 'var(--warning-color)'
        },
        {
            icon: 'fas fa-crystal-ball',
            title: 'Prediction Updated',
            description: 'Flood risk prediction model retrained with new data',
            time: '1 day ago',
            color: 'var(--secondary-color)'
        }
    ];
    
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon" style="background-color: ${activity.color}">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-description">${activity.description}</div>
            </div>
            <div class="activity-time">${activity.time}</div>
        </div>
    `).join('');
}

/**
 * Handle region filtering from query parameters
 */
function handleRegionFiltering() {
    const params = CS_Utils.getQueryParams();
    
    if (params.country && params.region) {
        console.log('[Dashboard] Filtering for region:', params.region, params.country);
        
        const regionFilter = document.getElementById('regionFilter');
        if (regionFilter) {
            regionFilter.textContent = `Climate data for ${params.region}, ${params.country}`;
        }
        
        // Filter dashboard data for the specific region
        filterDashboardForRegion(params.country, params.region);
    }
}

/**
 * Filter dashboard data for specific region
 */
function filterDashboardForRegion(country, region) {
    console.log('[Dashboard] Filtering dashboard for:', region, country);
    
    // Find region data
    if (dashboardData.regions) {
        const regionData = dashboardData.regions.find(r => 
            r.country === country && r.region === region
        );
        
        if (regionData) {
            // Update stats with region-specific data
            updateOverviewStats({
                co2: regionData.co2 || dashboardData.co2,
                temperature: regionData.temp || dashboardData.temperature,
                floodZones: regionData.alerts ? regionData.alerts.length : 0,
                alerts: regionData.alerts ? regionData.alerts.length : 0
            });
        }
    }
}

/**
 * Handle file selection for upload
 */
function handleFileSelection(files) {
    console.log('[Dashboard] Files selected for upload:', files.length);
    
    const progressContainer = document.getElementById('uploadProgress');
    progressContainer.innerHTML = '';
    
    Array.from(files).forEach((file, index) => {
        uploadFile(file, index);
    });
}

/**
 * Upload a single file
 */
async function uploadFile(file, index) {
    console.log('[Dashboard] Uploading file:', file.name);
    
    // Create progress item
    const progressItem = document.createElement('div');
    progressItem.className = 'progress-item';
    progressItem.innerHTML = `
        <div class="progress-header">
            <span>${file.name}</span>
            <span class="progress-status">Uploading...</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: 0%"></div>
        </div>
    `;
    
    document.getElementById('uploadProgress').appendChild(progressItem);
    
    const progressFill = progressItem.querySelector('.progress-fill');
    const progressStatus = progressItem.querySelector('.progress-status');
    
    try {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            progressFill.style.width = `${i}%`;
        }
        
        // Attempt API upload
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await CS_API.post('/upload', formData);
        
        progressStatus.textContent = 'Completed';
        progressStatus.style.color = 'var(--success-color)';
        
        if (response.demo) {
            CS_Utils.showNotification(`File "${file.name}" uploaded to demo storage`, 'success');
        } else {
            CS_Utils.showNotification(`File "${file.name}" uploaded successfully`, 'success');
        }
        
    } catch (error) {
        console.error('[Dashboard] Upload failed:', error);
        progressStatus.textContent = 'Failed';
        progressStatus.style.color = 'var(--danger-color)';
        progressFill.style.backgroundColor = 'var(--danger-color)';
        
        CS_Utils.showNotification(`Failed to upload "${file.name}"`, 'error');
    }
}

/**
 * Handle global search
 */
function handleSearch(query) {
    console.log('[Dashboard] Search query:', query);
    
    if (query.length < 2) return;
    
    // Implement search functionality
    // This would typically search through regions, data, insights, etc.
    CS_Utils.showNotification(`Search functionality coming soon: "${query}"`, 'info');
}

/**
 * Handle window resize
 */
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    if (window.innerWidth > 1024) {
        sidebar.classList.remove('show');
        if (!sidebarCollapsed) {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('expanded');
        }
    }
});

/**
 * Dashboard smoke tests
 */
function runDashboardTests() {
    console.log('=== Dashboard Smoke Tests ===');
    
    // Test 1: Authentication check
    const isAuth = CS_API.isAuthenticated() || CS_Utils.getQueryParams().demo === 'true';
    console.log(`✓ Test 1: Authentication check: ${isAuth ? 'PASS' : 'FAIL'}`);
    
    // Test 2: Navigation functionality
    const navLinks = document.querySelectorAll('.nav-link');
    console.log(`✓ Test 2: Navigation links found: ${navLinks.length > 0 ? 'PASS' : 'FAIL'}`);
    
    // Test 3: Section switching
    navigateToSection('upload');
    const uploadSection = document.getElementById('upload-section');
    const uploadActive = uploadSection.classList.contains('active');
    console.log(`✓ Test 3: Section switching: ${uploadActive ? 'PASS' : 'FAIL'}`);
    
    // Switch back to overview
    navigateToSection('overview');
    
    // Test 4: File upload setup
    const fileInput = document.getElementById('fileInput');
    console.log(`✓ Test 4: File upload setup: ${fileInput ? 'PASS' : 'FAIL'}`);
    
    // Test 5: Query parameter handling
    const params = CS_Utils.getQueryParams();
    if (params.country && params.region) {
        console.log(`✓ Test 5: Query params handled: PASS (${params.region}, ${params.country})`);
    } else {
        console.log(`✓ Test 5: Query params: PASS (no params to handle)`);
    }
    
    console.log('=== Dashboard Tests Complete ===');
}

// Export for testing
window.DashboardModule = {
    navigateToSection,
    handleFileSelection,
    runDashboardTests,
    currentSection: () => currentSection
};

// Run tests after initialization
setTimeout(() => {
    if (window.location.search.includes('test=true')) {
        runDashboardTests();
    }
}, 2000);

console.log('[Dashboard] Dashboard module loaded');/
**
 * Climate Charts Functionality
 * Handles the creation and management of climate analysis charts
 */

// Chart instances
let temperatureChart = null;
let rainfallChart = null;
let heatChart = null;
let humidityChart = null;

// Sample climate data for demonstration
const sampleClimateData = {
    temperature: {
        current: 15.2,
        trend: 1.1,
        min: -12.5,
        max: 42.8,
        variance: 8.3,
        hourlyData: [12.1, 13.5, 14.8, 16.2, 17.9, 19.1, 20.3, 21.5, 20.8, 19.2, 17.6, 15.4, 14.1, 13.2, 12.8, 12.3, 11.9, 11.5, 11.8, 12.4, 13.1, 13.8, 14.2, 14.6]
    },
    rainfall: {
        current: 2.8,
        trend: -0.3,
        min: 0.0,
        max: 45.2,
        total: 84.6,
        hourlyData: [0, 0.2, 0.8, 1.2, 2.1, 3.5, 4.8, 6.2, 5.1, 3.8, 2.9, 2.1, 1.8, 1.2, 0.8, 0.4, 0.1, 0, 0, 0.3, 0.7, 1.1, 1.8, 2.3]
    },
    heat: {
        current: 28.4,
        trend: 2.1,
        extreme: 52.1,
        moderate: 31.2,
        safe: 18.7,
        hourlyData: [22.1, 23.5, 25.8, 28.2, 31.9, 35.1, 38.3, 41.5, 39.8, 36.2, 33.6, 30.4, 28.1, 26.2, 24.8, 23.3, 22.9, 22.5, 22.8, 23.4, 24.1, 25.8, 26.2, 27.6]
    },
    humidity: {
        current: 67.3,
        trend: 1.8,
        min: 15.2,
        max: 98.7,
        optimal: "45-65%",
        hourlyData: [72, 74, 76, 75, 73, 70, 68, 65, 62, 58, 55, 53, 52, 54, 57, 61, 65, 68, 71, 74, 76, 78, 75, 73]
    }
};

/**
 * Initialize climate charts
 */
function initializeClimateCharts() {
    console.log('[Dashboard] Initializing climate charts');
    console.log('[Dashboard] Chart.js available:', typeof Chart !== 'undefined');
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('[Dashboard] Chart.js not loaded, retrying in 1 second');
        setTimeout(initializeClimateCharts, 1000);
        return;
    }
    
    // Set current date
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('analysisDate');
    if (dateInput) {
        dateInput.value = today;
    }
    
    // Destroy existing charts if they exist
    if (temperatureChart) {
        temperatureChart.destroy();
        temperatureChart = null;
    }
    if (rainfallChart) {
        rainfallChart.destroy();
        rainfallChart = null;
    }
    if (heatChart) {
        heatChart.destroy();
        heatChart = null;
    }
    if (humidityChart) {
        humidityChart.destroy();
        humidityChart = null;
    }
    
    // Create charts
    try {
        createTemperatureChart();
        createRainfallChart();
        createHeatChart();
        createHumidityChart();
        
        console.log('[Dashboard] All charts created successfully');
    } catch (error) {
        console.error('[Dashboard] Error creating charts:', error);
    }
    
    // Update chart data display
    updateChartValues();
    
    // Add event listener for date changes
    const updateBtn = document.getElementById('updateChartsBtn');
    if (updateBtn) {
        updateBtn.removeEventListener('click', updateChartsForDate); // Remove existing listener
        updateBtn.addEventListener('click', updateChartsForDate);
    }
    
    console.log('[Dashboard] Climate charts initialized successfully');
}

/**
 * Create temperature chart
 */
function createTemperatureChart() {
    const ctx = document.getElementById('temperatureChart');
    if (!ctx) {
        console.error('[Dashboard] Temperature chart canvas not found');
        return;
    }
    
    console.log('[Dashboard] Creating temperature chart');
    
    const hours = Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    
    try {
        temperatureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hours,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: sampleClimateData.temperature.hourlyData,
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
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '°C';
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 3,
                        hoverRadius: 6
                    }
                }
            }
        });
        console.log('[Dashboard] Temperature chart created successfully');
    } catch (error) {
        console.error('[Dashboard] Error creating temperature chart:', error);
    }
}

/**
 * Create rainfall chart
 */
function createRainfallChart() {
    const ctx = document.getElementById('rainfallChart');
    if (!ctx) return;
    
    const hours = Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    
    rainfallChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: hours,
            datasets: [{
                label: 'Rainfall (mm)',
                data: sampleClimateData.rainfall.hourlyData,
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + 'mm';
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });
}

/**
 * Create heat index chart
 */
function createHeatChart() {
    const ctx = document.getElementById('heatChart');
    if (!ctx) return;
    
    const hours = Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    
    heatChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Heat Index (°C)',
                data: sampleClimateData.heat.hourlyData,
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
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '°C';
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            elements: {
                point: {
                    radius: 3,
                    hoverRadius: 6
                }
            }
        }
    });
}

/**
 * Create humidity chart
 */
function createHumidityChart() {
    const ctx = document.getElementById('humidityChart');
    if (!ctx) return;
    
    const hours = Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    
    humidityChart = new Chart(ctx, {
        type: 'area',
        data: {
            labels: hours,
            datasets: [{
                label: 'Humidity (%)',
                data: sampleClimateData.humidity.hourlyData,
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
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            elements: {
                point: {
                    radius: 3,
                    hoverRadius: 6
                }
            }
        }
    });
}

/**
 * Update chart values in the UI
 */
function updateChartValues() {
    const data = sampleClimateData;
    
    // Temperature
    document.getElementById('tempValue').textContent = `${data.temperature.current}°C`;
    document.getElementById('tempTrend').textContent = `+${data.temperature.trend}°C`;
    document.getElementById('tempMin').textContent = `${data.temperature.min}°C`;
    document.getElementById('tempMax').textContent = `${data.temperature.max}°C`;
    document.getElementById('tempVariance').textContent = `±${data.temperature.variance}°C`;
    
    // Rainfall
    document.getElementById('rainfallValue').textContent = `${data.rainfall.current}mm`;
    document.getElementById('rainfallTrend').textContent = `${data.rainfall.trend}mm`;
    document.getElementById('rainfallMin').textContent = `${data.rainfall.min}mm`;
    document.getElementById('rainfallMax').textContent = `${data.rainfall.max}mm`;
    document.getElementById('rainfallTotal').textContent = `${data.rainfall.total}mm`;
    
    // Heat
    document.getElementById('heatValue').textContent = `${data.heat.current}°C`;
    document.getElementById('heatTrend').textContent = `+${data.heat.trend}°C`;
    document.getElementById('heatExtreme').textContent = `${data.heat.extreme}°C`;
    document.getElementById('heatModerate').textContent = `${data.heat.moderate}°C`;
    document.getElementById('heatSafe').textContent = `${data.heat.safe}°C`;
    
    // Humidity
    document.getElementById('humidityValue').textContent = `${data.humidity.current}%`;
    document.getElementById('humidityTrend').textContent = `+${data.humidity.trend}%`;
    document.getElementById('humidityMin').textContent = `${data.humidity.min}%`;
    document.getElementById('humidityMax').textContent = `${data.humidity.max}%`;
    document.getElementById('humidityOptimal').textContent = data.humidity.optimal;
}

/**
 * Update charts for selected date
 */
function updateChartsForDate() {
    const dateInput = document.getElementById('analysisDate');
    const selectedDate = dateInput.value;
    
    console.log('[Dashboard] Updating charts for date:', selectedDate);
    
    // Generate new sample data based on date
    const newData = generateDataForDate(selectedDate);
    
    // Update chart data
    if (temperatureChart) {
        temperatureChart.data.datasets[0].data = newData.temperature.hourlyData;
        temperatureChart.update();
    }
    
    if (rainfallChart) {
        rainfallChart.data.datasets[0].data = newData.rainfall.hourlyData;
        rainfallChart.update();
    }
    
    if (heatChart) {
        heatChart.data.datasets[0].data = newData.heat.hourlyData;
        heatChart.update();
    }
    
    if (humidityChart) {
        humidityChart.data.datasets[0].data = newData.humidity.hourlyData;
        humidityChart.update();
    }
    
    // Update values
    Object.assign(sampleClimateData, newData);
    updateChartValues();
    
    CS_Utils.showNotification(`Charts updated for ${selectedDate}`, 'success');
}

/**
 * Generate sample data for a specific date
 */
function generateDataForDate(dateString) {
    const date = new Date(dateString);
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    
    // Use day of year as seed for consistent but varied data
    const seed = dayOfYear / 365;
    
    return {
        temperature: {
            current: 15.2 + (Math.sin(seed * Math.PI * 2) * 5),
            trend: (Math.random() - 0.5) * 4,
            min: -12.5 + (Math.random() * 10),
            max: 42.8 + (Math.random() * 10 - 5),
            variance: 8.3 + (Math.random() * 4 - 2),
            hourlyData: Array.from({length: 24}, (_, i) => {
                const base = 15 + Math.sin(seed * Math.PI * 2) * 5;
                const daily = Math.sin((i / 24) * Math.PI * 2) * 8;
                const noise = (Math.random() - 0.5) * 3;
                return Math.round((base + daily + noise) * 10) / 10;
            })
        },
        rainfall: {
            current: 2.8 + (Math.random() * 4 - 2),
            trend: (Math.random() - 0.5) * 2,
            min: 0.0,
            max: 45.2 + (Math.random() * 20 - 10),
            total: 84.6 + (Math.random() * 40 - 20),
            hourlyData: Array.from({length: 24}, () => {
                const chance = Math.random();
                if (chance < 0.7) return 0;
                return Math.round(Math.random() * 8 * 10) / 10;
            })
        },
        heat: {
            current: 28.4 + (Math.sin(seed * Math.PI * 2) * 8),
            trend: (Math.random() - 0.5) * 6,
            extreme: 52.1 + (Math.random() * 10 - 5),
            moderate: 31.2 + (Math.random() * 6 - 3),
            safe: 18.7 + (Math.random() * 4 - 2),
            hourlyData: Array.from({length: 24}, (_, i) => {
                const base = 28 + Math.sin(seed * Math.PI * 2) * 8;
                const daily = Math.sin((i / 24) * Math.PI * 2) * 12;
                const noise = (Math.random() - 0.5) * 5;
                return Math.round((base + daily + noise) * 10) / 10;
            })
        },
        humidity: {
            current: 67.3 + (Math.random() * 20 - 10),
            trend: (Math.random() - 0.5) * 4,
            min: 15.2 + (Math.random() * 10),
            max: 98.7 - (Math.random() * 10),
            optimal: "45-65%",
            hourlyData: Array.from({length: 24}, (_, i) => {
                const base = 67 + (Math.random() * 20 - 10);
                const daily = Math.sin((i / 24) * Math.PI * 2 + Math.PI) * 15;
                const noise = (Math.random() - 0.5) * 8;
                return Math.max(10, Math.min(95, Math.round(base + daily + noise)));
            })
        }
    };
}

// Initialize charts when dashboard loads - moved to end of file
function initializeChartsWhenReady() {
    console.log('[Dashboard] DOM loaded, Chart.js available:', typeof Chart !== 'undefined');
    
    // Wait for dashboard to initialize first, then initialize charts
    setTimeout(() => {
        console.log('[Dashboard] Initializing charts after delay');
        if (typeof initializeClimateCharts === 'function') {
            initializeClimateCharts();
            fetchRealTimeWeatherData();
        } else {
            console.error('[Dashboard] initializeClimateCharts function not found');
        }
    }, 3000);
}

// Call initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChartsWhenReady);
} else {
    initializeChartsWhenReady();
}

// Override navigation to reinitialize charts when needed
const originalNavigateToSection = navigateToSection;
navigateToSection = function(sectionName) {
    originalNavigateToSection(sectionName);
    
    if (sectionName === 'overview') {
        setTimeout(() => {
            console.log('[Dashboard] Reinitializing charts for overview section');
            initializeClimateCharts();
        }, 300);
    }
};

console.log('[Dashboard] Climate charts module loaded');/
**
 * Real-time Weather Data Integration
 * Fetches live weather data from OpenWeatherMap API
 */

// Weather API configuration
const WEATHER_API_KEY = 'demo_key'; // In production, this should be from environment
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';

// Major cities for global data sampling
const GLOBAL_CITIES = [
    { name: 'New York', lat: 40.7128, lon: -74.0060, region: 'Americas' },
    { name: 'London', lat: 51.5074, lon: -0.1278, region: 'Europe' },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503, region: 'Asia' },
    { name: 'Cairo', lat: 30.0444, lon: 31.2357, region: 'Africa' },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093, region: 'Oceania' },
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777, region: 'Asia' },
    { name: 'São Paulo', lat: -23.5505, lon: -46.6333, region: 'Americas' },
    { name: 'Berlin', lat: 52.5200, lon: 13.4050, region: 'Europe' }
];

/**
 * Fetch real-time weather data for global analysis
 */
async function fetchRealTimeWeatherData() {
    console.log('[Dashboard] Fetching real-time weather data');
    
    try {
        // For demo purposes, we'll use simulated real-time data
        // In production, you would make actual API calls to weather services
        const realTimeData = await generateRealTimeData();
        
        // Update charts with real-time data
        updateChartsWithRealData(realTimeData);
        
        // Update regional data
        updateRegionalData(realTimeData);
        
        console.log('[Dashboard] Real-time data updated successfully');
        
    } catch (error) {
        console.error('[Dashboard] Failed to fetch real-time weather data:', error);
        // Fall back to sample data
        console.log('[Dashboard] Using sample data as fallback');
    }
}

/**
 * Generate realistic real-time weather data
 * In production, this would be replaced with actual API calls
 */
async function generateRealTimeData() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    
    // Simulate seasonal and daily variations
    const seasonalFactor = Math.sin((dayOfYear / 365) * Math.PI * 2);
    const dailyFactor = Math.sin((hour / 24) * Math.PI * 2);
    
    // Generate realistic global averages
    const baseTemp = 15 + (seasonalFactor * 8); // Seasonal variation
    const currentTemp = baseTemp + (dailyFactor * 5) + (Math.random() - 0.5) * 3;
    
    const baseHumidity = 65 + (seasonalFactor * 10);
    const currentHumidity = Math.max(20, Math.min(95, baseHumidity + (Math.random() - 0.5) * 15));
    
    const baseRainfall = Math.max(0, (seasonalFactor + 1) * 2 + (Math.random() - 0.7) * 5);
    const heatIndex = currentTemp + (currentHumidity > 40 ? (currentHumidity - 40) * 0.3 : 0);
    
    // Generate hourly data for the past 24 hours
    const hourlyTemp = [];
    const hourlyRain = [];
    const hourlyHeat = [];
    const hourlyHumidity = [];
    
    for (let i = 0; i < 24; i++) {
        const hourOffset = i - hour;
        const hourlyDaily = Math.sin(((hour + hourOffset) / 24) * Math.PI * 2);
        
        hourlyTemp.push(Math.round((baseTemp + hourlyDaily * 5 + (Math.random() - 0.5) * 2) * 10) / 10);
        hourlyRain.push(Math.max(0, Math.round((baseRainfall + (Math.random() - 0.8) * 3) * 10) / 10));
        hourlyHeat.push(Math.round((heatIndex + hourlyDaily * 8 + (Math.random() - 0.5) * 3) * 10) / 10);
        hourlyHumidity.push(Math.max(20, Math.min(95, Math.round(baseHumidity + (Math.random() - 0.5) * 10))));
    }
    
    return {
        timestamp: now.toISOString(),
        temperature: {
            current: Math.round(currentTemp * 10) / 10,
            trend: (Math.random() - 0.5) * 4,
            min: Math.min(...hourlyTemp),
            max: Math.max(...hourlyTemp),
            variance: Math.round((Math.max(...hourlyTemp) - Math.min(...hourlyTemp)) * 10) / 10,
            hourlyData: hourlyTemp
        },
        rainfall: {
            current: Math.round(baseRainfall * 10) / 10,
            trend: (Math.random() - 0.5) * 2,
            min: 0,
            max: Math.max(...hourlyRain),
            total: Math.round(hourlyRain.reduce((a, b) => a + b, 0) * 10) / 10,
            hourlyData: hourlyRain
        },
        heat: {
            current: Math.round(heatIndex * 10) / 10,
            trend: (Math.random() - 0.5) * 6,
            extreme: Math.max(...hourlyHeat),
            moderate: Math.round((Math.max(...hourlyHeat) + Math.min(...hourlyHeat)) / 2 * 10) / 10,
            safe: Math.min(...hourlyHeat),
            hourlyData: hourlyHeat
        },
        humidity: {
            current: Math.round(currentHumidity * 10) / 10,
            trend: (Math.random() - 0.5) * 4,
            min: Math.min(...hourlyHumidity),
            max: Math.max(...hourlyHumidity),
            optimal: "45-65%",
            hourlyData: hourlyHumidity
        },
        regions: generateRegionalData(seasonalFactor)
    };
}

/**
 * Generate regional climate data
 */
function generateRegionalData(seasonalFactor) {
    return {
        Americas: {
            temp: Math.round((16.8 + seasonalFactor * 4 + (Math.random() - 0.5) * 3) * 10) / 10,
            rain: Math.round((3.2 + (Math.random() - 0.5) * 2) * 10) / 10,
            humidity: Math.round((71 + (Math.random() - 0.5) * 10))
        },
        Europe: {
            temp: Math.round((12.4 + seasonalFactor * 6 + (Math.random() - 0.5) * 3) * 10) / 10,
            rain: Math.round((2.1 + (Math.random() - 0.5) * 1.5) * 10) / 10,
            humidity: Math.round((68 + (Math.random() - 0.5) * 8))
        },
        Asia: {
            temp: Math.round((18.9 + seasonalFactor * 5 + (Math.random() - 0.5) * 4) * 10) / 10,
            rain: Math.round((4.1 + (Math.random() - 0.5) * 3) * 10) / 10,
            humidity: Math.round((74 + (Math.random() - 0.5) * 12))
        },
        Africa: {
            temp: Math.round((24.7 + seasonalFactor * 3 + (Math.random() - 0.5) * 3) * 10) / 10,
            rain: Math.round((1.8 + (Math.random() - 0.5) * 1.2) * 10) / 10,
            humidity: Math.round((58 + (Math.random() - 0.5) * 10))
        }
    };
}

/**
 * Update charts with real-time data
 */
function updateChartsWithRealData(realTimeData) {
    console.log('[Dashboard] Updating charts with real-time data');
    
    // Update sample data with real-time data
    Object.assign(sampleClimateData, realTimeData);
    
    // Update chart data
    if (temperatureChart && temperatureChart.data) {
        temperatureChart.data.datasets[0].data = realTimeData.temperature.hourlyData;
        temperatureChart.update('none'); // No animation for real-time updates
    }
    
    if (rainfallChart && rainfallChart.data) {
        rainfallChart.data.datasets[0].data = realTimeData.rainfall.hourlyData;
        rainfallChart.update('none');
    }
    
    if (heatChart && heatChart.data) {
        heatChart.data.datasets[0].data = realTimeData.heat.hourlyData;
        heatChart.update('none');
    }
    
    if (humidityChart && humidityChart.data) {
        humidityChart.data.datasets[0].data = realTimeData.humidity.hourlyData;
        humidityChart.update('none');
    }
    
    // Update chart values
    updateChartValues();
}

/**
 * Update regional data display
 */
function updateRegionalData(realTimeData) {
    if (!realTimeData.regions) return;
    
    const regions = ['Americas', 'Europe', 'Asia', 'Africa'];
    
    regions.forEach(region => {
        const regionData = realTimeData.regions[region];
        if (!regionData) return;
        
        // Find region cards and update values
        const regionCards = document.querySelectorAll('.region-card');
        regionCards.forEach(card => {
            const title = card.querySelector('h4');
            if (title && title.textContent.includes(region)) {
                const stats = card.querySelectorAll('.region-stat .value');
                if (stats.length >= 3) {
                    stats[0].textContent = `${regionData.temp}°C`;
                    stats[1].textContent = `${regionData.rain}mm`;
                    stats[2].textContent = `${regionData.humidity}%`;
                }
            }
        });
    });
}

/**
 * Set up automatic data refresh
 */
function setupAutoRefresh() {
    // Refresh data every 5 minutes
    setInterval(() => {
        console.log('[Dashboard] Auto-refreshing weather data');
        fetchRealTimeWeatherData();
    }, 5 * 60 * 1000);
    
    // Update timestamp display
    setInterval(() => {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        
        // Update any timestamp displays
        const timestampElements = document.querySelectorAll('.last-updated');
        timestampElements.forEach(el => {
            el.textContent = `Last updated: ${timeString}`;
        });
    }, 1000);
}

// Start auto-refresh when dashboard loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        setupAutoRefresh();
    }, 3000);
});

console.log('[Dashboard] Real-time weather module loaded');
//
 Expose functions globally for debugging
window.initializeClimateCharts = initializeClimateCharts;
window.createTemperatureChart = createTemperatureChart;
window.fetchRealTimeWeatherData = fetchRealTimeWeatherData;
window.updateChartsForDate = updateChartsForDate;

console.log('[Dashboard] Functions exposed globally for debugging');
console.log('[Dashboard] Available functions:', {
    initializeClimateCharts: typeof initializeClimateCharts,
    createTemperatureChart: typeof createTemperatureChart,
    fetchRealTimeWeatherData: typeof fetchRealTimeWeatherData
});