// Upload functionality
class UploadManager {
    constructor() {
        this.currentFile = null;
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUploadHistory();
    }

    setupEventListeners() {
        // File input change
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Drag and drop
        if (this.uploadZone) {
            this.uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
            this.uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            this.uploadZone.addEventListener('drop', (e) => this.handleDrop(e));
            this.uploadZone.addEventListener('click', () => this.fileInput?.click());
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadZone.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadZone.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        // Validate file
        if (!this.validateFile(file)) {
            return;
        }

        this.currentFile = file;
        this.showFileInfo(file);
        this.uploadFile(file);
    }

    validateFile(file) {
        const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        const maxSize = 50 * 1024 * 1024; // 50MB

        if (!allowedTypes.includes(file.type)) {
            this.showError('Invalid file type. Please upload CSV or Excel files only.');
            return false;
        }

        if (file.size > maxSize) {
            this.showError('File size too large. Maximum size is 50MB.');
            return false;
        }

        return true;
    }

    showFileInfo(file) {
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');

        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = this.formatFileSize(file.size);
        if (fileInfo) fileInfo.style.display = 'block';
    }

    async uploadFile(file) {
        const formData = new FormData();
        formData.append('dataset', file);

        const progressBar = document.querySelector('.progress-bar');
        const uploadProgress = document.getElementById('uploadProgress');
        
        try {
            // Show progress
            if (uploadProgress) uploadProgress.style.display = 'block';
            
            // Simulate progress for demo
            this.simulateProgress(progressBar);

            const response = await window.climateSphere.apiCall('/upload/dataset', 'POST', formData);
            
            // Update progress to 100%
            if (progressBar) progressBar.style.width = '100%';
            
            setTimeout(() => {
                this.showUploadSuccess(response);
                if (uploadProgress) uploadProgress.style.display = 'none';
            }, 500);

        } catch (error) {
            console.error('Upload error:', error);
            this.showError(error.response?.data?.error || 'Upload failed');
            if (uploadProgress) uploadProgress.style.display = 'none';
        }
    }

    simulateProgress(progressBar) {
        if (!progressBar) return;
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) {
                clearInterval(interval);
                progress = 90;
            }
            progressBar.style.width = progress + '%';
        }, 200);
    }

    showUploadSuccess(response) {
        const fileRows = document.getElementById('fileRows');
        const fileColumns = document.getElementById('fileColumns');
        const processingResults = document.getElementById('processingResults');
        const dataSummary = document.getElementById('dataSummary');
        const cleaningReport = document.getElementById('cleaningReport');

        // Update file info
        if (fileRows) fileRows.textContent = response.cleanedRows || 'N/A';
        if (fileColumns) fileColumns.textContent = response.columns?.length || 'N/A';

        // Show processing results
        if (dataSummary) {
            dataSummary.innerHTML = `
                <div class="row g-2">
                    <div class="col-6">
                        <small class="text-muted">Total Rows</small>
                        <div class="fw-bold">${response.cleanedRows || 0}</div>
                    </div>
                    <div class="col-6">
                        <small class="text-muted">Columns</small>
                        <div class="fw-bold">${response.columns?.length || 0}</div>
                    </div>
                </div>
            `;
        }

        if (cleaningReport) {
            cleaningReport.innerHTML = `
                <div class="alert alert-success">
                    <small>✅ Data processed successfully</small>
                </div>
                <div class="row g-2">
                    <div class="col-12">
                        <small class="text-muted">Columns Found</small>
                        <div class="small">${response.columns?.join(', ') || 'N/A'}</div>
                    </div>
                </div>
            `;
        }

        if (processingResults) processingResults.style.display = 'block';

        // Refresh upload history
        this.loadUploadHistory();

        // Show success message
        if (window.climateSphere) {
            window.climateSphere.showAlert('File uploaded and processed successfully!', 'success');
        }
    }

    async loadUploadHistory() {
        try {
            const history = await window.climateSphere.apiCall('/upload/history');
            this.displayUploadHistory(history);
        } catch (error) {
            console.error('Error loading upload history:', error);
            // Show mock data for demo
            this.displayUploadHistory([
                {
                    _id: '1',
                    filename: 'climate_data_2024.csv',
                    uploadDate: new Date().toISOString(),
                    fileSize: 1024000,
                    status: 'completed'
                }
            ]);
        }
    }

    displayUploadHistory(history) {
        const tbody = document.getElementById('uploadHistory');
        if (!tbody) return;

        if (!history || history.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">No uploads yet</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = history.map(upload => `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="me-2">📄</span>
                        ${upload.filename}
                    </div>
                </td>
                <td>${new Date(upload.uploadDate).toLocaleDateString()}</td>
                <td>${this.formatFileSize(upload.fileSize)}</td>
                <td>
                    <span class="badge bg-${this.getStatusColor(upload.status)}">
                        ${upload.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="uploadManager.analyzeUpload('${upload._id}')">
                        📊 Analyze
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="uploadManager.deleteUpload('${upload._id}')">
                        🗑️
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getStatusColor(status) {
        switch (status) {
            case 'completed': return 'success';
            case 'processing': return 'warning';
            case 'failed': return 'danger';
            default: return 'secondary';
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async deleteUpload(uploadId) {
        if (!confirm('Are you sure you want to delete this upload?')) {
            return;
        }

        try {
            await window.climateSphere.apiCall(`/upload/${uploadId}`, 'DELETE');
            this.loadUploadHistory();
            if (window.climateSphere) {
                window.climateSphere.showAlert('Upload deleted successfully', 'success');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showError('Failed to delete upload');
        }
    }

    analyzeUpload(uploadId) {
        // Redirect to analysis page with upload ID
        window.location.href = `analysis.html?upload=${uploadId}`;
    }

    showError(message) {
        if (window.climateSphere) {
            window.climateSphere.showAlert(message, 'danger');
        }
    }
}

// Global functions
function proceedToAnalysis() {
    window.location.href = 'analysis.html';
}

function uploadAnother() {
    // Reset the upload form
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const processingResults = document.getElementById('processingResults');
    
    if (fileInput) fileInput.value = '';
    if (fileInfo) fileInfo.style.display = 'none';
    if (processingResults) processingResults.style.display = 'none';
}

// Initialize upload manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uploadManager = new UploadManager();
});

// Add CSS for drag and drop styling
const style = document.createElement('style');
style.textContent = `
    .upload-card {
        background: #fff;
        border-radius: 15px;
        padding: 2rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .upload-zone {
        border: 2px dashed #d1d5db;
        border-radius: 12px;
        padding: 3rem 2rem;
        text-align: center;
        transition: all 0.3s ease;
        cursor: pointer;
        background: #f9fafb;
    }

    .upload-zone:hover {
        border-color: #2563eb;
        background: #eff6ff;
    }

    .upload-zone.drag-over {
        border-color: #2563eb;
        background: #eff6ff;
        transform: scale(1.02);
    }

    .upload-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.7;
    }

    .info-card, .results-card, .history-card {
        background: #fff;
        border-radius: 15px;
        padding: 1.5rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(0, 0, 0, 0.05);
        height: 100%;
    }

    .sample-table {
        background: #f8fafc;
        border-radius: 8px;
        padding: 1rem;
        font-size: 0.8rem;
    }

    .file-info {
        background: #f8fafc;
        border-radius: 10px;
        padding: 1rem;
        margin-top: 1rem;
    }
`;
document.head.appendChild(style);