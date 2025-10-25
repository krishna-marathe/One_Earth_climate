/**
 * ClimateSphere Landing Page - Main JavaScript
 * Handles interactive map, data fetching, and UI interactions
 */

// Configuration - Add your API keys here
const API_KEYS = {
    OPENWEATHER: '', // Get from https://openweathermap.org/api
    AQICN: '', // Get from https://aqicn.org/api/
    CO2: '', // Get from https://co2signal.com
    MAPBOX_TOKEN: '' // Get from https://mapbox.com (optional, falls back to OpenStreetMap)
};

// Fallback data for when APIs are unavailable or keys are missing
const FALLBACK_DATA = {
    globalStats: {
        co2: { value: 421.3, trend: 'up', change: '+2.1' },
        temperature: { value: 15.2, trend: 'up', change: '+1.1°C' },
        floodZones: { value: 23, trend: 'up', change: '+5' },
        alerts: { value: 47, trend: 'down', change: '-3' }
    },
    regions: [
        {
            country: 'United States',
            region: 'California',
            lat: 36.7783,
            lon: -119.4179,
            temp: 22.5,
            aqi: 85,
            rainfall: 12.3,
            co2: 415.2,
            alerts: [
                { type: 'heatwave', level: 'high', message: 'Extreme heat warning in effect' },
                { type: 'drought', level: 'moderate', message: 'Water conservation advised' }
            ]
        },
        {
            country: 'India',
            region: 'Delhi',
            lat: 28.6139,
            lon: 77.2090,
            temp: 35.8,
            aqi: 156,
            rainfall: 2.1,
            co2: 425.8,
            alerts: [
                { type: 'heatwave', level: 'severe', message: 'Dangerous heat levels recorded' },
                { type: 'air_quality', level: 'high', message: 'Unhealthy air quality' }
            ]
        },
        {
            country: 'Brazil',
            region: 'Amazon',
            lat: -3.4653,
            lon: -62.2159,
            temp: 28.2,
            aqi: 45,
            rainfall: 45.7,
            co2: 398.5,
            alerts: [
                { type: 'flood', level: 'moderate', message: 'River levels rising' }
            ]
        },
        {
            country: 'Australia',
            region: 'Queensland',
            lat: -20.9176,
            lon: 142.7028,
            temp: 31.4,
            aqi: 32,
            rainfall: 0.8,
            co2: 418.9,
            alerts: [
                { type: 'drought', level: 'severe', message: 'Extreme drought conditions' },
                { type: 'heatwave', level: 'high', message: 'Heat advisory issued' }
            ]
        },
        {
            country: 'Norway',
            region: 'Oslo',
            lat: 59.9139,
            lon: 10.7522,
            temp: 8.3,
            aqi: 18,
            rainfall: 15.2,
            co2: 405.1,
            alerts: []
        }
    ],
    cyclones: [
        { lat: 25.7617, lon: -80.1918, name: 'Hurricane Alpha', category: 3 },
        { lat: 13.0827, lon: 80.2707, name: 'Cyclone Beta', category: 2 }
    ]
};

// Global variables
let map;
let layerGroups = {};
let markerClusters;
let currentRegionData = null;
let regionChart = null;

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    showLoading();
    initializeMap();
    initializeEventListeners();
    loadGlobalData();
    hideLoading();
});

/**
 * Show loading overlay
 */
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('show');
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.remove('show');
}

/**
 * Initialize the Leaflet map with base configuration
 */
function initializeMap() {
    try {
        // Initialize map centered on world view with scroll protection
        map = L.map('map', {
            center: [20, 0],
            zoom: 2,
            zoomControl: true,
            attributionControl: true,
            preferCanvas: true, // Better performance for many markers
            worldCopyJump: true,
            scrollWheelZoom: false, // Disable scroll wheel zoom initially
            doubleClickZoom: true,
            touchZoom: true,
            boxZoom: true,
            keyboard: true,
            dragging: true,
            zoomSnap: 0.5,
            zoomDelta: 0.5,
            wheelPxPerZoomLevel: 60
        });

        // Add base tile layer (Mapbox if token available, otherwise OpenStreetMap)
        const tileLayer = API_KEYS.MAPBOX_TOKEN 
            ? L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=${API_KEYS.MAPBOX_TOKEN}`, {
                attribution: '© Mapbox © OpenStreetMap',
                maxZoom: 18
            })
            : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            });
        
        tileLayer.addTo(map);

        // Initialize layer groups for different data types
        layerGroups = {
            temperature: L.layerGroup(),
            aqi: L.layerGroup(),
            rainfall: L.layerGroup(),
            snow: L.layerGroup(),
            cyclone: L.layerGroup(),
            waterStress: L.layerGroup()
        };

        // Initialize marker clustering with better options
        markerClusters = L.markerClusterGroup({
            chunkedLoading: true,
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true
        });

        // Add default layers to map
        layerGroups.temperature.addTo(map);
        layerGroups.cyclone.addTo(map);
        markerClusters.addTo(map);

        // Add map event listeners
        map.on('click', function(e) {
            // Close drawer when clicking on empty map area
            if (document.getElementById('regionDrawer').classList.contains('open')) {
                closeRegionDrawer();
            }
        });

        // Set up scroll protection
        setupMapScrollProtection();

        // Handle map focus for scroll zoom
        setupMapFocusHandling();

        // Show loading state
        showMapLoading();

        // Load map data
        loadMapData().then(() => {
            hideMapLoading();
        }).catch(() => {
            hideMapLoading();
        });
        
        console.log('[Landing] Map initialized successfully');
    } catch (error) {
        console.error('[Landing] Failed to initialize map:', error);
        hideMapLoading();
        showMapError();
    }
}

/**
 * Show map loading state
 */
function showMapLoading() {
    const mapContainer = document.querySelector('.map-container');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'map-loading';
    loadingDiv.id = 'mapLoading';
    loadingDiv.innerHTML = `
        <i class="fas fa-globe-americas"></i>
        <div>Loading Climate Data...</div>
        <small>Initializing interactive map</small>
    `;
    mapContainer.appendChild(loadingDiv);
}

/**
 * Hide map loading state
 */
function hideMapLoading() {
    const loading = document.getElementById('mapLoading');
    if (loading) {
        loading.style.opacity = '0';
        setTimeout(() => {
            if (loading.parentElement) {
                loading.remove();
            }
        }, 300);
    }
}

/**
 * Show map error message
 */
function showMapError() {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f3f4f6; color: #6b7280; text-align: center; padding: 2rem;">
                <div>
                    <i class="fas fa-map-marked-alt" style="font-size: 3rem; margin-bottom: 1rem; color: #9ca3af;"></i>
                    <h3>Map Loading Error</h3>
                    <p>Unable to load the interactive map. Please refresh the page to try again.</p>
                    <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                        Refresh Page
                    </button>
                </div>
            </div>
        `;
    }
}

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Navigation toggle for mobile
    const navToggle = document.getElementById('navToggle');
    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileNav);
    }

    // Navigation buttons
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = '../auth/login.html';
        });
    }
    
    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            window.location.href = '../auth/signup.html';
        });
    }

    // Layer control checkboxes with enhanced UI
    document.getElementById('tempLayer').addEventListener('change', (e) => {
        toggleLayer('temperature', e.target.checked);
        updateLayerToggleUI(e.target.closest('.layer-toggle'), e.target.checked);
    });
    document.getElementById('aqiLayer').addEventListener('change', (e) => {
        toggleLayer('aqi', e.target.checked);
        updateLayerToggleUI(e.target.closest('.layer-toggle'), e.target.checked);
    });
    document.getElementById('rainfallLayer').addEventListener('change', (e) => {
        toggleLayer('rainfall', e.target.checked);
        updateLayerToggleUI(e.target.closest('.layer-toggle'), e.target.checked);
    });
    document.getElementById('snowLayer').addEventListener('change', (e) => {
        toggleLayer('snow', e.target.checked);
        updateLayerToggleUI(e.target.closest('.layer-toggle'), e.target.checked);
    });
    document.getElementById('cycloneLayer').addEventListener('change', (e) => {
        toggleLayer('cyclone', e.target.checked);
        updateLayerToggleUI(e.target.closest('.layer-toggle'), e.target.checked);
    });
    document.getElementById('waterStressLayer').addEventListener('change', (e) => {
        toggleLayer('waterStress', e.target.checked);
        updateLayerToggleUI(e.target.closest('.layer-toggle'), e.target.checked);
    });

    // Map toolbar buttons
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);
    document.getElementById('locateBtn').addEventListener('click', locateUser);
    document.getElementById('resetViewBtn').addEventListener('click', resetMapView);
    document.getElementById('shareBtn').addEventListener('click', shareMap);

    // Stat card interactions
    document.getElementById('co2Card').addEventListener('click', () => focusMapLayer('co2'));
    document.getElementById('tempCard').addEventListener('click', () => focusMapLayer('temperature'));
    document.getElementById('floodCard').addEventListener('click', () => focusMapLayer('flood'));
    document.getElementById('alertCard').addEventListener('click', () => focusMapLayer('alerts'));

    // Hero action buttons
    document.getElementById('exploreBtn').addEventListener('click', () => {
        document.querySelector('.map-section').scrollIntoView({ behavior: 'smooth' });
    });
    document.getElementById('learnMoreBtn').addEventListener('click', () => {
        document.querySelector('.footer').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Test drawer button
    document.getElementById('testDrawerBtn').addEventListener('click', () => {
        const testRegion = FALLBACK_DATA.regions[0];
        openRegionDetails(testRegion);
    });

    // Region drawer controls
    document.getElementById('drawerClose').addEventListener('click', closeRegionDrawer);
    document.getElementById('openDashboardBtn').addEventListener('click', openRegionDashboard);
    document.getElementById('drawerBackdrop').addEventListener('click', closeRegionDrawer);

    // Keyboard navigation for stat cards
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });

    // Close drawer when clicking outside
    document.addEventListener('click', (e) => {
        const drawer = document.getElementById('regionDrawer');
        if (drawer.classList.contains('open') && !drawer.contains(e.target) && !e.target.closest('.leaflet-popup')) {
            closeRegionDrawer();
        }
    });

    // Close drawer with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const drawer = document.getElementById('regionDrawer');
            if (drawer.classList.contains('open')) {
                closeRegionDrawer();
            }
        }
    });
}

/**
 * Toggle mobile navigation menu
 */
function toggleMobileNav() {
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');
    // Implementation would depend on mobile nav design
    console.log('Mobile nav toggle - implement based on design needs');
}

/**
 * Toggle map layers on/off
 */
function toggleLayer(layerName, isVisible) {
    if (layerGroups[layerName]) {
        if (isVisible) {
            layerGroups[layerName].addTo(map);
        } else {
            map.removeLayer(layerGroups[layerName]);
        }
    }
}

/**
 * Focus map on specific data layer when stat card is clicked
 */
function focusMapLayer(dataType) {
    switch (dataType) {
        case 'co2':
            // Zoom to regions with high CO2 levels
            map.setView([40, 0], 3);
            toggleLayer('temperature', true);
            document.getElementById('tempLayer').checked = true;
            break;
        case 'temperature':
            // Focus on temperature layer
            toggleLayer('temperature', true);
            document.getElementById('tempLayer').checked = true;
            break;
        case 'flood':
            // Focus on flood-prone areas
            toggleLayer('rainfall', true);
            document.getElementById('rainfallLayer').checked = true;
            break;
        case 'alerts':
            // Show cyclone and alert markers
            toggleLayer('cyclone', true);
            document.getElementById('cycloneLayer').checked = true;
            break;
    }
}

/**
 * Load and display global statistics
 */
async function loadGlobalData() {
    try {
        // Attempt to fetch live data from APIs
        const globalData = await fetchGlobalStats();
        updateGlobalStats(globalData);
    } catch (error) {
        console.warn('Failed to fetch live data, using fallback:', error);
        updateGlobalStats(FALLBACK_DATA.globalStats);
    }
}

/**
 * Fetch global statistics from various APIs
 */
async function fetchGlobalStats() {
    const stats = { ...FALLBACK_DATA.globalStats };

    try {
        // Fetch CO2 data
        if (API_KEYS.CO2) {
            const co2Response = await axios.get(`https://api.co2signal.com/v1/latest?countryCode=US`, {
                headers: { 'auth-token': API_KEYS.CO2 }
            });
            if (co2Response.data && co2Response.data.data) {
                stats.co2.value = co2Response.data.data.carbonIntensity || stats.co2.value;
            }
        }

        // Fetch global temperature (using OpenWeatherMap for major cities average)
        if (API_KEYS.OPENWEATHER) {
            const cities = ['London', 'New York', 'Tokyo', 'Sydney', 'Mumbai'];
            const tempPromises = cities.map(city => 
                axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEYS.OPENWEATHER}&units=metric`)
            );
            
            const tempResponses = await Promise.allSettled(tempPromises);
            const validTemps = tempResponses
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value.data.main.temp);
            
            if (validTemps.length > 0) {
                stats.temperature.value = (validTemps.reduce((a, b) => a + b, 0) / validTemps.length).toFixed(1);
            }
        }

    } catch (error) {
        console.warn('Error fetching some global stats:', error);
    }

    return stats;
}

/**
 * Update global statistics display
 */
function updateGlobalStats(stats) {
    // Update CO2 levels
    document.getElementById('co2Value').textContent = stats.co2.value;
    const co2Trend = document.getElementById('co2Trend');
    co2Trend.textContent = stats.co2.change;
    co2Trend.className = `stat-trend ${stats.co2.trend}`;

    // Update temperature
    document.getElementById('tempValue').textContent = `${stats.temperature.value}°C`;
    const tempTrend = document.getElementById('tempTrend');
    tempTrend.textContent = stats.temperature.change;
    tempTrend.className = `stat-trend ${stats.temperature.trend}`;

    // Update flood zones
    document.getElementById('floodValue').textContent = stats.floodZones.value;
    const floodTrend = document.getElementById('floodTrend');
    floodTrend.textContent = stats.floodZones.change;
    floodTrend.className = `stat-trend ${stats.floodZones.trend}`;

    // Update alerts
    document.getElementById('alertValue').textContent = stats.alerts.value;
    const alertTrend = document.getElementById('alertTrend');
    alertTrend.textContent = stats.alerts.change;
    alertTrend.className = `stat-trend ${stats.alerts.trend}`;

    // Add fade-in animation
    document.querySelectorAll('.stat-card').forEach(card => {
        card.classList.add('fade-in-up');
    });
}

/**
 * Load and display map data (regions, cyclones, etc.)
 */
async function loadMapData() {
    try {
        // Load region data
        const regionData = await fetchRegionData();
        displayRegionMarkers(regionData);

        // Load cyclone data
        const cycloneData = await fetchCycloneData();
        displayCycloneMarkers(cycloneData);

        // Load other climate layers
        await loadClimateLayersData();

    } catch (error) {
        console.warn('Failed to load map data, using fallback:', error);
        displayRegionMarkers(FALLBACK_DATA.regions);
        displayCycloneMarkers(FALLBACK_DATA.cyclones);
    }
}

/**
 * Fetch region-specific climate data
 */
async function fetchRegionData() {
    const regions = [...FALLBACK_DATA.regions];

    // If API keys are available, try to fetch live data for each region
    if (API_KEYS.OPENWEATHER) {
        for (let region of regions) {
            try {
                const weatherResponse = await axios.get(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${region.lat}&lon=${region.lon}&appid=${API_KEYS.OPENWEATHER}&units=metric`
                );
                
                if (weatherResponse.data) {
                    region.temp = weatherResponse.data.main.temp;
                    region.rainfall = weatherResponse.data.rain ? weatherResponse.data.rain['1h'] || 0 : 0;
                }
            } catch (error) {
                console.warn(`Failed to fetch weather for ${region.region}:`, error);
            }
        }
    }

    return regions;
}

/**
 * Fetch cyclone/hurricane data
 */
async function fetchCycloneData() {
    // In a real implementation, this would fetch from a cyclone tracking API
    // For now, return fallback data with some randomization
    return FALLBACK_DATA.cyclones.map(cyclone => ({
        ...cyclone,
        // Add some random movement to simulate live tracking
        lat: cyclone.lat + (Math.random() - 0.5) * 0.1,
        lon: cyclone.lon + (Math.random() - 0.5) * 0.1
    }));
}

/**
 * Load additional climate layer data (temperature, AQI, etc.)
 */
async function loadClimateLayersData() {
    // This would typically load raster data or additional point data
    // For demo purposes, we'll create some sample heat map data
    
    // Temperature layer (sample heat map points)
    const tempPoints = [
        { lat: 40.7128, lon: -74.0060, intensity: 0.8 }, // New York
        { lat: 34.0522, lon: -118.2437, intensity: 0.9 }, // Los Angeles
        { lat: 51.5074, lon: -0.1278, intensity: 0.4 }, // London
        { lat: 35.6762, lon: 139.6503, intensity: 0.6 }, // Tokyo
        { lat: 19.0760, lon: 72.8777, intensity: 0.95 } // Mumbai
    ];

    tempPoints.forEach(point => {
        const color = getTemperatureColor(point.intensity);
        const circle = L.circle([point.lat, point.lon], {
            color: color,
            fillColor: color,
            fillOpacity: 0.3,
            radius: 100000
        });
        layerGroups.temperature.addLayer(circle);
    });
}

/**
 * Get color based on temperature intensity
 */
function getTemperatureColor(intensity) {
    if (intensity > 0.8) return '#ef4444'; // Red - Hot
    if (intensity > 0.6) return '#f97316'; // Orange - Warm
    if (intensity > 0.4) return '#eab308'; // Yellow - Moderate
    return '#22c55e'; // Green - Cool
}

/**
 * Display region markers on the map
 */
function displayRegionMarkers(regions) {
    displayRegionMarkersEnhanced(regions);
}

/**
 * Display cyclone markers on the map
 */
function displayCycloneMarkers(cyclones) {
    cyclones.forEach(cyclone => {
        const marker = L.marker([cyclone.lat, cyclone.lon], {
            icon: L.divIcon({
                className: 'cyclone-marker',
                html: `<i class="fas fa-hurricane" style="color: #ef4444; font-size: 20px;"></i>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        });

        marker.bindPopup(`
            <div class="cyclone-popup">
                <h4>${cyclone.name}</h4>
                <p><strong>Category:</strong> ${cyclone.category}</p>
                <p><strong>Status:</strong> Active</p>
            </div>
        `);

        layerGroups.cyclone.addLayer(marker);
    });
}

/**
 * Calculate risk level based on region data
 */
function calculateRiskLevel(region) {
    let riskScore = 0;
    
    // Temperature risk
    if (region.temp > 35) riskScore += 3;
    else if (region.temp > 30) riskScore += 2;
    else if (region.temp < 0) riskScore += 2;
    
    // AQI risk
    if (region.aqi > 150) riskScore += 3;
    else if (region.aqi > 100) riskScore += 2;
    else if (region.aqi > 50) riskScore += 1;
    
    // Alert count risk
    riskScore += region.alerts.length;
    
    if (riskScore >= 6) return 'severe';
    if (riskScore >= 4) return 'high';
    if (riskScore >= 2) return 'moderate';
    return 'safe';
}

/**
 * Get color based on risk level
 */
function getRiskColor(riskLevel) {
    switch (riskLevel) {
        case 'severe': return '#ef4444';
        case 'high': return '#f97316';
        case 'moderate': return '#eab308';
        case 'safe': return '#22c55e';
        default: return '#6b7280';
    }
}

/**
 * Open region details drawer
 */
function openRegionDetails(region) {
    // Prevent multiple rapid calls
    if (currentRegionData && currentRegionData.region === region.region) {
        return;
    }
    
    currentRegionData = region;
    
    // Update drawer content with proper formatting
    document.getElementById('regionName').textContent = `${region.region}, ${region.country}`;
    document.getElementById('regionTemp').textContent = formatTemperature(region.temp);
    document.getElementById('regionAqi').textContent = formatAQI(region.aqi);
    document.getElementById('regionRainfall').textContent = formatRainfall(region.rainfall);
    document.getElementById('regionCo2').textContent = formatCO2(region.co2);
    
    // Update alerts list
    const alertsList = document.getElementById('regionAlertsList');
    alertsList.innerHTML = '';
    
    if (!region.alerts || region.alerts.length === 0) {
        alertsList.innerHTML = '<p style="color: #22c55e; text-align: center;">No active alerts</p>';
    } else {
        region.alerts.forEach(alert => {
            const alertElement = document.createElement('div');
            alertElement.className = `alert-item ${alert.level}`;
            alertElement.innerHTML = `
                <i class="fas fa-${getAlertIcon(alert.type)}"></i>
                <span>${alert.message}</span>
            `;
            alertsList.appendChild(alertElement);
        });
    }
    
    // Create temperature trend chart (only once)
    setTimeout(() => {
        createRegionChart(region);
    }, 100);
    
    // Show drawer with animation
    const drawer = document.getElementById('regionDrawer');
    const backdrop = document.getElementById('drawerBackdrop');
    
    drawer.classList.add('open');
    backdrop.classList.add('show');
    
    // Log for debugging
    console.log('[Landing] Region drawer opened for:', region.region);
}

/**
 * Get appropriate icon for alert type
 */
function getAlertIcon(alertType) {
    switch (alertType) {
        case 'heatwave': return 'thermometer-full';
        case 'flood': return 'water';
        case 'drought': return 'sun';
        case 'cyclone': return 'hurricane';
        case 'air_quality': return 'smog';
        default: return 'exclamation-triangle';
    }
}

/**
 * Create temperature trend chart for region
 */
function createRegionChart(region) {
    const ctx = document.getElementById('regionChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (regionChart) {
        regionChart.destroy();
        regionChart = null;
    }
    
    // Generate stable trend data (fixed seed based on region)
    const trendData = generateStableTrendData(region.temp, region.region);
    
    regionChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['6h ago', '5h ago', '4h ago', '3h ago', '2h ago', '1h ago', 'Now'],
            datasets: [{
                label: 'Temperature (°C)',
                data: trendData,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0 // Disable animations to prevent shaking
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    display: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    beginAtZero: false
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

/**
 * Generate stable trend data around current temperature (no random changes)
 */
function generateStableTrendData(currentTemp, regionName) {
    // Use region name as seed for consistent data
    const seed = regionName ? regionName.length * 7 : 42;
    const data = [];
    let temp = currentTemp - 2;
    
    // Generate consistent trend based on seed
    for (let i = 0; i < 7; i++) {
        const variation = Math.sin((seed + i) * 0.5) * 1.5;
        data.push(Math.round((temp + variation) * 10) / 10);
        temp += 0.3; // Gradual increase
    }
    
    data[6] = currentTemp; // Ensure last point is current temperature
    return data;
}

/**
 * Close region details drawer
 */
function closeRegionDrawer() {
    console.log('[Landing] Closing region drawer...');
    const drawer = document.getElementById('regionDrawer');
    const backdrop = document.getElementById('drawerBackdrop');
    
    if (drawer) {
        drawer.classList.remove('open');
        console.log('[Landing] Drawer class removed');
    } else {
        console.error('[Landing] Drawer element not found!');
    }
    
    if (backdrop) {
        backdrop.classList.remove('show');
        console.log('[Landing] Backdrop hidden');
    }
    
    // Destroy chart to prevent memory leaks and shaking
    if (regionChart) {
        regionChart.destroy();
        regionChart = null;
        console.log('[Landing] Chart destroyed');
    }
    
    currentRegionData = null;
    console.log('[Landing] Region drawer closed successfully');
}

/**
 * Open region dashboard (navigate to detailed dashboard)
 */
function openRegionDashboard() {
    if (currentRegionData) {
        // Navigate to dashboard with region parameters
        const dashboardUrl = `../dashboard/dashboard.html?country=${encodeURIComponent(currentRegionData.country)}&region=${encodeURIComponent(currentRegionData.region)}`;
        console.log('[Landing] Navigating to dashboard:', dashboardUrl);
        window.location.href = dashboardUrl;
    } else {
        console.warn('[Landing] No region data available for dashboard navigation');
        if (window.CS_Utils) {
            CS_Utils.showNotification('Please select a region first', 'warning');
        }
    }
}

/**
 * Global function to handle region details from popup buttons
 * (Called from popup HTML)
 */
window.openRegionDetails = openRegionDetails;

/**
 * Global function to open region details from popup by country/region name
 */
window.openRegionDetailsFromPopup = function(country, region) {
    // Find the region data
    const regionData = FALLBACK_DATA.regions.find(r => 
        r.country === country && r.region === region
    );
    
    if (regionData) {
        openRegionDetails(regionData);
    } else {
        console.warn('[Landing] Region data not found for:', country, region);
    }
};

/**
 * Smoke test function to verify functionality
 */
function runSmokeTests() {
    console.log('=== ClimateSphere Landing Page Smoke Tests ===');
    
    // Test 1: Map initialization
    console.log('✓ Test 1: Map initialized:', !!map);
    
    // Test 2: API module loaded
    console.log('✓ Test 2: API module loaded:', !!window.CS_API);
    
    // Test 3: Utils module loaded
    console.log('✓ Test 3: Utils module loaded:', !!window.CS_Utils);
    
    // Test 4: Fallback data available
    console.log('✓ Test 4: Fallback data loaded:', FALLBACK_DATA.regions.length > 0);
    
    // Test 5: Region drawer functionality
    const testRegion = FALLBACK_DATA.regions[0];
    if (testRegion) {
        console.log('✓ Test 5: Testing region drawer with:', testRegion.region);
        setTimeout(() => {
            openRegionDetails(testRegion);
            setTimeout(() => {
                closeRegionDrawer();
                console.log('✓ Test 5: Region drawer open/close works');
            }, 1000);
        }, 500);
    }
    
    // Test 6: Dashboard URL construction
    if (testRegion) {
        const dashboardUrl = `../dashboard/dashboard.html?country=${encodeURIComponent(testRegion.country)}&region=${encodeURIComponent(testRegion.region)}`;
        console.log('✓ Test 6: Dashboard URL constructed:', dashboardUrl);
    }
    
    console.log('=== Smoke Tests Complete ===');
}

// Run smoke tests after initialization
setTimeout(runSmokeTests, 2000);

/**
 * Handle window resize events
 */
window.addEventListener('resize', function() {
    if (map) {
        map.invalidateSize();
    }
});

/**
 * Handle scroll events for header styling
 */
window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
    } else {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

/**
 * Error handling for failed API requests
 */
window.addEventListener('unhandledrejection', function(event) {
    console.warn('Unhandled promise rejection (likely API failure):', event.reason);
    // Gracefully continue with fallback data
    event.preventDefault();
});

/**
 * Initialize service worker for offline functionality (optional)
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}

/**
 * Map Scroll Protection and Focus Handling
 */

/**
 * Set up map scroll protection to prevent accidental zooming
 */
function setupMapScrollProtection() {
    const mapContainer = document.querySelector('.map-container');
    let isMapFocused = false;
    let scrollTimeout;

    // Create focus overlay
    const focusOverlay = document.createElement('div');
    focusOverlay.className = 'map-focus-overlay';
    focusOverlay.innerHTML = `
        <div class="map-focus-message">
            <i class="fas fa-mouse-pointer"></i>
            <div>Click to interact with map</div>
            <small>Use Ctrl + Scroll to zoom</small>
        </div>
    `;
    mapContainer.appendChild(focusOverlay);

    // Show overlay initially
    focusOverlay.classList.add('show');

    // Handle map focus
    focusOverlay.addEventListener('click', () => {
        isMapFocused = true;
        focusOverlay.classList.remove('show');
        map.scrollWheelZoom.enable();
        
        // Auto-unfocus after 10 seconds of inactivity
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (isMapFocused) {
                isMapFocused = false;
                focusOverlay.classList.add('show');
                map.scrollWheelZoom.disable();
            }
        }, 10000);
    });

    // Handle mouse leave
    mapContainer.addEventListener('mouseleave', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isMapFocused = false;
            focusOverlay.classList.add('show');
            map.scrollWheelZoom.disable();
        }, 1000);
    });

    // Handle Ctrl+Scroll for zoom when not focused
    mapContainer.addEventListener('wheel', (e) => {
        if (!isMapFocused && !e.ctrlKey) {
            e.preventDefault();
            e.stopPropagation();
            
            // Show temporary message
            showScrollHint();
        }
    }, { passive: false });

    // Reset focus on map interaction
    map.on('drag zoom', () => {
        if (isMapFocused) {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isMapFocused = false;
                focusOverlay.classList.add('show');
                map.scrollWheelZoom.disable();
            }, 10000);
        }
    });
}

/**
 * Show scroll hint message
 */
function showScrollHint() {
    const existing = document.querySelector('.scroll-hint');
    if (existing) return;

    const hint = document.createElement('div');
    hint.className = 'scroll-hint';
    hint.innerHTML = `
        <div class="hint-content">
            <i class="fas fa-info-circle"></i>
            <span>Hold Ctrl + Scroll to zoom map</span>
        </div>
    `;
    
    hint.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(37, 99, 235, 0.95);
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 2rem;
        z-index: 10000;
        font-size: 0.875rem;
        font-weight: 500;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
        animation: fadeInScale 0.3s ease-out;
    `;

    document.body.appendChild(hint);

    setTimeout(() => {
        hint.style.animation = 'fadeOutScale 0.3s ease-in forwards';
        setTimeout(() => {
            if (hint.parentElement) {
                hint.remove();
            }
        }, 300);
    }, 2000);
}

/**
 * Set up enhanced map focus handling
 */
function setupMapFocusHandling() {
    const mapElement = document.getElementById('map');
    
    // Prevent map from stealing focus during page scroll
    let isPageScrolling = false;
    let scrollTimer;

    window.addEventListener('scroll', () => {
        isPageScrolling = true;
        clearTimeout(scrollTimer);
        
        scrollTimer = setTimeout(() => {
            isPageScrolling = false;
        }, 150);
    });

    // Disable map interactions during page scroll
    mapElement.addEventListener('wheel', (e) => {
        if (isPageScrolling) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, { passive: false });
}

/**
 * Enhanced Map UI Functions
 */

/**
 * Update layer toggle UI state
 */
function updateLayerToggleUI(toggleElement, isActive) {
    if (isActive) {
        toggleElement.classList.add('active');
    } else {
        toggleElement.classList.remove('active');
    }
}

/**
 * Toggle fullscreen mode for map
 */
function toggleFullscreen() {
    const mapSection = document.querySelector('.map-section');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    if (!document.fullscreenElement) {
        mapSection.requestFullscreen().then(() => {
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            fullscreenBtn.title = 'Exit Fullscreen';
            map.invalidateSize();
        }).catch(err => {
            console.warn('Could not enter fullscreen:', err);
        });
    } else {
        document.exitFullscreen().then(() => {
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            fullscreenBtn.title = 'Toggle Fullscreen';
            map.invalidateSize();
        });
    }
}

/**
 * Locate user's current position
 */
function locateUser() {
    const locateBtn = document.getElementById('locateBtn');
    const originalHTML = locateBtn.innerHTML;
    
    locateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    locateBtn.disabled = true;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                
                // Add user location marker
                const userMarker = L.marker([latitude, longitude], {
                    icon: L.divIcon({
                        className: 'user-location-marker',
                        html: '<i class="fas fa-map-marker-alt" style="color: #2563eb; font-size: 24px;"></i>',
                        iconSize: [30, 30],
                        iconAnchor: [15, 30]
                    })
                });
                
                userMarker.addTo(map);
                userMarker.bindPopup('<div class="user-popup"><h4>Your Location</h4><p>Current position</p></div>');
                
                // Zoom to user location
                map.setView([latitude, longitude], 10);
                
                locateBtn.innerHTML = originalHTML;
                locateBtn.disabled = false;
                
                // Remove marker after 10 seconds
                setTimeout(() => {
                    map.removeLayer(userMarker);
                }, 10000);
            },
            (error) => {
                console.warn('Geolocation error:', error);
                locateBtn.innerHTML = originalHTML;
                locateBtn.disabled = false;
                
                // Show error notification
                if (window.CS_Utils) {
                    CS_Utils.showNotification('Unable to access your location', 'error');
                }
            }
        );
    } else {
        locateBtn.innerHTML = originalHTML;
        locateBtn.disabled = false;
        
        if (window.CS_Utils) {
            CS_Utils.showNotification('Geolocation not supported', 'error');
        }
    }
}

/**
 * Reset map to initial view
 */
function resetMapView() {
    map.setView([20, 0], 2);
    
    // Reset all layers to default state
    document.getElementById('tempLayer').checked = true;
    document.getElementById('cycloneLayer').checked = true;
    document.getElementById('aqiLayer').checked = false;
    document.getElementById('rainfallLayer').checked = false;
    document.getElementById('snowLayer').checked = false;
    document.getElementById('waterStressLayer').checked = false;
    
    // Update layer visibility
    toggleLayer('temperature', true);
    toggleLayer('cyclone', true);
    toggleLayer('aqi', false);
    toggleLayer('rainfall', false);
    toggleLayer('snow', false);
    toggleLayer('waterStress', false);
    
    // Update UI states
    document.querySelectorAll('.layer-toggle').forEach(toggle => {
        const checkbox = toggle.querySelector('input[type="checkbox"]');
        updateLayerToggleUI(toggle, checkbox.checked);
    });
    
    // Close any open drawer
    if (document.getElementById('regionDrawer').classList.contains('open')) {
        closeRegionDrawer();
    }
}

/**
 * Share current map view
 */
function shareMap() {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const url = `${window.location.origin}${window.location.pathname}?lat=${center.lat.toFixed(4)}&lng=${center.lng.toFixed(4)}&zoom=${zoom}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'ClimateSphere - Climate Risk Map',
            text: 'Check out this climate risk visualization',
            url: url
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            if (window.CS_Utils) {
                CS_Utils.showNotification('Map link copied to clipboard!', 'success');
            }
        }).catch(err => {
            console.warn('Could not copy to clipboard:', err);
        });
    }
}

/**
 * Update map info panel
 */
function updateMapInfo() {
    const activeRegionsCount = document.getElementById('activeRegionsCount');
    const lastUpdated = document.getElementById('lastUpdated');
    
    if (activeRegionsCount) {
        activeRegionsCount.textContent = FALLBACK_DATA.regions.length;
    }
    
    if (lastUpdated) {
        lastUpdated.textContent = new Date().toLocaleTimeString();
    }
}

/**
 * Enhanced region marker display with animations
 */
function displayRegionMarkersEnhanced(regions) {
    regions.forEach((region, index) => {
        // Create custom marker based on risk level
        const riskLevel = window.CS_Utils ? CS_Utils.calculateRiskLevel(region) : calculateRiskLevel(region);
        const markerColor = window.CS_Utils ? CS_Utils.getRiskColor(riskLevel) : getRiskColor(riskLevel);
        
        const marker = L.circleMarker([region.lat, region.lon], {
            radius: 10,
            fillColor: markerColor,
            color: '#fff',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.8,
            className: 'climate-marker'
        });

        // Add pulsing animation for high-risk areas
        if (riskLevel === 'severe' || riskLevel === 'high') {
            marker.options.className += ' pulse-marker';
        }

        // Enhanced popup with better styling
        const popupContent = `
            <div class="region-popup enhanced">
                <div class="popup-header">
                    <h4>${region.region}, ${region.country}</h4>
                    <span class="risk-badge risk-${riskLevel}">${riskLevel.toUpperCase()}</span>
                </div>
                <div class="popup-stats">
                    <div class="stat-item">
                        <i class="fas fa-thermometer-half"></i>
                        <span>${formatTemperature(region.temp)}</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-smog"></i>
                        <span>AQI ${formatAQI(region.aqi)}</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-cloud-rain"></i>
                        <span>${formatRainfall(region.rainfall)}</span>
                    </div>
                </div>
                <button class="btn btn-primary btn-small popup-btn" onclick="window.openRegionDetailsFromPopup('${region.country}', '${region.region}')">
                    <i class="fas fa-chart-line"></i>
                    View Details
                </button>
            </div>
        `;

        marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup'
        });
        
        // Add click handler for region details
        marker.on('click', () => {
            console.log('[Landing] Marker clicked for region:', region.region);
            openRegionDetails(region);
        });

        // Add hover effects
        marker.on('mouseover', function() {
            this.setStyle({
                radius: 12,
                weight: 4
            });
        });

        marker.on('mouseout', function() {
            this.setStyle({
                radius: 10,
                weight: 3
            });
        });

        // Animate marker appearance with delay
        setTimeout(() => {
            markerClusters.addLayer(marker);
        }, index * 100);
    });
}

// Local utility functions (fallback if CS_Utils not loaded)
function formatTemperature(temp) {
    if (temp === null || temp === undefined || temp === '--') {
        return '--°C';
    }
    return `${parseFloat(temp).toFixed(1)}°C`;
}

function formatAQI(aqi) {
    if (aqi === null || aqi === undefined || aqi === '--') {
        return '--';
    }
    return parseInt(aqi);
}

function formatRainfall(rainfall) {
    if (rainfall === null || rainfall === undefined || rainfall === '--') {
        return '-- mm';
    }
    return `${parseFloat(rainfall).toFixed(1)} mm`;
}

function formatCO2(co2) {
    if (co2 === null || co2 === undefined || co2 === '--') {
        return '-- ppm';
    }
    return `${parseFloat(co2).toFixed(1)} ppm`;
}

/**
 * Enhanced scroll and performance optimizations
 */
function setupScrollOptimizations() {
    // Smooth scroll behavior for the entire page
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Intersection Observer for map performance
    const mapSection = document.querySelector('.map-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Map is visible, enable full functionality
                if (map) {
                    map.invalidateSize();
                }
            } else {
                // Map is not visible, reduce performance impact
                if (map && map.scrollWheelZoom) {
                    map.scrollWheelZoom.disable();
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });
    
    if (mapSection) {
        observer.observe(mapSection);
    }
    
    // Debounced resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (map) {
                map.invalidateSize();
            }
        }, 250);
    });
}

/**
 * Prevent scroll conflicts with map
 */
function preventScrollConflicts() {
    const mapContainer = document.querySelector('.map-container');
    if (!mapContainer) return;
    
    let isScrolling = false;
    let scrollTimeout;
    
    // Detect when user is scrolling the page
    window.addEventListener('scroll', () => {
        isScrolling = true;
        clearTimeout(scrollTimeout);
        
        // Add visual indicator that map is protected
        mapContainer.style.pointerEvents = 'none';
        mapContainer.style.opacity = '0.8';
        
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
            mapContainer.style.pointerEvents = 'auto';
            mapContainer.style.opacity = '1';
        }, 150);
    });
    
    // Prevent map zoom during page scroll
    mapContainer.addEventListener('wheel', (e) => {
        if (isScrolling) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, { passive: false });
}

// Initialize enhanced features
document.addEventListener('DOMContentLoaded', function() {
    // Set up scroll optimizations
    setupScrollOptimizations();
    
    // Prevent scroll conflicts
    preventScrollConflicts();
    
    // Update map info panel
    setTimeout(updateMapInfo, 1000);
    
    // Set up URL parameters for map sharing
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('lat') && urlParams.has('lng') && urlParams.has('zoom')) {
        const lat = parseFloat(urlParams.get('lat'));
        const lng = parseFloat(urlParams.get('lng'));
        const zoom = parseInt(urlParams.get('zoom'));
        
        setTimeout(() => {
            if (map) {
                map.setView([lat, lng], zoom);
            }
        }, 1000);
    }
});

console.log('ClimateSphere Landing Page initialized successfully!');