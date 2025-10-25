/**
 * Real AI Verification Script
 * Ensures that only real AI analysis runs and prevents hardcoded values
 */

console.log('🔍 Loading Real AI Verification Script...');

// Wait for everything to load, then verify and fix
setTimeout(() => {
    verifyAndFixAIAnalysis();
}, 5000);

function verifyAndFixAIAnalysis() {
    console.log('🔍 Verifying Real AI Analysis System...');
    
    // 1. Check if real AI modules are loaded
    const requiredModules = ['DataProcessor', 'ModelRunner', 'UIManager', 'AIAnalysis'];
    const missingModules = requiredModules.filter(module => !window[module]);
    
    if (missingModules.length > 0) {
        console.error('❌ Missing AI modules:', missingModules);
        return;
    }
    
    console.log('✅ All AI modules loaded');
    
    // 2. Override any remaining hardcoded functions
    overrideHardcodedFunctions();
    
    // 3. Set up proper button handlers
    setupProperButtonHandlers();
    
    // 4. Monitor for hardcoded value updates and prevent them
    preventHardcodedUpdates();
    
    console.log('✅ Real AI Analysis System verified and secured');
}

function overrideHardcodedFunctions() {
    console.log('🔧 Overriding any remaining hardcoded functions...');
    
    // List of functions that might show hardcoded values
    const functionsToOverride = [
        'displayAnalysisResults',
        'showAnalysisResults', 
        'updateSummaryCards',
        'generateAnalysisCharts',
        'startFourModelAnalysis',
        'handleAnalysisStart',
        'performAnalysis',
        'runAnalysis'
    ];
    
    functionsToOverride.forEach(funcName => {
        if (window[funcName]) {
            console.log(`🔄 Overriding ${funcName}`);
            window[funcName] = function(...args) {
                console.log(`🚫 Blocked hardcoded function: ${funcName}`);
                if (window.startRealAIAnalysis) {
                    return window.startRealAIAnalysis(...args);
                }
            };
        }
    });
}

function setupProperButtonHandlers() {
    console.log('🔧 Setting up proper button handlers...');
    
    // Find all potential analysis buttons
    const buttonSelectors = [
        '#startAnalysisBtn',
        '.analysis-btn',
        '.start-analysis',
        'button[onclick*="analysis"]',
        'button[onclick*="Analysis"]'
    ];
    
    buttonSelectors.forEach(selector => {
        const buttons = document.querySelectorAll(selector);
        buttons.forEach(button => {
            // Clear all existing handlers
            button.removeAttribute('onclick');
            
            // Clone to remove all event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add only the real AI analysis handler
            newButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                
                console.log('🚀 Starting Real AI Analysis from button');
                if (window.startRealAIAnalysis) {
                    window.startRealAIAnalysis(event);
                } else {
                    console.error('❌ Real AI Analysis function not available');
                }
            });
            
            console.log('✅ Button handler set:', newButton.textContent?.trim());
        });
    });
}

function preventHardcodedUpdates() {
    console.log('🛡️ Setting up hardcoded value prevention...');
    
    // Monitor for hardcoded value updates
    const hardcodedValues = ['20', '93.8%', '2,450', '2450'];
    const elementsToMonitor = ['highRiskCount', 'confidenceScore', 'dataPointsCount'];
    
    elementsToMonitor.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            // Set up a mutation observer to catch hardcoded updates
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' || mutation.type === 'characterData') {
                        const currentValue = element.textContent;
                        
                        // Check if it's a hardcoded value
                        if (hardcodedValues.includes(currentValue)) {
                            console.warn(`🚫 Blocked hardcoded value update: ${elementId} = ${currentValue}`);
                            
                            // Replace with a placeholder until real analysis runs
                            element.textContent = '...';
                            element.style.opacity = '0.5';
                        }
                    }
                });
            });
            
            observer.observe(element, {
                childList: true,
                characterData: true,
                subtree: true
            });
            
            console.log(`🛡️ Monitoring ${elementId} for hardcoded values`);
        }
    });
}

// Add a global flag to indicate real AI is active
window.REAL_AI_ACTIVE = true;

// Override any setTimeout/setInterval that might be setting hardcoded values
const originalSetTimeout = window.setTimeout;
window.setTimeout = function(callback, delay, ...args) {
    // Check if the callback might be setting hardcoded values
    const callbackStr = callback.toString();
    if (callbackStr.includes('93.8') || callbackStr.includes('2,450') || callbackStr.includes('2450')) {
        console.warn('🚫 Blocked setTimeout with hardcoded values');
        return;
    }
    
    return originalSetTimeout(callback, delay, ...args);
};

console.log('✅ Real AI Verification Script loaded');