(() => {
  'use strict';
  const root = document.documentElement;
  const body = document.body;
  const toggle = document.querySelector('.motion-toggle');
  const canvas = document.querySelector('#motes');
  const ctx = canvas?.getContext('2d', { alpha: true });
  const cursor = document.querySelector('.cursor-light');
  const progress = document.querySelector('.reading-line span');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const lowPower = Boolean(connection?.saveData) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  let motion = !reduced.matches;
  let visible = !document.hidden;
  let raf = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];

  const setMotion = (enabled, persist = true) => {
    motion = Boolean(enabled) && !reduced.matches;
    root.dataset.motion = motion ? 'on' : 'off';
    body.classList.toggle('is-motion-off', !motion);
    toggle?.setAttribute('aria-pressed', String(motion));
    toggle?.setAttribute('aria-label', motion ? '关闭动态效果' : '开启动态效果');
    if (persist) {
      try { localStorage.setItem('nkbr-motion', motion ? 'on' : 'off'); } catch {}
    }
    if (motion && visible) start(); else stop();
  };

  try {
    if (localStorage.getItem('nkbr-motion') === 'off') motion = false;
  } catch {}
  root.dataset.quality = lowPower ? 'low' : 'high';
  toggle?.addEventListener('click', () => setMotion(!motion));
  reduced.addEventListener?.('change', () => setMotion(!reduced.matches, false));

  const revealItems = [...document.querySelectorAll('[data-reveal]')];
  if (!('IntersectionObserver' in window) || reduced.matches) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    root.classList.add('reveal-enhanced');
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      observer.observe(item);
    });
  }

  const resize = () => {
    if (!canvas || !ctx) return;
    dpr = Math.min(devicePixelRatio || 1, lowPower ? 1 : 1.5);
    width = innerWidth;
    height = innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = lowPower ? Math.min(18, Math.round(width / 55)) : Math.min(46, Math.round(width / 28));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.7 + Math.random() * 2.2,
      vx: (Math.random() - 0.5) * 0.13,
      vy: -0.08 - Math.random() * 0.22,
      a: 0.08 + Math.random() * 0.22
    }));
  };

  const draw = () => {
    if (!ctx || !motion || !visible) return;
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -8) { p.y = height + 8; p.x = Math.random() * width; }
      if (p.x < -8) p.x = width + 8;
      if (p.x > width + 8) p.x = -8;
      ctx.beginPath();
      ctx.fillStyle = `rgba(78,123,61,${p.a})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  };
  const start = () => { if (!raf && ctx) raf = requestAnimationFrame(draw); };
  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; ctx?.clearRect(0, 0, width, height); };
  addEventListener('resize', resize, { passive: true });
  resize();
  setMotion(motion, false);

  addEventListener('pointermove', (event) => {
    if (!motion || event.pointerType === 'touch') return;
    const x = event.clientX;
    const y = event.clientY;
    root.style.setProperty('--light-x', `${(x / innerWidth) * 100}%`);
    root.style.setProperty('--light-y', `${(y / innerHeight) * 100}%`);
    if (cursor) {
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
    }
  }, { passive: true });

  const onScroll = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible && motion) start(); else stop();
  });
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
