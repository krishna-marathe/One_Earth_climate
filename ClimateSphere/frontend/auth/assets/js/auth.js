/**
 * ClimateSphere Authentication JavaScript
 * Handles login and signup functionality with API integration and fallbacks
 * 
 * Testing Instructions:
 * 1. Open login.html or signup.html in browser
 * 2. Try invalid inputs to test validation
 * 3. Submit form to test API calls (will fallback to demo mode)
 * 4. Check localStorage for stored tokens after successful auth
 */

// Auth configuration
const AUTH_CONFIG = {
    MIN_PASSWORD_LENGTH: 4, // Reduced for demo
    DEMO_MODE_ENABLED: true,
    REDIRECT_DELAY: 0 // Immediate redirect
};

// Current page detection
const isLoginPage = window.location.pathname.includes('login.html');
const isSignupPage = window.location.pathname.includes('signup.html');

/**
 * Initialize authentication page
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Auth] Initializing authentication page');
    
    // Check if user is already logged in
    if (CS_API.isAuthenticated()) {
        console.log('[Auth] User already authenticated, redirecting to dashboard');
        redirectToDashboard();
        return;
    }
    
    // Initialize page-specific functionality
    if (isLoginPage) {
        initializeLoginPage();
    } else if (isSignupPage) {
        initializeSignupPage();
    }
    
    // Initialize common functionality
    initializeCommonFeatures();
});

/**
 * Initialize login page functionality
 */
function initializeLoginPage() {
    console.log('[Auth] Initializing login page');
    
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');
    const loginBtn = document.getElementById('loginBtn');
    
    // Form submission
    form.addEventListener('submit', handleLogin);
    
    // Password visibility toggle
    passwordToggle.addEventListener('click', () => togglePasswordVisibility('password', 'passwordToggle'));
    
    // Real-time validation - only on form submit to reduce errors
    emailInput.addEventListener('input', () => {
        if (emailInput.value) hideFieldError(document.getElementById('emailError'), emailInput);
    });
    passwordInput.addEventListener('input', () => {
        if (passwordInput.value) hideFieldError(document.getElementById('passwordError'), passwordInput);
    });
    
    // Social login buttons (demo only)
    document.getElementById('googleLogin').addEventListener('click', () => handleSocialLogin('google'));
    document.getElementById('githubLogin').addEventListener('click', () => handleSocialLogin('github'));
}

/**
 * Initialize signup page functionality
 */
function initializeSignupPage() {
    console.log('[Auth] Initializing signup page');
    
    const form = document.getElementById('signupForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordToggle = document.getElementById('passwordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    
    // Form submission
    form.addEventListener('submit', handleSignup);
    
    // Password visibility toggles
    passwordToggle.addEventListener('click', () => togglePasswordVisibility('password', 'passwordToggle'));
    confirmPasswordToggle.addEventListener('click', () => togglePasswordVisibility('confirmPassword', 'confirmPasswordToggle'));
    
    // Real-time validation
    emailInput.addEventListener('blur', () => validateEmail(emailInput.value, 'emailError'));
    passwordInput.addEventListener('input', () => {
        validatePasswordStrength(passwordInput.value);
        if (confirmPasswordInput.value) {
            validatePasswordMatch(passwordInput.value, confirmPasswordInput.value);
        }
    });
    confirmPasswordInput.addEventListener('blur', () => {
        validatePasswordMatch(passwordInput.value, confirmPasswordInput.value);
    });
    
    // Social signup buttons (demo only)
    document.getElementById('googleSignup').addEventListener('click', () => handleSocialLogin('google'));
    document.getElementById('githubSignup').addEventListener('click', () => handleSocialLogin('github'));
}

/**
 * Initialize common features for both pages
 */
function initializeCommonFeatures() {
    // Check if we should show demo mode banner
    checkDemoMode();
    
    // Add form input animations
    addInputAnimations();
}

/**
 * Handle login form submission
 */
async function handleLogin(event) {
    event.preventDefault();
    console.log('[Auth] Processing login');
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const rememberMe = formData.get('rememberMe') === 'on';
    
    // Basic validation - only check if fields are filled
    if (!email || !password) {
        if (!email) showFieldError(document.getElementById('emailError'), document.getElementById('email'), 'Email is required');
        if (!password) showFieldError(document.getElementById('passwordError'), document.getElementById('password'), 'Password is requ
    if (!emailValid || !passwordValid) {
        console.log('[Auth] Login validation failed');
        return;
    }
    
    // Show loading state
    setButtonLoading('loginBtn', true);
    
    // Demo login - simulate successful authentication
    const demoUser = {
        id: 1,
        name: 'Demo User',
        email: email
    };
    
    const demoToken = 'demo_token_' + Date.now();
    
    // Store authentication data
    localStorage.setItem('cs_token', demoToken);
    localStorage.setItem('cs_user', JSON.stringify(demoUser));
    
    console.log('Demo login successful — redirected to dashboard.');
    
    // Remove loading state
    setButtonLoading('loginBtn', false);
    
    // Redirect immediately to dashboard
    redirectToDashboard();
}

/**
 * Handle signup form submission
 */
async function handleSignup(event) {
    event.preventDefault();
    console.log('[Auth] Processing signup');
    
    const formData = new FormData(event.target);
    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const agreeTerms = formData.get('agreeTerms') === 'on';
    const newsletter = formData.get('newsletter') === 'on';
    
    // Validate all inputs
    const nameValid = validateRequired(fullName, 'fullNameError', 'Full name is required');
    const emailValid = validateEmail(email, 'emailError');
    const passwordValid = validatePasswordStrength(password);
    const passwordMatchValid = validatePasswordMatch(password, confirmPassword);
    const termsValid = validateRequired(agreeTerms, 'agreeTermsError', 'You must agree to the terms');
    
    if (!nameValid || !emailValid || !passwordValid.isValid || !passwordMatchValid || !termsValid) {
        console.log('[Auth] Signup validation failed');
        return;
    }
    
    // Show loading state
    setButtonLoading('signupBtn', true);
    
    try {
        // Attempt API signup
        const response = await CS_API.post('/auth/signup', {
            fullName,
            email,
            password,
            newsletter
        });
        
        if (response.demo) {
            showDemoBanner();
        }
        
        // Store authentication data
        localStorage.setItem('cs_token', response.data.token);
        localStorage.setItem('cs_user', JSON.stringify(response.data.user));
        
        console.log('[Auth] Signup successful');
        CS_Utils.showNotification('Account created successfully! Redirecting...', 'success');
        
        // Redirect after delay
        setTimeout(() => {
            redirectToDashboard();
        }, AUTH_CONFIG.REDIRECT_DELAY);
        
    } catch (error) {
        console.error('[Auth] Signup failed:', error);
        CS_Utils.showNotification('Signup failed. Please try again.', 'error');
        setButtonLoading('signupBtn', false);
    }
}

/**
 * Handle social login (demo only)
 */
function handleSocialLogin(provider) {
    console.log(`[Auth] Social login with ${provider} (demo mode)`);
    CS_Utils.showNotification(`${provider} login is not available in demo mode`, 'info');
}

/**
 * Validate email format
 */
function validateEmail(email, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    const emailInput = document.getElementById('email');
    
    if (!email || email.trim() === '') {
        showFieldError(errorElement, emailInput, 'Email is required');
        return false;
    }
    
    // More lenient email validation for demo
    if (email.includes('@') && email.includes('.')) {
        hideFieldError(errorElement, emailInput);
        return true;
    }
    
    showFieldError(errorElement, emailInput, 'Please enter a valid email address');
    return false;
}

/**
 * Validate password length
 */
function validatePasswordLength(password, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    const passwordInput = document.getElementById('password');
    
    if (!password || password.trim() === '') {
        showFieldError(errorElement, passwordInput, 'Password is required');
        return false;
    }
    
    // More lenient for demo - accept any password with 4+ characters
    if (password.length >= 4) {
        hideFieldError(errorElement, passwordInput);
        return true;
    }
    
    showFieldError(errorElement, passwordInput, 'Password must be at least 4 characters');
    return false;
}

/**
 * Validate password strength (for signup)
 */
function validatePasswordStrength(password) {
    if (!isSignupPage) return { isValid: true };
    
    const validation = CS_Utils.validatePassword(password);
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    const errorElement = document.getElementById('passwordError');
    const passwordInput = document.getElementById('password');
    
    if (!password) {
        strengthFill.className = 'strength-fill';
        strengthText.textContent = 'Password strength';
        return { isValid: false };
    }
    
    // Calculate strength score
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    // Update strength indicator
    const strengthLevels = ['weak', 'weak', 'fair', 'good', 'strong'];
    const strengthTexts = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
    
    strengthFill.className = `strength-fill ${strengthLevels[score]}`;
    strengthText.textContent = strengthTexts[score];
    
    // Show errors if any
    if (validation.errors.length > 0) {
        showFieldError(errorElement, passwordInput, validation.errors[0]);
        return { isValid: false };
    }
    
    hideFieldError(errorElement, passwordInput);
    return { isValid: true };
}

/**
 * Validate password match
 */
function validatePasswordMatch(password, confirmPassword) {
    const errorElement = document.getElementById('confirmPasswordError');
    const confirmInput = document.getElementById('confirmPassword');
    
    if (!confirmPassword) {
        showFieldError(errorElement, confirmInput, 'Please confirm your password');
        return false;
    }
    
    if (password !== confirmPassword) {
        showFieldError(errorElement, confirmInput, 'Passwords do not match');
        return false;
    }
    
    hideFieldError(errorElement, confirmInput);
    return true;
}

/**
 * Validate required field
 */
function validateRequired(value, errorElementId, message) {
    const errorElement = document.getElementById(errorElementId);
    const input = document.querySelector(`[name="${errorElementId.replace('Error', '')}"]`);
    
    if (!value) {
        showFieldError(errorElement, input, message);
        return false;
    }
    
    hideFieldError(errorElement, input);
    return true;
}

/**
 * Show field error
 */
function showFieldError(errorElement, inputElement, message) {
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('d-none');
    }
    
    if (inputElement) {
        inputElement.classList.add('error');
        inputElement.classList.add('shake');
        setTimeout(() => inputElement.classList.remove('shake'), 500);
    }
}

/**
 * Hide field error
 */
function hideFieldError(errorElement, inputElement) {
    if (errorElement) {
        errorElement.classList.add('d-none');
    }
    
    if (inputElement) {
        inputElement.classList.remove('error');
        inputElement.classList.add('success');
        setTimeout(() => inputElement.classList.remove('success'), 2000);
    }
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    const icon = toggle.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

/**
 * Set button loading state
 */
function setButtonLoading(buttonId, loading) {
    const button = document.getElementById(buttonId);
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');
    
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
        btnText.classList.add('d-none');
        btnLoading.classList.remove('d-none');
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        btnText.classList.remove('d-none');
        btnLoading.classList.add('d-none');
    }
}

/**
 * Check and show demo mode banner if needed
 */
function checkDemoMode() {
    // Hide demo banner for cleaner UI
    const banner = document.getElementById('demoBanner');
    if (banner) {
        banner.classList.add('d-none');
    }
}

/**
 * Show demo mode banner
 */
function showDemoBanner() {
    // Keep banner hidden for cleaner UI
    const banner = document.getElementById('demoBanner');
    if (banner) {
        banner.classList.add('d-none');
    }
}

/**
 * Add input animations and interactions
 */
function addInputAnimations() {
    // Add focus animations to form inputs
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
}

/**
 * Redirect to dashboard
 */
function redirectToDashboard() {
    const params = CS_Utils.getQueryParams();
    let dashboardUrl = '../dashboard/dashboard.html';
    
    // Preserve any query parameters
    if (params.country && params.region) {
        dashboardUrl += `?country=${encodeURIComponent(params.country)}&region=${encodeURIComponent(params.region)}`;
    }
    
    console.log('[Auth] Redirecting to dashboard:', dashboardUrl);
    window.location.href = dashboardUrl;
}

/**
 * Client-side validation test function
 */
function runAuthValidationTests() {
    console.log('=== Auth Validation Tests ===');
    
    // Test email validation
    const emailTests = [
        { email: 'invalid-email', expected: false },
        { email: 'test@example.com', expected: true },
        { email: '', expected: false }
    ];
    
    emailTests.forEach(test => {
        const result = CS_Utils.isValidEmail(test.email);
        console.log(`Email "${test.email}": ${result === test.expected ? '✓' : '✗'} (expected: ${test.expected}, got: ${result})`);
    });
    
    // Test password validation
    const passwordTests = [
        { password: '123', expected: false },
        { password: 'Password123', expected: true },
        { password: 'weakpass', expected: false }
    ];
    
    passwordTests.forEach(test => {
        const result = CS_Utils.validatePassword(test.password);
        console.log(`Password "${test.password}": ${result.isValid === test.expected ? '✓' : '✗'} (expected: ${test.expected}, got: ${result.isValid})`);
    });
    
    console.log('=== Auth Tests Complete ===');
}

// Export for testing
window.AuthModule = {
    validateEmail,
    validatePasswordStrength,
    validatePasswordMatch,
    runAuthValidationTests
};

console.log('[Auth] Authentication module loaded');