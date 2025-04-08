// Google Analytics Implementation

// Initialize Google Analytics 4 tracking
function initAnalytics() {
    // Load Google Analytics script asynchronously
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-MEASUREMENT_ID'; // Replace with actual Measurement ID when available
    document.head.appendChild(script);

    // Initialize dataLayer and define gtag function
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-MEASUREMENT_ID'); // Replace with actual Measurement ID when available

    // Track page views
    trackPageView();
}

// Track page views
function trackPageView() {
    const pagePath = window.location.pathname;
    const pageTitle = document.title;
    
    // Log page view to console (for development purposes)
    console.log(`Page viewed: ${pageTitle} (${pagePath})`);
    
    // In production, this would send data to Google Analytics
    // gtag('event', 'page_view', {
    //   'page_title': pageTitle,
    //   'page_path': pagePath
    // });
}

// Track user interactions (clicks, form submissions, etc.)
function trackEvent(category, action, label = null, value = null) {
    // Log event to console (for development purposes)
    console.log(`Event tracked: ${category} - ${action}${label ? ' - ' + label : ''}${value ? ' - ' + value : ''}`);
    
    // In production, this would send data to Google Analytics
    // gtag('event', action, {
    //   'event_category': category,
    //   'event_label': label,
    //   'value': value
    // });
}

// Initialize visitor counter (simple implementation for demonstration)
let visitorCount = 0;
function incrementVisitorCount() {
    // Try to get stored count from localStorage
    const storedCount = localStorage.getItem('visitorCount');
    if (storedCount) {
        visitorCount = parseInt(storedCount);
    }
    
    // Increment count
    visitorCount++;
    
    // Store updated count
    localStorage.setItem('visitorCount', visitorCount.toString());
    
    return visitorCount;
}

// Get current visitor statistics
function getVisitorStats() {
    return {
        pageViews: visitorCount,
        currentPage: window.location.pathname,
        timestamp: new Date().toISOString()
    };
}

// Initialize analytics when the script loads
document.addEventListener('DOMContentLoaded', function() {
    initAnalytics();
    incrementVisitorCount();
});

// Export functions for use in other scripts
window.Analytics = {
    trackEvent: trackEvent,
    trackPageView: trackPageView,
    getVisitorStats: getVisitorStats
};