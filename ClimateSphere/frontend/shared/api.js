/**
 * ClimateSphere API Client
 * Handles all API communications with backend services
 */

class ClimateSphereAPI {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.mlURL = 'http://localhost:5000';
        this.token = localStorage.getItem('climateSphere_token');
    }

    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('climateSphere_token', token);
    }

    /**
     * Get authentication headers
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    /**
     * Generic API request method
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            // Return demo data structure for development
            return {
                demo: true,
                error: error.message,
                data: null
            };
        }
    }

    /**
     * GET request
     */
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Authentication Methods
    async login(credentials) {
        // TODO: Implement actual login API call
        return this.post('/auth/login', credentials);
    }

    async signup(userData) {
        // TODO: Implement actual signup API call
        return this.post('/auth/signup', userData);
    }

    async logout() {
        // TODO: Implement actual logout API call
        this.token = null;
        localStorage.removeItem('climateSphere_token');
        return { success: true };
    }

    // Data Methods
    async uploadData(formData) {
        // TODO: Implement file upload API call
        return this.post('/data/upload', formData);
    }

    async getAnalysis(dataId) {
        // TODO: Implement analysis retrieval API call
        return this.get(`/analysis/${dataId}`);
    }

    async getPredictions(params) {
        // TODO: Implement predictions API call
        return this.post('/predictions', params);
    }

    async getInsights(filters) {
        // TODO: Implement insights API call
        return this.post('/insights', filters);
    }

    // Dashboard Methods
    async getDashboardData() {
        // TODO: Implement dashboard data API call
        return this.get('/dashboard/summary');
    }

    async getRegionData(region) {
        // TODO: Implement region-specific data API call
        return this.get(`/data/region/${region}`);
    }
}

// Create global API instance
window.ClimateSphereAPI = new ClimateSphereAPI();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClimateSphereAPI;
}