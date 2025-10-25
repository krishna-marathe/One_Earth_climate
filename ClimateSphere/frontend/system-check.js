/**
 * ClimateSphere System Verification Script
 * Comprehensive testing of all frontend and backend components
 */

class ClimateSphereVerifier {
    constructor() {
        this.results = {
            frontend: {},
            backend: {},
            database: false,
            functionality: {}
        };
        this.baseUrl = window.location.origin;
    }

    async runCompleteVerification() {
        console.log('🌍 ClimateSphere System Verification Started');
        console.log('==========================================');

        // 1. Verify Frontend URLs
        await this.verifyFrontendURLs();

        // 2. Test Backend APIs
        await this.testBackendAPIs();

        // 3. Test Database Connection
        await this.testDatabaseConnection();

        // 4. Test Frontend Functionality
        await this.testFrontendFunctionality();

        // 5. Generate Summary
        this.generateSummary();

        console.log('==========================================');
        console.log('✅ System Verification Complete');
        
        return this.results;
    }

    async verifyFrontendURLs() {
        console.log('\n📍 Testing Frontend URLs...');
        
        const urls = [
            { name: 'Landing Page', path: '/landing/index.html' },
            { name: 'Login', path: '/auth/login.html' },
            { name: 'Signup', path: '/auth/signup.html' },
            { name: 'Dashboard', path: '/dashboard/dashboard.html' },
            { name: 'Predictions', path: '/dashboard/predictions.html' },
            { name: 'Upload', path: '/dashboard/upload.html' }
        ];

        for (const url of urls) {
            try {
                const response = await fetch(`${this.baseUrl}${url.path}`);
                if (response.ok) {
                    console.log(`✅ ${url.name}: ${url.path}`);
                    this.results.frontend[url.name] = true;
                } else {
                    console.log(`❌ ${url.name}: ${url.path} (${response.status})`);
                    this.results.frontend[url.name] = false;
                }
            } catch (error) {
                console.log(`❌ ${url.name}: ${url.path} (Failed to load)`);
                this.results.frontend[url.name] = false;
            }
        }
    }

    async testBackendAPIs() {
        console.log('\n🔌 Testing Backend APIs...');
        
        const apis = [
            { name: 'Backend Health', url: 'http://localhost:3000/api/health', method: 'GET' },
            { name: 'ML Health', url: 'http://localhost:5000/api/health', method: 'GET' },
            { name: 'Auth Login', url: 'http://localhost:3000/api/auth/login', method: 'POST' },
            { name: 'Summary Data', url: 'http://localhost:3000/api/summary', method: 'GET' },
            { name: 'File Upload', url: 'http://localhost:3000/api/upload', method: 'POST' },
            { name: 'ML Predict', url: 'http://localhost:5000/api/predict', method: 'POST' }
        ];

        let connectedAPIs = 0;

        for (const api of apis) {
            try {
                const options = {
                    method: api.method,
                    headers: { 'Content-Type': 'application/json' }
                };

                if (api.method === 'POST') {
                    options.body = JSON.stringify({ test: true });
                }

                const response = await fetch(api.url, options);
                
                if (response.status < 500) {
                    console.log(`✅ ${api.name}: Reachable (${response.status})`);
                    this.results.backend[api.name] = true;
                    connectedAPIs++;
                } else {
                    console.log(`⚠️ ${api.name}: Server Error (${response.status})`);
                    this.results.backend[api.name] = false;
                }
            } catch (error) {
                console.log(`❌ ${api.name}: Offline`);
                this.results.backend[api.name] = false;
            }
        }

        this.results.backend.connectivity = connectedAPIs > 0;
        this.results.backend.connectedCount = connectedAPIs;
        this.results.backend.totalCount = apis.length;
    }

    async testDatabaseConnection() {
        console.log('\n🗄️ Testing Database Connection...');
        
        try {
            const response = await fetch('http://localhost:3000/api/health');
            const data = await response.json();
            
            if (data.database === 'connected' || data.mongodb === 'connected') {
                console.log('✅ Database: Connected (MongoDB)');
                this.results.database = true;
            } else {
                console.log('⚠️ Database: Status unknown');
                this.results.database = false;
            }
        } catch (error) {
            console.log('❌ Database: Cannot reach health endpoint');
            this.results.database = false;
        }
    }

    async testFrontendFunctionality() {
        console.log('\n⚡ Testing Frontend Functionality...');
        
        const tests = [
            { name: 'Leaflet Map Library', test: () => typeof L !== 'undefined' },
            { name: 'Chart.js Library', test: () => typeof Chart !== 'undefined' },
            { name: 'API Module', test: () => typeof window.CS_API !== 'undefined' },
            { name: 'Utils Module', test: () => typeof window.CS_Utils !== 'undefined' },
            { name: 'Local Storage', test: () => typeof Storage !== 'undefined' }
        ];

        for (const test of tests) {
            try {
                const result = test.test();
                if (result) {
                    console.log(`✅ ${test.name}: Available`);
                    this.results.functionality[test.name] = true;
                } else {
                    console.log(`❌ ${test.name}: Not available`);
                    this.results.functionality[test.name] = false;
                }
            } catch (error) {
                console.log(`❌ ${test.name}: Error - ${error.message}`);
                this.results.functionality[test.name] = false;
            }
        }
    }

    generateSummary() {
        console.log('\n📋 SYSTEM STATUS SUMMARY');
        console.log('========================');

        // Frontend URLs
        const frontendPassed = Object.values(this.results.frontend).filter(Boolean).length;
        const frontendTotal = Object.keys(this.results.frontend).length;
        console.log(`Frontend routing: ${frontendPassed}/${frontendTotal} ${frontendPassed === frontendTotal ? '✅' : '❌'}`);

        // Backend APIs
        const backendConnected = this.results.backend.connectivity;
        const backendCount = this.results.backend.connectedCount || 0;
        const backendTotal = this.results.backend.totalCount || 0;
        console.log(`Backend API connectivity: ${backendCount}/${backendTotal} ${backendConnected ? '✅' : '❌'}`);

        // Database
        console.log(`Database connectivity: ${this.results.database ? '✅' : '❌'}`);

        // Frontend Functionality
        const functionalityPassed = Object.values(this.results.functionality).filter(Boolean).length;
        const functionalityTotal = Object.keys(this.results.functionality).length;
        console.log(`Frontend functionality: ${functionalityPassed}/${functionalityTotal} ${functionalityPassed === functionalityTotal ? '✅' : '❌'}`);

        // Overall Status
        const overallHealthy = frontendPassed === frontendTotal && 
                              backendConnected && 
                              this.results.database && 
                              functionalityPassed === functionalityTotal;

        console.log(`\n🎯 Overall System Status: ${overallHealthy ? '✅ HEALTHY' : '⚠️ NEEDS ATTENTION'}`);

        // Working URLs
        console.log('\n🔗 WORKING URLS:');
        Object.entries(this.results.frontend).forEach(([name, working]) => {
            if (working) {
                const path = this.getURLPath(name);
                console.log(`   ${name}: ${this.baseUrl}${path}`);
            }
        });
    }

    getURLPath(name) {
        const paths = {
            'Landing Page': '/landing/index.html',
            'Login': '/auth/login.html',
            'Signup': '/auth/signup.html',
            'Dashboard': '/dashboard/dashboard.html',
            'Predictions': '/dashboard/predictions.html',
            'Upload': '/dashboard/upload.html'
        };
        return paths[name] || '';
    }
}

// Auto-run verification if this script is loaded directly
if (typeof window !== 'undefined') {
    window.ClimateSphereVerifier = ClimateSphereVerifier;
    
    // Auto-run after page load
    window.addEventListener('load', async () => {
        const verifier = new ClimateSphereVerifier();
        await verifier.runCompleteVerification();
    });
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClimateSphereVerifier;
}