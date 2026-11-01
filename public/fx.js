/* VexWalls — visual effects in the cryvextech.com.tr style:
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
  window.CWTheme = { THEMES, apply: applyTheme, current: () => root.dataset.theme || '' };   // used by settings.js
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
  // (cheap: remembers the one button being pulled instead of searching the page on every move)
  let magBtn = null;
  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const b = e.target.closest('.btn--primary');
    if (magBtn && magBtn !== b) { magBtn.style.transform = ''; magBtn = null; }
    if (!b) return;
    magBtn = b;
    const r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.12}px, ${(e.clientY - r.top - r.height / 2) * 0.2}px)`;
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
      // mouse wheel over a strip scrolls the strip itself (fast); outside it the page scrolls as usual
      mq.addEventListener('wheel', (e) => {
        e.preventDefault();
        const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        row.x -= d * (e.deltaMode === 1 ? 32 : 1.1);
      }, { passive: false });
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
    // measure once (reading sizes every frame is slow on phones); re-measure on resize
    const measure = () => rows.forEach((r) => (r.half = r.track.scrollWidth / 2));
    measure(); addEventListener('resize', measure); setTimeout(measure, 1500);
    // only animate while the strips are on screen
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible && !running) { running = true; requestAnimationFrame(frame); } })
      .observe($('#strip'));
  }
  let dragMoved = false, visible = false, running = false;
  function frame() {
    if (!visible) { running = false; return; }
    rows.forEach((r) => {
      const half = r.half;
      if (r.drag == null) {
        if (!r.hover) r.x += r.base * r.dir;   // slow steady drift; stops while the mouse is on the strip
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

// ---------- privacy note (shown once) + privacy dialog ----------
(() => {
  const dlg = document.getElementById('privacy');
  document.getElementById('openPrivacy')?.addEventListener('click', () => dlg?.showModal());
  let seen = false; try { seen = localStorage.getItem('crywall.privacy') === '1'; } catch {}
  if (seen) return;
  const n = document.createElement('div');
  n.className = 'cookie';
  n.innerHTML = `<div><b>🍪 Çerez yok, takip yok.</b><span>VexWalls sadece favorilerini ve tercihlerini senin cihazında saklar. <a href="#" data-more>Ayrıntılar</a></span></div>
    <button class="btn btn--primary btn--sm" data-ok>Tamam</button>`;
  n.addEventListener('click', (e) => {
    if (e.target.closest('[data-more]')) { e.preventDefault(); dlg?.showModal(); }
    if (e.target.closest('[data-ok]')) { try { localStorage.setItem('crywall.privacy', '1'); } catch {} n.classList.remove('show'); setTimeout(() => n.remove(), 400); }
  });
  document.body.append(n);
  setTimeout(() => n.classList.add('show'), 900);
})();

// ---------- hero: quick category buttons + live wallpaper count ----------
(() => {
  document.querySelector('.hero2__quick')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-quickcat]');
    if (b && window.CryWall) window.CryWall.openCat(b.dataset.quickcat);
  });
  fetch('data/index.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((d) => {
    const el = document.querySelector('.hero2__pill b');
    if (d && d.wallpapers && el) el.textContent = new Intl.NumberFormat('tr-TR').format(Math.floor(d.wallpapers / 100) * 100) + '+';
  }).catch(() => {});
})();
