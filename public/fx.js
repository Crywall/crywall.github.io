/* CryWall — visual effects in the cryvextech.com.tr style:
   theme picker, intro, scroll progress, cursor ring, reveal-on-scroll,
   magnetic buttons, count-up and the scroll-reactive category strips. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };

  // ---------- theme picker ----------
  const THEMES = [
    ['', 'Camgöbeği', '#26ccea'], ['mor', 'Mor', '#a98bff'], ['yesil', 'Yeşil', '#2bd47b'], ['turuncu', 'Turuncu', '#ffae3a'],
    ['pembe', 'Pembe', '#ff6fae'], ['mavi', 'Mavi', '#4d9dff'], ['kirmizi', 'Kırmızı', '#ff5a5a'],
  ];
  const root = document.documentElement;
  const applyTheme = (t) => { if (t) root.dataset.theme = t; else delete root.dataset.theme; store.set('crywall.theme', t); renderMenu(); };
  const menu = $('#themeMenu');
  function renderMenu() {
    if (!menu) return;
    const cur = root.dataset.theme || '';
    menu.innerHTML = THEMES.map(([k, n, c]) => `<button data-t="${k}" class="${k === cur ? 'is-active' : ''}"><i style="background:${c};box-shadow:0 0 10px ${c}"></i>${n}</button>`).join('');
  }
  applyTheme(store.get('crywall.theme', ''));
  $('#themeBtn')?.addEventListener('click', (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; });
  menu?.addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (b) { applyTheme(b.dataset.t); menu.hidden = true; } });
  document.addEventListener('click', (e) => { if (menu && !menu.hidden && !e.target.closest('.themes')) menu.hidden = true; });

  // ---------- scroll progress ----------
  const prog = $('#prog');
  const onScrollProg = () => {
    const h = document.documentElement;
    prog.style.width = (h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1)) * 100 + '%';
  };
  addEventListener('scroll', onScrollProg, { passive: true }); onScrollProg();

  // ---------- cursor ring ----------
  const cur = $('#cursor');
  if (cur && matchMedia('(pointer: fine)').matches) {
    let x = -100, y = -100, cx = -100, cy = -100;
    addEventListener('pointermove', (e) => {
      x = e.clientX; y = e.clientY; cur.classList.add('on');
      cur.classList.toggle('big', !!e.target.closest('a, button, .card, .cat, .mqi, .mqt, .hero__bg, select, input'));
    }, { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.remove('on'));
    addEventListener('pointerdown', () => cur.classList.add('down'));
    addEventListener('pointerup', () => cur.classList.remove('down'));
    (function loop() {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      cur.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    })();
  }

  // ---------- reveal on scroll (staggered) ----------
  const io = new IntersectionObserver((es) => es.forEach((e, i) => {
    if (e.isIntersecting) { setTimeout(() => e.target.classList.add('in'), (i % 4) * 80); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  $$('.section-head, #cats, .toolbar__title, .strip__title, .mq, .footer__inner').forEach((el) => { el.classList.add('reveal'); io.observe(el); });

  // ---------- count-up ----------
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, t0 = performance.now();
    (function tick(t) {
      const p = Math.min(1, (t - t0) / 1400), v = Math.round(to * (1 - Math.pow(1 - p, 3)));
      el.textContent = v; if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }), { threshold: 0.5 });
  $$('[data-count]').forEach((el) => cio.observe(el));

  // ---------- magnetic primary buttons ----------
  document.addEventListener('pointermove', (e) => {
    const b = e.target.closest('.btn--primary');
    $$('.btn--primary.is-mag').forEach((x) => { if (x !== b) { x.classList.remove('is-mag'); x.style.transform = ''; } });
    if (!b || e.pointerType !== 'mouse') return;
    const r = b.getBoundingClientRect();
    b.classList.add('is-mag');
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.16}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
  }, { passive: true });

  // ---------- flowing category strips ----------
  // Two rows drift slowly in opposite directions at a steady speed.
  const api = window.CryWall;
  const rows = [];
  function buildStrips() {
    const cats = $('#mqCats'), live = $('#mqLive');
    if (!api || !cats || !live) return;
    const cHtml = api.CATS.filter((c) => c.key !== 'kesfet')
      .map((c) => `<button class="mqi" data-cat="${c.key}"><img src="${c.img}" alt="" loading="lazy"><span>${c.name}</span></button>`).join('');
    cats.innerHTML = cHtml + cHtml;
    const lHtml = api.LIVE_CATS.filter((c) => c[0].startsWith('mb:')).slice(0, 14)
      .map(([k, n]) => `<button class="mqt" data-live="${k}"><i></i>${n}<small>Hareketli</small></button>`).join('');
    live.innerHTML = lHtml + lHtml;
    cats.addEventListener('click', (e) => { const b = e.target.closest('[data-cat]'); if (b && !dragMoved) api.openCat(b.dataset.cat); });
    live.addEventListener('click', (e) => { const b = e.target.closest('[data-live]'); if (b && !dragMoved) api.openLive(b.dataset.live); });
    $$('.mq').forEach((mq) => {
      const row = { mq, track: mq.firstElementChild, dir: +mq.dataset.dir || -1, x: 0, hover: false, base: mq.classList.contains('mq--text') ? 0.3 : 0.4 };
      mq.addEventListener('pointerenter', () => (row.hover = true));
      mq.addEventListener('pointerleave', () => (row.hover = false));
      // drag to scrub
      mq.addEventListener('pointerdown', (e) => { row.drag = e.clientX; row.dragX = row.x; dragMoved = false; });
      rows.push(row);
    });
    addEventListener('pointermove', (e) => rows.forEach((r) => {
      if (r.drag == null) return;
      const dx = e.clientX - r.drag;
      if (Math.abs(dx) > 5) dragMoved = true;
      r.x = r.dragX + dx;
    }));
    addEventListener('pointerup', () => { rows.forEach((r) => (r.drag = null)); setTimeout(() => (dragMoved = false), 0); });
    requestAnimationFrame(frame);
  }
  let dragMoved = false;
  function frame() {
    rows.forEach((r) => {
      const half = r.track.scrollWidth / 2;
      if (r.drag == null) {
        r.x += r.base * r.dir * (r.hover ? 0.3 : 1);   // steady, slow drift — not tied to scrolling
      }
      if (half) { while (r.x <= -half) r.x += half; while (r.x > 0) r.x -= half; }
      r.track.style.transform = `translate3d(${r.x}px,0,0)`;
    });
    requestAnimationFrame(frame);
  }
  buildStrips();
})();

// ---------- back-to-top button ----------
(() => {
  const b = document.getElementById('toTop');
  if (!b) return;
  const upd = () => b.classList.toggle('show', scrollY > 500);
  addEventListener('scroll', upd, { passive: true }); upd();
  b.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
})();
