// Awa – Portfolio: Partikelmotiv im Einstieg, Navigation, sanftes Einblenden.
(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Kopfbereich: Linie beim Scrollen ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

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

  const BG = '#101512';
  const COLORS = ['163,230,177', '196,242,205', '120,200,150'];
  let w = 0, h = 0, dpr = 1;
  let particles = [];
  let running = false;
  let visible = true;
  let raf = 0;
  let t = 0;
  const pointer = { x: -9999, y: -9999, active: false };

  // Weiches Strömungsfeld aus überlagerten Sinuswellen – billig und ruhig.
  const flow = (x, y, time) =>
    Math.sin(x * 0.0023 + time * 0.00021) * 1.6 +
    Math.cos(y * 0.0031 - time * 0.00017) * 1.4 +
    Math.sin((x + y) * 0.0011 + time * 0.0001);

  const spawn = (p = {}) => {
    p.x = Math.random() * w;
    p.y = Math.random() * h;
    p.vx = 0;
    p.vy = 0;
    p.size = 0.7 + Math.random() * 1.8;
    p.speed = 0.25 + Math.random() * 0.55;
    p.alpha = 0.25 + Math.random() * 0.6;
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
    const target = Math.min(380, Math.round((w * h) / 4200));
    while (particles.length < target) particles.push(spawn());
    particles.length = target;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);
    if (!running) drawStatic();
  };

  const drawDot = (p) => {
    ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  };

  function drawStatic() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);
    particles.forEach(drawDot);
  }

  const step = (now) => {
    t = now;
    // Halbtransparent übermalen erzeugt kurze, weiche Spuren.
    ctx.fillStyle = 'rgba(16,21,18,0.16)';
    ctx.fillRect(0, 0, w, h);

    for (const p of particles) {
      const a = flow(p.x, p.y, t);
      p.vx += Math.cos(a) * 0.04 * p.speed;
      p.vy += Math.sin(a) * 0.04 * p.speed;

      if (pointer.active) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 140 * 140 && d2 > 1) {
          const f = (1 - Math.sqrt(d2) / 140) * 0.35;
          p.vx += (dx / Math.sqrt(d2)) * f;
          p.vy += (dy / Math.sqrt(d2)) * f;
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
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });

  resize();
  start();
})();
