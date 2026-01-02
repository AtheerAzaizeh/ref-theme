/**
 * Mysterious Effects JavaScript
 * Ambient animations, cursor effects, and reveal behaviors
 */

(function() {
  'use strict';

  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Cursor Glow Effect
   * Creates an ambient glow that follows the cursor
   */
  function initCursorGlow() {
    if (prefersReducedMotion) return;
    
    const cursorGlow = document.createElement('div');
    cursorGlow.className = 'mysterious-cursor-glow';
    document.body.appendChild(cursorGlow);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorGlow.classList.add('active');
    });

    document.addEventListener('mouseleave', () => {
      cursorGlow.classList.remove('active');
    });

    // Smooth follow animation
    function animateCursor() {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;
      
      cursorX += dx * 0.1;
      cursorY += dy * 0.1;
      
      cursorGlow.style.left = cursorX + 'px';
      cursorGlow.style.top = cursorY + 'px';
      
      requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
  }

  /**
   * Scroll Reveal Animation
   * Triggers reveal animations when elements enter viewport
   */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.mysterious-reveal, .mysterious-reveal-up');
    
    if (revealElements.length === 0) return;

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Add staggered delay for multiple elements
          const delay = entry.target.dataset.mysteriousDelay || 0;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, delay * 100);
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  /**
   * Parallax Depth Effect
   * Subtle parallax on scroll for depth layers
   */
  function initParallax() {
    if (prefersReducedMotion) return;

    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (parallaxElements.length === 0) return;

    let ticking = false;

    function updateParallax() {
      const scrollY = window.scrollY;
      
      parallaxElements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.1;
        const rect = el.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const offset = (scrollY - elementTop) * speed;
        
        el.style.transform = `translateY(${offset}px)`;
      });
      
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /**
   * Text Reveal Animation
   * Typewriter-style text reveal for dramatic effect
   */
  function initTextReveal() {
    if (prefersReducedMotion) return;

    const textRevealElements = document.querySelectorAll('[data-mysterious-text-reveal]');
    
    textRevealElements.forEach(el => {
      const text = el.textContent;
      el.textContent = '';
      el.style.visibility = 'visible';
      
      let charIndex = 0;
      const revealInterval = setInterval(() => {
        if (charIndex < text.length) {
          el.textContent += text.charAt(charIndex);
          charIndex++;
        } else {
          clearInterval(revealInterval);
        }
      }, 50);
    });
  }

  /**
   * Interactive Hover Ripple
   * Creates ripple effect on button/card clicks
   */
  function initRippleEffect() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.mysterious-ripple');
      if (!target) return;

      const ripple = document.createElement('span');
      ripple.className = 'mysterious-ripple-effect';
      
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
      ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
      
      target.appendChild(ripple);
      
      ripple.addEventListener('animationend', () => {
        ripple.remove();
      });
    });
  }

  /**
   * Magnetic Hover Effect
   * Elements subtly follow cursor on hover
   */
  function initMagneticHover() {
    if (prefersReducedMotion) return;

    const magneticElements = document.querySelectorAll('.mysterious-magnetic');
    
    magneticElements.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        el.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0)';
      });
    });
  }

  /**
   * Auto-apply mysterious classes to existing sections
   */
  function enhanceExistingSections() {
    // Enhance banners with vignette
    document.querySelectorAll('.banner, .image-banner').forEach(el => {
      if (!el.classList.contains('mysterious-vignette')) {
        el.classList.add('mysterious-vignette');
      }
    });

    // Enhance product images with reveal
    document.querySelectorAll('.product__media-wrapper').forEach(el => {
      if (!el.classList.contains('mysterious-image-reveal')) {
        el.classList.add('mysterious-image-reveal');
      }
    });

    // Enhance buttons with glow potential
    document.querySelectorAll('.button--primary').forEach((el, index) => {
      if (index === 0) {
        el.classList.add('mysterious-pulse');
      }
    });

    // Add reveal animation to content sections
    document.querySelectorAll('.banner__content, .newsletter__wrapper').forEach(el => {
      if (!el.classList.contains('mysterious-reveal-up')) {
        el.classList.add('mysterious-reveal-up');
      }
    });
  }

  /**
   * Initialize Particles Background
   */
  function initParticles() {
    if (prefersReducedMotion) return;

    // Only add if not already present
    if (document.querySelector('.mysterious-particles')) return;

    const particles = document.createElement('div');
    particles.className = 'mysterious-particles';
    document.body.prepend(particles);
  }

  /**
   * Initialize all effects
   */
  function init() {
    // Wait for DOM to be fully ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAll);
    } else {
      initAll();
    }
  }

  function initAll() {
    initCursorGlow();
    initScrollReveal();
    initParallax();
    initRippleEffect();
    initMagneticHover();
    enhanceExistingSections();
    initParticles();
    
    // Text reveal is opt-in only
    // initTextReveal();
  }

  // Auto-initialize
  init();

  // Re-initialize on Shopify section reload (theme editor)
  if (typeof Shopify !== 'undefined' && Shopify.designMode) {
    document.addEventListener('shopify:section:load', () => {
      enhanceExistingSections();
      initScrollReveal();
    });
  }

  // Expose for manual triggering if needed
  window.MysteriousEffects = {
    init: initAll,
    initScrollReveal,
    initCursorGlow,
    initParallax,
    enhanceExistingSections
  };

})();
