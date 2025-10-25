/**
 * Navigation Fix for ClimateSphere Dashboard
 * Ensures all sidebar navigation works properly
 */

console.log('🔧 Loading Navigation Fix...');

/**
 * Navigate to a specific section
 */
function navigateToSection(sectionName) {
    console.log('[Navigation] Navigating to section:', sectionName);
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Show/hide sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        console.log('[Navigation] Successfully switched to:', sectionName);
    } else {
        console.error('[Navigation] Section not found:', `${sectionName}-section`);
    }
    
    // Close mobile sidebar
    if (window.innerWidth <= 1024) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('show');
        }
    }
    
    // Special handling for upload section
    if (sectionName === 'upload') {
        // Initialize upload functionality if not already done
        setTimeout(() => {
            if (typeof window.UploadAnalysis !== 'undefined') {
                console.log('[Navigation] Upload section ready');
            }
        }, 100);
    }
}

/**
 * Initialize navigation system
 */
function initializeNavigationFix() {
    console.log('🚀 Initializing Navigation Fix');
    
    // Add click handlers to all navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        // Remove existing listeners to avoid duplicates
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        // Add new listener
        newLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const section = e.currentTarget.dataset.section;
            console.log('[Navigation] Link clicked:', section);
            
            if (section) {
                navigateToSection(section);
            } else {
                console.error('[Navigation] No section data found on link');
            }
        });
    });
    
    // Ensure Data Upload link is specifically working
    const uploadLink = document.querySelector('[data-section="upload"]');
    if (uploadLink) {
        console.log('[Navigation] Data Upload link found and configured');
        
        // Add visual feedback
        uploadLink.style.cursor = 'pointer';
        
        // Test click
        uploadLink.addEventListener('mouseenter', () => {
            console.log('[Navigation] Data Upload link hovered');
        });
    } else {
        console.error('[Navigation] Data Upload link not found');
    }
    
    // Add action button handlers
    document.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            console.log('[Navigation] Action button clicked:', action);
            
            switch (action) {
                case 'upload':
                    navigateToSection('upload');
                    break;
                case 'analyze':
                    navigateToSection('analysis');
                    break;
                case 'predict':
                    navigateToSection('predictions');
                    break;
                default:
                    console.warn('[Navigation] Unknown action:', action);
            }
        });
    });
    
    console.log('✅ Navigation Fix initialized');
}

/**
 * Debug navigation state
 */
function debugNavigation() {
    console.log('=== Navigation Debug ===');
    
    const navLinks = document.querySelectorAll('.nav-link');
    console.log('Navigation links found:', navLinks.length);
    
    navLinks.forEach((link, index) => {
        const section = link.dataset.section;
        const text = link.textContent.trim();
        console.log(`Link ${index + 1}: "${text}" -> section: "${section}"`);
    });
    
    const sections = document.querySelectorAll('.content-section');
    console.log('Content sections found:', sections.length);
    
    sections.forEach((section, index) => {
        const id = section.id;
        const isActive = section.classList.contains('active');
        console.log(`Section ${index + 1}: "${id}" -> active: ${isActive}`);
    });
    
    console.log('=== Debug Complete ===');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initializeNavigationFix, 500);
    });
} else {
    setTimeout(initializeNavigationFix, 500);
}

// Expose functions globally
window.navigateToSection = navigateToSection;
window.debugNavigation = debugNavigation;

console.log('✅ Navigation Fix module loaded');