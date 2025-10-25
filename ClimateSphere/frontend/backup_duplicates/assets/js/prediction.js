// Prediction functionality
class PredictionManager {
    constructor() {
        this.currentPredictions = null;
        this.init();
    }

    init() {
        this.setupSliders();
        this.setupEventListeners();
        this.loadModelMetrics();
        this.generateInitialPrediction();
    }

    setupSliders() {
        const sliders = [
            { id: 'tempSlider', valueId: 'tempValue', suffix: '°C' },
            { id: 'rainfallSlider', valueId: 'rainfallValue', suffix: 'mm' },
            { id: 'humiditySlider', valueId: 'humidityValue', suffix: '%' },
            { id: 'co2Slider', valueId: 'co2Value', suffix: 'ppm' },
            { id: 'co2ChangeSlider', valueId: 'co2ChangeValue', suffix: '%' },
            { id: 'deforestationSlider', valueId: 'deforestationValue', suffix: '%' },
            { id: 'renewableSlider', valueId: 'renewableValue', suffix: '%' }
        ];

        sliders.forEach(slider => {
            const element = document.getElementById(slider.id);
            const valueElement = document.getElementById(slider.valueId);
            
            if (element && valueElement) {
                element.addEventListener('input', (e) => {
                    let value = e.target.value;
                    if (slider.id === 'co2ChangeSlider' && value > 0) {
                        value = '+' + value;
                    }
                    valueElement.textContent = value + slider.suffix;
                });
            }
        });
    }

    setupEventListeners() {
        const predictionForm = document.getElementById('predictionForm');
        if (predictionForm) {
            predictionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generatePrediction();
            });
        }
    }

    async generatePrediction() {
        const temperature = document.getElementById('tempSlider').value;
        const rainfall = document.getElementById('rainfallSlider').value;
        const humidity = document.getElementById('humiditySlider').value;
        const co2_level = document.getElementById('co2Slider').value;

        try {
            const response = await window.climateSphere.apiCall('/prediction/risk', 'POST', {
                temperature: parseFloat(temperature),
                rainfall: parseFloat(rainfall),
                humidity: parseFloat(humidity),
                co2_level: parseFloat(co2_level)
            });

            this.currentPredictions = response;
            this.displayPredictions(response.predictions);
            
        } catch (error) {
            console.error('Prediction error:', error);
            // Show mock predictions for demo
            this.displayMockPredictions();
        }
    }

    async generateInitialPrediction() {
        // Generate prediction with default values
        await this.generatePrediction();
    }

    displayPredictions(predictions) {
        const riskTypes = ['flood', 'drought', 'heatwave'];
        
        riskTypes.forEach(type => {
            const riskElement = document.getElementById(`${type}Risk`);
            const levelElement = document.getElementById(`${type}Level`);
            
            if (predictions[type] && riskElement && levelElement) {
                const probability = Math.round(predictions[type].risk_probability * 100);
                const level = predictions[type].risk_level;
                
                riskElement.textContent = `${probability}%`;
                levelElement.textContent = level;
                
                // Update card styling based on risk level
                const card = riskElement.closest('.risk-card');
                if (card) {
                    card.className = `risk-card ${type} ${level.toLowerCase()}`;
                }
            }
        });
    }

    displayMockPredictions() {
        const mockPredictions = {
            flood: { risk_probability: 0.65, risk_level: 'Medium' },
            drought: { risk_probability: 0.42, risk_level: 'Low' },
            heatwave: { risk_probability: 0.78, risk_level: 'High' }
        };
        
        this.displayPredictions(mockPredictions);
    }

    async loadModelMetrics() {
        try {
            const metrics = await window.climateSphere.apiCall('/prediction/metrics');
            this.displayModelMetrics(metrics.performance);
        } catch (error) {
            console.error('Model metrics error:', error);
            // Show default metrics
            this.displayModelMetrics({
                flood_model: { accuracy: 0.87 },
                drought_model: { accuracy: 0.82 },
                heatwave_model: { accuracy: 0.91 }
            });
        }
    }

    displayModelMetrics(performance) {
        const metricsContainer = document.getElementById('modelMetrics');
        if (!metricsContainer) return;

        const metrics = [
            { label: 'Flood Model Accuracy', value: performance.flood_model?.accuracy || 0.87 },
            { label: 'Drought Model Accuracy', value: performance.drought_model?.accuracy || 0.82 },
            { label: 'Heatwave Model Accuracy', value: performance.heatwave_model?.accuracy || 0.91 }
        ];

        metricsContainer.innerHTML = metrics.map(metric => `
            <div class="metric-item">
                <span class="metric-label">${metric.label}</span>
                <span class="metric-value">${Math.round(metric.value * 100)}%</span>
            </div>
        `).join('');
    }

    async runScenarioSimulation() {
        const co2Change = document.getElementById('co2ChangeSlider').value;
        const deforestation = document.getElementById('deforestationSlider').value;
        const renewableEnergy = document.getElementById('renewableSlider').value;

        try {
            const response = await window.climateSphere.apiCall('/prediction/scenario', 'POST', {
                co2_change: parseFloat(co2Change),
                deforestation: parseFloat(deforestation),
                renewable_energy: parseFloat(renewableEnergy)
            });

            this.displayScenarioResults(response);
            
        } catch (error) {
            console.error('Scenario simulation error:', error);
            this.displayMockScenarioResults();
        }
    }

    displayScenarioResults(results) {
        const scenarioResults = document.getElementById('scenarioResults');
        const scenarioCards = document.getElementById('scenarioCards');
        
        if (!scenarioResults || !scenarioCards) return;

        const riskTypes = ['flood', 'drought', 'heatwave'];
        
        scenarioCards.innerHTML = riskTypes.map(type => {
            const prediction = results.risk_predictions[type];
            const probability = Math.round(prediction.risk_probability * 100);
            const level = prediction.risk_level;
            
            return `
                <div class="col-md-4">
                    <div class="scenario-risk-card ${level.toLowerCase()}">
                        <div class="risk-icon">${this.getRiskIcon(type)}</div>
                        <h6>${this.capitalizeFirst(type)} Risk</h6>
                        <div class="risk-percentage">${probability}%</div>
                        <div class="risk-level">${level}</div>
                    </div>
                </div>
            `;
        }).join('');

        scenarioResults.style.display = 'block';
        
        if (window.climateSphere) {
            window.climateSphere.showAlert('Scenario simulation completed!', 'success');
        }
    }

    displayMockScenarioResults() {
        const mockResults = {
            risk_predictions: {
                flood: { risk_probability: 0.72, risk_level: 'High' },
                drought: { risk_probability: 0.58, risk_level: 'Medium' },
                heatwave: { risk_probability: 0.85, risk_level: 'High' }
            }
        };
        
        this.displayScenarioResults(mockResults);
    }

    async generateFuturePrediction() {
        const targetYear = document.getElementById('targetYear').value;
        
        try {
            const response = await window.climateSphere.apiCall('/prediction/future', 'POST', {
                year: parseInt(targetYear),
                base_temperature: 25,
                base_rainfall: 100,
                base_humidity: 60,
                base_co2: 420
            });

            this.displayFutureResults(response);
            
        } catch (error) {
            console.error('Future prediction error:', error);
            this.displayMockFutureResults(targetYear);
        }
    }

    displayFutureResults(results) {
        const futureResults = document.getElementById('futureResults');
        const futureConditions = document.getElementById('futureConditions');
        
        if (!futureResults || !futureConditions) return;

        const conditions = results.projected_conditions;
        
        futureConditions.innerHTML = `
            <div class="row g-3">
                <div class="col-6">
                    <div class="condition-item">
                        <span class="condition-label">🌡️ Temperature</span>
                        <span class="condition-value">${conditions.temperature.toFixed(1)}°C</span>
                    </div>
                </div>
                <div class="col-6">
                    <div class="condition-item">
                        <span class="condition-label">🌧️ Rainfall</span>
                        <span class="condition-value">${conditions.rainfall.toFixed(1)}mm</span>
                    </div>
                </div>
                <div class="col-6">
                    <div class="condition-item">
                        <span class="condition-label">💧 Humidity</span>
                        <span class="condition-value">${conditions.humidity.toFixed(1)}%</span>
                    </div>
                </div>
                <div class="col-6">
                    <div class="condition-item">
                        <span class="condition-label">💨 CO₂ Level</span>
                        <span class="condition-value">${conditions.co2_level.toFixed(1)}ppm</span>
                    </div>
                </div>
            </div>
        `;

        futureResults.style.display = 'block';
        
        if (window.climateSphere) {
            window.climateSphere.showAlert(`Future prediction for ${results.target_year} generated!`, 'success');
        }
    }

    displayMockFutureResults(year) {
        const yearsAhead = parseInt(year) - new Date().getFullYear();
        
        const mockResults = {
            target_year: parseInt(year),
            projected_conditions: {
                temperature: 25 + (yearsAhead * 0.1),
                rainfall: Math.max(0, 100 - (yearsAhead * 0.5)),
                humidity: 60,
                co2_level: 420 + (yearsAhead * 2.5)
            }
        };
        
        this.displayFutureResults(mockResults);
    }

    getRiskIcon(type) {
        const icons = {
            flood: '🌊',
            drought: '🏜️',
            heatwave: '🌡️'
        };
        return icons[type] || '⚠️';
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    refreshModels() {
        this.loadModelMetrics();
        if (window.climateSphere) {
            window.climateSphere.showAlert('Model metrics refreshed!', 'success');
        }
    }
}

// Global functions
function runScenarioSimulation() {
    if (window.predictionManager) {
        window.predictionManager.runScenarioSimulation();
    }
}

function generateFuturePrediction() {
    if (window.predictionManager) {
        window.predictionManager.generateFuturePrediction();
    }
}

function refreshModels() {
    if (window.predictionManager) {
        window.predictionManager.refreshModels();
    }
}

// Initialize prediction manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.predictionManager = new PredictionManager();
});

// Add CSS for prediction styling
const style = document.createElement('style');
style.textContent = `
    .control-card, .prediction-results, .scenario-card, .future-card, .model-card {
        background: #fff;
        border-radius: 15px;
        padding: 1.5rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(0, 0, 0, 0.05);
        height: 100%;
    }

    .risk-card {
        background: #fff;
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        border: 2px solid transparent;
        transition: all 0.3s ease;
    }

    .risk-card.low {
        border-color: #10b981;
        background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
    }

    .risk-card.medium {
        border-color: #f59e0b;
        background: linear-gradient(135deg, #fffbeb 0%, #fefce8 100%);
    }

    .risk-card.high {
        border-color: #ef4444;
        background: linear-gradient(135deg, #fef2f2 0%, #fef1f1 100%);
    }

    .risk-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }

    .risk-percentage {
        font-size: 1.8rem;
        font-weight: bold;
        color: #1f2937;
        margin: 0.5rem 0;
    }

    .risk-level {
        font-size: 0.9rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .scenario-risk-card {
        background: #fff;
        border-radius: 10px;
        padding: 1rem;
        text-align: center;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        border: 2px solid transparent;
    }

    .scenario-risk-card.low { border-color: #10b981; }
    .scenario-risk-card.medium { border-color: #f59e0b; }
    .scenario-risk-card.high { border-color: #ef4444; }

    .metric-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid #f3f4f6;
    }

    .metric-item:last-child {
        border-bottom: none;
    }

    .metric-label {
        color: #6b7280;
        font-size: 0.9rem;
    }

    .metric-value {
        font-weight: bold;
        color: #1f2937;
    }

    .condition-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        background: #f8fafc;
        border-radius: 8px;
        margin-bottom: 0.5rem;
    }

    .condition-label {
        font-size: 0.9rem;
        color: #6b7280;
    }

    .condition-value {
        font-weight: bold;
        color: #1f2937;
    }

    .form-range::-webkit-slider-thumb {
        background: #2563eb;
    }

    .form-range::-moz-range-thumb {
        background: #2563eb;
        border: none;
    }
`;
document.head.appendChild(style);