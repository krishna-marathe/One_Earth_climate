/**
 * Enhanced Data Upload & Analysis System
 * Comprehensive file processing, analysis, and prediction functionality
 */

class DataUploadAnalyzer {
    constructor() {
        this.uploadedData = null;
        this.processedData = null;
        this.columnMapping = {};
        this.charts = {};
        this.statistics = {};
        this.currentStep = 1;
        
        this.initializeEventListeners();
    }

    showStep(stepId) {
        // Hide all step contents
        document.querySelectorAll('.step-content').forEach(step => {
            step.classList.add('hidden');
        });
        
        // Show target step
        document.getElementById(stepId).classList.remove('hidden');
        
        // Update step indicators
        this.updateStepIndicators();
    }

    nextStep() {
        this.currentStep++;
        this.updateStepIndicators();
        
        if (this.currentStep === 2) {
            this.showStep('mappingStep');
        } else if (this.currentStep === 3) {
            this.showStep('analysisStep');
        }
    }

    updateStepIndicators() {
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            
            if (index + 1 < this.currentStep) {
                step.classList.add('completed');
            } else if (index + 1 === this.currentStep) {
                step.classList.add('active');
            }
        });
    }

    initializeEventListeners() {
        // File upload events
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const browseBtn = document.getElementById('browseBtn');

        browseBtn.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                this.handleFileUpload(e.dataTransfer.files[0]);
            }
        });

        // Analysis button
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.performAnalysis();
        });

        // Demo button
        document.getElementById('demoBtn').addEventListener('click', () => {
            this.loadDemoData();
        });

        // Prediction controls
        this.initializePredictionControls();

        // Download buttons
        this.initializeDownloadButtons();
    }

    initializePredictionControls() {
        const sliders = ['co2Slider', 'deforestSlider', 'renewableSlider'];
        const values = ['co2Value', 'deforestValue', 'renewableValue'];

        sliders.forEach((sliderId, index) => {
            const slider = document.getElementById(sliderId);
            const valueDisplay = document.getElementById(values[index]);
            
            slider.addEventListener('input', (e) => {
                valueDisplay.textContent = e.target.value + '%';
                this.updatePredictionCharts();
            });
        });

        document.getElementById('runPredictionBtn').addEventListener('click', () => {
            this.runMLPrediction();
        });
    }

    initializeDownloadButtons() {
        // Add null checks for buttons that might not exist yet
        const downloadCSV = document.getElementById('downloadCSV');
        if (downloadCSV) {
            downloadCSV.addEventListener('click', () => {
                this.downloadData('csv');
            });
        }

        const downloadJSON = document.getElementById('downloadJSON');
        if (downloadJSON) {
            downloadJSON.addEventListener('click', () => {
                this.downloadData('json');
            });
        }

        const savePrediction = document.getElementById('savePrediction');
        if (savePrediction) {
            savePrediction.addEventListener('click', () => {
                this.savePredictionResults();
            });
        }
    }

    async handleFileUpload(file) {
        console.log('[Upload] Processing file:', file.name);
        
        // Show progress
        this.showUploadProgress(file);
        
        try {
            // Validate file
            if (!this.validateFile(file)) {
                return;
            }

            // Parse file based on type
            const data = await this.parseFile(file);
            
            if (data && data.length > 0) {
                this.uploadedData = data;
                this.showFileInfo(file, data);
                this.showDataPreview(data);
                this.showColumnMapping(data);
                
                CS_Utils.showNotification('File uploaded and parsed successfully!', 'success');
            } else {
                throw new Error('No data found in file');
            }
            
        } catch (error) {
            console.error('[Upload] Error processing file:', error);
            CS_Utils.showNotification(`Error processing file: ${error.message}`, 'error');
        }
    }

    validateFile(file) {
        const maxSize = 50 * 1024 * 1024; // 50MB
        const allowedTypes = ['.csv', '.json', '.xlsx', '.xls'];
        
        if (file.size > maxSize) {
            CS_Utils.showNotification('File too large. Maximum size is 50MB.', 'error');
            return false;
        }

        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(extension)) {
            CS_Utils.showNotification('Unsupported file type. Please use CSV, JSON, or Excel files.', 'error');
            return false;
        }

        return true;
    }

    async parseFile(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        
        switch (extension) {
            case 'csv':
                return this.parseCSV(file);
            case 'json':
                return this.parseJSON(file);
            case 'xlsx':
            case 'xls':
                return this.parseExcel(file);
            default:
                throw new Error('Unsupported file format');
        }
    }

    parseCSV(file) {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        console.warn('[Upload] CSV parsing warnings:', results.errors);
                    }
                    resolve(results.data);
                },
                error: (error) => {
                    reject(new Error(`CSV parsing failed: ${error.message}`));
                }
            });
        });
    }

    parseJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    // Handle different JSON structures
                    if (Array.isArray(data)) {
                        resolve(data);
                    } else if (data.data && Array.isArray(data.data)) {
                        resolve(data.data);
                    } else {
                        resolve([data]);
                    }
                } catch (error) {
                    reject(new Error(`JSON parsing failed: ${error.message}`));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read JSON file'));
            reader.readAsText(file);
        });
    }

    parseExcel(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error(`Excel parsing failed: ${error.message}`));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read Excel file'));
            reader.readAsArrayBuffer(file);
        });
    }

    showUploadProgress(file) {
        const progressContainer = document.getElementById('uploadProgress');
        progressContainer.innerHTML = `
            <div class="progress-item">
                <div class="progress-header">
                    <span>${file.name}</span>
                    <span class="progress-status">Processing...</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 100%; background: var(--primary-color);"></div>
                </div>
            </div>
        `;
    }

    showFileInfo(file, data) {
        const fileInfo = document.getElementById('fileInfo');
        const rows = data.length;
        const columns = Object.keys(data[0] || {}).length;
        const size = (file.size / 1024).toFixed(2);

        fileInfo.innerHTML = `
            <div style="display: grid; gap: 0.5rem;">
                <div><strong>File:</strong> ${file.name}</div>
                <div><strong>Size:</strong> ${size} KB</div>
                <div><strong>Rows:</strong> ${rows.toLocaleString()}</div>
                <div><strong>Columns:</strong> ${columns}</div>
            </div>
        `;

        // Show file info section and move to next step
        document.getElementById('fileInfoSection').classList.remove('hidden');
        this.nextStep();
    }

    showDataPreview(data) {
        const preview = document.getElementById('dataPreview');
        const previewData = data.slice(0, 10); // Show first 10 rows
        const columns = Object.keys(data[0] || {});

        let tableHTML = `
            <table class="preview-table">
                <thead>
                    <tr>
                        ${columns.map(col => `<th>${col}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${previewData.map(row => `
                        <tr>
                            ${columns.map(col => `<td>${row[col] || ''}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        if (data.length > 10) {
            tableHTML += `<p class="text-secondary" style="margin-top: 1rem;">Showing first 10 of ${data.length} rows</p>`;
        }

        preview.innerHTML = tableHTML;
    }

    showColumnMapping(data) {
        const mappingContainer = document.getElementById('mappingContainer');
        const columns = Object.keys(data[0] || {});
        
        const climateVariables = [
            { value: '', label: 'Select variable type...' },
            { value: 'date', label: 'Date/Time' },
            { value: 'temperature', label: 'Temperature (°C)' },
            { value: 'rainfall', label: 'Rainfall (mm)' },
            { value: 'humidity', label: 'Humidity (%)' },
            { value: 'co2', label: 'CO₂ (ppm)' },
            { value: 'aqi', label: 'Air Quality Index' },
            { value: 'windspeed', label: 'Wind Speed (km/h)' },
            { value: 'pressure', label: 'Atmospheric Pressure (hPa)' },
            { value: 'latitude', label: 'Latitude' },
            { value: 'longitude', label: 'Longitude' },
            { value: 'region', label: 'Region/Location' },
            { value: 'ignore', label: 'Ignore this column' }
        ];

        mappingContainer.innerHTML = columns.map(column => `
            <div class="mapping-item">
                <label class="mapping-label">${column}</label>
                <select class="mapping-select" data-column="${column}">
                    ${climateVariables.map(variable => 
                        `<option value="${variable.value}" ${this.autoDetectColumnType(column) === variable.value ? 'selected' : ''}>
                            ${variable.label}
                        </option>`
                    ).join('')}
                </select>
            </div>
        `).join('');

        // Add event listeners for mapping changes
        mappingContainer.querySelectorAll('.mapping-select').forEach(select => {
            select.addEventListener('change', (e) => {
                this.columnMapping[e.target.dataset.column] = e.target.value;
            });
            
            // Initialize mapping
            this.columnMapping[select.dataset.column] = select.value;
        });

        // Move to mapping step
        this.showStep('mappingStep');
    }

    autoDetectColumnType(columnName) {
        const name = columnName.toLowerCase();
        
        if (name.includes('date') || name.includes('time')) return 'date';
        if (name.includes('temp')) return 'temperature';
        if (name.includes('rain') || name.includes('precip')) return 'rainfall';
        if (name.includes('humid')) return 'humidity';
        if (name.includes('co2') || name.includes('carbon')) return 'co2';
        if (name.includes('aqi') || name.includes('air')) return 'aqi';
        if (name.includes('wind')) return 'windspeed';
        if (name.includes('pressure')) return 'pressure';
        if (name.includes('lat')) return 'latitude';
        if (name.includes('lon') || name.includes('lng')) return 'longitude';
        if (name.includes('region') || name.includes('location') || name.includes('city')) return 'region';
        
        return '';
    }

    performAnalysis() {
        console.log('[Analysis] Starting data analysis...');
        
        try {
            // Process data based on column mapping
            this.processedData = this.processDataWithMapping();
            
            // Save processed data to localStorage for use in predictions
            localStorage.setItem('climateSphere_uploadedData', JSON.stringify(this.processedData));
            localStorage.setItem('climateSphere_columnMapping', JSON.stringify(this.columnMapping));
            
            // Calculate statistics
            this.calculateStatistics();
            
            // Generate charts
            this.generateCharts();
            
            // Move to analysis step
            this.nextStep();
            
            CS_Utils.showNotification('Data analysis completed successfully! Data is now available for predictions.', 'success');
            
        } catch (error) {
            console.error('[Analysis] Error:', error);
            CS_Utils.showNotification(`Analysis failed: ${error.message}`, 'error');
        }
    }

    processDataWithMapping() {
        const processed = this.uploadedData.map(row => {
            const processedRow = {};
            
            Object.entries(this.columnMapping).forEach(([column, type]) => {
                if (type && type !== 'ignore') {
                    let value = row[column];
                    
                    // Convert data types
                    if (['temperature', 'rainfall', 'humidity', 'co2', 'aqi', 'windspeed', 'pressure', 'latitude', 'longitude'].includes(type)) {
                        value = parseFloat(value);
                        if (isNaN(value)) value = null;
                    } else if (type === 'date') {
                        value = new Date(value);
                        if (isNaN(value.getTime())) value = null;
                    }
                    
                    processedRow[type] = value;
                }
            });
            
            return processedRow;
        });

        return processed.filter(row => Object.keys(row).length > 0);
    }

    calculateStatistics() {
        const numericColumns = ['temperature', 'rainfall', 'humidity', 'co2', 'aqi', 'windspeed', 'pressure'];
        this.statistics = {};

        numericColumns.forEach(column => {
            const values = this.processedData
                .map(row => row[column])
                .filter(val => val !== null && !isNaN(val));

            if (values.length > 0) {
                this.statistics[column] = {
                    count: values.length,
                    mean: values.reduce((a, b) => a + b, 0) / values.length,
                    min: Math.min(...values),
                    max: Math.max(...values),
                    missing: this.processedData.length - values.length
                };
            }
        });

        this.displayStatistics();
    }

    displayStatistics() {
        const statsGrid = document.getElementById('statsGrid');
        
        const statsHTML = Object.entries(this.statistics).map(([column, stats]) => `
            <div class="stat-item">
                <div class="stat-value">${stats.count}</div>
                <div class="stat-label">${column} records</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${stats.mean.toFixed(2)}</div>
                <div class="stat-label">${column} avg</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${stats.missing}</div>
                <div class="stat-label">${column} missing</div>
            </div>
        `).join('');

        statsGrid.innerHTML = statsHTML;
    }

    generateCharts() {
        const chartsGrid = document.getElementById('chartsGrid');
        chartsGrid.innerHTML = '';

        // Generate different types of charts based on available data
        if (this.processedData.length === 0) {
            this.generateDemoCharts();
            return;
        }

        const availableColumns = Object.keys(this.processedData[0]);
        console.log('[Charts] Available columns:', availableColumns);
        
        // Time series charts
        const timeSeriesColumns = ['temperature', 'rainfall', 'co2', 'aqi'].filter(col => availableColumns.includes(col));
        if (timeSeriesColumns.length > 0) {
            this.createTimeSeriesCharts(availableColumns);
        }
        
        // Distribution charts
        this.createDistributionCharts(availableColumns);
        
        // Correlation chart
        this.createCorrelationChart(availableColumns);
        
        // Always create a demo prediction chart
        this.generateDemoPredictions({
            co2Reduction: 0,
            deforestationChange: 0,
            renewableIncrease: 0
        });
        
        // Geographic chart (if location data available)
        if (availableColumns.includes('latitude') && availableColumns.includes('longitude')) {
            this.createGeographicChart();
        }
    }

    generateDemoCharts() {
        console.log('[Charts] Generating demo charts...');
        
        // Create demo data
        const demoData = Array.from({length: 30}, (_, i) => ({
            date: new Date(2024, 0, i + 1),
            temperature: 20 + Math.sin(i * 0.2) * 10 + Math.random() * 5,
            rainfall: Math.max(0, 50 + Math.cos(i * 0.3) * 30 + Math.random() * 20),
            co2: 400 + Math.random() * 50,
            aqi: 50 + Math.random() * 100
        }));
        
        this.processedData = demoData;
        
        // Generate charts with demo data
        this.createTimeSeriesChart('temperature');
        this.createTimeSeriesChart('rainfall');
        this.createDistributionCharts(['temperature', 'rainfall', 'co2', 'aqi']);
        this.createCorrelationChart(['temperature', 'rainfall', 'co2', 'aqi']);
        
        // Generate demo predictions
        this.generateDemoPredictions({
            co2Reduction: 0,
            deforestationChange: 0,
            renewableIncrease: 0
        });
        
        CS_Utils.showNotification('Demo charts generated! Upload your own data to see real analysis.', 'info');
    }

    loadDemoData() {
        console.log('[Demo] Loading demo climate data...');
        
        // Create comprehensive demo dataset
        const demoData = Array.from({length: 100}, (_, i) => {
            const date = new Date(2024, 0, i + 1);
            const dayOfYear = i;
            
            return {
                date: date.toISOString().split('T')[0],
                temperature: 15 + Math.sin(dayOfYear * 0.017) * 15 + Math.random() * 5,
                rainfall: Math.max(0, 80 + Math.cos(dayOfYear * 0.02) * 60 + Math.random() * 30),
                humidity: 40 + Math.sin(dayOfYear * 0.015) * 30 + Math.random() * 10,
                co2: 410 + Math.random() * 30 + dayOfYear * 0.1,
                aqi: 50 + Math.abs(Math.sin(dayOfYear * 0.03)) * 100 + Math.random() * 20,
                windspeed: 5 + Math.random() * 15,
                pressure: 1013 + Math.sin(dayOfYear * 0.01) * 20 + Math.random() * 10,
                region: 'Demo Region'
            };
        });
        
        this.uploadedData = demoData;
        
        // Auto-detect column mapping
        this.columnMapping = {
            date: 'date',
            temperature: 'temperature',
            rainfall: 'rainfall',
            humidity: 'humidity',
            co2: 'co2',
            aqi: 'aqi',
            windspeed: 'windspeed',
            pressure: 'pressure',
            region: 'region'
        };
        
        // Show file info
        this.showFileInfo({ name: 'demo_climate_data.csv', size: 50000 }, demoData);
        this.showDataPreview(demoData);
        this.showColumnMapping(demoData);
        
        CS_Utils.showNotification('Demo climate data loaded! Click "Start Analysis" to see visualizations.', 'success');
    }

    createTimeSeriesCharts(columns) {
        const timeColumns = ['temperature', 'rainfall', 'co2', 'aqi'];
        
        timeColumns.forEach(column => {
            if (columns.includes(column) && columns.includes('date')) {
                this.createTimeSeriesChart(column);
            }
        });
    }

    createTimeSeriesChart(dataColumn) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-card';
        chartContainer.style.minHeight = '400px';
        chartContainer.innerHTML = `
            <div class="chart-header">
                <h3 class="chart-title">${dataColumn.charAt(0).toUpperCase() + dataColumn.slice(1)} Over Time</h3>
            </div>
            <div style="position: relative; height: 300px; width: 100%;">
                <canvas id="chart-${dataColumn}"></canvas>
            </div>
        `;
        
        document.getElementById('chartsGrid').appendChild(chartContainer);

        // Wait for DOM to update
        setTimeout(() => {
            const ctx = document.getElementById(`chart-${dataColumn}`).getContext('2d');
            
            let data;
            
            // Check if we have date data, otherwise create index-based data
            if (this.processedData.some(row => row.date)) {
                data = this.processedData
                    .filter(row => row.date && row[dataColumn] !== null && !isNaN(row[dataColumn]))
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(row => ({
                        x: new Date(row.date),
                        y: parseFloat(row[dataColumn])
                    }));
            } else {
                // Create index-based data if no date column
                data = this.processedData
                    .filter(row => row[dataColumn] !== null && !isNaN(row[dataColumn]))
                    .map((row, index) => ({
                        x: index,
                        y: parseFloat(row[dataColumn])
                    }));
            }

            if (data.length === 0) {
                // Create demo data if no valid data found
                data = Array.from({length: 30}, (_, i) => ({
                    x: i,
                    y: Math.random() * 100 + 50
                }));
            }

            this.charts[dataColumn] = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [{
                        label: dataColumn.charAt(0).toUpperCase() + dataColumn.slice(1),
                        data: data,
                        borderColor: this.getChartColor(dataColumn),
                        backgroundColor: this.getChartColor(dataColumn, 0.1),
                        fill: true,
                        tension: 0.4,
                        pointRadius: 2,
                        pointHoverRadius: 5,
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        title: {
                            display: true,
                            text: `${dataColumn.charAt(0).toUpperCase() + dataColumn.slice(1)} Trend`
                        }
                    },
                    scales: {
                        x: {
                            type: data[0] && data[0].x instanceof Date ? 'time' : 'linear',
                            time: data[0] && data[0].x instanceof Date ? {
                                unit: 'day',
                                displayFormats: {
                                    day: 'MMM DD'
                                }
                            } : undefined,
                            title: {
                                display: true,
                                text: data[0] && data[0].x instanceof Date ? 'Date' : 'Index'
                            },
                            grid: {
                                display: true,
                                color: 'rgba(0,0,0,0.1)'
                            }
                        },
                        y: {
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: dataColumn
                            },
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });
            
            console.log(`[Chart] Created ${dataColumn} chart with ${data.length} data points`);
        }, 100);
    }

    createDistributionCharts(columns) {
        const numericColumns = ['temperature', 'rainfall', 'co2', 'aqi', 'humidity', 'windspeed', 'pressure'].filter(col => columns.includes(col));
        
        if (numericColumns.length > 0) {
            const chartContainer = document.createElement('div');
            chartContainer.className = 'chart-card';
            chartContainer.style.minHeight = '400px';
            chartContainer.innerHTML = `
                <div class="chart-header">
                    <h3 class="chart-title">Data Distribution</h3>
                </div>
                <div style="position: relative; height: 300px; width: 100%;">
                    <canvas id="chart-distribution"></canvas>
                </div>
            `;
            
            document.getElementById('chartsGrid').appendChild(chartContainer);

            setTimeout(() => {
                const ctx = document.getElementById('chart-distribution').getContext('2d');
                
                // Create a simple bar chart showing averages for each column
                const chartData = numericColumns.map(column => {
                    const values = this.processedData
                        .map(row => row[column])
                        .filter(val => val !== null && !isNaN(val));
                    
                    const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
                    
                    return {
                        label: column.charAt(0).toUpperCase() + column.slice(1),
                        value: average,
                        count: values.length
                    };
                });

                this.charts.distribution = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: chartData.map(item => item.label),
                        datasets: [{
                            label: 'Average Values',
                            data: chartData.map(item => item.value),
                            backgroundColor: chartData.map((_, index) => this.getChartColor(numericColumns[index], 0.7)),
                            borderColor: chartData.map((_, index) => this.getChartColor(numericColumns[index])),
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            title: {
                                display: true,
                                text: 'Average Values by Variable'
                            },
                            tooltip: {
                                callbacks: {
                                    afterLabel: function(context) {
                                        const dataIndex = context.dataIndex;
                                        return `Records: ${chartData[dataIndex].count}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Variables'
                                }
                            },
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Average Value'
                                }
                            }
                        }
                    }
                });
                
                console.log(`[Chart] Created distribution chart with ${numericColumns.length} variables`);
            }, 150);
        }
    }

    createCorrelationChart(columns) {
        const numericColumns = ['temperature', 'rainfall', 'co2', 'aqi', 'humidity', 'windspeed', 'pressure'].filter(col => columns.includes(col));
        
        if (numericColumns.length >= 2) {
            const chartContainer = document.createElement('div');
            chartContainer.className = 'chart-card';
            chartContainer.style.minHeight = '400px';
            chartContainer.innerHTML = `
                <div class="chart-header">
                    <h3 class="chart-title">Correlation Analysis</h3>
                </div>
                <div style="position: relative; height: 300px; width: 100%;">
                    <canvas id="chart-correlation"></canvas>
                </div>
            `;
            
            document.getElementById('chartsGrid').appendChild(chartContainer);

            setTimeout(() => {
                const ctx = document.getElementById('chart-correlation').getContext('2d');
                
                // Create scatter plot for first two numeric columns
                const xColumn = numericColumns[0];
                const yColumn = numericColumns[1];
                
                let data = this.processedData
                    .filter(row => row[xColumn] !== null && row[yColumn] !== null && 
                                  !isNaN(row[xColumn]) && !isNaN(row[yColumn]))
                    .map(row => ({
                        x: parseFloat(row[xColumn]),
                        y: parseFloat(row[yColumn])
                    }));

                // If no valid data, create demo data
                if (data.length === 0) {
                    data = Array.from({length: 50}, () => ({
                        x: Math.random() * 100,
                        y: Math.random() * 100
                    }));
                }

                this.charts.correlation = new Chart(ctx, {
                    type: 'scatter',
                    data: {
                        datasets: [{
                            label: `${yColumn.charAt(0).toUpperCase() + yColumn.slice(1)} vs ${xColumn.charAt(0).toUpperCase() + xColumn.slice(1)}`,
                            data: data,
                            backgroundColor: this.getChartColor('correlation', 0.6),
                            borderColor: this.getChartColor('correlation'),
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            },
                            title: {
                                display: true,
                                text: `${yColumn.charAt(0).toUpperCase() + yColumn.slice(1)} vs ${xColumn.charAt(0).toUpperCase() + xColumn.slice(1)}`
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: xColumn.charAt(0).toUpperCase() + xColumn.slice(1)
                                },
                                grid: {
                                    color: 'rgba(0,0,0,0.1)'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: yColumn.charAt(0).toUpperCase() + yColumn.slice(1)
                                },
                                grid: {
                                    color: 'rgba(0,0,0,0.1)'
                                }
                            }
                        }
                    }
                });
                
                console.log(`[Chart] Created correlation chart with ${data.length} data points`);
            }, 200);
        }
    }

    createHistogramData(values, bins = 10) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const binWidth = (max - min) / bins;
        
        const histogram = new Array(bins).fill(0);
        
        values.forEach(value => {
            const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
            histogram[binIndex]++;
        });
        
        return histogram.map((count, index) => ({
            x: min + (index + 0.5) * binWidth,
            y: count
        }));
    }

    getChartColor(type, alpha = 1) {
        const colors = {
            temperature: `rgba(255, 99, 132, ${alpha})`,
            rainfall: `rgba(54, 162, 235, ${alpha})`,
            co2: `rgba(255, 206, 86, ${alpha})`,
            aqi: `rgba(75, 192, 192, ${alpha})`,
            correlation: `rgba(153, 102, 255, ${alpha})`,
            default: `rgba(201, 203, 207, ${alpha})`
        };
        
        return colors[type] || colors.default;
    }

    updatePredictionCharts() {
        // Update charts based on slider values
        const co2Change = document.getElementById('co2Slider').value;
        const deforestChange = document.getElementById('deforestSlider').value;
        const renewableChange = document.getElementById('renewableSlider').value;
        
        // Apply changes to existing charts (simplified simulation)
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.data && chart.data.datasets) {
                chart.data.datasets.forEach(dataset => {
                    if (dataset.data && Array.isArray(dataset.data)) {
                        // Simple simulation: adjust values based on sliders
                        dataset.data = dataset.data.map(point => {
                            if (typeof point === 'object' && point.y !== undefined) {
                                let adjustedY = point.y;
                                adjustedY *= (1 + co2Change / 100 * 0.1); // CO2 effect
                                adjustedY *= (1 - deforestChange / 100 * 0.05); // Deforestation effect
                                adjustedY *= (1 - renewableChange / 100 * 0.08); // Renewable effect
                                return { ...point, y: adjustedY };
                            }
                            return point;
                        });
                    }
                });
                chart.update('none'); // Update without animation
            }
        });
    }

    async runMLPrediction() {
        console.log('[Prediction] Running ML prediction...');
        
        try {
            const predictionData = {
                data: this.processedData,
                scenarios: {
                    co2Reduction: document.getElementById('co2Slider').value,
                    deforestationChange: document.getElementById('deforestSlider').value,
                    renewableIncrease: document.getElementById('renewableSlider').value
                }
            };
            
            // Call ML API
            const response = await CS_API.post('/predict', predictionData);
            
            if (response.demo) {
                // Generate demo predictions
                this.generateDemoPredictions(predictionData.scenarios);
            } else {
                this.displayPredictionResults(response.data);
            }
            
            CS_Utils.showNotification('Prediction completed successfully!', 'success');
            
        } catch (error) {
            console.error('[Prediction] Error:', error);
            CS_Utils.showNotification(`Prediction failed: ${error.message}`, 'error');
        }
    }

    generateDemoPredictions(scenarios) {
        // Generate realistic demo predictions based on scenarios
        const predictions = {
            floodRisk: Math.max(0, Math.min(100, 30 + scenarios.co2Reduction * 0.5 + scenarios.deforestationChange * 0.3)),
            droughtRisk: Math.max(0, Math.min(100, 25 + scenarios.co2Reduction * 0.4 - scenarios.renewableIncrease * 0.2)),
            heatwaveRisk: Math.max(0, Math.min(100, 40 + scenarios.co2Reduction * 0.6 - scenarios.renewableIncrease * 0.3))
        };
        
        this.displayPredictionResults(predictions);
    }

    displayPredictionResults(predictions) {
        // Remove existing prediction chart if any
        const existingChart = document.getElementById('chart-predictions');
        if (existingChart) {
            existingChart.parentElement.remove();
        }
        
        // Create prediction results chart
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-card';
        chartContainer.style.minHeight = '400px';
        chartContainer.innerHTML = `
            <div class="chart-header">
                <h3 class="chart-title">Climate Risk Predictions</h3>
            </div>
            <div style="position: relative; height: 300px; width: 100%;">
                <canvas id="chart-predictions"></canvas>
            </div>
        `;
        
        document.getElementById('chartsGrid').appendChild(chartContainer);

        setTimeout(() => {
            const ctx = document.getElementById('chart-predictions').getContext('2d');
            
            const riskData = [
                predictions.floodRisk || 30,
                predictions.droughtRisk || 25,
                predictions.heatwaveRisk || 40
            ];
            
            this.charts.predictions = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Flood Risk', 'Drought Risk', 'Heatwave Risk'],
                    datasets: [{
                        data: riskData,
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(255, 99, 132, 0.8)'
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(255, 99, 132, 1)'
                        ],
                        borderWidth: 3,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        title: {
                            display: true,
                            text: 'Climate Risk Assessment (%)'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.label + ': ' + context.parsed + '%';
                                }
                            }
                        }
                    }
                }
            });
            
            console.log('[Chart] Created prediction chart with risk values:', riskData);
        }, 250);
    }

    downloadData(format) {
        if (!this.processedData) {
            CS_Utils.showNotification('No data to download. Please analyze data first.', 'warning');
            return;
        }

        let content, filename, mimeType;

        switch (format) {
            case 'csv':
                content = this.convertToCSV(this.processedData);
                filename = 'climate_analysis.csv';
                mimeType = 'text/csv';
                break;
            case 'json':
                content = JSON.stringify({
                    data: this.processedData,
                    statistics: this.statistics,
                    timestamp: new Date().toISOString()
                }, null, 2);
                filename = 'climate_analysis.json';
                mimeType = 'application/json';
                break;
        }

        CS_Utils.downloadAsFile(content, filename, mimeType);
        CS_Utils.showNotification(`${format.toUpperCase()} file downloaded successfully!`, 'success');
    }

    convertToCSV(data) {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    return value !== null && value !== undefined ? `"${value}"` : '';
                }).join(',')
            )
        ].join('\n');
        
        return csvContent;
    }

    downloadCharts() {
        // Download all charts as images
        Object.entries(this.charts).forEach(([name, chart]) => {
            if (chart && chart.canvas) {
                const link = document.createElement('a');
                link.download = `climate_chart_${name}.png`;
                link.href = chart.canvas.toDataURL();
                link.click();
            }
        });
        
        CS_Utils.showNotification('Charts downloaded successfully!', 'success');
    }

    async savePredictionResults() {
        if (!this.processedData) {
            CS_Utils.showNotification('No prediction results to save.', 'warning');
            return;
        }

        try {
            const predictionResults = {
                data: this.processedData,
                statistics: this.statistics,
                scenarios: {
                    co2Reduction: document.getElementById('co2Slider').value,
                    deforestationChange: document.getElementById('deforestSlider').value,
                    renewableIncrease: document.getElementById('renewableSlider').value
                },
                timestamp: new Date().toISOString()
            };

            const response = await CS_API.post('/scenario/save', predictionResults);
            
            if (response.demo) {
                CS_Utils.showNotification('Prediction saved to demo storage!', 'success');
            } else {
                CS_Utils.showNotification('Prediction saved to database!', 'success');
            }
            
        } catch (error) {
            console.error('[Save] Error:', error);
            CS_Utils.showNotification(`Failed to save prediction: ${error.message}`, 'error');
        }
    }
}

// Initialize the enhanced upload system
document.addEventListener('DOMContentLoaded', () => {
    window.dataUploadAnalyzer = new DataUploadAnalyzer();
    console.log('[Upload] Enhanced data upload system initialized');
});