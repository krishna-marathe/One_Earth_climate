/**
 * Data Processor Module
 * Handles file reading, parsing, and data extraction
 */

console.log('📊 Loading Data Processor Module...');

window.DataProcessor = {
    
    // Read file content
    async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    },
    
    // Parse data based on file type
    parseData(content, filename) {
        if (filename.endsWith('.json')) {
            return JSON.parse(content);
        } else if (filename.endsWith('.csv')) {
            return this.parseCSV(content);
        }
        throw new Error('Unsupported file format');
    },
    
    // Parse CSV content
    parseCSV(content) {
        const lines = content.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] ? values[index].trim() : '';
            });
            if (Object.values(row).some(v => v !== '')) {
                data.push(row);
            }
        }
        
        return data;
    },
    
    // Extract climate metrics from data
    extractMetrics(data) {
        const tempField = this.findField(data[0], ['temperature', 'temp', 'celsius']);
        const rainField = this.findField(data[0], ['rainfall', 'rain', 'precipitation']);
        const humidField = this.findField(data[0], ['humidity', 'humid', 'rh']);
        const co2Field = this.findField(data[0], ['co2', 'carbon', 'dioxide']);
        
        const temperatures = this.extractNumericValues(data, tempField);
        const rainfall = this.extractNumericValues(data, rainField);
        const humidity = this.extractNumericValues(data, humidField);
        const co2 = this.extractNumericValues(data, co2Field);
        
        return {
            temperature: {
                values: temperatures,
                average: temperatures.length > 0 ? 
                    temperatures.reduce((a, b) => a + b, 0) / temperatures.length : 25,
                min: temperatures.length > 0 ? Math.min(...temperatures) : 20,
                max: temperatures.length > 0 ? Math.max(...temperatures) : 30
            },
            rainfall: {
                values: rainfall,
                total: rainfall.length > 0 ? rainfall.reduce((a, b) => a + b, 0) : 100,
                average: rainfall.length > 0 ? 
                    rainfall.reduce((a, b) => a + b, 0) / rainfall.length : 5
            },
            humidity: {
                values: humidity,
                average: humidity.length > 0 ? 
                    humidity.reduce((a, b) => a + b, 0) / humidity.length : 60
            },
            co2: {
                values: co2,
                average: co2.length > 0 ? 
                    co2.reduce((a, b) => a + b, 0) / co2.length : 400
            }
        };
    },
    
    // Find field in data by possible names
    findField(row, possibleNames) {
        const keys = Object.keys(row).map(k => k.toLowerCase());
        for (const name of possibleNames) {
            const found = keys.find(key => key.includes(name.toLowerCase()));
            if (found) {
                return Object.keys(row).find(k => k.toLowerCase() === found);
            }
        }
        return null;
    },
    
    // Extract numeric values from field
    extractNumericValues(data, fieldName) {
        if (!fieldName) return [];
        
        return data
            .map(row => parseFloat(row[fieldName]))
            .filter(val => !isNaN(val));
    },
    
    // Generate sample data for testing
    generateSampleData() {
        console.log('📊 Generating sample data...');
        
        const data = [];
        for (let i = 0; i < 100; i++) {
            data.push({
                temperature: 20 + Math.random() * 15,
                rainfall: Math.random() * 50,
                humidity: 40 + Math.random() * 40,
                co2: 380 + Math.random() * 40,
                date: new Date(2023, 0, i + 1).toISOString().split('T')[0]
            });
        }
        return data;
    }
};

console.log('✅ Data Processor Module loaded');