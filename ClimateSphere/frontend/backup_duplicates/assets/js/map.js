// Interactive World Map with Climate Data
class ClimateMap {
    constructor() {
        this.map = null;
        this.markers = [];
        this.heatmapLayer = null;
        this.init();
    }

    init() {
        this.initializeMap();
        this.loadClimateData();
        this.setupMapControls();
    }

    initializeMap() {
        // Initialize Leaflet map
        this.map = L.map('worldMap', {
            center: [20, 0],
            zoom: 2,
            zoomControl: true,
            scrollWheelZoom: true
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);

        // Add custom controls
        this.addMapLegend();
    }

    async loadClimateData() {
        try {
            // Mock climate data points - in production, fetch from real APIs
            const climateData = this.generateMockClimateData();
            
            // Add markers for each data point
            climateData.forEach(point => {
                this.addClimateMarker(point);
            });

            // Add heatmap layer
            this.addHeatmapLayer(climateData);
            
        } catch (error) {
            console.error('Error loading climate data:', error);
        }
    }

    generateMockClimateData() {
        const cities = [
            { name: 'New York', lat: 40.7128, lng: -74.0060, temp: 22, risk: 'medium' },
            { name: 'London', lat: 51.5074, lng: -0.1278, temp: 18, risk: 'low' },
            { name: 'Tokyo', lat: 35.6762, lng: 139.6503, temp: 26, risk: 'high' },
            { name: 'Sydney', lat: -33.8688, lng: 151.2093, temp: 24, risk: 'medium' },
            { name: 'Mumbai', lat: 19.0760, lng: 72.8777, temp: 32, risk: 'high' },
            { name: 'São Paulo', lat: -23.5505, lng: -46.6333, temp: 28, risk: 'high' },
            { name: 'Cairo', lat: 30.0444, lng: 31.2357, temp: 35, risk: 'high' },
            { name: 'Moscow', lat: 55.7558, lng: 37.6176, temp: 15, risk: 'low' },
            { name: 'Cape Town', lat: -33.9249, lng: 18.4241, temp: 21, risk: 'medium' },
            { name: 'Bangkok', lat: 13.7563, lng: 100.5018, temp: 34, risk: 'high' },
            { name: 'Mexico City', lat: 19.4326, lng: -99.1332, temp: 25, risk: 'medium' },
            { name: 'Berlin', lat: 52.5200, lng: 13.4050, temp: 19, risk: 'low' }
        ];

        return cities.map(city => ({
            ...city,
            humidity: 60 + Math.random() * 30,
            rainfall: 50 + Math.random() * 150,
            co2: 400 + Math.random() * 50,
            aqi: Math.floor(50 + Math.random() * 200)
        }));
    }

    addClimateMarker(data) {
        const riskColors = {
            low: '#10b981',
            medium: '#f59e0b',
            high: '#ef4444'
        };

        const icon = L.divIcon({
            className: 'climate-marker',
            html: `
                <div style="
                    background: ${riskColors[data.risk]};
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 10px;
                ">
                    ${Math.round(data.temp)}°
                </div>
            `,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
        });

        const marker = L.marker([data.lat, data.lng], { icon })
            .addTo(this.map)
            .bindPopup(this.createPopupContent(data));

        this.markers.push(marker);
    }

    createPopupContent(data) {
        const riskBadgeClass = {
            low: 'success',
            medium: 'warning',
            high: 'danger'
        };

        return `
            <div class="climate-popup">
                <h6 class="mb-2">${data.name}</h6>
                <div class="row g-2 mb-2">
                    <div class="col-6">
                        <small class="text-muted">Temperature</small>
                        <div class="fw-bold">${data.temp}°C</div>
                    </div>
                    <div class="col-6">
                        <small class="text-muted">Humidity</small>
                        <div class="fw-bold">${Math.round(data.humidity)}%</div>
                    </div>
                    <div class="col-6">
                        <small class="text-muted">Rainfall</small>
                        <div class="fw-bold">${Math.round(data.rainfall)}mm</div>
                    </div>
                    <div class="col-6">
                        <small class="text-muted">AQI</small>
                        <div class="fw-bold">${data.aqi}</div>
                    </div>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-${riskBadgeClass[data.risk]} text-capitalize">
                        ${data.risk} Risk
                    </span>
                    <small class="text-muted">CO₂: ${Math.round(data.co2)} ppm</small>
                </div>
            </div>
        `;
    }

    addHeatmapLayer(data) {
        // Create heatmap points
        const heatmapPoints = data.map(point => [
            point.lat,
            point.lng,
            point.temp / 50 // Normalize temperature for heatmap intensity
        ]);

        // Add simple circle markers for heatmap effect
        data.forEach(point => {
            const intensity = point.temp / 50;
            const radius = 50000 + (intensity * 100000); // Radius in meters
            
            L.circle([point.lat, point.lng], {
                radius: radius,
                fillColor: this.getHeatmapColor(point.temp),
                fillOpacity: 0.3,
                stroke: false
            }).addTo(this.map);
        });
    }

    getHeatmapColor(temperature) {
        if (temperature < 15) return '#3b82f6'; // Blue for cold
        if (temperature < 25) return '#10b981'; // Green for moderate
        if (temperature < 30) return '#f59e0b'; // Yellow for warm
        return '#ef4444'; // Red for hot
    }

    addMapLegend() {
        const legend = L.control({ position: 'bottomright' });
        
        legend.onAdd = function() {
            const div = L.DomUtil.create('div', 'map-legend');
            div.innerHTML = `
                <div style="
                    background: white;
                    padding: 15px;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    font-size: 12px;
                ">
                    <h6 class="mb-2">Climate Risk Levels</h6>
                    <div class="d-flex align-items-center mb-1">
                        <div style="width: 12px; height: 12px; background: #10b981; border-radius: 50%; margin-right: 8px;"></div>
                        <span>Low Risk</span>
                    </div>
                    <div class="d-flex align-items-center mb-1">
                        <div style="width: 12px; height: 12px; background: #f59e0b; border-radius: 50%; margin-right: 8px;"></div>
                        <span>Medium Risk</span>
                    </div>
                    <div class="d-flex align-items-center">
                        <div style="width: 12px; height: 12px; background: #ef4444; border-radius: 50%; margin-right: 8px;"></div>
                        <span>High Risk</span>
                    </div>
                </div>
            `;
            return div;
        };
        
        legend.addTo(this.map);
    }

    setupMapControls() {
        // Add layer control for different data views
        const baseLayers = {
            "Street Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
            "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}')
        };

        L.control.layers(baseLayers).addTo(this.map);

        // Add custom control for data refresh
        const refreshControl = L.control({ position: 'topright' });
        refreshControl.onAdd = () => {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            div.innerHTML = `
                <a href="#" title="Refresh Data" style="
                    background: white;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-decoration: none;
                    color: #333;
                    font-size: 16px;
                ">🔄</a>
            `;
            
            div.onclick = (e) => {
                e.preventDefault();
                this.refreshMapData();
            };
            
            return div;
        };
        
        refreshControl.addTo(this.map);
    }

    refreshMapData() {
        // Clear existing markers
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
        
        // Reload data
        this.loadClimateData();
        
        // Show refresh feedback
        if (window.climateSphere) {
            window.climateSphere.showAlert('Map data refreshed!', 'success');
        }
    }

    // Method to filter markers by risk level
    filterByRisk(riskLevel) {
        this.markers.forEach(marker => {
            const markerData = marker.options.data;
            if (riskLevel === 'all' || markerData.risk === riskLevel) {
                marker.addTo(this.map);
            } else {
                this.map.removeLayer(marker);
            }
        });
    }
}

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('worldMap')) {
        window.climateMap = new ClimateMap();
    }
});