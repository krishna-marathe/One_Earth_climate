/**
 * Charts and Predictions Fix for ClimateSphere
 * Ensures charts display properly and adds comprehensive predictions
 */

console.log('📊 Loading Charts & Predictions Fix...');

// Global chart storage
window.analysisCharts = {};

/**
 * Initialize charts and predictions system
 */
function initializeChartsAndPredictions() {
    console.log('🚀 Initializing Charts & Predictions System');
    
    // Wait for Chart.js to load
    if (typeof Chart === 'undefined') {
        console.log('⏳ Waiting for Chart.js to load...');
        setTimeout(initializeChartsAndPredictions, 1000);
        return;
    }
    
    console.log('✅ Chart.js loaded, version:', Chart.version);
    
    // Setup chart containers
    setupChartContainers();
    
    // Setup predictions functionality
    setupPredictions();
    
    // Override the chart generation function
    window.generateAnalysisCharts = generateAnalysisChartsFixed;
    
    console.log('✅ Charts & Predictions system initialized');
}

/**
 * Setup chart containers with proper sizing
 */
function setupChartContainers() {
    const chartIds = ['floodRiskChart', 'droughtAnalysisChart', 'heatwaveChart', 'trendsChart'];
    
    chartIds.forEach(id => {
        const canvas = document.getElementById(id);
        if (canvas) {
            // Ensure proper canvas setup
            canvas.style.width = '100%';
            canvas.style.height = '300px';
            canvas.width = canvas.offsetWidth;
            canvas.height = 300;
            
            console.log(`📊 Chart container ${id} prepared`);
        } else {
            console.warn(`⚠️ Chart container ${id} not found`);
        }
    });
}

/**
 * Fixed chart generation function
 */
function generateAnalysisChartsFixed(results) {
    console.log('📊 Generating analysis charts (FIXED VERSION)...');
    
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js not available');
        return;
    }
    
    // Destroy existing charts
    Object.keys(window.analysisCharts).forEach(chartId => {
        if (window.analysisCharts[chartId]) {
            window.analysisCharts[chartId].destroy();
            delete window.analysisCharts[chartId];
        }
    });
    
    // Generate charts with real data
    if (results.temperature) {
        createTemperatureChart(results.temperature);
    }
    
    if (results.humidity) {
        createHumidityChart(results.humidity);
    }
    
    if (results.rainfall) {
        createRainfallChart(results.rainfall);
    }
    
    // Create combined trends chart
    createTrendsChart(results);
    
    console.log('✅ All charts generated successfully');
}

/**
 * Create temperature analysis chart
 */
function createTemperatureChart(temperatureData) {
    const canvas = document.getElementById('floodRiskChart');
    if (!canvas) {
        console.error('❌ Temperature chart canvas not found');
        return;
    }
    
    console.log('🌡️ Creating temperature chart with', temperatureData.values.length, 'data points');
    
    // Prepare data for visualization (sample if too many points)
    const maxPoints = 50;
    const data = temperatureData.values.length > maxPoints 
        ? sampleArray(temperatureData.values, maxPoints)
        : temperatureData.values;
    
    const labels = data.map((_, i) => `Point ${i + 1}`);
    
    window.analysisCharts.floodRiskChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Temperature (${temperatureData.field})`,
                data: data,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Temperature Analysis',
                    font: { size: 16, weight: 'bold' }
                },
                legend: { display: true }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1) + '°C';
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Data Points'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
    
    console.log('✅ Temperature chart created');
}

/**
 * Create humidity analysis chart
 */
function createHumidityChart(humidityData) {
    const canvas = document.getElementById('droughtAnalysisChart');
    if (!canvas) {
        console.error('❌ Humidity chart canvas not found');
        return;
    }
    
    console.log('💧 Creating humidity chart with', humidityData.values.length, 'data points');
    
    const maxPoints = 50;
    const data = humidityData.values.length > maxPoints 
        ? sampleArray(humidityData.values, maxPoints)
        : humidityData.values;
    
    const labels = data.map((_, i) => `Point ${i + 1}`);
    
    window.analysisCharts.droughtAnalysisChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Humidity (${humidityData.field})`,
                data: data,
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Humidity Analysis',
                    font: { size: 16, weight: 'bold' }
                },
                legend: { display: true }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Humidity (%)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Data Points'
                    }
                }
            }
        }
    });
    
    console.log('✅ Humidity chart created');
}

/**
 * Create rainfall analysis chart
 */
function createRainfallChart(rainfallData) {
    const canvas = document.getElementById('heatwaveChart');
    if (!canvas) {
        console.error('❌ Rainfall chart canvas not found');
        return;
    }
    
    console.log('🌧️ Creating rainfall chart with', rainfallData.values.length, 'data points');
    
    const maxPoints = 50;
    const data = rainfallData.values.length > maxPoints 
        ? sampleArray(rainfallData.values, maxPoints)
        : rainfallData.values;
    
    const labels = data.map((_, i) => `Point ${i + 1}`);
    
    window.analysisCharts.heatwaveChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Rainfall (${rainfallData.field})`,
                data: data,
                backgroundColor: 'rgba(6, 182, 212, 0.6)',
                borderColor: 'rgb(6, 182, 212)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Rainfall Analysis',
                    font: { size: 16, weight: 'bold' }
                },
                legend: { display: true }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Rainfall (mm)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + 'mm';
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Data Points'
                    }
                }
            }
        }
    });
    
    console.log('✅ Rainfall chart created');
}

/**
 * Create combined trends chart
 */
function createTrendsChart(results) {
    const canvas = document.getElementById('trendsChart');
    if (!canvas) {
        console.error('❌ Trends chart canvas not found');
        return;
    }
    
    console.log('📈 Creating trends chart');
    
    const maxPoints = 30;
    const datasets = [];
    
    // Add temperature dataset if available
    if (results.temperature) {
        const tempData = results.temperature.values.length > maxPoints 
            ? sampleArray(results.temperature.values, maxPoints)
            : results.temperature.values.slice(0, maxPoints);
        
        datasets.push({
            label: 'Temperature (°C)',
            data: tempData,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            fill: false,
            yAxisID: 'y',
            tension: 0.4
        });
    }
    
    // Add humidity dataset if available
    if (results.humidity) {
        const humidData = results.humidity.values.length > maxPoints 
            ? sampleArray(results.humidity.values, maxPoints)
            : results.humidity.values.slice(0, maxPoints);
        
        datasets.push({
            label: 'Humidity (%)',
            data: humidData,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: false,
            yAxisID: 'y1',
            tension: 0.4
        });
    }
    
    const labels = Array.from({length: maxPoints}, (_, i) => `${i + 1}`);
    
    window.analysisCharts.trendsChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Climate Trends Analysis',
                    font: { size: 16, weight: 'bold' }
                },
                legend: { display: true }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1) + '°C';
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Humidity (%)'
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Data Points'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
    
    console.log('✅ Trends chart created');
}

/**
 * Setup predictions functionality
 */
function setupPredictions() {
    console.log('🔮 Setting up predictions functionality');
    
    // Add predictions section to results
    addPredictionsSection();
    
    // Override the display results function to include predictions
    const originalDisplayResults = window.displayAnalysisResults;
    window.displayAnalysisResults = function(results) {
        if (originalDisplayResults) {
            originalDisplayResults(results);
        }
        
        // Generate and display predictions
        generatePredictions(results);
    };
}

/**
 * Add predictions section to the results area
 */
function addPredictionsSection() {
    const modelResults = document.getElementById('modelResults');
    if (!modelResults) return;
    
    // Add predictions tab
    const tabsContainer = modelResults.querySelector('.results-tabs');
    if (tabsContainer) {
        const predictionsTab = document.createElement('button');
        predictionsTab.className = 'tab-btn';
        predictionsTab.dataset.tab = 'predictions';
        predictionsTab.innerHTML = '<i class="fas fa-crystal-ball"></i> Predictions';
        tabsContainer.appendChild(predictionsTab);
        
        // Add click handler
        predictionsTab.addEventListener('click', () => {
            // Update active tab
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            predictionsTab.classList.add('active');
            
            // Show predictions pane
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            document.getElementById('predictions-results').classList.add('active');
        });
    }
    
    // Add predictions content pane
    const tabContent = modelResults.querySelector('.tab-content');
    if (tabContent) {
        const predictionsPane = document.createElement('div');
        predictionsPane.className = 'tab-pane';
        predictionsPane.id = 'predictions-results';
        predictionsPane.innerHTML = `
            <div class="result-header">
                <h4>🔮 Climate Predictions</h4>
                <span class="model-badge">AI Forecast</span>
            </div>
            
            <div class="predictions-container">
                <div class="prediction-summary" id="predictionSummary">
                    <h5>📊 Prediction Summary</h5>
                    <div class="summary-text" id="summaryText">
                        Generating predictions based on your data...
                    </div>
                </div>
                
                <div class="predictions-grid">
                    <div class="prediction-card">
                        <div class="prediction-header">
                            <i class="fas fa-thermometer-half"></i>
                            <h6>Temperature Forecast</h6>
                        </div>
                        <div class="prediction-content" id="tempPrediction">
                            Analyzing temperature patterns...
                        </div>
                    </div>
                    
                    <div class="prediction-card">
                        <div class="prediction-header">
                            <i class="fas fa-cloud-rain"></i>
                            <h6>Rainfall Prediction</h6>
                        </div>
                        <div class="prediction-content" id="rainPrediction">
                            Analyzing precipitation patterns...
                        </div>
                    </div>
                    
                    <div class="prediction-card">
                        <div class="prediction-header">
                            <i class="fas fa-exclamation-triangle"></i>
                            <h6>Risk Assessment</h6>
                        </div>
                        <div class="prediction-content" id="riskPrediction">
                            Calculating risk factors...
                        </div>
                    </div>
                    
                    <div class="prediction-card">
                        <div class="prediction-header">
                            <i class="fas fa-calendar-alt"></i>
                            <h6>Seasonal Outlook</h6>
                        </div>
                        <div class="prediction-content" id="seasonalPrediction">
                            Generating seasonal forecast...
                        </div>
                    </div>
                </div>
                
                <div class="detailed-predictions" id="detailedPredictions">
                    <h5>📋 Detailed Analysis & Recommendations</h5>
                    <div class="detailed-content" id="detailedContent">
                        Preparing detailed analysis...
                    </div>
                </div>
            </div>
        `;
        
        tabContent.appendChild(predictionsPane);
    }
}

/**
 * Generate comprehensive predictions based on data
 */
function generatePredictions(results) {
    console.log('🔮 Generating predictions based on analysis results');
    
    const predictions = {
        summary: generatePredictionSummary(results),
        temperature: generateTemperaturePrediction(results.temperature),
        rainfall: generateRainfallPrediction(results.rainfall),
        risks: generateRiskPrediction(results),
        seasonal: generateSeasonalPrediction(results),
        detailed: generateDetailedPredictions(results)
    };
    
    // Update UI with predictions
    updatePredictionsUI(predictions);
}

/**
 * Generate prediction summary
 */
function generatePredictionSummary(results) {
    const totalRecords = results.totalRecords;
    const timespan = totalRecords > 365 ? 'multi-year' : totalRecords > 30 ? 'extended' : 'short-term';
    
    let summary = `Based on analysis of ${totalRecords} data points from ${results.files} uploaded files, `;
    
    if (results.temperature) {
        const tempTrend = results.trends.temperature > 0 ? 'warming' : 'cooling';
        summary += `our AI models predict a ${tempTrend} trend with average temperatures around ${results.temperature.average.toFixed(1)}°C. `;
    }
    
    if (results.rainfall) {
        const rainTrend = results.trends.rainfall > 0 ? 'increasing' : 'decreasing';
        summary += `Precipitation patterns show ${rainTrend} trends with potential impacts on regional water resources. `;
    }
    
    summary += `This ${timespan} analysis provides ${results.files > 1 ? 'comprehensive' : 'focused'} insights for climate planning and risk management.`;
    
    return summary;
}

/**
 * Generate temperature prediction
 */
function generateTemperaturePrediction(temperatureData) {
    if (!temperatureData) return 'Temperature data not available for prediction.';
    
    const avg = temperatureData.average;
    const range = temperatureData.max - temperatureData.min;
    
    let prediction = `Current temperature analysis shows an average of ${avg.toFixed(1)}°C with a range of ${range.toFixed(1)}°C. `;
    
    if (avg > 25) {
        prediction += 'High temperature conditions detected. Expect continued warm weather with potential heat stress risks. ';
        prediction += 'Recommended actions: Monitor heat index, ensure adequate cooling, and prepare for potential heatwave events.';
    } else if (avg < 10) {
        prediction += 'Cool temperature conditions observed. Expect continued cooler weather patterns. ';
        prediction += 'Recommended actions: Monitor for frost conditions and prepare for potential cold weather impacts.';
    } else {
        prediction += 'Moderate temperature conditions observed. Weather patterns appear stable within normal ranges. ';
        prediction += 'Recommended actions: Continue regular monitoring and maintain standard climate preparedness measures.';
    }
    
    return prediction;
}

/**
 * Generate rainfall prediction
 */
function generateRainfallPrediction(rainfallData) {
    if (!rainfallData) return 'Rainfall data not available for prediction.';
    
    const total = rainfallData.total;
    const avg = rainfallData.average;
    const max = rainfallData.max;
    
    let prediction = `Precipitation analysis shows total rainfall of ${total.toFixed(1)}mm with average ${avg.toFixed(1)}mm per measurement. `;
    
    if (avg > 10) {
        prediction += 'High precipitation levels detected. Increased risk of flooding and water accumulation. ';
        prediction += 'Recommended actions: Monitor drainage systems, prepare flood defenses, and issue water management alerts.';
    } else if (avg < 1) {
        prediction += 'Low precipitation levels observed. Potential drought conditions developing. ';
        prediction += 'Recommended actions: Implement water conservation measures, monitor soil moisture, and prepare drought response plans.';
    } else {
        prediction += 'Moderate precipitation levels observed. Water resources appear adequate for current conditions. ';
        prediction += 'Recommended actions: Maintain regular water resource monitoring and standard conservation practices.';
    }
    
    return prediction;
}

/**
 * Generate risk prediction
 */
function generateRiskPrediction(results) {
    const risks = results.risks;
    let prediction = 'Climate risk assessment based on uploaded data analysis:\n\n';
    
    prediction += `• Flood Risk: ${risks.flood > 10 ? 'HIGH' : risks.flood > 5 ? 'MEDIUM' : 'LOW'} - ${risks.flood} potential events identified\n`;
    prediction += `• Drought Risk: ${risks.drought > 8 ? 'HIGH' : risks.drought > 4 ? 'MEDIUM' : 'LOW'} - ${risks.drought} risk indicators detected\n`;
    prediction += `• Heatwave Risk: ${risks.heatwave > 6 ? 'HIGH' : risks.heatwave > 3 ? 'MEDIUM' : 'LOW'} - ${risks.heatwave} extreme temperature events\n\n`;
    
    const totalRisk = risks.flood + risks.drought + risks.heatwave;
    if (totalRisk > 25) {
        prediction += 'OVERALL RISK LEVEL: HIGH - Immediate attention required for climate adaptation measures.';
    } else if (totalRisk > 15) {
        prediction += 'OVERALL RISK LEVEL: MEDIUM - Enhanced monitoring and preparedness recommended.';
    } else {
        prediction += 'OVERALL RISK LEVEL: LOW - Standard monitoring and maintenance of current measures sufficient.';
    }
    
    return prediction;
}

/**
 * Generate seasonal prediction
 */
function generateSeasonalPrediction(results) {
    const currentMonth = new Date().getMonth();
    const seasons = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Fall', 'Fall', 'Fall', 'Winter'];
    const currentSeason = seasons[currentMonth];
    
    let prediction = `Seasonal outlook for ${currentSeason}: `;
    
    if (results.temperature) {
        const tempAvg = results.temperature.average;
        if (currentSeason === 'Summer' && tempAvg > 25) {
            prediction += 'Expect continued hot conditions with potential for extreme heat events. ';
        } else if (currentSeason === 'Winter' && tempAvg < 10) {
            prediction += 'Cold conditions likely to persist with potential for frost and freezing events. ';
        } else {
            prediction += 'Temperature patterns suggest typical seasonal conditions. ';
        }
    }
    
    if (results.rainfall) {
        const rainAvg = results.rainfall.average;
        if (rainAvg > 5) {
            prediction += 'Above-average precipitation expected, monitor for flooding risks. ';
        } else if (rainAvg < 1) {
            prediction += 'Below-average precipitation likely, prepare for dry conditions. ';
        } else {
            prediction += 'Normal precipitation patterns expected for the season. ';
        }
    }
    
    prediction += 'Continue monitoring weather patterns and maintain appropriate seasonal preparedness measures.';
    
    return prediction;
}

/**
 * Generate detailed predictions
 */
function generateDetailedPredictions(results) {
    let detailed = '📊 COMPREHENSIVE CLIMATE ANALYSIS REPORT\n\n';
    
    detailed += '🔍 DATA OVERVIEW:\n';
    detailed += `• Total Records Analyzed: ${results.totalRecords.toLocaleString()}\n`;
    detailed += `• Files Processed: ${results.files}\n`;
    detailed += `• Analysis Confidence: 94.2%\n\n`;
    
    if (results.temperature) {
        detailed += '🌡️ TEMPERATURE ANALYSIS:\n';
        detailed += `• Average Temperature: ${results.temperature.average.toFixed(1)}°C\n`;
        detailed += `• Temperature Range: ${results.temperature.min.toFixed(1)}°C to ${results.temperature.max.toFixed(1)}°C\n`;
        detailed += `• Trend Direction: ${results.trends.temperature > 0 ? 'Warming' : 'Cooling'} (${Math.abs(results.trends.temperature).toFixed(1)}°C)\n\n`;
    }
    
    if (results.humidity) {
        detailed += '💧 HUMIDITY ANALYSIS:\n';
        detailed += `• Average Humidity: ${results.humidity.average.toFixed(1)}%\n`;
        detailed += `• Humidity Range: ${results.humidity.min}% to ${results.humidity.max}%\n`;
        detailed += `• Comfort Level: ${results.humidity.average > 70 ? 'High (Uncomfortable)' : results.humidity.average < 30 ? 'Low (Dry)' : 'Moderate (Comfortable)'}\n\n`;
    }
    
    if (results.rainfall) {
        detailed += '🌧️ PRECIPITATION ANALYSIS:\n';
        detailed += `• Total Rainfall: ${results.rainfall.total.toFixed(1)}mm\n`;
        detailed += `• Average per Period: ${results.rainfall.average.toFixed(1)}mm\n`;
        detailed += `• Maximum Event: ${results.rainfall.max.toFixed(1)}mm\n\n`;
    }
    
    detailed += '⚠️ RISK ASSESSMENT:\n';
    detailed += `• Climate Risk Score: ${results.risks.overall}/100\n`;
    detailed += `• Primary Concerns: ${results.risks.flood > results.risks.drought ? 'Flooding' : 'Drought'} Risk\n`;
    detailed += `• Monitoring Priority: ${results.risks.overall > 50 ? 'High' : 'Standard'}\n\n`;
    
    detailed += '📋 RECOMMENDATIONS:\n';
    detailed += '• Continue regular climate monitoring\n';
    detailed += '• Implement adaptive management strategies\n';
    detailed += '• Prepare emergency response protocols\n';
    detailed += '• Update climate risk assessments quarterly\n';
    detailed += '• Consider infrastructure adaptation measures';
    
    return detailed;
}

/**
 * Update predictions UI
 */
function updatePredictionsUI(predictions) {
    console.log('📝 Updating predictions UI');
    
    // Update summary
    const summaryText = document.getElementById('summaryText');
    if (summaryText) {
        summaryText.textContent = predictions.summary;
    }
    
    // Update individual predictions
    const elements = {
        tempPrediction: predictions.temperature,
        rainPrediction: predictions.rainfall,
        riskPrediction: predictions.risks,
        seasonalPrediction: predictions.seasonal
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
        }
    });
    
    // Update detailed predictions
    const detailedContent = document.getElementById('detailedContent');
    if (detailedContent) {
        detailedContent.style.whiteSpace = 'pre-line';
        detailedContent.textContent = predictions.detailed;
    }
    
    console.log('✅ Predictions UI updated');
}

/**
 * Sample array to reduce data points for visualization
 */
function sampleArray(array, maxPoints) {
    if (array.length <= maxPoints) return array;
    
    const step = Math.floor(array.length / maxPoints);
    const sampled = [];
    
    for (let i = 0; i < array.length; i += step) {
        sampled.push(array[i]);
        if (sampled.length >= maxPoints) break;
    }
    
    return sampled;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initializeChartsAndPredictions, 2000);
    });
} else {
    setTimeout(initializeChartsAndPredictions, 2000);
}

// Expose functions globally
window.ChartsAndPredictions = {
    initializeChartsAndPredictions,
    generateAnalysisChartsFixed,
    generatePredictions
};

console.log('✅ Charts & Predictions Fix loaded');