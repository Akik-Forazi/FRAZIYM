/* ═══════════════════════════════════════════════════════════════
   FRAZIYM TECH & AI — script.js v6.0
   ─ Hero slow typewriter  (1 char / ~900ms)
   ─ Founder name type-backspace infinite loop
   ─ Section header fast typewriter (on scroll into view)
   ─ Full live terminal engine with boot + typos + cursor
   ─ Moving background particles & aurora via JS
   ─ Glitch on headings, 3D tilt on cards
   ─ Stat scramble, backend tag stagger, progress reveal
   ─ Nav, scroll reveal, counters, form UX
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Utilities ──────────────────────────────────────────────── */
  const sleep   = ms => new Promise(r => setTimeout(r, ms));
  const rand    = (a, b) => Math.random() * (b - a) + a;
  const pick    = arr => arr[Math.floor(Math.random() * arr.length)];
  const qs      = (s, ctx = document) => ctx.querySelector(s);
  const qsa     = (s, ctx = document) => [...ctx.querySelectorAll(s)];

  /* ═══════════════════════════════════════════════════════════
     INJECT RUNTIME STYLES
  ═══════════════════════════════════════════════════════════ */
  if (!qs('#fz-runtime-css')) {
    const s = document.createElement('style');
    s.id = 'fz-runtime-css';
    s.textContent = `
      /* ── Cursors ── */
      @keyframes fz-hero-blink  { 0%,49%{opacity:1} 50%,100%{opacity:0} }
      @keyframes fz-fast-blink  { 0%,49%{opacity:1} 50%,100%{opacity:0} }
      @keyframes fz-term-blink  { 0%,49%{opacity:1} 50%,100%{opacity:0} }

      .fz-hero-cursor {
        display:inline-block; width:4px; height:0.85em;
        background:var(--accent-light); margin-left:3px;
        vertical-align:text-bottom; border-radius:1px;
        animation:fz-hero-blink 1.1s step-end infinite;
      }
      .fz-fast-cursor {
        display:inline-block; width:2px; height:0.9em;
        background:var(--accent); margin-left:2px;
        vertical-align:text-bottom; border-radius:1px;
        animation:fz-fast-blink 0.75s step-end infinite;
      }
      .fz-term-cursor {
        display:inline-block; width:0.5em; height:1em;
        background:var(--accent-light); margin-left:1px;
        vertical-align:text-bottom; border-radius:1px;
        animation:fz-term-blink 1s step-end infinite; flex-shrink:0;
        opacity:0.85;
      }

      /* ── Terminal live lines ── */
      @keyframes fz-fadein { from{opacity:0;transform:translateY(2px)} to{opacity:1;transform:none} }
      @keyframes fz-scan   { 0%{background-position:0 0} 100%{background-position:0 200px} }

      .fz-line {
        display:block; white-space:pre-wrap; word-break:break-all;
        line-height:1.75; animation:fz-fadein 0.1s ease;
      }
      .fz-line.fz-cmd    { color:var(--fg); }
      .fz-line.fz-dim    { color:var(--fg-dim); }
      .fz-line.fz-ok     { color:#4ade80; }
      .fz-line.fz-err    { color:var(--accent-3); }
      .fz-line.fz-blue   { color:var(--accent-2); }
      .fz-line.fz-warn   { color:var(--accent-4); }
      .fz-line.fz-prompt { color:var(--accent-light); font-weight:600; }
      .fz-line.fz-gap    { height:0.65em; display:block; }

      .fz-scan {
        pointer-events:none; position:absolute; inset:0; z-index:2;
        background:repeating-linear-gradient(
          transparent 0px, transparent 3px,
          rgba(124,92,252,0.022) 3px, rgba(124,92,252,0.022) 4px
        );
        animation:fz-scan 7s linear infinite; border-radius:inherit;
      }
      .terminal-body { position:relative; }

      /* ── Glitch ── */
      @keyframes fz-g1 {
        0%{clip-path:inset(38% 0 52% 0);transform:translate(-3px,0)}
        50%{clip-path:inset(72% 0 14% 0);transform:translate(3px,0)}
        100%{clip-path:inset(20% 0 66% 0);transform:translate(-1px,0)}
      }
      @keyframes fz-g2 {
        0%{clip-path:inset(55% 0 30% 0);transform:translate(3px,0);color:#4fa3ff}
        50%{clip-path:inset(15% 0 75% 0);transform:translate(-3px,0);color:#ff6b8a}
        100%{clip-path:inset(80% 0 8% 0);transform:translate(1px,0);color:#7c5cfc}
      }
      .fz-glitch          { position:relative; }
      .fz-glitch.fz-active::before,
      .fz-glitch.fz-active::after {
        content:attr(data-gt); position:absolute; inset:0;
        font:inherit; letter-spacing:inherit; pointer-events:none;
      }
      .fz-glitch.fz-active::before { animation:fz-g1 0.2s steps(1) forwards; opacity:0.6; }
      .fz-glitch.fz-active::after  { animation:fz-g2 0.2s steps(1) forwards; opacity:0.45; }

      /* ── Profile image ── */
      .founder-img-wrap,[data-profile-img] {
        transition:opacity 0.7s ease,transform 0.7s ease,box-shadow 0.7s ease;
        opacity:0; transform:scale(0.9) translateY(16px);
      }
      .founder-img-wrap.fz-revealed,[data-profile-img].fz-revealed {
        opacity:1; transform:scale(1) translateY(0);
        box-shadow:0 0 70px rgba(124,92,252,0.32);
      }

      /* ── Tilt ── */
      [data-tilt] { will-change:transform; }

      /* ── Progress steps ── */
      .progress-step,.progress-tracker .progress-step {
        transition:opacity 0.45s ease,transform 0.45s ease;
        opacity:0; transform:translateX(-12px);
      }
      .progress-step.fz-in { opacity:1; transform:translateX(0); }

      /* ── Section header typewriter highlight ── */
      .fz-typed-done { border-right:none; }

      /* ── Floating particles canvas ── */
      #fz-particles {
        position:fixed; inset:0; z-index:0; pointer-events:none;
        opacity:0.55;
      }

      /* ── Ambient light orbs that drift ── */
      .fz-orb {
        position:fixed; border-radius:50%; pointer-events:none; z-index:0;
        filter:blur(120px); mix-blend-mode:screen; opacity:0;
        animation:fz-orb-drift linear infinite;
      }
      @keyframes fz-orb-drift {
        0%   { transform:translate(0,0) scale(1);   opacity:0; }
        10%  { opacity:var(--orb-opacity); }
        50%  { transform:translate(var(--orb-dx),var(--orb-dy)) scale(1.1); }
        90%  { opacity:var(--orb-opacity); }
        100% { transform:translate(0,0) scale(1);   opacity:0; }
      }
    `;
    document.head.appendChild(s);
  }

  /* ═══════════════════════════════════════════════════════════
     AMBIENT ORB LIGHTING
     Creates 4 slow-drifting glowing blobs behind everything
  ═══════════════════════════════════════════════════════════ */
  function spawnOrbs() {
    const orbs = [
      { color:'rgba(124,92,252,0.18)', size:700, x:'8%',  y:'5%',  dx:'6vw',  dy:'8vh',  dur:22, opacity:0.18 },
      { color:'rgba(79,163,255,0.12)',  size:500, x:'80%', y:'10%', dx:'-8vw', dy:'12vh', dur:28, opacity:0.12 },
      { color:'rgba(124,92,252,0.10)',  size:600, x:'50%', y:'85%', dx:'10vw', dy:'-6vh', dur:32, opacity:0.10 },
      { color:'rgba(255,107,138,0.07)', size:400, x:'20%', y:'60%', dx:'-6vw', dy:'-8vh', dur:26, opacity:0.07 },
    ];
    orbs.forEach(o => {
      const el = document.createElement('div');
      el.className = 'fz-orb';
      el.style.cssText = [
        `width:${o.size}px`, `height:${o.size}px`,
        `background:radial-gradient(circle,${o.color},transparent 70%)`,
        `left:${o.x}`, `top:${o.y}`,
        `--orb-dx:${o.dx}`, `--orb-dy:${o.dy}`,
        `--orb-opacity:${o.opacity}`,
        `animation-duration:${o.dur}s`,
        `animation-delay:${rand(0,8)}s`,
      ].join(';');
      document.body.appendChild(el);
    });
  }
  spawnOrbs();

  /* ═══════════════════════════════════════════════════════════
     CANVAS PARTICLES — floating dots that move
  ═══════════════════════════════════════════════════════════ */
  function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'fz-particles';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = innerWidth;
      canvas.height = innerHeight;
    };
    resize();
    addEventListener('resize', resize, { passive: true });

    const COUNT  = Math.min(60, Math.floor(innerWidth / 22));
    const COLORS = ['rgba(164,139,255,', 'rgba(79,163,255,', 'rgba(77,240,200,'];
    const dots   = Array.from({ length: COUNT }, () => ({
      x:  rand(0, innerWidth),
      y:  rand(0, innerHeight),
      r:  rand(0.5, 1.8),
      vx: rand(-0.18, 0.18),
      vy: rand(-0.12, 0.12),
      a:  rand(0.15, 0.55),
      c:  pick(COLORS),
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0)            d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0)            d.y = canvas.height;
        if (d.y > canvas.height)d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.c + d.a + ')';
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
  }
  initParticles();

  /* ═══════════════════════════════════════════════════════════
     1. HEADER + NAV
  ═══════════════════════════════════════════════════════════ */
  const header   = qs('.header');
  const toggle   = qs('.mobile-toggle');
  const navLinks = qs('.nav-links');

  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', scrollY > 30);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    document.addEventListener('click', e => {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
    qsa('a:not(.dropdown > a)', navLinks).forEach(a => {
      a.addEventListener('click', () => {
        if (innerWidth <= 860) {
          navLinks.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    });
  }

  qsa('.dropdown').forEach(dd => {
    const tr = qs('a', dd);
    if (!tr) return;
    tr.addEventListener('click', e => {
      if (innerWidth <= 860) { e.preventDefault(); dd.classList.toggle('open'); }
    });
    dd.addEventListener('mouseenter', () => { if (innerWidth > 860) dd.classList.add('open'); });
    dd.addEventListener('mouseleave', () => { if (innerWidth > 860) dd.classList.remove('open'); });
  });

  const cur = location.pathname.split('/').pop() || 'index.html';
  qsa('.nav-links > a').forEach(a => {
    if ((a.getAttribute('href') || '').replace('./', '') === cur) a.classList.add('active');
  });

  /* ═══════════════════════════════════════════════════════════
     2. SCROLL REVEAL
  ═══════════════════════════════════════════════════════════ */
  const revealEls = qsa('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ═══════════════════════════════════════════════════════════
     3. COUNTER
  ═══════════════════════════════════════════════════════════ */
  qsa('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    let started = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        started = true; io.disconnect();
        const dur = 1600; let t0 = null;
        requestAnimationFrame(function step(ts) {
          if (!t0) t0 = ts;
          const p    = Math.min((ts - t0) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          const v    = Number.isInteger(target) ? Math.floor(ease * target) : (ease * target).toFixed(1);
          el.textContent = prefix + v + suffix;
          if (p < 1) requestAnimationFrame(step);
        });
      }
    }, { threshold: 0.5 });
    io.observe(el);
  });

  /* ═══════════════════════════════════════════════════════════
     4. SMOOTH SCROLL
  ═══════════════════════════════════════════════════════════ */
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = qs(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70;
      scrollTo({ top: t.getBoundingClientRect().top + scrollY - navH - 16, behavior: 'smooth' });
    });
  });

  /* ═══════════════════════════════════════════════════════════
     5. FORM UX
  ═══════════════════════════════════════════════════════════ */
  qsa('form[data-demo]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = qs('[type="submit"]', form);
      if (!btn) return;
      const orig = btn.textContent;
      btn.textContent = 'Sending…'; btn.disabled = true;
      setTimeout(() => {
        btn.textContent = '✓ Sent! We\'ll respond within 24h';
        btn.style.background = '#4ade80'; btn.style.color = '#030508';
        setTimeout(() => {
          btn.textContent = orig; btn.disabled = false;
          btn.style.background = btn.style.color = '';
          form.reset();
        }, 5000);
      }, 1400);
    });
  });

  /* ═══════════════════════════════════════════════════════════
     6. TOUCH SWIPE
  ═══════════════════════════════════════════════════════════ */
  let ty0 = 0;
  document.addEventListener('touchstart', e => { ty0 = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', e => {
    if (e.changedTouches[0].clientY - ty0 < -60 && navLinks?.classList.contains('open')) {
      navLinks.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }, { passive: true });

  /* ═══════════════════════════════════════════════════════════
     7. LOGO HOVER
  ═══════════════════════════════════════════════════════════ */
  const logoWrap = qs('.logo');
  const logoIcon = qs('.logo-icon');
  if (logoWrap && logoIcon) {
    logoWrap.addEventListener('mouseenter', () => {
      logoIcon.style.transform = 'rotate(14deg) scale(1.15)';
      logoIcon.style.filter    = 'drop-shadow(0 0 18px rgba(124,92,252,0.9))';
    });
    logoWrap.addEventListener('mouseleave', () => {
      logoIcon.style.transform = '';
      logoIcon.style.filter    = '';
    });
  }

  /* ═══════════════════════════════════════════════════════════
     8. HERO SLOW TYPEWRITER  ── 1 char per ~90ms
     Target: elements with [data-hero-type]
     Preserves child spans (.display etc)
  ═══════════════════════════════════════════════════════════ */
  async function heroType(el) {
    // Parse children before clearing
    const parts = [];
    el.childNodes.forEach(n => {
      if (n.nodeType === 3) {
        parts.push({ kind: 'text', val: n.textContent });
      } else {
        parts.push({ kind: 'elem', tag: n.tagName, cls: n.className, style: n.style?.cssText || '', text: n.textContent });
      }
    });

    el.innerHTML = '';
    const cursor = document.createElement('span');
    cursor.className = 'fz-hero-cursor';
    el.appendChild(cursor);

    for (const part of parts) {
      if (part.kind === 'text') {
        for (const ch of part.val) {
          if (ch.trim() || ch === ' ') {
            el.insertBefore(document.createTextNode(ch), cursor);
          }
          await sleep(rand(50, 90)); // ~1 sec per char
        }
      } else {
        // Animate child span char by char too
        const span = document.createElement(part.tag);
        span.className = part.cls;
        if (part.style) span.style.cssText = part.style;
        el.insertBefore(span, cursor);
        for (const ch of part.text) {
          span.textContent += ch;
          await sleep(rand(82, 105));
        }
      }
    }
    // Leave cursor blinking
  }

  qsa('[data-hero-type]').forEach(el => heroType(el));

  /* ═══════════════════════════════════════════════════════════
     9. FOUNDER NAME  ── type → pause → backspace → retype loop
     Target: element with [data-founder-loop]
     Format: data-names="Akik Faraji|Akik F.|The Founder"
  ═══════════════════════════════════════════════════════════ */
  async function founderLoop(el) {
    const names  = (el.dataset.names || el.textContent).split('|').map(s => s.trim()).filter(Boolean);
    const cursor = document.createElement('span');
    cursor.className = 'fz-hero-cursor';
    el.textContent = '';
    el.appendChild(cursor);

    let idx = 0;
    while (true) {
      const name = names[idx % names.length];
      // Type forward
      for (const ch of name) {
        el.insertBefore(document.createTextNode(ch), cursor);
        await sleep(rand(90, 150)); // fast typing for the name
      }
      await sleep(3800); // pause to read
      // Backspace all
      while (el.childNodes.length > 1) { // keep cursor
        const nodes = [...el.childNodes].filter(n => n !== cursor);
        if (!nodes.length) break;
        nodes[nodes.length - 1].remove();
        await sleep(rand(55, 90));
      }
      await sleep(500);
      idx++;
    }
  }

  qsa('[data-founder-loop]').forEach(el => founderLoop(el));

  /* ═══════════════════════════════════════════════════════════
     10. SECTION HEADER FAST TYPEWRITER  ~35ms/char
     Target: elements with [data-type-header]
     Fires when element scrolls into view
  ═══════════════════════════════════════════════════════════ */
  async function typeHeader(el) {
    const parts = [];
    el.childNodes.forEach(n => {
      if (n.nodeType === 3) parts.push({ kind: 'text', val: n.textContent });
      else parts.push({ kind: 'elem', tag: n.tagName, cls: n.className, style: n.style?.cssText || '', text: n.textContent });
    });
    el.innerHTML = '';
    const cursor = document.createElement('span');
    cursor.className = 'fz-fast-cursor';
    el.appendChild(cursor);

    for (const part of parts) {
      if (part.kind === 'text') {
        for (const ch of part.val) {
          el.insertBefore(document.createTextNode(ch), cursor);
          await sleep(rand(28, 52));
        }
      } else {
        const span = document.createElement(part.tag);
        span.className = part.cls;
        if (part.style) span.style.cssText = part.style;
        el.insertBefore(span, cursor);
        for (const ch of part.text) {
          span.textContent += ch;
          await sleep(rand(28, 52));
        }
      }
    }
    cursor.remove(); // section headers don't keep cursor
  }

  qsa('[data-type-header]').forEach(el => {
    let done = false;
    const io = new IntersectionObserver(([entry], obs) => {
      if (entry.isIntersecting && !done) {
        done = true; obs.disconnect();
        typeHeader(el);
      }
    }, { threshold: 0.5 });
    io.observe(el);
  });

  /* ═══════════════════════════════════════════════════════════
     11. GLITCH  ── [data-glitch] fires randomly
  ═══════════════════════════════════════════════════════════ */
  function glitchFire(el) {
    el.setAttribute('data-gt', el.textContent);
    el.classList.add('fz-glitch', 'fz-active');
    setTimeout(() => el.classList.remove('fz-active'), 240);
  }
  qsa('[data-glitch]').forEach(el => {
    el.classList.add('fz-glitch');
    const schedule = () => setTimeout(() => {
      if (document.contains(el)) { glitchFire(el); schedule(); }
    }, rand(4500, 13000));
    schedule();
  });

  /* ═══════════════════════════════════════════════════════════
     12. 3D TILT  ── [data-tilt]
  ═══════════════════════════════════════════════════════════ */
  qsa('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - 0.5;
      const y  = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform  = `perspective(700px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) scale(1.022)`;
      card.style.boxShadow  = `${-x * 16}px ${-y * 16}px 40px rgba(124,92,252,0.15)`;
      card.style.transition = 'transform 0.08s ease, box-shadow 0.08s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.boxShadow  = '';
      card.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
    });
  });

  /* ═══════════════════════════════════════════════════════════
     13. STAT DIGIT SCRAMBLE  ── .stat-num without data-count
  ═══════════════════════════════════════════════════════════ */
  const DIGS = '0123456789';
  qsa('.stat-num:not([data-count])').forEach(el => {
    const final = el.textContent.trim();
    let done = false;
    const io = new IntersectionObserver(([e], obs) => {
      if (e.isIntersecting && !done) {
        done = true; obs.disconnect();
        let f = 0; const total = 22;
        const iv = setInterval(() => {
          if (f >= total) { el.textContent = final; clearInterval(iv); return; }
          el.textContent = final.split('').map(ch =>
            /\d/.test(ch) && f < total * 0.72
              ? DIGS[Math.floor(Math.random() * 10)] : ch
          ).join('');
          f++;
        }, 50);
      }
    }, { threshold: 0.5 });
    io.observe(el);
  });

  /* ═══════════════════════════════════════════════════════════
     14. PROFILE IMAGE REVEAL
  ═══════════════════════════════════════════════════════════ */
  qsa('.founder-img-wrap, [data-profile-img]').forEach(el => {
    const io = new IntersectionObserver(([e], obs) => {
      if (e.isIntersecting) { obs.disconnect(); el.classList.add('fz-revealed'); }
    }, { threshold: 0.25 });
    io.observe(el);
  });

  /* ═══════════════════════════════════════════════════════════
     15. PROGRESS STEPS REVEAL  ── sequential
  ═══════════════════════════════════════════════════════════ */
  qsa('.progress-track, .progress-tracker').forEach(track => {
    const steps = qsa('.progress-step', track);
    const io = new IntersectionObserver(([e], obs) => {
      if (e.isIntersecting) {
        obs.disconnect();
        steps.forEach((s, i) => setTimeout(() => s.classList.add('fz-in'), i * 100));
      }
    }, { threshold: 0.08 });
    io.observe(track);
  });

  /* ═══════════════════════════════════════════════════════════
     16. BACKEND TAG STAGGER
  ═══════════════════════════════════════════════════════════ */
  qsa('.backend-grid').forEach(grid => {
    const tags = qsa('.backend-tag', grid);
    tags.forEach(t => { t.style.opacity = '0'; t.style.transform = 'translateY(8px)'; t.style.transition = 'opacity 0.35s ease, transform 0.35s ease'; });
    const io = new IntersectionObserver(([e], obs) => {
      if (e.isIntersecting) {
        obs.disconnect();
        tags.forEach((t, i) => setTimeout(() => { t.style.opacity = '1'; t.style.transform = ''; }, i * 40));
      }
    }, { threshold: 0.1 });
    io.observe(grid);
  });

  /* ═══════════════════════════════════════════════════════════
     17. LIVE TERMINAL ENGINE  ── full rewrite
  ═══════════════════════════════════════════════════════════ */

  // Color map: t-class → fz-class
  const CLS_MAP = {
    't-prompt':'fz-prompt','t-cmd':'fz-cmd','t-ok':'fz-ok',
    't-blue':'fz-blue','t-dim':'fz-dim','t-warn':'fz-warn','t-error':'fz-err',
  };

  function parseScript(body) {
    const steps = [];
    qsa('.t-line', body).forEach(line => {
      if (!line.textContent.trim()) { steps.push({ type: 'gap' }); return; }
      const segs = [];
      line.childNodes.forEach(n => {
        if (n.nodeType === 3 && n.textContent) {
          segs.push({ text: n.textContent, cls: null });
        } else if (n.nodeType === 1) {
          let cls = null;
          for (const [k, v] of Object.entries(CLS_MAP)) {
            if (n.classList.contains(k) || n.className?.includes?.(k)) { cls = v; break; }
          }
          segs.push({ text: n.textContent, cls });
        }
      });
      const isCmd  = !!qs('.t-prompt', line);
      const isOk   = line.classList.contains('t-ok') || line.textContent.includes('✓') || line.textContent.includes('●');
      const isDim  = line.classList.contains('t-dim');
      const isBlue = !!qs('.t-blue', line);
      steps.push({
        type: 'line', segs,
        isCommand: isCmd,
        baseClass: isOk ? 'fz-ok' : isDim ? 'fz-dim' : isBlue ? 'fz-blue' : 'fz-cmd',
      });
    });
    return steps;
  }

  const TERM_SPEED = {
    cmd:  () => rand(42, 88),
    out:  () => rand(5, 16),
    del:  () => rand(50, 80),
  };

  async function typeWithTypos(text, appendFn, speedFn) {
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (/[a-z]/i.test(ch) && Math.random() < 0.06) {
        appendFn(String.fromCharCode(ch.charCodeAt(0) + (Math.random() < 0.5 ? 1 : -1)));
        await sleep(TERM_SPEED.cmd());
        await sleep(rand(160, 340));
        appendFn('\b');
        await sleep(TERM_SPEED.del());
      }
      appendFn(ch);
      await sleep(speedFn());
    }
  }

  async function renderTermLine(lineEl, segs, isCmd, cursor) {
    lineEl.innerHTML = '';
    lineEl.appendChild(cursor);
    for (const seg of segs) {
      let container = null;
      if (seg.cls) {
        container = document.createElement('span');
        container.className = seg.cls;
        lineEl.insertBefore(container, cursor);
      }
      const appendChar = ch => {
        if (ch === '\b') {
          const parent = container || lineEl;
          const kids = [...parent.childNodes].filter(n => n !== cursor);
          if (kids.length) kids[kids.length - 1].remove();
          return;
        }
        const tn = document.createTextNode(ch);
        if (container) container.appendChild(tn);
        else lineEl.insertBefore(tn, cursor);
      };
      if (isCmd && seg.cls === 'fz-cmd') {
        await typeWithTypos(seg.text, appendChar, TERM_SPEED.cmd);
      } else {
        for (const ch of seg.text) { appendChar(ch); await sleep(TERM_SPEED.out()); }
      }
    }
  }

  const BOOT_LINES = [
    { t: 'FRAZIYM TECH & AI  ·  runtime v1.0-beta-A2', d: 0 },
    { t: 'system check: CPU OK  ·  RAM 16 GB  ·  OS win32', d: 80 },
    { t: 'backend providers: 8 loaded ................. OK', d: 100 },
    { t: 'tool registry: 20 tools ..................... OK', d: 80 },
    { t: 'memory system: active ....................... OK', d: 60 },
    { t: '─'.repeat(52), d: 40 },
  ];

  async function runBoot(body, cursor) {
    for (const row of BOOT_LINES) {
      await sleep(row.d);
      const el = document.createElement('span');
      el.className = 'fz-line fz-dim';
      body.insertBefore(el, cursor);
      for (const ch of row.t) { el.textContent += ch; await sleep(rand(3, 12)); }
    }
    await sleep(220);
    qsa('.fz-line.fz-dim', body).forEach(el => { el.style.transition = 'opacity 0.2s'; el.style.opacity = '0'; });
    await sleep(250);
    qsa('.fz-line.fz-dim', body).forEach(el => el.remove());
    await sleep(100);
  }

  async function runTerminal(terminal) {
    const body = qs('.terminal-body', terminal);
    if (!body) return;
    const script = parseScript(body);
    const loops  = terminal.hasAttribute('data-terminal-loop');
    const fast   = terminal.dataset.terminalSpeed === 'fast';

    // Add scanline
    if (!qs('.fz-scan', body)) {
      const scan = document.createElement('div');
      scan.className = 'fz-scan';
      body.appendChild(scan);
    }
    // Wipe static content
    [...body.childNodes].forEach(n => { if (!n.classList?.contains?.('fz-scan')) n.remove(); });

    const cursor = document.createElement('span');
    cursor.className = 'fz-term-cursor';
    body.appendChild(cursor);

    const doRun = async () => {
      qsa('.fz-line', body).forEach(l => l.remove());
      body.appendChild(cursor);
      if (!fast) await runBoot(body, cursor);

      for (const step of script) {
        if (step.type === 'gap') {
          const g = document.createElement('span');
          g.className = 'fz-line fz-gap';
          body.insertBefore(g, cursor);
          await sleep(55);
          continue;
        }
        if (step.isCommand) await sleep(rand(280, 650));
        const lineEl = document.createElement('span');
        lineEl.className = `fz-line ${step.baseClass}`;
        body.insertBefore(lineEl, cursor);
        await renderTermLine(lineEl, step.segs, step.isCommand && !fast, cursor);
        await sleep(step.isCommand ? rand(100, 220) : rand(25, 70));
      }

      if (loops) {
        await sleep(3400);
        qsa('.fz-line', body).forEach(l => { l.style.transition = 'opacity 0.35s'; l.style.opacity = '0'; });
        await sleep(400);
        await doRun();
      }
    };

    const io = new IntersectionObserver(([e], obs) => {
      if (e.isIntersecting) { obs.disconnect(); doRun(); }
    }, { threshold: 0.12 });
    io.observe(terminal);
  }

  qsa('.terminal').forEach((t, i) => setTimeout(() => runTerminal(t), i * 450));

  /* ═══════════════════════════════════════════════════════════
     18. STATUS TICKER  ── [data-ticker]
  ═══════════════════════════════════════════════════════════ */
  qsa('[data-ticker]').forEach(el => {
    const items = (el.dataset.tickerItems || '').split('|').map(s => s.trim()).filter(Boolean);
    if (!items.length) return;
    let idx = 0;
    const cycle = async () => {
      el.style.transition = 'opacity 0.25s';
      el.style.opacity = '0';
      await sleep(280);
      el.textContent = items[idx++ % items.length];
      el.style.opacity = '1';
      setTimeout(cycle, rand(2400, 3800));
    };
    setTimeout(cycle, rand(600, 1800));
  });

  /* ═══════════════════════════════════════════════════════════
     19. MOUSE PARALLAX on hero sections
  ═══════════════════════════════════════════════════════════ */
  document.addEventListener('mousemove', e => {
    const mx = (e.clientX / innerWidth  - 0.5) * 2;
    const my = (e.clientY / innerHeight - 0.5) * 2;
    qsa('.fz-orb').forEach((orb, i) => {
      const strength = [12, 8, 6, 10][i] || 8;
      const ox = mx * strength;
      const oy = my * strength;
      orb.style.marginLeft = ox + 'px';
      orb.style.marginTop  = oy + 'px';
    });
  }, { passive: true });

  /* ═══════════════════════════════════════════════════════════
     20. POINTER LIGHT  ── subtle glow only inside cards/boxes
  ═══════════════════════════════════════════════════════════ */
  (function initPointerLight() {
    const style = document.createElement('style');
    style.textContent = `
      .card, .card-feature, .person-card, .stat {
        --px: 50%; --py: 50%;
      }
      .card:hover, .card-feature:hover, .person-card:hover, .stat:hover {
        background-image: radial-gradient(circle at var(--px) var(--py), rgba(124,92,252,0.07) 0%, transparent 65%);
      }
    `;
    document.head.appendChild(style);

    const boxEls = '.card, .card-feature, .person-card, .stat';
    document.addEventListener('mousemove', e => {
      const box = e.target.closest(boxEls);
      if (!box) return;
      const r = box.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%';
      const y = ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%';
      box.style.setProperty('--px', x);
      box.style.setProperty('--py', y);
    }, { passive: true });
  })();

  /* ═══════════════════════════════════════════════════════════
     22. CARD BORDER GLOW on hover
  ═══════════════════════════════════════════════════════════ */
  (function initBorderGlow() {
    const style = document.createElement('style');
    style.textContent = `
      .card, .card-feature, .person-card {
        transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
      }
      .card:hover, .card-feature:hover {
        border-color: rgba(124,92,252,0.4) !important;
        box-shadow: 0 0 0 1px rgba(124,92,252,0.15), 0 8px 40px rgba(124,92,252,0.12);
      }
      .person-card:hover {
        border-color: rgba(124,92,252,0.5) !important;
        box-shadow: 0 0 0 1px rgba(124,92,252,0.2), 0 12px 48px rgba(124,92,252,0.15);
      }
    `;
    document.head.appendChild(style);
  })();

  /* ═══════════════════════════════════════════════════════════
     20. GLOBAL API
  ═══════════════════════════════════════════════════════════ */
  window.FRAZIYM = {
    heroType, founderLoop, typeHeader, runTerminal, glitchFire,
    sleep, rand, qs, qsa, version: '6.0',
  };

})();
