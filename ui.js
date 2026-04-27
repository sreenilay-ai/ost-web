// ============================================================
// ui.js - UI Controller: loader, panels, nav, back button
// ============================================================
(function () {
  'use strict';

  // ─── Elements ────────────────────────────────────────────
  const loader    = document.getElementById('loader');
  const heroHud   = document.getElementById('hero-hud');
  const nav       = document.getElementById('nav');
  const backBtn   = document.createElement('button');
  const exploreBtn = document.getElementById('explore-btn');
  const panels    = document.querySelectorAll('.info-panel');

  // Create and mount back button
  backBtn.id        = 'back-btn';
  backBtn.textContent = '← Return to Space';
  document.body.appendChild(backBtn);

  // ─── Loader Dismiss ──────────────────────────────────────
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      nav.classList.add('visible');
      setTimeout(() => {
        heroHud.classList.add('visible');
      }, 300);
    }, 1800);
  });

  // ─── Explore Button ──────────────────────────────────────
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      heroHud.classList.add('fade-out');
      // Pan slightly to hint at the 3D space
      if (window.OST3D) {
        window.OST3D.targetCamera = { x: 2, y: -1, z: 18 };
        setTimeout(() => {
          heroHud.classList.remove('fade-out');
          heroHud.classList.add('visible');
          if (window.OST3D) window.OST3D.targetCamera = { x: 0, y: 0, z: 22 };
        }, 2200);
      }
    });
  }

  // ─── Fly-to panel reveal ─────────────────────────────────
  document.addEventListener('ost:flyto', e => {
    const id = e.detail.id;

    // Fade out hero
    heroHud.classList.add('fade-out');
    setTimeout(() => heroHud.classList.remove('visible'), 400);

    // Hide all panels first
    panels.forEach(p => p.classList.remove('visible'));

    // Show target panel
    setTimeout(() => {
      const target = document.getElementById('panel-' + id);
      if (target) {
        target.classList.add('visible');
      }
      backBtn.classList.add('visible');
    }, 500);
  });

  // ─── Fly Home ────────────────────────────────────────────
  document.addEventListener('ost:home', () => {
    panels.forEach(p => p.classList.remove('visible'));
    backBtn.classList.remove('visible');
    setTimeout(() => {
      heroHud.classList.remove('fade-out');
      heroHud.classList.add('visible');
    }, 400);
  });

  backBtn.addEventListener('click', () => {
    if (window.OST3D) window.OST3D.flyHome();
  });

  // ─── Nav links direct to panels ──────────────────────────
  // (data-target handled by scene.js, but fallback here)
  document.querySelectorAll('[data-target]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });

  // ─── Hover cursor state for buttons ──────────────────────
  const interactive = document.querySelectorAll('a, button, .pill, .r-card, .connect-btn');
  interactive.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // ─── Keyboard navigation ─────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (window.OST3D) window.OST3D.flyHome();
    }
    const keyMap = {
      '1': 'about',
      '2': 'activities',
      '3': 'resources',
      '4': 'connect',
    };
    if (keyMap[e.key] && window.OST3D) {
      window.OST3D.flyToNode(keyMap[e.key]);
    }
  });

  // ─── Panel close on outside click ────────────────────────
  document.addEventListener('click', e => {
    const inPanel = e.target.closest('.info-panel');
    const inNav   = e.target.closest('#nav');
    const onCanvas = e.target === document.getElementById('c');
    if (!inPanel && !inNav && onCanvas) {
      // Click on canvas handled by scene.js raycaster
    }
  });

})();
