/**
 * CUTE LAMP - INTERACTIVE INTRO SCRIPT
 * Pull cord -> Click/Snap Sound -> Turn ON Light & Wake Up -> Smooth Portfolio Reveal
 */

(function () {
  'use strict';

  // Elements
  const overlay = document.getElementById('cuteLampOverlay');
  if (!overlay) return;

  const cordGroup = document.getElementById('lampCordGroup');
  const cordString = document.getElementById('lampCordString');
  const cordKnob = document.getElementById('lampCordKnob');
  const skipBtn = document.getElementById('lampSkipBtn');
  const replayBtn = document.getElementById('navLampReplayBtn');

  // Prevent background scrolling while lamp overlay is active
  document.body.classList.add('lamp-intro-active');

  // Initial cord dimensions (SVG viewBox coordinates)
  const ANCHOR_X = 228;
  const ANCHOR_Y = 245;
  const DEFAULT_END_Y = 328;
  const KNOB_DEFAULT_CY = 338;
  const MAX_PULL_DELTA = 45; // Max drag distance
  const TRIGGER_DELTA = 18;  // Distance required to trigger switch

  let isLit = false;
  let isDragging = false;
  let isAnimating = false;
  let startClientY = 0;
  let currentPull = 0;
  let hasTriggered = false;

  /* --------------------------------------------------------------------------
     1. Tactile Switch Audio Feedback (Web Audio API - No external mp3 needed)
     -------------------------------------------------------------------------- */
  function playLampSwitchSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // 1. Initial mechanical spring pull click
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(650, now);
      osc1.frequency.exponentialRampToValueAtTime(140, now + 0.045);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.05);

      // 2. Crisp metallic toggle snap
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1350, now + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(320, now + 0.09);
      gain2.gain.setValueAtTime(0.28, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.1);
    } catch (e) {
      // Audio playback fails silently if browser policy blocks autoplay
    }
  }

  /* --------------------------------------------------------------------------
     2. Update Cord Position in SVG
     -------------------------------------------------------------------------- */
  function setCordPosition(pullOffset) {
    if (!cordString || !cordKnob) return;
    const endY = DEFAULT_END_Y + pullOffset;
    const knobY = KNOB_DEFAULT_CY + pullOffset;

    cordString.setAttribute('y2', endY);
    cordKnob.setAttribute('cy', knobY);
  }

  /* --------------------------------------------------------------------------
     3. Spring Release Animation
     -------------------------------------------------------------------------- */
  function animateCordSnapBack(fromOffset, callback) {
    const startTime = performance.now();
    const duration = 380; // ms

    function spring(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Damped harmonic oscillation formula
      const decay = Math.exp(-progress * 6);
      const oscillation = Math.cos(progress * Math.PI * 4);
      const currentOffset = fromOffset * decay * oscillation;

      setCordPosition(currentOffset);

      if (progress < 1) {
        requestAnimationFrame(spring);
      } else {
        setCordPosition(0);
        if (callback) callback();
      }
    }

    requestAnimationFrame(spring);
  }

  /* --------------------------------------------------------------------------
     4. Turn On the Lamp & Reveal Portfolio
     -------------------------------------------------------------------------- */
  function turnOnLamp() {
    if (isLit) return;
    isLit = true;

    playLampSwitchSound();

    // Visual ON state: lamp lights up, turns lavender, awake face smiles, light beam glows
    overlay.classList.add('is-lit');
    cordGroup?.classList.remove('is-idle');

    // Step 1: Let the user enjoy the bright happy lit lamp for ~1.35s
    setTimeout(() => {
      revealPortfolioWithAnimation();
    }, 1350);
  }

  function revealPortfolioWithAnimation() {
    // Step 2: Trigger expanding light burst & portfolio bloom unfold
    overlay.classList.add('is-transitioning');
    document.body.classList.add('portfolio-revealing');
    document.body.classList.remove('lamp-intro-active');

    // Step 3: Complete transition smoothly after animation finishes
    setTimeout(() => {
      overlay.classList.add('is-revealed');
      overlay.style.display = 'none';
      document.body.classList.remove('portfolio-revealing');
    }, 1150);
  }

  /* --------------------------------------------------------------------------
     5. Cord Drag & Touch Event Handlers
     -------------------------------------------------------------------------- */
  function animateCordQuickClick() {
    if (isLit || isAnimating) return;
    isAnimating = true;
    cordGroup?.classList.remove('is-idle');

    let frame = 0;
    const totalFrames = 7;
    function pullDown() {
      frame++;
      const offset = (frame / totalFrames) * 28;
      setCordPosition(offset);
      if (frame < totalFrames) {
        requestAnimationFrame(pullDown);
      } else {
        animateCordSnapBack(28, () => {
          isAnimating = false;
          turnOnLamp();
        });
      }
    }
    requestAnimationFrame(pullDown);
  }

  function handlePointerDown(e) {
    if (isLit || isAnimating) return;
    isDragging = true;
    hasTriggered = false;
    currentPull = 0;
    startClientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    cordGroup.classList.add('is-dragging');
    cordGroup.classList.remove('is-idle');

    window.addEventListener('mousemove', handlePointerMove, { passive: false });
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);
  }

  function handlePointerMove(e) {
    if (!isDragging || isLit) return;

    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    const deltaY = clientY - startClientY;

    if (deltaY > 2) {
      if (e.cancelable) e.preventDefault();
      // Elastic resistance formula
      currentPull = Math.min(deltaY * 0.65, MAX_PULL_DELTA);
      setCordPosition(currentPull);

      if (currentPull >= TRIGGER_DELTA) {
        hasTriggered = true;
      }
    } else {
      currentPull = 0;
      setCordPosition(0);
    }
  }

  function handlePointerUp() {
    if (!isDragging) return;
    isDragging = false;
    cordGroup.classList.remove('is-dragging');

    window.removeEventListener('mousemove', handlePointerMove);
    window.removeEventListener('touchmove', handlePointerMove);
    window.removeEventListener('mouseup', handlePointerUp);
    window.removeEventListener('touchend', handlePointerUp);

    const pullDistance = currentPull;
    currentPull = 0;

    if (hasTriggered || pullDistance >= TRIGGER_DELTA) {
      animateCordSnapBack(pullDistance, () => {
        turnOnLamp();
      });
    } else if (pullDistance > 4) {
      // Released without reaching trigger threshold
      animateCordSnapBack(pullDistance);
    } else {
      // Tap / Click without drag
      animateCordQuickClick();
    }
  }

  // Attach Pointer Events
  if (cordGroup) {
    cordGroup.classList.add('is-idle');
    cordGroup.addEventListener('mousedown', handlePointerDown);
    cordGroup.addEventListener('touchstart', handlePointerDown, { passive: true });

    // Keyboard support: Space / Enter
    cordGroup.setAttribute('tabindex', '0');
    cordGroup.setAttribute('role', 'button');
    cordGroup.setAttribute('aria-label', 'Pull cord to turn on lamp and enter portfolio');
    cordGroup.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isLit) {
          animateCordQuickClick();
        }
      }
    });
  }

  // Skip Button
  if (skipBtn) {
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playLampSwitchSound();
      overlay.classList.add('is-lit');
      overlay.classList.add('is-transitioning');
      document.body.classList.add('portfolio-revealing');
      document.body.classList.remove('lamp-intro-active');

      setTimeout(() => {
        overlay.classList.add('is-revealed');
        overlay.style.display = 'none';
        document.body.classList.remove('portfolio-revealing');
      }, 400);
    });
  }

  // Fallback: click anywhere on stage to trigger lamp
  const lampStage = document.querySelector('.lamp-stage');
  lampStage?.addEventListener('click', (e) => {
    if (!isLit && !isAnimating && !isDragging && !e.target.closest('.lamp-skip-btn') && !e.target.closest('#lampCordGroup')) {
      animateCordQuickClick();
    }
  });

  /* --------------------------------------------------------------------------
     6. Replay Feature from Navbar (Mini Lamp Button)
     -------------------------------------------------------------------------- */
  if (replayBtn) {
    replayBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Reset states
      isLit = false;
      hasTriggered = false;
      isAnimating = false;
      setCordPosition(0);

      overlay.style.display = 'flex';
      overlay.classList.remove('is-revealed');
      overlay.classList.remove('is-transitioning');
      overlay.classList.remove('is-lit');
      document.body.classList.remove('portfolio-revealing');
      document.body.classList.add('lamp-intro-active');
      cordGroup?.classList.add('is-idle');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
