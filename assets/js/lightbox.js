/**
 * SADMAN SAKIB - LIGHTBOX GALLERY MODULE
 * Fullscreen modal image viewer with keyboard and touch navigation
 */

(function () {
  'use strict';

  // Lightbox DOM elements
  const modal = document.getElementById('projectLightbox');
  if (!modal) return;

  const modalImg = modal.querySelector('.lightbox-image');
  const modalCaption = modal.querySelector('.lightbox-caption');
  const modalCounter = modal.querySelector('.lightbox-counter');
  const closeBtn = modal.querySelector('.lightbox-close-btn');
  const prevBtn = modal.querySelector('.lightbox-prev');
  const nextBtn = modal.querySelector('.lightbox-next');

  // Collect all gallery items
  const galleryItems = Array.from(document.querySelectorAll('[data-lightbox="project"]'));
  let currentIndex = 0;

  function openLightbox(index) {
    if (index < 0 || index >= galleryItems.length) return;
    currentIndex = index;
    updateLightboxContent();

    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent page scroll while viewing
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    updateLightboxContent();
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    updateLightboxContent();
  }

  function updateLightboxContent() {
    const item = galleryItems[currentIndex];
    if (!item) return;

    const src = item.getAttribute('data-image') || item.querySelector('img')?.src;
    const title = item.getAttribute('data-title') || 'Project Preview';

    if (modalImg) {
      modalImg.src = src;
      modalImg.alt = title;
    }

    if (modalCaption) {
      modalCaption.textContent = title;
    }

    if (modalCounter) {
      modalCounter.textContent = `${currentIndex + 1} / ${galleryItems.length}`;
    }
  }

  // Click triggers on preview items
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(index);
    });

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });

  // Close and Nav button listeners
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);
  if (nextBtn) nextBtn.addEventListener('click', showNext);

  // Click outside image to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('lightbox-backdrop-target')) {
      closeLightbox();
    }
  });

  // Keyboard navigation: ESC, Left Arrow, Right Arrow
  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-active')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      showNext();
    } else if (e.key === 'ArrowLeft') {
      showPrev();
    }
  });

})();
