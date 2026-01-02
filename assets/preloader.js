/**
 * Store Preloader JavaScript
 * Shows animated logo during page transitions and button clicks
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    minLoadTime: 300,      // Minimum time to show preloader (ms)
    maxLoadTime: 8000,     // Maximum time before auto-hide (ms)
    fadeDelay: 100,        // Delay before hiding (ms)
    buttonSelectors: [
      '.drop-add-button',
      'button[type="submit"]',
      '.btn',
      '.button',
      '[data-preloader]'
    ],
    linkSelectors: [
      'a[href^="/"]',
      'a[href^="' + window.location.origin + '"]'
    ],
    excludeSelectors: [
      '[data-no-preloader]',
      '[target="_blank"]',
      '[href^="#"]',
      '[href^="mailto:"]',
      '[href^="tel:"]',
      '.no-preloader'
    ]
  };

  let preloaderEl = null;
  let showTime = 0;

  /**
   * Initialize preloader element
   */
  function init() {
    preloaderEl = document.getElementById('store-preloader');
    
    if (!preloaderEl) {
      console.log('Preloader: Element not found');
      return;
    }

    // Hide preloader on initial page load
    hidePreloader();

    // Attach event listeners
    attachButtonListeners();
    attachLinkListeners();
    attachFormListeners();

    // Handle browser back/forward
    window.addEventListener('pageshow', function(event) {
      if (event.persisted) {
        hidePreloader();
      }
    });

    console.log('Preloader: Initialized');
  }

  /**
   * Show preloader
   */
  function showPreloader() {
    if (!preloaderEl) return;
    
    showTime = Date.now();
    preloaderEl.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Hide preloader with minimum display time
   */
  function hidePreloader() {
    if (!preloaderEl) return;

    const elapsed = Date.now() - showTime;
    const remaining = Math.max(0, CONFIG.minLoadTime - elapsed);

    setTimeout(function() {
      preloaderEl.classList.add('hidden');
      document.body.style.overflow = '';
    }, remaining + CONFIG.fadeDelay);
  }

  /**
   * Check if element matches exclude selectors
   */
  function isExcluded(element) {
    return CONFIG.excludeSelectors.some(function(selector) {
      return element.matches(selector);
    });
  }

  /**
   * Attach listeners to buttons
   */
  function attachButtonListeners() {
    CONFIG.buttonSelectors.forEach(function(selector) {
      document.querySelectorAll(selector).forEach(function(btn) {
        if (isExcluded(btn)) return;
        
        btn.addEventListener('click', function(e) {
          // Only show for form submits or explicit preloader buttons
          if (this.type === 'submit' || this.hasAttribute('data-preloader')) {
            showPreloader();
            
            // Auto-hide after max time (fallback)
            setTimeout(hidePreloader, CONFIG.maxLoadTime);
          }
        });
      });
    });
  }

  /**
   * Attach listeners to internal links
   */
  function attachLinkListeners() {
    document.querySelectorAll('a').forEach(function(link) {
      const href = link.getAttribute('href');
      
      // Skip external links or excluded links
      if (!href) return;
      if (isExcluded(link)) return;
      if (href.startsWith('#')) return;
      if (href.startsWith('mailto:')) return;
      if (href.startsWith('tel:')) return;
      if (link.target === '_blank') return;
      
      // Only internal links
      const isInternal = href.startsWith('/') || href.startsWith(window.location.origin);
      
      if (isInternal) {
        link.addEventListener('click', function(e) {
          // Don't show for prevented clicks or special keys
          if (e.defaultPrevented) return;
          if (e.metaKey || e.ctrlKey || e.shiftKey) return;
          
          showPreloader();
        });
      }
    });
  }

  /**
   * Attach listeners to forms
   */
  function attachFormListeners() {
    document.querySelectorAll('form').forEach(function(form) {
      if (isExcluded(form)) return;
      
      form.addEventListener('submit', function(e) {
        if (!e.defaultPrevented) {
          showPreloader();
          
          // Auto-hide after max time (fallback)
          setTimeout(hidePreloader, CONFIG.maxLoadTime);
        }
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also hide when page is fully loaded
  window.addEventListener('load', hidePreloader);

  // Expose functions globally for manual control
  window.StorePreloader = {
    show: showPreloader,
    hide: hidePreloader
  };

})();
