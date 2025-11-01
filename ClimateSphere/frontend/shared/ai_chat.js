// Enhanced AI Chat System for ClimateSphere
// Supports specialized responses for farmers and disaster response teams

class ClimateSphereAIChat {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3000/api';
        this.chatHistory = [];
        this.userProfile = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // Get user profile to understand user type
            this.userProfile = await this.getUserProfile();
            this.isInitialized = true;
            console.log('AI Chat initialized successfully');
        } catch (error) {
            console.error('Failed to initialize AI Chat:', error);
            this.isInitialized = false;
        }
    }

    async getUserProfile() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;

            const response = await fetch(`${this.apiBaseUrl}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to get user profile:', error);
        }
        return null;
    }

    async sendMessage(message, context = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const token = localStorage.getItem('token');
            
            // Add message to history
            this.chatHistory.push({
                message,
                sender: 'user',
                timestamp: new Date().toISOString()
            });

            // Use demo endpoint if no token available
            const endpoint = token ? '/insights/chat' : '/insights/demo/chat';
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    message,
                    context: {
                        ...context,
                        chatHistory: this.chatHistory.slice(-5), // Last 5 messages for context
                        userProfile: this.userProfile
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const aiResponse = await response.json();
            
            // Add AI response to history
            this.chatHistory.push({
                message: aiResponse.message,
                sender: 'ai',
                timestamp: aiResponse.timestamp,
                metadata: {
                    userType: aiResponse.user_type,
                    riskType: aiResponse.risk_type,
                    cropType: aiResponse.crop_type,
                    specializedAdvice: aiResponse.specialized_advice,
                    riskPredictions: aiResponse.risk_predictions,
                    confidenceScore: aiResponse.confidence_score
                }
            });

            return this.formatAIResponse(aiResponse);

        } catch (error) {
            console.error('Chat API error:', error);
            
            // Fallback to local response
            return this.generateFallbackResponse(message);
        }
    }

    formatAIResponse(aiResponse) {
        let formattedMessage = aiResponse.message;

        // Add specialized advice if available
        if (aiResponse.specialized_advice && aiResponse.specialized_advice.length > 0) {
            formattedMessage += '\n\n🎯 **Specific Recommendations:**\n';
            aiResponse.specialized_advice.forEach((advice, index) => {
                formattedMessage += `${index + 1}. ${advice}\n`;
            });
        }

        // Add risk predictions if available
        if (aiResponse.risk_predictions) {
            const risk = aiResponse.risk_predictions;
            formattedMessage += `\n\n📊 **Risk Assessment:**\n`;
            formattedMessage += `• Risk Type: ${risk.risk_type}\n`;
            formattedMessage += `• Probability: ${(risk.probability * 100).toFixed(1)}%\n`;
            formattedMessage += `• Severity: ${risk.severity}\n`;
            formattedMessage += `• Timeframe: ${risk.timeframe}\n`;
        }

        // Add confidence score
        if (aiResponse.confidence_score) {
            formattedMessage += `\n\n🎯 Confidence: ${(aiResponse.confidence_score * 100).toFixed(1)}%`;
        }

        return formattedMessage;
    }

    generateFallbackResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Farmer-specific fallbacks
        if (lowerMessage.includes('crop') || lowerMessage.includes('farm')) {
            if (lowerMessage.includes('drought') || lowerMessage.includes('dry')) {
                return `For drought conditions affecting your crops, I recommend:

1. **Immediate Actions:**
   • Switch to drought-resistant crop varieties
   • Implement drip irrigation systems
   • Apply mulching to retain soil moisture

2. **Water Management:**
   • Use soil moisture sensors for precise irrigation
   • Consider rainwater harvesting
   • Implement alternate wetting and drying for rice

3. **Crop Selection:**
   • Consider drought-tolerant varieties like Sahbhagi Dhan for rice
   • Intercrop with legumes to improve soil health

Would you like specific advice for your crop type?`;
            }
            
            if (lowerMessage.includes('flood') || lowerMessage.includes('water')) {
                return `For flood protection of your crops, here are key recommendations:

1. **Preventive Measures:**
   • Create proper drainage channels
   • Plant on raised beds to prevent waterlogging
   • Choose flood-tolerant varieties if available

2. **Emergency Response:**
   • Harvest early if flooding is predicted
   • Move equipment to higher ground
   • Apply fungicides post-flood to prevent diseases

3. **Recovery:**
   • Assess crop damage systematically
   • Replant with quick-growing varieties if needed
   • Focus on soil health restoration

What specific crop are you growing?`;
            }
        }

        // Disaster response fallbacks
        if (lowerMessage.includes('district') || lowerMessage.includes('emergency') || lowerMessage.includes('response')) {
            return `For disaster response planning, here are immediate actions:

1. **Risk Assessment:**
   • Monitor weather forecasts continuously
   • Identify high-risk areas and vulnerable populations
   • Coordinate with meteorological departments

2. **Emergency Preparedness:**
   • Activate early warning systems
   • Deploy response teams to strategic locations
   • Ensure communication channels are operational

3. **Resource Management:**
   • Pre-position emergency supplies
   • Coordinate with local authorities
   • Prepare evacuation routes and shelters

Which specific risk type are you concerned about? (flood, drought, heatwave)`;
        }

        // General climate questions
        return `I'm here to help with climate-related questions. I can assist with:

🌾 **For Farmers:**
• Crop-specific climate adaptation strategies
• Irrigation and water management advice
• Drought and flood mitigation techniques

🚨 **For Disaster Response:**
• Risk assessment and early warning systems
• Emergency response protocols
• District-wise vulnerability analysis

🌍 **General Climate Insights:**
• Climate trend analysis
• Risk predictions and scenarios
• Adaptation and mitigation strategies

Please provide more specific details about your situation, and I'll give you targeted recommendations.`;
    }

    getSuggestedQuestions() {
        const suggestions = [
            // Farmer questions
            "My crop is maize and rainfall has been low - what can I do?",
            "How can I protect my rice fields from flooding?",
            "What drought-resistant crops should I consider?",
            "When should I irrigate based on weather forecasts?",
            
            // Disaster response questions
            "Which districts face high flood risk this week?",
            "What's the emergency response protocol for heatwaves?",
            "How do I set up early warning systems?",
            "What are the evacuation procedures for coastal areas?",
            
            // General questions
            "What are the climate trends for my region?",
            "How will climate change affect agriculture?",
            "What adaptation strategies work best?",
            "Show me the latest risk predictions"
        ];

        // Shuffle and return 6 random suggestions
        return suggestions.sort(() => 0.5 - Math.random()).slice(0, 6);
    }

    async getDistrictRiskAssessment(riskType = 'flood', timeframe = '7 days') {
        try {
            const token = localStorage.getItem('token');
            
            // Use demo endpoint if no token available
            const endpoint = token ? '/insights/districts' : '/insights/demo/districts';
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${this.apiBaseUrl}${endpoint}?risk_type=${riskType}&timeframe=${timeframe}`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error('District risk assessment error:', error);
            
            // Return mock data as fallback
            return {
                risk_type: riskType,
                timeframe: timeframe,
                districts: [
                    { name: 'Mumbai', state: 'Maharashtra', risk_level: 'High', probability: 0.78 },
                    { name: 'Chennai', state: 'Tamil Nadu', risk_level: 'High', probability: 0.72 },
                    { name: 'Kolkata', state: 'West Bengal', risk_level: 'Medium', probability: 0.55 }
                ]
            };
        }
    }

    getChatHistory() {
        return this.chatHistory;
    }

    clearChatHistory() {
        this.chatHistory = [];
    }

    // Export chat history for analysis
    exportChatHistory() {
        const data = {
            chatHistory: this.chatHistory,
            userProfile: this.userProfile,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `climate-chat-history-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
}

// Create global instance
window.ClimateSphereAIChat = new ClimateSphereAIChat();

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ClimateSphereAIChat.initialize();
});