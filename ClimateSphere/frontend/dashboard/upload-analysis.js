/**
 * ClimateSphere Upload & Analysis System
 * Handles file upload, model selection, and AI-powered climate analysis
 */

console.log('🚀 Loading ClimateSphere Upload & Analysis System...');

// Analysis state
let uploadedFiles = [];
let selectedModels = ['flood', 'drought', 'heatwave', 'trends'];
let analysisOptions = ['visualization', 'report', 'predictions', 'alerts'];
let analysisCharts = {};

/**
 * Initialize upload and analysis system
 */
function initializeUploadAnalysis() {
    console.log('📊 Initializing Upload & Analysis System');
    
    // File upload handlers
    setupFileUpload();
    
    // Model selection handlers
    setupModelSelection();
    
    // Analysis handlers
    setupAnalysisHandlers();
    
    // Tab navigation
    setupTabNavigation();
    
    console.log('✅ Upload & Analysis System initialized');
}

/**
 * Setup file upload functionality
 */
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    
    if (!uploadArea || !fileInput || !browseBtn) return;
    
    // Browse button click
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Upload area click
    uploadArea.addEventListener('click', (e) => {
        if (e.target === uploadArea || e.target.closest('.upload-icon') || e.target.closest('h3')) {
            fileInput.click();
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFileSelection(e.target.files);
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        if (!uploadArea.contains(e.relatedTarget)) {
            uploadArea.classList.remove('dragover');
        }
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFileSelection(e.dataTransfer.files);
    });
}

/**
 * Handle file selection and upload
 */
async function handleFileSelection(files) {
    console.log('📁 Files selected:', files.length);
    
    if (files.length === 0) return;
    
    const progressContainer = document.getElementById('uploadProgress');
    progressContainer.innerHTML = '';
    
    uploadedFiles = [];
    
    for (let i = 0; i < files.length; i++) {
        await uploadFile(files[i], i);
    }
    
    // Show model selection after successful upload
    if (uploadedFiles.length > 0) {
        showModelSelection();
    }
}

/**
 * Upload a single file
 */
async function uploadFile(file, index) {
    console.log('📤 Uploading file:', file.name);
    
    // Validate file type
    const validTypes = ['.csv', '.json', '.xlsx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
        showNotification(`Invalid file type: ${file.name}. Please upload CSV, JSON, or Excel files.`, 'error');
        return;
    }
    
    // Create progress item
    const progressItem = document.createElement('div');
    progressItem.className = 'progress-item';
    progressItem.innerHTML = `
        <div class="progress-header">
            <span><i class="fas fa-file"></i> ${file.name}</span>
            <span class="progress-status">Uploading...</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: 0%"></div>
        </div>
        <div class="file-info">
            <span>Size: ${formatFileSize(file.size)}</span>
            <span>Type: ${file.type || 'Unknown'}</span>
        </div>
    `;
    
    document.getElementById('uploadProgress').appendChild(progressItem);
    
    const progressFill = progressItem.querySelector('.progress-fill');
    const progressStatus = progressItem.querySelector('.progress-status');
    
    try {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            progressFill.style.width = `${i}%`;
        }
        
        // Process file data
        const fileData = await processFileData(file);
        
        progressStatus.textContent = 'Processing...';
        progressStatus.style.color = var(--warning-color);
        
        // Validate data structure
        const validation = validateClimateData(fileData);
        
        if (validation.valid) {
            progressStatus.textContent = 'Ready for Analysis';
            progressStatus.style.color = 'var(--success-color)';
            
            uploadedFiles.push({
                name: file.name,
                size: file.size,
                data: fileData,
                validation: validation
            });
            
            showNotification(`File "${file.name}" uploaded successfully`, 'success');
        } else {
            progressStatus.textContent = 'Invalid Data Structure';
            progressStatus.style.color = 'var(--danger-color)';
            progressFill.style.backgroundColor = 'var(--danger-color)';
            
            showNotification(`File "${file.name}" has invalid data structure: ${validation.errors.join(', ')}`, 'error');
        }
        
    } catch (error) {
        console.error('Upload failed:', error);
        progressStatus.textContent = 'Upload Failed';
        progressStatus.style.color = 'var(--danger-color)';
        progressFill.style.backgroundColor = 'var(--danger-color)';
        
        showNotification(`Failed to upload "${file.name}": ${error.message}`, 'error');
    }
}

/**
 * Process file data based on type
 */
async function processFileData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const content = e.target.result;
                let data;
                
                if (file.name.endsWith('.json')) {
                    data = JSON.parse(content);
                } else if (file.name.endsWith('.csv')) {
                    data = parseCSV(content);
                } else if (file.name.endsWith('.xlsx')) {
                    // For demo purposes, treat as CSV
                    data = parseCSV(content);
                }
                
                resolve(data);
            } catch (error) {
                reject(new Error('Failed to parse file content'));
            }
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

/**
 * Simple CSV parser
 */
function parseCSV(content) {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV must have header and data rows');
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row = {};
        
        headers.forEach((header, index) => {
            row[header] = values[index] ? values[index].trim() : '';
        });
        
        data.push(row);
    }
    
    return data;
}

/**
 * Validate climate data structure
 */
function validateClimateData(data) {
    const errors = [];
    
    if (!Array.isArray(data) || data.length === 0) {
        errors.push('Data must be a non-empty array');
        return { valid: false, errors };
    }
    
    const requiredFields = ['temperature', 'humidity', 'rainfall'];
    const optionalFields = ['date', 'time', 'location', 'latitude', 'longitude'];
    
    const firstRow = data[0];
    const availableFields = Object.keys(firstRow).map(k => k.toLowerCase());
    
    // Check required fields
    requiredFields.forEach(field => {
        const hasField = availableFields.some(af => af.includes(field) || field.includes(af));
        if (!hasField) {
            errors.push(`Missing required field: ${field}`);
        }
    });
    
    // Check data types
    const sampleSize = Math.min(10, data.length);
    for (let i = 0; i < sampleSize; i++) {
        const row = data[i];
        
        // Check if temperature values are numeric
        const tempField = Object.keys(row).find(k => k.toLowerCase().includes('temp'));
        if (tempField && isNaN(parseFloat(row[tempField]))) {
            errors.push(`Non-numeric temperature value at row ${i + 1}`);
            break;
        }
    }
    
    return {
        valid: errors.length === 0,
        errors,
        fields: availableFields,
        recordCount: data.length
    };
}

/**
 * Show model selection section
 */
function showModelSelection() {
    const modelSelection = document.getElementById('modelSelection');
    if (modelSelection) {
        modelSelection.style.display = 'block';
        modelSelection.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Setup model selection handlers
 */
function setupModelSelection() {
    // Model checkbox handlers
    document.querySelectorAll('input[name="models"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                if (!selectedModels.includes(e.target.value)) {
                    selectedModels.push(e.target.value);
                }
            } else {
                selectedModels = selectedModels.filter(m => m !== e.target.value);
            }
            console.log('Selected models:', selectedModels);
        });
    });
    
    // Options checkbox handlers
    document.querySelectorAll('input[name="options"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                if (!analysisOptions.includes(e.target.value)) {
                    analysisOptions.push(e.target.value);
                }
            } else {
                analysisOptions = analysisOptions.filter(o => o !== e.target.value);
            }
            console.log('Selected options:', analysisOptions);
        });
    });
}

/**
 * Setup analysis handlers
 */
function setupAnalysisHandlers() {
    const startAnalysisBtn = document.getElementById('startAnalysisBtn');
    if (startAnalysisBtn) {
        startAnalysisBtn.addEventListener('click', startAnalysis);
    }
    
    const newAnalysisBtn = document.getElementById('newAnalysisBtn');
    if (newAnalysisBtn) {
        newAnalysisBtn.addEventListener('click', resetAnalysis);
    }
    
    const downloadReportBtn = document.getElementById('downloadReportBtn');
    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', downloadReport);
    }
}

/**
 * Start the analysis process
 */
async function startAnalysis() {
    console.log('🔬 Starting climate analysis...');
    
    if (uploadedFiles.length === 0) {
        showNotification('Please upload files before starting analysis', 'error');
        return;
    }
    
    if (selectedModels.length === 0) {
        showNotification('Please select at least one model for analysis', 'error');
        return;
    }
    
    // Show analysis results section
    const analysisResults = document.getElementById('analysisResults');
    if (analysisResults) {
        analysisResults.style.display = 'block';
        analysisResults.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Run analysis simulation
    await runAnalysisSimulation();
}

/**
 * Run analysis simulation
 */
async function runAnalysisSimulation() {
    const progressFill = document.getElementById('analysisProgressFill');
    const progressPercentage = document.querySelector('.progress-percentage');
    const steps = document.querySelectorAll('.step');
    
    // Step 1: Data Processing
    steps[0].classList.add('active');
    await animateProgress(progressFill, progressPercentage, 0, 25, 2000);
    steps[0].classList.remove('active');
    steps[0].classList.add('completed');
    
    // Step 2: Model Analysis
    steps[1].classList.add('active');
    await animateProgress(progressFill, progressPercentage, 25, 70, 3000);
    steps[1].classList.remove('active');
    steps[1].classList.add('completed');
    
    // Step 3: Generating Results
    steps[2].classList.add('active');
    await animateProgress(progressFill, progressPercentage, 70, 95, 2000);
    steps[2].classList.remove('active');
    steps[2].classList.add('completed');
    
    // Step 4: Complete
    steps[3].classList.add('active');
    await animateProgress(progressFill, progressPercentage, 95, 100, 500);
    steps[3].classList.remove('active');
    steps[3].classList.add('completed');
    
    // Show results
    setTimeout(() => {
        showAnalysisResults();
    }, 1000);
}

/**
 * Animate progress bar
 */
function animateProgress(progressFill, progressPercentage, start, end, duration) {
    return new Promise(resolve => {
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = start + (end - start) * progress;
            
            progressFill.style.width = `${currentValue}%`;
            progressPercentage.textContent = `${Math.round(currentValue)}%`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                resolve();
            }
        };
        animate();
    });
}

/**
 * Show analysis results
 */
function showAnalysisResults() {
    // Hide progress, show summary
    document.getElementById('analysisProgress').style.display = 'none';
    document.getElementById('resultsSummary').style.display = 'block';
    document.getElementById('modelResults').style.display = 'block';
    document.getElementById('resultsActions').style.display = 'flex';
    
    // Generate mock results
    generateMockResults();
    
    // Create result charts
    createResultCharts();
    
    showNotification('Analysis completed successfully!', 'success');
}

/**
 * Generate mock analysis results
 */
function generateMockResults() {
    const totalRecords = uploadedFiles.reduce((sum, file) => sum + file.data.length, 0);
    
    // Update summary cards
    document.getElementById('highRiskCount').textContent = Math.floor(Math.random() * 15) + 5;
    document.getElementById('mediumRiskCount').textContent = Math.floor(Math.random() * 25) + 10;
    document.getElementById('confidenceScore').textContent = (85 + Math.random() * 10).toFixed(1) + '%';
    document.getElementById('dataPointsCount').textContent = totalRecords.toLocaleString();
    
    // Update insights
    const insights = {
        flood: `Analysis of ${totalRecords} data points reveals ${Math.floor(Math.random() * 5) + 2} high-risk flood zones. Peak risk periods identified during monsoon months with 94.2% confidence.`,
        drought: `Drought analysis indicates ${Math.floor(Math.random() * 3) + 1} severe drought periods over the analyzed timeframe. Water stress levels exceed critical thresholds in ${Math.floor(Math.random() * 20) + 10}% of regions.`,
        heatwave: `Heatwave detection model identified ${Math.floor(Math.random() * 8) + 3} extreme heat events. Temperature anomalies show increasing frequency with 96.5% prediction accuracy.`,
        trends: `Climate trend analysis reveals significant warming patterns with ${(Math.random() * 2 + 1).toFixed(1)}°C increase over the analyzed period. Precipitation patterns show ${Math.random() > 0.5 ? 'decreasing' : 'increasing'} trends.`
    };
    
    Object.keys(insights).forEach(model => {
        const insightElement = document.getElementById(`${model}Insight`);
        if (insightElement) {
            insightElement.textContent = insights[model];
        }
    });
}

/**
 * Create result charts
 */
function createResultCharts() {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not available for result charts');
        return;
    }
    
    // Generate sample data for charts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Flood Risk Chart
    createResultChart('floodRiskChart', {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Flood Risk Level',
                data: months.map(() => Math.random() * 100),
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { 
                    beginAtZero: true,
                    max: 100,
                    ticks: { callback: value => value + '%' }
                }
            }
        }
    });
    
    // Drought Analysis Chart
    createResultChart('droughtAnalysisChart', {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Drought Severity',
                data: months.map(() => Math.random() * 10),
                borderColor: 'rgb(245, 158, 11)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { 
                    beginAtZero: true,
                    max: 10,
                    ticks: { callback: value => 'Level ' + value }
                }
            }
        }
    });
    
    // Heatwave Chart
    createResultChart('heatwaveChart', {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Heat Index',
                data: months.map(() => 25 + Math.random() * 20),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { 
                    beginAtZero: false,
                    ticks: { callback: value => value + '°C' }
                }
            }
        }
    });
    
    // Trends Chart
    createResultChart('trendsChart', {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Temperature Trend',
                    data: months.map((_, i) => 15 + i * 0.5 + Math.random() * 3),
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'Rainfall Trend',
                    data: months.map(() => Math.random() * 100),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true } },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: { callback: value => value + '°C' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: { callback: value => value + 'mm' },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

/**
 * Create individual result chart
 */
function createResultChart(canvasId, config) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (analysisCharts[canvasId]) {
        analysisCharts[canvasId].destroy();
    }
    
    analysisCharts[canvasId] = new Chart(ctx, config);
}

/**
 * Setup tab navigation
 */
function setupTabNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = e.currentTarget.dataset.tab;
            
            // Update active tab button
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            // Update active tab pane
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            document.getElementById(`${tabId}-results`).classList.add('active');
        });
    });
}

/**
 * Reset analysis for new upload
 */
function resetAnalysis() {
    // Reset state
    uploadedFiles = [];
    selectedModels = ['flood', 'drought', 'heatwave', 'trends'];
    analysisOptions = ['visualization', 'report', 'predictions', 'alerts'];
    
    // Reset UI
    document.getElementById('uploadProgress').innerHTML = '';
    document.getElementById('modelSelection').style.display = 'none';
    document.getElementById('analysisResults').style.display = 'none';
    
    // Reset checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = ['flood', 'drought', 'heatwave', 'trends', 'visualization', 'report', 'predictions', 'alerts'].includes(cb.value);
    });
    
    // Reset file input
    document.getElementById('fileInput').value = '';
    
    showNotification('Ready for new analysis', 'info');
}

/**
 * Download analysis report
 */
function downloadReport() {
    // Generate mock report data
    const reportData = {
        timestamp: new Date().toISOString(),
        files: uploadedFiles.map(f => ({ name: f.name, records: f.data.length })),
        models: selectedModels,
        results: {
            highRisk: document.getElementById('highRiskCount').textContent,
            mediumRisk: document.getElementById('mediumRiskCount').textContent,
            confidence: document.getElementById('confidenceScore').textContent,
            dataPoints: document.getElementById('dataPointsCount').textContent
        }
    };
    
    // Create and download JSON report
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `climate-analysis-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Report downloaded successfully', 'success');
}

/**
 * Utility functions
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showNotification(message, type = 'info') {
    // Simple notification system
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // You can enhance this with a proper notification UI
    if (typeof CS_Utils !== 'undefined' && CS_Utils.showNotification) {
        CS_Utils.showNotification(message, type);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUploadAnalysis);
} else {
    initializeUploadAnalysis();
}

// Expose functions globally for debugging
window.UploadAnalysis = {
    initializeUploadAnalysis,
    handleFileSelection,
    startAnalysis,
    resetAnalysis,
    downloadReport
};

console.log('✅ ClimateSphere Upload & Analysis System loaded');