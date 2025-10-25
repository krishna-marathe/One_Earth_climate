/**
 * Enhanced Upload with Gemini AI Integration
 * Provides real-time AI analysis of uploaded climate data
 */

class GeminiUploadAnalyzer {
    constructor() {
        this.uploadedData = null;
        this.analysisResult = null;
        this.chatHistory = [];
        this.isAnalyzing = false;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File upload events
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        const browseBtn = document.getElementById('browseBtn');
        const demoBtn = document.getElementById('demoBtn');

        // Upload area events
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));

        // Button events
        browseBtn.addEventListener('click', () => fileInput.click());
        demoBtn.addEventListener('click', this.loadDemoData.bind(this));
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Analysis step events
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', this.startAnalysis.bind(this));
        }

        // AI Chat events
        const chatSend = document.getElementById('aiChatSend');
        const chatInput = document.getElementById('aiChatInput');
        const chatSuggestions = document.getElementById('aiChatSuggestions');

        if (chatSend) {
            chatSend.addEventListener('click', this.sendChatMessage.bind(this));
        }
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }

        if (chatSuggestions) {
            chatSuggestions.addEventListener('click', (e) => {
                if (e.target.classList.contains('suggestion-btn')) {
                    chatInput.value = e.target.textContent;
                    this.sendChatMessage();
                }
            });
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        
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

    async processFile(file) {
        try {
            this.showUploadProgress(file.name);
            
            const data = await this.parseFile(file);
            this.uploadedData = data;
            
            this.showFileInfo(file, data);
            this.showColumnMapping(data);
            this.activateStep(2);
            
        } catch (error) {
            console.error('File processing err