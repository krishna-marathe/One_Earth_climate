/**
 * AI Analysis Main Coordinator
 * Orchestrates the real AI analysis using trained models
 */

console.log('🤖 Loading AI Analysis Main Coordinator...');

// Global state
window.AIAnalysis = {
    uploadedData: null,
    analysisInProgress: false,
    results: null
};

// Initialize the AI analysis system
setTimeout(() => {
    initializeAIAnalysis();
}, 1000);

function initializeAIAnalysis() {
    console.log('🔧 Initializing AI Analysis System...');
    
    // Override ALL existing analysis functions to prevent hardcoded results
    window.startFourModelAnalysis = startRealAIAnalysis;
    window.handleAnalysisStart = startRealAIAnalysis;
    window.startAnalysis = startRealAIAnalysis;
    window.runAnalysis = startRealAIAnalysis;
    window.performAnalysis = startRealAIAnalysis;
    window.executeAnalysis = startRealAIAnalysis;
    
    // Override result display functions
    window.displayAnalysisResults = displayRealResults;
    window.showAnalysisResults = displayRealResults;
    window.updateResults = displayRealResults;
    
    // Override summary update functions
    window.updateSummaryCards = updateRealSummaryCards;
    
    // Hook into file upload to capture data
    setupDataCapture();
    
    // Set up button event listeners
    setupAnalysisButtons();
    
    console.log('✅ AI Analysis System initialized - All functions overridden');
}

function setupAnalysisButtons() {
    // Find and override all analysis buttons
    const analysisButtons = document.querySelectorAll(
        'button[onclick*="analysis"], button[onclick*="Analysis"], ' +
        '.analysis-btn, .start-analysis, #startAnalysis, #analysisBtn, #startAnalysisBtn'
    );
    
    analysisButtons.forEach(button => {
        // Remove existing onclick handlers
        button.removeAttribute('onclick');
        
        // Remove existing event listeners by cloning the element
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add new event listener to the cloned button
        newButton.addEventListener('click', startRealAIAnalysis);
        
        console.log('✅ Overridden button:', newButton.textContent?.trim());
    });
    
    // Also set up a direct listener for the main analysis button
    setTimeout(() => {
        const mainButton = document.getElementById('startAnalysisBtn');
        if (mainButton) {
            mainButton.removeAttribute('onclick');
            mainButton.addEventListener('click', startRealAIAnalysis);
            console.log('✅ Main analysis button connected to real AI');
        }
    }, 2000);
}

function displayRealResults(results) {
    console.log('📊 Displaying real AI results (override)');
    if (window.UIManager && window.UIManager.displayResults) {
        window.UIManager.displayResults(results, window.AIAnalysis.uploadedData);
    }
}

function updateRealSummaryCards(results) {
    console.log('📊 Updating real summary cards (override)');
    if (window.UIManager && window.UIManager.updateSummaryCards) {
        window.UIManager.updateSummaryCards(results);
    }
}

function setupDataCapture() {
    // Override file upload handler to capture data
    const originalHandleFileUpload = window.handleFileUpload;
    if (originalHandleFileUpload) {
        window.handleFileUpload = function(files) {
            originalHandleFileUpload(files);
            captureUploadedData(files);
        };
    }
}

async function captureUploadedData(files) {
    if (!files || files.length === 0) return;
    
    try {
        console.log('📊 Capturing uploaded data...');
        const file = files[0];
        const content = await window.DataProcessor.readFile(file);
        const data = window.DataProcessor.parseData(content, file.name);
        
        window.AIAnalysis.uploadedData = data;
        console.log('✅ Data captured:', data.length, 'records');
        
    } catch (error) {
        console.error('❌ Error capturing data:', error);
        window.AIAnalysis.uploadedData = null;
    }
}

async function startRealAIAnalysis(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    if (window.AIAnalysis.analysisInProgress) {
        console.log('⏳ Analysis already in progress...');
        return;
    }
    
    window.AIAnalysis.analysisInProgress = true;
    console.log('🚀 Starting Real AI Analysis...');
    
    try {
        // Show progress UI
        window.UIManager.showProgress();
        
        // Get data to analyze
        const dataToAnalyze = window.AIAnalysis.uploadedData || 
                             window.DataProcessor.generateSampleData();
        
        console.log('📊 Analyzing', dataToAnalyze.length, 'data records');
        
        // Run AI models
        const results = await window.ModelRunner.runAllModels(dataToAnalyze);
        
        // Store and display results
        window.AIAnalysis.results = results;
        window.UIManager.displayResults(results, dataToAnalyze);
        
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        window.UIManager.showError(error.message);
    } finally {
        window.AIAnalysis.analysisInProgress = false;
    }
}

// Expose main function globally
window.startRealAIAnalysis = startRealAIAnalysis;

console.log('✅ AI Analysis Main Coordinator loaded');