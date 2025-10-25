/**
 * ClimateSphere API Module
 * Handles all API communications with fallback to demo data
 * 
 * Usage:
 * - Set API_BASE_URL in config
 * - All functions return promises
 * - Automatically falls back to demo data on network errors
 */

// API Configuration - Update these for production
const API_CONFIG = {
    BASE_URL: 'http://localhost:3000/api', // Backend API URL
    ML_BASE_URL: 'http://localhost:5000/api', // ML API URL
    TIMEOUT: 10000, // 10 seconds
    DEMO_MODE: false // Set to true to force demo mode
};

// Demo fallback data
const DEMO_DATA = {
    auth: {
        login: { token: 'demo_token_12345', user: { id: 1, email: 'demo@climatosphere.com', name: 'Demo User' } },
        signup: { token: 'demo_token_12345', user: { id: 1, email: 'demo@climatosphere.com', name: 'Demo User' } }
    },
    summary: {
        co2: 421.3,
        temperature: 15.2,
        floodZones: 23,
        alerts: 47,
        regions: [
            { country: 'USA', region: 'California', temp: 22.5, aqi: 85, alerts: 2 },
            { country: 'India', region: 'Delhi', temp: 35.8, aqi: 156, alerts: 3 }
        ]
    },
    predictions: {
        temperature: [15.2, 15.8, 16.1, 16.7, 17.2],
        co2: [421, 425, 430, 435, 440],
        floods: [23, 25, 28, 32, 35]
    }
};

/**
 * Get authorization headers if user is logged in
 */
function getHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const token = localStorage.getItem('cs_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}

/**
 * Generic GET request with fallback
 */
async function get(endpoint, params = {}) {
    try {
        // Check if demo mode is forced
        if (API_CONFIG.DEMO_MODE) {
            console.log(`[API] Demo mode: GET ${endpoint}`);
            return { demo: true, data: getDemoData(endpoint) };
        }
        
        // Build URL with query parameters
        const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });
        
        console.log(`[API] GET ${url.toString()}`);
        
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: getHeaders(),
            timeout: API_CONFIG.TIMEOUT
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`[API] GET ${endpoint} - Success`);
        return { demo: false, data };
        
    } catch (error) {
        console.warn(`[API] GET ${endpoint} failed, using demo data:`, error.message);
        return { demo: true, data: getDemoData(endpoint) };
    }
}

/**
 * Generic POST request with fallback
 */
async function post(endpoint, body = {}) {
    try {
        // Check if demo mode is forced
        if (API_CONFIG.DEMO_MODE) {
            console.log(`[API] Demo mode: POST ${endpoint}`);
            return { demo: true, data: getDemoData(endpoint, body) };
        }
        
        // Determine which base URL to use (ML API for predictions)
        const baseUrl = endpoint.includes('/predict') ? API_CONFIG.ML_BASE_URL : API_CONFIG.BASE_URL;
        const url = `${baseUrl}${endpoint}`;
        console.log(`[API] POST ${url}`);
        
        const headers = getHeaders();
        
        // Handle file uploads differently
        const isFileUpload = body instanceof FormData;
        if (!isFileUpload) {
            headers['Content-Type'] = 'application/json';
        }
        
        const response = await fetch(url, {
            method: 'POST',
            headers: isFileUpload ? getHeaders() : headers,
            body: isFileUpload ? body : JSON.stringify(body),
            timeout: API_CONFIG.TIMEOUT
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`[API] POST ${endpoint} - Success`);
        return { demo: false, data };
        
    } catch (error) {
        console.warn(`[API] POST ${endpoint} failed, using demo data:`, error.message);
        return { demo: true, data: getDemoData(endpoint, body) };
    }
}

/**
 * Get demo data based on endpoint
 */
function getDemoData(endpoint, body = {}) {
    // Remove leading slash and split path
    const path = endpoint.replace(/^\//, '').split('/');
    
    switch (path[0]) {
        case 'auth':
            if (path[1] === 'login') {
                return DEMO_DATA.auth.login;
            } else if (path[1] === 'signup') {
                return DEMO_DATA.auth.signup;
            }
            break;
            
        case 'summary':
            return DEMO_DATA.summary;
            
        case 'predict':
            return DEMO_DATA.predictions;
            
        case 'upload':
            return { success: true, message: 'File uploaded to demo storage', fileId: 'demo_' + Date.now() };
            
        default:
            return { message: 'Demo data not available for this endpoint' };
    }
    
    return {};
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return !!localStorage.getItem('cs_token');
}

/**
 * Get current user data
 */
function getCurrentUser() {
    const userStr = localStorage.getItem('cs_user');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Set demo mode
 */
function setDemoMode(enabled) {
    API_CONFIG.DEMO_MODE = enabled;
    console.log(`[API] Demo mode ${enabled ? 'enabled' : 'disabled'}`);
}

// Export API functions globally
window.CS_API = {
    get,
    post,
    getHeaders,
    isAuthenticated,
    getCurrentUser,
    setDemoMode,
    config: API_CONFIG
};

console.log('[API] ClimateSphere API module loaded');