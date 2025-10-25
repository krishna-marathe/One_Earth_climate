// Dashboard JavaScript
class Dashboard {
    constructor() {
        this.charts = {};
        this.updateInterval = null;
        this.init();
    }

    init() {
        this.checkAuth();
        this.loadDashboardData();
        this.initializeCharts();
        this.setupEventListeners();
        this.startAutoUpdate();
    }

    checkAuth() {
        const token = localStorage.getItem('climatesphere_token');
        
        // Update user info in navbar
        const user = JSON.parse(localStorage.getItem('climatesphere_user') || '{}');
        const userDropdown = document.querySelector('.navbar-nav .dropdown-toggle');
        const demoIndicator = document.getElementById('demoModeIndicator');
        
        if (token && user.name && userDropdown) {
            // User is logged in
            userDropdown.innerHTML = `👤 ${user.name}`;
            if (demoIndicator) demoIndicator.style.display = 'none';
        } else if (userDropdown) {
            // User is not logged in - show demo mode
            userDropdown.innerHTML = `👤 Demo User`;
            userDropdown.parentElement.querySelector('.dropdown-menu').innerHTML = `
                <li><a class="dropdown-item" href="index.html">← Back to Home</a></li>
                <li><a class="dropdown-item" href="#" onclick="showLogin()">Login</a></li>
                <li><a class="dropdown-item" href="#" onclick="showRegister()">Sign Up</a></li>
            `;
            if (demoIndicator) demoIndicator.style.display = 'block';
        }
    }

    async loadDashboardData() {
        try {
            // Add loading state to prevent multiple simultaneous requests
            if (this.isLoading) return;
            this.isLoading = true;
            
            // Load climate trends
            const trends = await this.fetchClimatetrends();
            this.updateStatCards(trends);
            
            // Load risk assessment
            const risks = await this.fetchRiskAssessment();
            this.updateRiskAlerts(risks);
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        } finally {
            this.isLoading = false;
        }
    }

    async fetchClimatetrends() {
        const token = localStorage.getItem('climatesphere_token');
        
        try {
            if (token && window.climateSphere) {
                const response = await window.climateSphere.apiCall('/analysis/trends');
                return response.trends;
            } else {
                // Demo mode - return mock data
                throw new Error('Demo mode');
            }
        } catch (error) {
            // Return mock data for demo mode or if API fails
            return {
                temperature: { current: 25.4, change: +1.2, trend: 'increasing' },
                co2: { current: 421.3, change: +2.8, trend: 'increasing' },
                rainfall: { current: 98.7, change: -5.2, trend: 'decreasing' },
                seaLevel: { current: 3.4, change: +0.3, trend: 'increasing' }
            };
        }
    }

    async fetchRiskAssessment() {
        const token = localStorage.getItem('climatesphere_token');
        
        try {
            if (token && window.climateSphere) {
                const response = await window.climateSphere.apiCall('/prediction/risk', 'POST', {
                    temperature: 25.4,
                    rainfall: 98.7,
                    humidity: 65,
                    co2_level: 421.3
                });
                return response.predictions;
            } else {
                // Demo mode - return mock data
                throw new Error('Demo mode');
            }
        } catch (error) {
            // Return mock data for demo mode or if API fails
            return {
                flood: { risk_probability: 0.78, risk_level: 'High' },
                drought: { risk_probability: 0.65, risk_level: 'Medium' },
                heatwave: { risk_probability: 0.82, risk_level: 'High' }
            };
        }
    }

    updateStatCards(trends) {
        // Update temperature
        const tempElement = document.getElementById('dashTemp');
        if (tempElement && trends.temperature) {
            tempElement.textContent = `${trends.temperature.current}°C`;
        }

        // Update CO2
        const co2Element = document.getElementById('dashCO2');
        if (co2Element && trends.co2) {
            co2Element.textContent = `${Math.round(trends.co2.current)} ppm`;
        }

        // Update rainfall
        const rainfallElement = document.getElementById('dashRainfall');
        if (rainfallElement && trends.rainfall) {
            rainfallElement.textContent = `${trends.rainfall.current}mm`;
        }

        // Update sea level
        const seaLevelElement = document.getElementById('dashSeaLevel');
        if (seaLevelElement && trends.seaLevel) {
            seaLevelElement.textContent = `+${trends.seaLevel.current}mm`;
        }
    }

    updateRiskAlerts(risks) {
        const alertList = document.querySelector('.alert-list');
        if (!alertList || !risks) return;

        const alerts = [
            {
                type: 'flood',
                icon: '🌊',
                title: 'Flood Risk',
                message: `Coastal regions showing ${Math.round(risks.flood.risk_probability * 100)}% flood probability`,
                level: risks.flood.risk_level.toLowerCase(),
                time: '2 hours ago'
            },
            {
                type: 'drought',
                icon: '🏜️',
                title: 'Drought Warning',
                message: `Agricultural areas at ${Math.round(risks.drought.risk_probability * 100)}% drought risk`,
                level: risks.drought.risk_level.toLowerCase(),
                time: '5 hours ago'
            },
            {
                type: 'heatwave',
                icon: '🌡️',
                title: 'Heatwave Alert',
                message: `Urban areas showing ${Math.round(risks.heatwave.risk_probability * 100)}% extreme heat probability`,
                level: risks.heatwave.risk_level.toLowerCase(),
                time: '1 day ago'
            }
        ];

        alertList.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.level}">
                <div class="alert-icon">${alert.icon}</div>
                <div class="alert-content">
                    <h6>${alert.title}</h6>
                    <p>${alert.message}</p>
                    <small>${alert.time}</small>
                </div>
            </div>
        `).join('');
    }

    initializeCharts() {
        this.initTemperatureChart();
        this.initRiskChart();
    }

    initTemperatureChart() {
        const ctx = document.getElementById('temperatureChart');
        if (!ctx) return;

        // Generate mock temperature data
        const data = this.generateTemperatureData();

        // Destroy existing chart if it exists
        if (this.charts.temperature) {
            this.charts.temperature.destroy();
        }

        this.charts.temperature = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Global Temperature (°C)',
                    data: data.values,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
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
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 4,
                        hoverRadius: 8
                    }
                }
            }
        });
    }

    initRiskChart() {
        const ctx = document.getElementById('riskChart');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.charts.risk) {
            this.charts.risk.destroy();
        }

        this.charts.risk = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Flood Risk', 'Drought Risk', 'Heatwave Risk'],
                datasets: [{
                    data: [78, 65, 82],
                    backgroundColor: [
                        '#3b82f6',
                        '#f59e0b',
                        '#ef4444'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    generateTemperatureData() {
        const labels = [];
        const values = [];
        const now = new Date();
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
            values.push(24 + Math.random() * 4 + (i * 0.1)); // Slight upward trend
        }
        
        return { labels, values };
    }

    setupEventListeners() {
        // Time range selector for temperature chart
        const timeRangeSelect = document.getElementById('tempTimeRange');
        if (timeRangeSelect) {
            timeRangeSelect.addEventListener('change', (e) => {
                this.updateTemperatureChart(e.target.value);
            });
        }

        // Sidebar toggle for mobile
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('show');
            });
        }

        // Logout functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('logout-btn')) {
                e.preventDefault();
                this.handleLogout();
            }
        });
    }

    updateTemperatureChart(timeRange) {
        if (!this.charts.temperature) return;

        let data;
        switch (timeRange) {
            case '5y':
                data = this.generateTemperatureData(60); // 5 years of monthly data
                break;
            case '10y':
                data = this.generateTemperatureData(120); // 10 years of monthly data
                break;
            default:
                data = this.generateTemperatureData(12); // 1 year of monthly data
        }

        this.charts.temperature.data.labels = data.labels;
        this.charts.temperature.data.datasets[0].data = data.values;
        this.charts.temperature.update();
    }

    startAutoUpdate() {
        // Update dashboard data every 30 seconds (reduced frequency for stability)
        this.updateInterval = setInterval(() => {
            this.loadDashboardData();
        }, 30 * 1000);
    }

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    handleLogout() {
        this.stopAutoUpdate();
        localStorage.removeItem('climatesphere_token');
        localStorage.removeItem('climatesphere_user');
        window.location.href = 'index.html';
    }

    showError(message) {
        if (window.climateSphere) {
            window.climateSphere.showAlert(message, 'danger');
        }
    }

    // Cleanup when leaving page
    destroy() {
        this.stopAutoUpdate();
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
    }
}

// Global functions for modal handling
function showLogin() {
    const modal = new bootstrap.Modal(document.getElementById('loginModal'));
    modal.show();
}

function showRegister() {
    const modal = new bootstrap.Modal(document.getElementById('registerModal'));
    modal.show();
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});

// Cleanup when leaving page
window.addEventListener('beforeunload', () => {
    if (window.dashboard) {
        window.dashboard.destroy();
    }
});