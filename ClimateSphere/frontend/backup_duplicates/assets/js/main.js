// ClimateSphere Main JavaScript
class ClimateSphere {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api';
        this.token = localStorage.getItem('climatesphere_token');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateLiveStats();
        this.checkAuthStatus();
        
        // Update stats every 30 seconds
        setInterval(() => this.updateLiveStats(), 30000);
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Logout functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('logout-btn')) {
                this.handleLogout();
            }
        });
    }

    async updateLiveStats() {
        try {
            // Simulate live climate data updates
            const stats = {
                globalTemp: (25 + Math.random() * 2).toFixed(1),
                co2Level: Math.floor(420 + Math.random() * 5),
                seaLevel: (3.2 + Math.random() * 0.4).toFixed(1),
                iceExtent: (-12 + Math.random() * 2).toFixed(1)
            };

            // Update DOM elements
            const elements = {
                globalTemp: document.getElementById('globalTemp'),
                co2Level: document.getElementById('co2Level'),
                seaLevel: document.getElementById('seaLevel'),
                iceExtent: document.getElementById('iceExtent')
            };

            if (elements.globalTemp) elements.globalTemp.textContent = `${stats.globalTemp}°C`;
            if (elements.co2Level) elements.co2Level.textContent = `${stats.co2Level} ppm`;
            if (elements.seaLevel) elements.seaLevel.textContent = `+${stats.seaLevel}mm`;
            if (elements.iceExtent) elements.iceExtent.textContent = `${stats.iceExtent}%`;

        } catch (error) {
            console.error('Error updating live stats:', error);
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        try {
            submitBtn.innerHTML = '<span class="loading"></span> Logging in...';
            submitBtn.disabled = true;

            const response = await axios.post(`${this.apiUrl}/auth/login`, {
                email,
                password
            });

            if (response.data.token) {
                localStorage.setItem('climatesphere_token', response.data.token);
                localStorage.setItem('climatesphere_user', JSON.stringify(response.data.user));
                
                this.showAlert('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert(error.response?.data?.error || 'Login failed', 'danger');
        } finally {
            submitBtn.innerHTML = 'Login';
            submitBtn.disabled = false;
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        try {
            submitBtn.innerHTML = '<span class="loading"></span> Creating account...';
            submitBtn.disabled = true;

            const response = await axios.post(`${this.apiUrl}/auth/register`, {
                name,
                email,
                password
            });

            if (response.data.token) {
                localStorage.setItem('climatesphere_token', response.data.token);
                localStorage.setItem('climatesphere_user', JSON.stringify(response.data.user));
                
                this.showAlert('Account created successfully! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showAlert(error.response?.data?.error || 'Registration failed', 'danger');
        } finally {
            submitBtn.innerHTML = 'Sign Up';
            submitBtn.disabled = false;
        }
    }

    handleLogout() {
        localStorage.removeItem('climatesphere_token');
        localStorage.removeItem('climatesphere_user');
        window.location.href = 'index.html';
    }

    checkAuthStatus() {
        const token = localStorage.getItem('climatesphere_token');
        const user = JSON.parse(localStorage.getItem('climatesphere_user') || '{}');
        
        if (token && user.name) {
            // Update navigation for logged-in user
            this.updateNavForLoggedInUser(user);
        }
    }

    updateNavForLoggedInUser(user) {
        const navItems = document.querySelector('.navbar-nav:last-child');
        if (navItems) {
            navItems.innerHTML = `
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                        👤 ${user.name}
                    </a>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="dashboard.html">Dashboard</a></li>
                        <li><a class="dropdown-item" href="upload.html">Upload Data</a></li>
                        <li><a class="dropdown-item" href="analysis.html">Analysis</a></li>
                        <li><a class="dropdown-item" href="predictions.html">Predictions</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item logout-btn" href="#">Logout</a></li>
                    </ul>
                </li>
            `;
        }
    }

    showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert-custom');
        existingAlerts.forEach(alert => alert.remove());

        // Create new alert
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-custom position-fixed`;
        alert.style.cssText = `
            top: 100px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        `;
        alert.innerHTML = `
            <div class="d-flex align-items-center">
                <span>${message}</span>
                <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;

        document.body.appendChild(alert);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 5000);
    }

    // Utility method for API calls with auth
    async apiCall(endpoint, method = 'GET', data = null) {
        const config = {
            method,
            url: `${this.apiUrl}${endpoint}`,
            headers: {}
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        if (data) {
            config.data = data;
            config.headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await axios(config);
            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                // Token expired, redirect to login
                this.handleLogout();
            }
            throw error;
        }
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

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.climateSphere = new ClimateSphere();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClimateSphere;
}