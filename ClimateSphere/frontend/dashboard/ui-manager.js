/**
 * UI Manager Module
 * Handles all user interface updates and display
 */

console.log('🎨 Loading UI Manager Module...');

window.UIManager = {
    
    // Show analysis progress
    showProgress() {
        const uploadSection = document.getElementById('upload-section');
        if (!uploadSection) return;
        
        // Remove existing results
        const existing = document.getElementById('realAIResults');
        if (existing) existing.remove();
        
        const progressHTML = `
            <div id="realAIResults" class="real-ai-results">
                <h3>🤖 Analyzing Data with Trained AI Models...</h3>
                <div class="ai-progress">
                    <div class="model-step" id="step-flood">
                        <i class="fas fa-water"></i>
                        <span>Flood Risk Model</span>
                        <div class="status">⏳ Processing...</div>
                    </div>
                    <div class="model-step" id="step-drought">
                        <i class="fas fa-sun"></i>
                        <span>Drought Analysis Model</span>
                        <div class="status">⏳ Waiting...</div>
                    </div>
                    <div class="model-step" id="step-heatwave">
                        <i class="fas fa-thermometer-full"></i>
                        <span>Heatwave Detection Model</span>
                        <div class="status">⏳ Waiting...</div>
                    </div>
                    <div class="model-step" id="step-trends">
                        <i class="fas fa-chart-line"></i>
                        <span>Climate Trends Analysis</span>
                        <div class="status">⏳ Waiting...</div>
                    </div>
                </div>
            </div>
        `;
        
        uploadSection.insertAdjacentHTML('afterend', progressHTML);
        document.getElementById('realAIResults').scrollIntoView({ behavior: 'smooth' });
    },
    
    // Update model status
    updateModelStatus(stepId, status, className) {
        const step = document.getElementById(stepId);
        if (step) {
            const statusEl = step.querySelector('.status');
            if (statusEl) {
                statusEl.textContent = status;
                statusEl.className = `status ${className}`;
            }
        }
    },
    
    // Display analysis results
    displayResults(results, originalData) {
        console.log('📊 Displaying AI analysis results');
        
        const container = document.getElementById('realAIResults');
        if (!container) return;
        
        // Hide progress, show results
        const progress = container.querySelector('.ai-progress');
        if (progress) progress.style.display = 'none';
        
        const resultsHTML = this.generateResultsHTML(results, originalData);
        container.innerHTML += resultsHTML;
        
        // Update summary cards
        this.updateSummaryCards(results);
    },
    
    // Generate results HTML
    generateResultsHTML(results, originalData) {
        const models = results.models;
        
        return `
            <div class="real-results-content">
                <h3>🎯 AI Analysis Results - Based on Your Data</h3>
                <div class="data-summary">
                    <p><strong>Analyzed:</strong> ${results.dataPoints} data records</p>
                    <p><strong>Temperature:</strong> ${results.metrics.temperature.min.toFixed(1)}°C to ${results.metrics.temperature.max.toFixed(1)}°C (avg: ${results.metrics.temperature.average.toFixed(1)}°C)</p>
                    <p><strong>Rainfall:</strong> ${results.metrics.rainfall.total.toFixed(1)}mm total (avg: ${results.metrics.rainfall.average.toFixed(1)}mm)</p>
                    <p><strong>Humidity:</strong> ${results.metrics.humidity.average.toFixed(1)}% average</p>
                </div>
                
                <div class="model-results-real">
                    ${Object.keys(models).map(modelName => `
                        <div class="model-result-real ${modelName}">
                            <h4>${this.getModelTitle(modelName)}</h4>
                            <div class="risk-level-real ${models[modelName].risk_level?.toLowerCase() || 'unknown'}">
                                ${models[modelName].risk_level || 'Unknown'} Risk
                            </div>
                            <div class="probability">
                                Probability: ${((models[modelName].risk_probability || 0) * 100).toFixed(1)}%
                            </div>
                            <p class="model-note">${models[modelName].note || this.getModelDescription(modelName, models[modelName])}</p>
                        </div>
                    `).join('')}
                </div>
                
                <div class="recommendations-real">
                    <h4>📋 Recommendations Based on Your Data</h4>
                    ${this.generateRecommendations(results)}
                </div>
            </div>
        `;
    },
    
    // Get model title
    getModelTitle(modelName) {
        const titles = {
            flood: '🌊 Flood Risk Analysis',
            drought: '🏜️ Drought Assessment', 
            heatwave: '🔥 Heatwave Detection',
            trends: '📈 Climate Trends'
        };
        return titles[modelName] || modelName;
    },
    
    // Get model description
    getModelDescription(modelName, result) {
        const descriptions = {
            flood: 'Based on rainfall patterns in your data, flood risk assessment complete.',
            drought: 'Analysis of precipitation and temperature data indicates drought conditions.',
            heatwave: 'Temperature pattern analysis reveals heatwave risk levels.',
            trends: `Trend analysis shows ${result.trend_direction?.toLowerCase() || 'stable'} climate patterns.`
        };
        return descriptions[modelName] || 'Analysis complete.';
    },
    
    // Generate recommendations
    generateRecommendations(results) {
        const recommendations = [];
        const models = results.models;
        
        if (models.flood?.risk_level === 'High') {
            recommendations.push('• Implement flood preparedness measures');
        }
        if (models.drought?.risk_level === 'High') {
            recommendations.push('• Activate water conservation protocols');
        }
        if (models.heatwave?.risk_level === 'High') {
            recommendations.push('• Prepare heat emergency response');
        }
        if (models.trends?.trend_direction === 'Warming') {
            recommendations.push('• Update climate adaptation strategies');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('• Continue regular monitoring protocols');
        }
        
        return `<ul>${recommendations.join('\n')}</ul>`;
    },
    
    // Update summary cards with real data
    updateSummaryCards(results) {
        const models = results.models;
        
        const highRisk = Object.values(models).filter(m => m.risk_level === 'High').length;
        const mediumRisk = Object.values(models).filter(m => m.risk_level === 'Medium').length;
        const lowRisk = Object.values(models).filter(m => m.risk_level === 'Low').length;
        
        // Calculate average confidence from risk probabilities
        const validModels = Object.values(models).filter(m => m.risk_probability !== undefined);
        const avgConfidence = validModels.length > 0 ? 
            validModels.reduce((sum, m) => sum + (m.risk_probability || 0), 0) / validModels.length : 0;
        
        // Calculate total risk events (high + medium risks)
        const totalRiskEvents = highRisk + mediumRisk;
        
        const updates = {
            'highRiskCount': totalRiskEvents.toString(),
            'mediumRiskCount': lowRisk.toString(),
            'confidenceScore': `${(avgConfidence * 100).toFixed(1)}%`,
            'dataPointsCount': results.dataPoints.toString()
        };
        
        console.log('📊 Updating summary cards with real data:', updates);
        
        Object.keys(updates).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = updates[id];
                console.log(`✅ Updated ${id}: ${updates[id]}`);
            } else {
                console.warn(`⚠️ Element ${id} not found`);
            }
        });
        
        // Force update the main summary section
        this.updateMainSummary(results);
    },
    
    // Update main summary section
    updateMainSummary(results) {
        const summarySection = document.querySelector('.overall-assessment') || 
                              document.querySelector('.climate-assessment') ||
                              document.querySelector('#resultsSummary');
        
        if (summarySection) {
            const models = results.models;
            const highRisk = Object.values(models).filter(m => m.risk_level === 'High').length;
            const mediumRisk = Object.values(models).filter(m => m.risk_level === 'Medium').length;
            const validModels = Object.values(models).filter(m => m.risk_probability !== undefined);
            const avgConfidence = validModels.length > 0 ? 
                validModels.reduce((sum, m) => sum + (m.risk_probability || 0), 0) / validModels.length : 0;
            
            // Update the summary numbers
            const summaryNumbers = summarySection.querySelectorAll('.stat-number, .assessment-number');
            if (summaryNumbers.length >= 3) {
                summaryNumbers[0].textContent = (highRisk + mediumRisk).toString();
                summaryNumbers[1].textContent = `${(avgConfidence * 100).toFixed(1)}%`;
                summaryNumbers[2].textContent = results.dataPoints.toString();
            }
            
            console.log('✅ Updated main summary section');
        }
    },
    
    // Show error message
    showError(message) {
        const container = document.getElementById('realAIResults');
        if (container) {
            container.innerHTML = `
                <div class="analysis-error">
                    <h3>❌ Analysis Error</h3>
                    <p>Error: ${message}</p>
                    <button onclick="location.reload()">Try Again</button>
                </div>
            `;
        }
    }
};

console.log('✅ UI Manager Module loaded');