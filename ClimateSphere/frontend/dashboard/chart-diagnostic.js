/**
 * Chart Diagnostic Script
 * Run this in browser console to diagnose chart issues
 */

function runChartDiagnostics() {
    console.log('=== ClimateSphere Chart Diagnostics ===');
    
    // Test 1: Chart.js availability
    console.log('1. Chart.js availability:', typeof Chart !== 'undefined' ? '✓ PASS' : '✗ FAIL');
    
    if (typeof Chart === 'undefined') {
        console.log('   → Chart.js not loaded. Check CDN connection.');
        return;
    }
    
    // Test 2: Chart.js version
    console.log('2. Chart.js version:', Chart.version || 'Unknown');
    
    // Test 3: Canvas elements
    const canvases = document.querySelectorAll('canvas');
    console.log('3. Canvas elements found:', canvases.length);
    
    canvases.forEach((canvas, index) => {
        console.log(`   Canvas ${index + 1}: ID="${canvas.id}", Size=${canvas.width}x${canvas.height}`);
    });
    
    // Test 4: Chart instances
    if (window.dataUploadAnalyzer && window.dataUploadAnalyzer.charts) {
        const chartCount = Object.keys(window.dataUploadAnalyzer.charts).length;
        console.log('4. Chart instances:', chartCount);
        
        Object.entries(window.dataUploadAnalyzer.charts).forEach(([name, chart]) => {
            console.log(`   Chart "${name}":`, chart ? '✓ Created' : '✗ Failed');
        });
    } else {
        console.log('4. Chart instances: No dataUploadAnalyzer found');
    }
    
    // Test 5: Create test chart
    console.log('5. Creating test chart...');
    
    try {
        // Create temporary canvas
        const testCanvas = document.createElement('canvas');
        testCanvas.id = 'diagnostic-test-chart';
        testCanvas.width = 400;
        testCanvas.height = 200;
        testCanvas.style.display = 'none';
        document.body.appendChild(testCanvas);
        
        const ctx = testCanvas.getContext('2d');
        const testChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['A', 'B', 'C'],
                datasets: [{
                    label: 'Test',
                    data: [1, 2, 3],
                    borderColor: 'red'
                }]
            },
            options: {
                responsive: false,
                animation: false
            }
        });
        
        console.log('   ✓ Test chart created successfully');
        
        // Cleanup
        testChart.destroy();
        testCanvas.remove();
        
    } catch (error) {
        console.log('   ✗ Test chart failed:', error.message);
    }
    
    // Test 6: DOM readiness
    console.log('6. DOM state:', document.readyState);
    
    // Test 7: Check for common issues
    console.log('7. Common issues check:');
    
    const issues = [];
    
    // Check for missing containers
    const chartsGrid = document.getElementById('chartsGrid');
    if (!chartsGrid) {
        issues.push('Missing chartsGrid container');
    }
    
    // Check for CSS issues
    const hiddenCharts = document.querySelectorAll('canvas[style*="display: none"]');
    if (hiddenCharts.length > 0) {
        issues.push(`${hiddenCharts.length} hidden canvas elements`);
    }
    
    // Check for zero-size containers
    const zeroSizeContainers = Array.from(document.querySelectorAll('.chart-card')).filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width === 0 || rect.height === 0;
    });
    
    if (zeroSizeContainers.length > 0) {
        issues.push(`${zeroSizeContainers.length} zero-size chart containers`);
    }
    
    if (issues.length === 0) {
        console.log('   ✓ No common issues detected');
    } else {
        issues.forEach(issue => console.log(`   ✗ ${issue}`));
    }
    
    console.log('=== Diagnostics Complete ===');
    
    // Return summary
    return {
        chartJsLoaded: typeof Chart !== 'undefined',
        canvasCount: canvases.length,
        issues: issues
    };
}

// Auto-run diagnostics if in browser
if (typeof window !== 'undefined') {
    // Run after page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(runChartDiagnostics, 1000);
        });
    } else {
        setTimeout(runChartDiagnostics, 1000);
    }
}

// Export for manual use
window.runChartDiagnostics = runChartDiagnostics;