// Awa – Portfolio: Menü, Details auf dem Handy, Navigation, Einblenden,
// Partikelmotiv, Lauflicht, Kippen, Lichtschein, Scroll-Fortschritt, Bildvergrößerung.
(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 959px)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* privater Modus */ } },
  };

  /* ---------- Kopfbereich: Linie und Fortschritt beim Scrollen ---------- */
  const header = document.querySelector('.site-header');
  let scrollQueued = false;
  const onScroll = () => {
    scrollQueued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    header.style.setProperty('--progress', max > 0 ? (window.scrollY / max).toFixed(4) : '0');
  };
  onScroll();
  window.addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

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

  /* ---------- Projektdetails: zuerst eingeklappt, damit die Karten kurz bleiben ---------- */
  const moreToggles = [...document.querySelectorAll('.more-toggle')];
  const setMore = (btn, open) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Details ausblenden' : 'Details, Technik und nächste Schritte';
    document.getElementById(btn.getAttribute('aria-controls')).hidden = !open;
  };
  moreToggles.forEach((btn) => {
    setMore(btn, false);
    btn.addEventListener('click', () => setMore(btn, btn.getAttribute('aria-expanded') !== 'true'));
  });
  mobile.addEventListener?.('change', () => { if (!mobile.matches) setMenu(false); });

  /* ---------- Aktiven Abschnitt markieren und Einblenden ---------- */
  const navLinks = [...document.querySelectorAll('.nav a')];
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);

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

  /* ---------- Lauflicht: woran ich baue ---------- */
  const ticker = document.querySelector('[data-ticker]');
  if (ticker) {
    const items = [...document.querySelectorAll('.project h3')].map((h) => ({
      name: h.firstChild.textContent.trim(),
      href: '#' + h.closest('.project').id,
    }));
    const label = ticker.querySelector('.ticker__item');
    let i = 0;
    let timer = 0;
    const show = (idx) => {
      label.classList.add('is-out');
      setTimeout(() => {
        label.textContent = items[idx].name;
        ticker.setAttribute('href', items[idx].href);
        label.classList.remove('is-out');
        label.classList.add('is-in');
        requestAnimationFrame(() => requestAnimationFrame(() => label.classList.remove('is-in')));
      }, 300);
    };
    const run = () => {
      clearInterval(timer);
      if (items.length < 2) return;
      timer = setInterval(() => {
        if (document.hidden || ticker.matches(':hover, :focus-visible')) return;
        i = (i + 1) % items.length;
        show(i);
      }, reducedMotion.matches ? 5200 : 3200);
    };
    run();
    reducedMotion.addEventListener?.('change', run);
  }

  /* ---------- Bild im Einstieg kippt leicht mit der Maus ---------- */
  const portrait = document.querySelector('.hero__portrait');
  if (portrait && finePointer.matches) {
    const img = portrait.querySelector('img');
    const glare = document.createElement('span');
    glare.className = 'glare';
    portrait.appendChild(glare);
    portrait.addEventListener('pointermove', (e) => {
      if (mobile.matches) return;
      const k = reducedMotion.matches ? 0.5 : 1;
      const r = portrait.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      portrait.classList.add('is-tilting');
      img.style.transform = `perspective(900px) rotateX(${(-y * 8 * k).toFixed(2)}deg) rotateY(${(x * 10 * k).toFixed(2)}deg) scale(1.02)`;
      glare.style.setProperty('--gx', `${(x + 0.5) * 100}%`);
      glare.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
    });
    portrait.addEventListener('pointerleave', () => {
      portrait.classList.remove('is-tilting');
      img.style.transform = '';
    });
  }

  /* ---------- Lichtschein auf Karten folgt der Maus ---------- */
  if (finePointer.matches) {
    document.querySelectorAll('.project, .principle, .now').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- Screenshots vergrößern ---------- */
  const lightbox = document.querySelector('.lightbox');
  if (lightbox && typeof lightbox.showModal === 'function') {
    const lbImg = lightbox.querySelector('.lightbox__img');
    const lbCap = lightbox.querySelector('.lightbox__caption');
    document.querySelectorAll('.project__media img').forEach((img) => {
      const figure = img.closest('figure');
      const caption = figure?.querySelector('figcaption')?.textContent.trim() || '';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'zoom';
      const hint = document.createElement('span');
      hint.className = 'visually-hidden';
      hint.textContent = ' – vergrößern';
      img.replaceWith(btn);
      btn.append(img, hint);
      btn.addEventListener('click', () => {
        lbImg.src = img.currentSrc.replace('-640.', '-1200.') || img.src;
        lbImg.alt = img.alt;
        lbCap.textContent = caption;
        lightbox.showModal();
      });
    });
    // Klick neben das Bild schließt
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
  }

  /* ---------- Partikelmotiv (Anspielung auf Particle Playground) ---------- */
  const canvas = document.querySelector('.hero__particles');
  const hero = document.querySelector('.hero');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const fxToggle = document.querySelector('.fx-toggle');

  // Farben aus dem Signaturbild: Mint, helles Mint, Cremeweiß, tiefes Grün
  const COLORS = ['201,248,175', '231,254,204', '253,254,226', '144,194,122'];
  let w = 0, h = 0, dpr = 1;
  let particles = [];
  let sparks = [];
  let running = false;
  let visible = true;
  let paused = store.get('awa-fx-paused') === '1';
  let raf = 0;
  let last = 0;
  let t = 0;
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

  const fadeAt = (x) => (w > 900 ? Math.min(1, Math.max(0.15, (x / w - 0.2) * 2)) : 0.6);
  const drawDot = (p) => {
    // Links ausblenden, damit die Schrift lesbar bleibt
    ctx.fillStyle = `rgba(${p.color},${(p.alpha * fadeAt(p.x)).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  };

  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(drawDot);
  }

  // Klick ins Feld: Stoßwelle für die Partikel und ein kurzer Funkenregen.
  const burst = (x, y) => {
    for (const p of particles) {
      const dx = p.x - x;
      const dy = p.y - y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < 260) {
        const f = (1 - d / 260) * 9;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }
    }
    const n = reducedMotion.matches ? 18 : 42;
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2;
      const v = 1.5 + Math.random() * 5;
      sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, size: 0.8 + Math.random() * 1.8, color: COLORS[(Math.random() * 3) | 0] });
    }
    if (sparks.length > 400) sparks.splice(0, sparks.length - 400);
    if (!running) start(true);
  };

  const step = (now) => {
    const dt = Math.min(3, last ? (now - last) / 16.7 : 1);
    last = now;
    // Bei reduzierter Bewegung (z. B. Windows-Animationen aus) läuft alles deutlich ruhiger.
    const calm = reducedMotion.matches;
    const speedScale = calm ? 0.3 : 1;
    t += 16.7 * dt * speedScale;

    // Teilweise löschen erzeugt kurze, weiche Spuren auf transparentem Grund.
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = calm ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.32)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';

    for (const p of particles) {
      const a = flow(p.x, p.y, t);
      p.vx += Math.cos(a) * 0.04 * p.speed * speedScale * dt;
      p.vy += Math.sin(a) * 0.04 * p.speed * speedScale * dt;

      if (pointer.active) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 150 * 150 && d2 > 1) {
          const d = Math.sqrt(d2);
          const f = (1 - d / 150) * 0.3;
          // abstoßen und leicht verwirbeln
          p.vx += ((dx / d) * f - (dy / d) * f * 0.6) * dt;
          p.vy += ((dy / d) * f + (dx / d) * f * 0.6) * dt;
        }
      }

      const damp = Math.pow(0.95, dt);
      p.vx *= damp;
      p.vy *= damp;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x < -10) p.x = w + 10;
      else if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      else if (p.y > h + 10) p.y = -10;

      drawDot(p);
    }

    for (let k = sparks.length - 1; k >= 0; k--) {
      const s = sparks[k];
      s.vx *= Math.pow(0.94, dt);
      s.vy = s.vy * Math.pow(0.94, dt) + 0.04 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= 0.018 * dt;
      if (s.life <= 0) { sparks.splice(k, 1); continue; }
      ctx.fillStyle = `rgba(${s.color},${(s.life * 0.95).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * (0.6 + s.life * 0.6), 0, Math.PI * 2);
      ctx.fill();
    }

    // Angehalten: nur noch die letzten Funken ausklingen lassen.
    if (paused && !sparks.length) { stop(); drawStatic(); return; }
    raf = requestAnimationFrame(step);
  };

  function start(force = false) {
    if (running || !visible || document.hidden) return;
    if (paused && !force) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(step);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  const setPaused = (value) => {
    paused = value;
    store.set('awa-fx-paused', value ? '1' : '0');
    fxToggle.setAttribute('aria-pressed', String(value));
    const text = value ? 'Partikel starten' : 'Partikel anhalten';
    fxToggle.title = text;
    fxToggle.querySelector('.visually-hidden').textContent = text;
    if (value) { if (!sparks.length) { stop(); drawStatic(); } } else start();
  };
  fxToggle.addEventListener('click', () => setPaused(!paused));
  setPaused(paused);

  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = true;
  });
  hero.addEventListener('pointerleave', () => { pointer.active = false; });
  hero.addEventListener('click', (e) => {
    // Nur ins freie Feld, nicht auf Links, Schaltflächen oder Texte
    if (e.target.closest('a, button, p, h1, figure, li, .ticker')) return;
    const rect = canvas.getBoundingClientRect();
    burst(e.clientX - rect.left, e.clientY - rect.top);
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible ? start() : stop();
    }).observe(hero);
  }
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

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
