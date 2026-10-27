// Awa – Portfolio: Menü, Details auf dem Handy, Navigation, Einblenden, Partikelmotiv.
(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 959px)');

  /* ---------- Kopfbereich: Linie beim Scrollen ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menü auf dem Handy ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const siteNav = document.getElementById('hauptnavigation');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.nav-toggle__label').textContent = open ? 'Schließen' : 'Menü';
    siteNav.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  siteNav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && siteNav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (siteNav.classList.contains('is-open') && !e.target.closest('.site-header')) setMenu(false);
  });

  /* ---------- Projektdetails: auf dem Handy eingeklappt, am PC offen ---------- */
  const moreToggles = [...document.querySelectorAll('.more-toggle')];
  const setMore = (btn, open) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Weniger anzeigen' : 'Details anzeigen';
    document.getElementById(btn.getAttribute('aria-controls')).hidden = !open;
  };
  const applyLayout = () => moreToggles.forEach((btn) => setMore(btn, !mobile.matches));
  moreToggles.forEach((btn) =>
    btn.addEventListener('click', () => setMore(btn, btn.getAttribute('aria-expanded') !== 'true'))
  );
  applyLayout();
  mobile.addEventListener?.('change', () => { applyLayout(); if (!mobile.matches) setMenu(false); });

  /* ---------- Aktiven Abschnitt in der Navigation markieren ---------- */
  const navLinks = [...document.querySelectorAll('.nav a')];
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          for (const a of navLinks) {
            if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
          }
        }
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => spy.observe(s));

    /* ---------- Einblenden ---------- */
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            reveal.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => reveal.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Jahr im Fußbereich ---------- */
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Partikelmotiv (Anspielung auf Particle Playground) ---------- */
  const canvas = document.querySelector('.hero__particles');
  const hero = document.querySelector('.hero');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');

  // Farben aus dem Signaturbild: Mint, helles Mint, Cremeweiß, tiefes Grün
  const COLORS = ['201,248,175', '231,254,204', '253,254,226', '144,194,122'];
  let w = 0, h = 0, dpr = 1;
  let particles = [];
  let running = false;
  let visible = true;
  let raf = 0;
  const pointer = { x: -9999, y: -9999, active: false };

  // Weiches Strömungsfeld aus überlagerten Sinuswellen – billig und ruhig.
  const flow = (x, y, time) =>
    Math.sin(x * 0.0023 + time * 0.00021) * 1.6 +
    Math.cos(y * 0.0031 - time * 0.00017) * 1.4 +
    Math.sin((x + y) * 0.0011 + time * 0.0001);

  const spawn = (p = {}) => {
    // Mehr Partikel rechts, wo das Licht herkommt; links bleibt der Text ruhig.
    p.x = w * Math.pow(Math.random(), 0.6);
    p.y = Math.random() * h;
    p.vx = 0;
    p.vy = 0;
    p.size = 0.6 + Math.random() * 1.7;
    p.speed = 0.25 + Math.random() * 0.55;
    p.alpha = 0.2 + Math.random() * 0.65;
    p.color = COLORS[(Math.random() * COLORS.length) | 0];
    return p;
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.min(360, Math.round((w * h) / 4200));
    particles = Array.from({ length: target }, (_, i) => particles[i] || spawn());
    particles.forEach((p) => { if (p.x > w || p.y > h) spawn(p); });
    if (!running) drawStatic();
  };

  const drawDot = (p) => {
    // Links ausblenden, damit die Schrift lesbar bleibt
    const fade = w > 900 ? Math.min(1, Math.max(0.15, (p.x / w - 0.2) * 2)) : 0.6;
    ctx.fillStyle = `rgba(${p.color},${(p.alpha * fade).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  };

  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(drawDot);
  }

  const step = (now) => {
    // Teilweise löschen erzeugt kurze, weiche Spuren auf transparentem Grund.
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';

    for (const p of particles) {
      const a = flow(p.x, p.y, now);
      p.vx += Math.cos(a) * 0.04 * p.speed;
      p.vy += Math.sin(a) * 0.04 * p.speed;

      if (pointer.active) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 140 * 140 && d2 > 1) {
          const d = Math.sqrt(d2);
          const f = (1 - d / 140) * 0.35;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
      }

      p.vx *= 0.95;
      p.vy *= 0.95;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = w + 10;
      else if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      else if (p.y > h + 10) p.y = -10;

      drawDot(p);
    }
    raf = requestAnimationFrame(step);
  };

  const start = () => {
    if (running || reducedMotion.matches || !visible || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(step);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = true;
  });
  hero.addEventListener('pointerleave', () => { pointer.active = false; });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible ? start() : stop();
    }).observe(hero);
  }
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  reducedMotion.addEventListener?.('change', () => {
    if (reducedMotion.matches) { stop(); drawStatic(); } else start();
  });

  let resizeTimer = 0;
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    // Auf dem Handy löst das Ein-/Ausblenden der Adressleiste resize aus – nur auf Breitenänderung reagieren.
    if (window.innerWidth === lastWidth && particles.length) return;
    lastWidth = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });

  resize();
  start();
})();
