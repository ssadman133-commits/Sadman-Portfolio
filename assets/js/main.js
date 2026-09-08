/**
 * SADMAN SAKIB - MAIN APPLICATION SCRIPT
 * Navigation, Smooth Scrolling, Mobile Drawer, Form Validation, Back-to-Top
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     1. Sticky Navigation & Header Blur
     -------------------------------------------------------------------------- */
  const header = document.getElementById('siteHeader');

  function handleScroll() {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check

  /* --------------------------------------------------------------------------
     2. Mobile Navigation Drawer
     -------------------------------------------------------------------------- */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function toggleMobileMenu() {
    const isOpen = hamburgerBtn?.classList.toggle('is-active');
    mobileDrawer?.classList.toggle('is-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    hamburgerBtn?.setAttribute('aria-expanded', String(isOpen));
  }

  function closeMobileMenu() {
    hamburgerBtn?.classList.remove('is-active');
    mobileDrawer?.classList.remove('is-open');
    document.body.style.overflow = '';
    hamburgerBtn?.setAttribute('aria-expanded', 'false');
  }

  hamburgerBtn?.addEventListener('click', toggleMobileMenu);

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Close mobile drawer on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer?.classList.contains('is-open')) {
      closeMobileMenu();
    }
  });

  /* --------------------------------------------------------------------------
     3. Active Navigation Indicator on Scroll
     -------------------------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    const scrollY = window.pageYOffset;

    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 140;
      const sectionId = current.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  /* --------------------------------------------------------------------------
     4. Back-to-Top Button
     -------------------------------------------------------------------------- */
  const backToTopBtn = document.getElementById('backToTopBtn');

  function handleBackToTopVisibility() {
    if (window.scrollY > 350) {
      backToTopBtn?.classList.add('is-visible');
    } else {
      backToTopBtn?.classList.remove('is-visible');
    }
  }

  window.addEventListener('scroll', handleBackToTopVisibility, { passive: true });
  handleBackToTopVisibility();

  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  /* --------------------------------------------------------------------------
     5. Contact Form Validation & Mailto Action
     -------------------------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('senderName');
      const emailInput = document.getElementById('senderEmail');
      const messageInput = document.getElementById('senderMessage');

      const name = nameInput?.value.trim() || '';
      const email = emailInput?.value.trim() || '';
      const message = messageInput?.value.trim() || '';

      // Reset previous status
      if (formStatus) {
        formStatus.className = 'form-status';
        formStatus.textContent = '';
      }

      // Basic Validation
      if (!name || name.length < 2) {
        showStatus('Please enter your full name (at least 2 characters).', 'error');
        nameInput?.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        showStatus('Please enter a valid email address.', 'error');
        emailInput?.focus();
        return;
      }

      if (!message || message.length < 10) {
        showStatus('Please write a message of at least 10 characters.', 'error');
        messageInput?.focus();
        return;
      }

      // Success: prepare mailto link
      showStatus('Launching your email client to send your message to ssadman133@gmail.com...', 'success');

      const recipient = 'ssadman133@gmail.com';
      const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
      const body = encodeURIComponent(`Hello Sadman,\n\n${message}\n\n---\nFrom: ${name} (${email})`);
      const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${body}`;

      setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 500);
    });
  }

  function showStatus(text, type) {
    if (!formStatus) return;
    formStatus.textContent = text;
    formStatus.className = `form-status ${type}`;
  }

  /* --------------------------------------------------------------------------
     6. Dynamic Year in Footer
     -------------------------------------------------------------------------- */
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

})();
