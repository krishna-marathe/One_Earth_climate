/**
 * ClimateSphere Utility Functions
 * Common utilities used across the application
 */

/**
 * Logout user and redirect to landing page
 */
function logout() {
    // Clear all stored user data
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_user');
    
    console.log('[Utils] User logged out');
    
    // Redirect to landing page
    window.location.href = '/landing/index.html';
}

/**
 * Check if user is authenticated and redirect if not
 * @param {boolean} allowDemo - Allow access in demo mode
 */
function requireAuth(allowDemo = false) {
    const token = localStorage.getItem('cs_token');
    const isDemoMode = new URLSearchParams(window.location.search).has('demo');
    
    if (!token && !(allowDemo && isDemoMode)) {
        console.log('[Utils] Authentication required, redirecting to login');
        window.location.href = '/auth/login.html';
        return false;
    }
    
    return true;
}

/**
 * Get query parameters as object
 */
function getQueryParams() {
    const params = {};
    const urlParams = new URLSearchParams(window.location.search);
    
    for (const [key, value] of urlParams) {
        params[key] = value;
    }
    
    return params;
}

/**
 * Set query parameters without page reload
 */
function setQueryParams(params) {
    const url = new URL(window.location);
    
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
            url.searchParams.set(key, params[key]);
        } else {
            url.searchParams.delete(key);
        }
    });
    
    window.history.replaceState({}, '', url);
}

/**
 * Format temperature with proper units
 */
function formatTemperature(temp) {
    if (temp === null || temp === undefined || temp === '--') {
        return '--°C';
    }
    return `${parseFloat(temp).toFixed(1)}°C`;
}

/**
 * Format AQI with color coding
 */
function formatAQI(aqi) {
    if (aqi === null || aqi === undefined || aqi === '--') {
        return '--';
    }
    return parseInt(aqi);
}

/**
 * Get AQI color based on value
 */
function getAQIColor(aqi) {
    if (aqi <= 50) return '#22c55e'; // Good - Green
    if (aqi <= 100) return '#eab308'; // Moderate - Yellow
    if (aqi <= 150) return '#f97316'; // Unhealthy for sensitive - Orange
    if (aqi <= 200) return '#ef4444'; // Unhealthy - Red
    if (aqi <= 300) return '#a855f7'; // Very unhealthy - Purple
    return '#7c2d12'; // Hazardous - Maroon
}

/**
 * Format rainfall with units
 */
function formatRainfall(rainfall) {
    if (rainfall === null || rainfall === undefined || rainfall === '--') {
        return '-- mm';
    }
    return `${parseFloat(rainfall).toFixed(1)} mm`;
}

/**
 * Format CO2 with units
 */
function formatCO2(co2) {
    if (co2 === null || co2 === undefined || co2 === '--') {
        return '-- ppm';
    }
    return `${parseFloat(co2).toFixed(1)} ppm`;
}

/**
 * Calculate risk level based on multiple factors
 */
function calculateRiskLevel(data) {
    let riskScore = 0;
    
    // Temperature risk
    if (data.temp > 35) riskScore += 3;
    else if (data.temp > 30) riskScore += 2;
    else if (data.temp < 0) riskScore += 2;
    
    // AQI risk
    if (data.aqi > 150) riskScore += 3;
    else if (data.aqi > 100) riskScore += 2;
    else if (data.aqi > 50) riskScore += 1;
    
    // Alert count risk
    if (data.alerts && Array.isArray(data.alerts)) {
        riskScore += data.alerts.length;
    }
    
    if (riskScore >= 6) return 'severe';
    if (riskScore >= 4) return 'high';
    if (riskScore >= 2) return 'moderate';
    return 'safe';
}

/**
 * Get risk color based on level
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
 * Show notification message
 */
function showNotification(message, type = 'info', duration = 5000) {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#2563eb'};
        color: white;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after duration
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function validatePassword(password) {
    const errors = [];
    
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Debounce function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Download data as file
 */
function downloadAsFile(data, filename, type = 'application/json') {
    const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], { type });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Format date for display
 */
function formatDate(date) {
    if (!date) return '--';
    
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Add CSS animation styles if not already present
 */
function addAnimationStyles() {
    if (document.getElementById('utils-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'utils-animations';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .notification {
            animation: slideIn 0.3s ease-out;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: inherit;
            font-size: 1.25rem;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s;
        }
        
        .notification-close:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize animation styles
document.addEventListener('DOMContentLoaded', addAnimationStyles);

// Export utilities globally
window.CS_Utils = {
    logout,
    requireAuth,
    getQueryParams,
    setQueryParams,
    formatTemperature,
    formatAQI,
    getAQIColor,
    formatRainfall,
    formatCO2,
    calculateRiskLevel,
    getRiskColor,
    showNotification,
    isValidEmail,
    validatePassword,
    debounce,
    downloadAsFile,
    formatDate
};

console.log('[Utils] ClimateSphere utilities loaded');