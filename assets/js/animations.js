/**
 * SADMAN SAKIB - ANIMATIONS MODULE
 * Interactive Cursor, Hero Parallax Tilt, Scroll Observer Reveals
 */

(function () {
  'use strict';

  // Check for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------------------------
     1. Subtle Dual-Ring Custom Cursor (Desktop Only)
     -------------------------------------------------------------------------- */
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (isFinePointer && !prefersReducedMotion) {
    const dot = document.createElement('div');
    const glow = document.createElement('div');

    dot.className = 'custom-cursor-dot';
    glow.className = 'custom-cursor-glow';

    document.body.appendChild(dot);
    document.body.appendChild(glow);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;
    let isVisible = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        dot.style.opacity = '1';
        glow.style.opacity = '1';
        isVisible = true;
      }

      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    });

    // Smooth RAF follower for outer glow ring
    function renderGlow() {
      // Lerp
      glowX += (mouseX - glowX) * 0.15;
      glowY += (mouseY - glowY) * 0.15;

      glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(renderGlow);
    }
    requestAnimationFrame(renderGlow);

    // Expand on hoverable elements
    const hoverTargets = 'a, button, input, textarea, .project-screenshot-item, .project-single-preview, .timeline-card, .skill-category-card, .highlight-metric-card, .beyond-card, .contact-channel-item';
    
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) {
        document.body.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) {
        document.body.classList.remove('cursor-hover');
      }
    });

    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      glow.style.opacity = '0';
      isVisible = false;
    });
  }

  /* --------------------------------------------------------------------------
     2. Hero Portrait 3D Parallax Tilt & Movement
     -------------------------------------------------------------------------- */
  const heroSection = document.getElementById('hero') || document.getElementById('home');
  const portraitImg = document.getElementById('portraitImg');

  if (heroSection && portraitImg && isFinePointer && !prefersReducedMotion) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const deltaX = (x - centerX) / centerX;
      const deltaY = (y - centerY) / centerY;

      const moveX = deltaX * 16;
      const moveY = deltaY * 8;
      const tilt = deltaX * 3.5;

      portraitImg.style.transform = `translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
    });

    heroSection.addEventListener('mouseleave', () => {
      portraitImg.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
    });
  }

  /* --------------------------------------------------------------------------
     3. Scroll Reveal via IntersectionObserver
     -------------------------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.12
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Immediate visibility fallback
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

})();
