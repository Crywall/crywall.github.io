/* VexWalls — front end */
(() => {
  'use strict';

  // ---------- data ----------
  // Only generic (non-franchise) categories: the site is meant to be published.
  // "+tag" = the wallpaper must carry that tag (keeps categories accurate). Same list as
  // tools/build-catalog.ps1. Women/girls only appear in "Anime Karakter" (original characters).
  const CATS = [
    { key: 'kesfet',    name: 'Keşfet',          q: '',                  c: '100', img: 'https://th.wallhaven.cc/lg/yq/yqg6r7.jpg' },
    { key: 'doga',      name: 'Doğa',            q: '+nature',           c: '100', img: 'https://th.wallhaven.cc/lg/k8/k81776.jpg' },
    { key: 'manzara',   name: 'Manzara',         q: '+landscape',        c: '100', img: 'https://th.wallhaven.cc/lg/qr/qrjmgl.jpg' },
    { key: 'dag',       name: 'Dağ',             q: '+mountains',        c: '100', img: 'https://th.wallhaven.cc/lg/3q/3qqdg6.jpg' },
    { key: 'deniz',     name: 'Deniz',           q: '+sea',              c: '100', img: 'https://th.wallhaven.cc/lg/zp/zpoxyj.jpg' },
    { key: 'orman',     name: 'Orman',           q: '+forest',           c: '100', img: 'https://th.wallhaven.cc/lg/gw/gwm2z3.jpg' },
    { key: 'anime',     name: 'Anime Manzara',   q: '+landscape',        c: '010', img: 'https://th.wallhaven.cc/lg/yq/yqe81l.jpg' },
    { key: 'karakter',  name: 'Anime Karakter',  q: '+"original characters" +"anime girls"', c: '010', img: 'https://th.wallhaven.cc/lg/3q/3q6m6y.jpg' },
    { key: 'savasci',   name: 'Savaşçılar',      q: '+warrior',          c: '100', img: 'https://th.wallhaven.cc/lg/ne/ne78w4.jpg' },
    { key: 'sovalye',   name: 'Şövalyeler',      q: '+knight',           c: '100', img: 'https://th.wallhaven.cc/lg/kx/kx9pg7.jpg' },
    { key: 'samuray',   name: 'Samuray',         q: '+samurai',          c: '100', img: 'https://th.wallhaven.cc/lg/l3/l3zyg2.jpg' },
    { key: 'japonya',   name: 'Japonya',         q: '+Japan',            c: '100', img: 'https://th.wallhaven.cc/lg/yq/yqv2wx.jpg' },
    { key: 'uzay',      name: 'Uzay',            q: '+space',            c: '100', img: 'https://th.wallhaven.cc/lg/vp/vpyekp.jpg' },
    { key: 'siberpunk', name: 'Siberpunk',       q: '+cyberpunk',        c: '100', img: 'https://th.wallhaven.cc/lg/je/jel1jq.jpg' },
    { key: 'fantastik', name: 'Fantastik',       q: '+"fantasy art"',    c: '100', img: 'https://th.wallhaven.cc/lg/k8/k881zd.jpg' },
    { key: 'dijital',   name: 'Dijital Sanat',   q: '+"digital art"',    c: '100', img: 'https://th.wallhaven.cc/lg/yq/yqxzqx.jpg' },
    { key: 'araba',     name: 'Arabalar',        q: '+cars',             c: '100', img: 'https://th.wallhaven.cc/lg/qr/qrgl87.jpg' },
    { key: 'sehir',     name: 'Şehir',           q: '+city',             c: '100', img: 'https://th.wallhaven.cc/lg/ly/lydkg2.jpg' },
    { key: 'hayvan',    name: 'Hayvanlar',       q: '+animals',          c: '100', img: 'https://th.wallhaven.cc/lg/ly/lywpjl.jpg' },
    { key: 'minimal',   name: 'Minimal',         q: '+minimalism',       c: '100', img: 'https://th.wallhaven.cc/lg/zp/zpq1dg.jpg' },
    { key: 'soyut',     name: 'Soyut',           q: '+abstract',         c: '100', img: 'https://th.wallhaven.cc/lg/w5/w5m6yr.jpg' },
    { key: 'karanlik',  name: 'Karanlık',        q: '+dark',             c: '100', img: 'https://th.wallhaven.cc/lg/yq/yqqvv7.jpg' },
  ];
  // Mixed views (Keşfet, home slideshow) show only a little of these "people" categories.
  const RARE_CATS = new Set(['karakter']);
  const mixPool = () => {
    const base = CATS.filter((c) => c.key !== 'kesfet' && !RARE_CATS.has(c.key));
    return Math.random() < 0.3 ? base.concat(CATS.filter((c) => RARE_CATS.has(c.key))) : base;
  };
  // [key, name, group]  key = "<source>:<category>"  (mb = MotionBGs, mx = Mixkit). Generic tags only.
  const LIVE_CATS = [
    ['mb:anime-nature', 'Anime Manzara', 'Çizim & Sanat'], ['mb:japan', 'Japonya', 'Çizim & Sanat'], ['mb:samurai', 'Samuray', 'Çizim & Sanat'],
    ['mb:fantasy', 'Fantastik', 'Çizim & Sanat'], ['mb:knight', 'Şövalye', 'Çizim & Sanat'],
    ['mb:cyberpunk', 'Siberpunk', 'Çizim & Sanat'], ['mb:dark', 'Karanlık', 'Çizim & Sanat'],
    ['mb:space', 'Uzay', 'Uzay'],
    ['mb:rain', 'Yağmur', 'Atmosfer'], ['mb:night', 'Gece', 'Atmosfer'], ['mb:sunset', 'Gün batımı', 'Atmosfer'], ['mb:forest', 'Orman', 'Atmosfer'],
    ['mb:winter', 'Kış', 'Atmosfer'], ['mb:mountain', 'Dağ', 'Atmosfer'], ['mb:autumn-leaves', 'Sonbahar', 'Atmosfer'], ['mb:water', 'Su', 'Atmosfer'],
    ['mb:car', 'Arabalar', 'Araba & Hayvan'], ['mb:sports-cars', 'Spor Arabalar', 'Araba & Hayvan'], ['mb:animal', 'Hayvanlar', 'Araba & Hayvan'], ['mb:cat', 'Kediler', 'Araba & Hayvan'],
    ['mx:nature', 'Doğa', 'Gerçek çekim'], ['mx:galaxy', 'Galaksi', 'Gerçek çekim'], ['mx:sea', 'Okyanus', 'Gerçek çekim'],
    ['mx:forest', 'Orman', 'Gerçek çekim'], ['mx:city', 'Şehir', 'Gerçek çekim'], ['mx:neon', 'Neon', 'Gerçek çekim'], ['mx:fire', 'Ateş', 'Gerçek çekim'],
  ];

  const ICON = {
    heart: '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.4C.4 8.4 2.3 4.5 6 4.1c2-.2 3.6.8 4.6 2.2l1.4 1.8 1.4-1.8c1-1.4 2.6-2.4 4.6-2.2 3.7.4 5.6 4.3 4 7.5C19.5 16.4 12 21 12 21Z"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M12 5c5.5 0 9.5 4.6 10.8 7-1.3 2.4-5.3 7-10.8 7S2.5 14.4 1.2 12C2.5 9.6 6.5 5 12 5Zm0 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/></svg>',
    monitor: '<svg viewBox="0 0 24 24"><path d="M3 4h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-7v2h3v2H7v-2h3v-2H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm1 2v9h16V6H4Z"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><path d="M12 2a5 5 0 0 1 5 5v3h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h1V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v3h6V7a3 3 0 0 0-3-3Z"/></svg>',
    both: '<svg viewBox="0 0 24 24"><path d="M4 3h12a1 1 0 0 1 1 1v3h-2V5H5v8h4v2H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 6h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1Zm1 2v8h7v-8h-7Z"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M11 3h2v10.2l3.6-3.6 1.4 1.4-6 6-6-6 1.4-1.4 3.6 3.6V3ZM4 19h16v2H4v-2Z"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z"/></svg>',
    stop: '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
  };

  // ---------- state ----------
  const S = {
    mode: 'static', cat: CATS[0], q: '', title: 'Keşfet', colors: '',
    sort: 'toplist', range: '1y', res: '1920x1080', ratio: 'landscape',
    liveCat: LIVE_CATS[0][0],
    page: 1, last: 1, seed: '', loading: false, done: false, token: 0,
    items: [], lives: [], monitors: [], mon: 'all',
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nf = new Intl.NumberFormat('tr-TR');
  const compact = new Intl.NumberFormat('tr-TR', { notation: 'compact', maximumFractionDigits: 1 });
  const mb = (b) => (b / 1048576).toFixed(1).replace('.', ',') + ' MB';

  // ---------- storage (favourites) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  let favs = store.get('crywall.favs', []);
  const favKey = (it) => (it.kind === 'live' ? 'l:' : 'i:') + it.id;
  const isFav = (it) => favs.some((f) => favKey(f) === favKey(it));
  function toggleFav(it) {
    if (isFav(it)) favs = favs.filter((f) => favKey(f) !== favKey(it));
    else favs.unshift(it);
    store.set('crywall.favs', favs);
    $$(`[data-fav="${favKey(it)}"]`).forEach((b) => b.classList.toggle('is-fav', isFav(it)));
    toast(isFav(it) ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı', '', 'ok', 1800);
    if (S.mode === 'fav') renderFavs();
    window.CryWall?.onFavsChange?.(favs);          // account.js saves them to the user's account
  }

  // ---------- api ----------
  async function api(path, body) {
    const opt = body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {};
    const r = await fetch(path, opt);
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.ok === false) throw new Error(j.error || ('HTTP ' + r.status));
    return j;
  }
  // c = the VexWalls category the picture came from (shown on the card)
  const toImg = (w, c) => ({
    kind: 'img', id: w.id, thumb: w.thumbs.large, tall: w.thumbs.original, small: w.thumbs.small, full: w.path,
    w: w.dimension_x, h: w.dimension_y, res: w.resolution, ratio: w.ratio, size: w.file_size,
    views: w.views, favs: w.favorites, colors: w.colors || [], cat: w.category, page: w.url,
    catKey: c?.key || '', catName: c?.name || '',
  });

  // Tall (phone) wallpapers: Wallhaven's "large" preview is a small landscape crop that looks
  // pixelated in a tall box, so use our own 1080px preview (it.phone, made nightly) or the
  // uncropped one. On phones the hero also uses the 1080px picture instead of the 4K original.
  const thumbOf = (it) => (it.kind === 'img' && it.ratio < 1 && it.tall ? it.tall : it.thumb);
  // screen-sized copies made nightly (1080 tall for phones, 1920 wide for computers); originals as fallback
  const heroSrc = (it) => (IS_PHONE ? (it.phone || it.full) : (it.desk || it.full));

  // ---------- mood tags ----------
  // A picture's "vibe" is read from its colour palette (brightness, saturation, hue)
  // plus a hint from its category. Videos get theirs from the category.
  const MOOD_COLOR = {
    Soft: '#f5c6d6', Enerjik: '#ffb86b', Rahatlatıcı: '#8fe3d6', Hoş: '#f7d9a8', Huzurlu: '#a7e0a1', Gizemli: '#b9a6ff',
    Karanlık: '#8a8fa3', Sade: '#d9d6cf', Sıcak: '#ff9f80', Neon: '#ff7ce5', Hayalperest: '#c9b6ff', Ferah: '#9fd2ff',
    Zen: '#cfe8c4', Epik: '#ffcf70', Modern: '#b7c4d6', Hızlı: '#ff8a8a', Sevimli: '#ffc4e1', Sanatsal: '#e7b6ff',
    Yaratıcı: '#9ff0e6', Güneşli: '#ffe08a', Doğal: '#a7e0a1', Sakin: '#a6c8ff', Romantik: '#ffadc6', Nostaljik: '#e6c29a',
    Fütüristik: '#8fd3ff', Güçlü: '#ff9a7a', Büyülü: '#d7b6ff', Canlı: '#ffd36b',
  };
  const CAT_MOOD = {
    doga: 'Huzurlu', manzara: 'Ferah', dag: 'Ferah', deniz: 'Rahatlatıcı', orman: 'Huzurlu', karakter: 'Hayalperest', savasci: 'Epik', sovalye: 'Epik', samuray: 'Güçlü', anime: 'Hayalperest', japonya: 'Zen', uzay: 'Gizemli', siberpunk: 'Neon', fantastik: 'Epik',
    dijital: 'Yaratıcı', araba: 'Hızlı', sehir: 'Modern', hayvan: 'Sevimli', minimal: 'Sade', soyut: 'Sanatsal', karanlik: 'Gizemli',
  };
  const LIVE_MOOD = {
    'anime-nature': ['Hayalperest', 'Soft'], japan: ['Zen', 'Huzurlu'], samurai: ['Epik', 'Güçlü'], fantasy: ['Epik', 'Büyülü'],
    dragon: ['Epik', 'Güçlü'], knight: ['Epik', 'Karanlık'], cyberpunk: ['Neon', 'Enerjik'], dark: ['Karanlık', 'Gizemli'],
    technology: ['Fütüristik', 'Modern'], space: ['Gizemli', 'Sakin'], astronaut: ['Hayalperest', 'Gizemli'], 'black-hole': ['Gizemli', 'Güçlü'],
    rain: ['Rahatlatıcı', 'Huzurlu'], night: ['Sakin', 'Gizemli'], sunset: ['Sıcak', 'Romantik'], forest: ['Huzurlu', 'Doğal'],
    winter: ['Soft', 'Sakin'], mountain: ['Ferah', 'Huzurlu'], 'autumn-leaves': ['Sıcak', 'Nostaljik'], water: ['Rahatlatıcı', 'Ferah'],
    car: ['Hızlı', 'Enerjik'], 'sports-cars': ['Hızlı', 'Enerjik'], animal: ['Sevimli', 'Doğal'], cat: ['Sevimli', 'Soft'],
    nature: ['Huzurlu', 'Doğal'], galaxy: ['Gizemli', 'Büyülü'], sea: ['Rahatlatıcı', 'Ferah'], city: ['Modern', 'Canlı'],
    neon: ['Neon', 'Enerjik'], fire: ['Sıcak', 'Enerjik'],
  };
  function hsl(hex) {
    const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    let h = 0, s = 0;
    if (d) {
      s = d / (1 - Math.abs(2 * l - 1));
      h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h = (h * 60 + 360) % 360;
    }
    return { h, s, l };
  }
  function moodsOf(it) {
    if (it.kind === 'live') return LIVE_MOOD[(it.cat || '').split(':')[1]] || ['Canlı'];
    const out = [];
    const add = (m) => { if (m && !out.includes(m)) out.push(m); };
    add(CAT_MOOD[it.catKey]);
    const cols = (it.colors || []).filter((c) => /^#[0-9a-f]{6}$/i.test(c)).map(hsl);
    if (cols.length) {
      const w = cols.map((_, i) => 1 / (i + 1)), W = w.reduce((a, b) => a + b, 0);
      const L = cols.reduce((a, c, i) => a + c.l * w[i], 0) / W;
      const Sat = cols.reduce((a, c, i) => a + c.s * w[i], 0) / W;
      const vivid = cols.filter((c) => c.s > 0.35 && c.l > 0.15 && c.l < 0.85).sort((a, b) => b.s - a.s)[0];
      if (L < 0.2) add('Karanlık');
      else if (L > 0.6 && Sat < 0.4) add('Soft');
      else if (L > 0.5 && Sat >= 0.3 && Sat < 0.65) add('Hoş');
      if (Sat > 0.55 && L > 0.25) add('Enerjik');
      if (vivid) {
        const h = vivid.h;
        if (h >= 170 && h < 250) add(L < 0.25 ? 'Sakin' : 'Rahatlatıcı');
        else if (h >= 75 && h < 170) add('Huzurlu');
        else if (h >= 250 && h < 320) add(L < 0.35 ? 'Neon' : 'Hayalperest');
        else if (h >= 320 || h < 15) add(vivid.l > 0.6 ? 'Romantik' : 'Sıcak');
        else if (h >= 15 && h < 45) add('Sıcak');
        else add('Güneşli');
      } else if (Sat < 0.2 && L >= 0.2) add('Sade');
    }
    if (out.length < 2) add(cols.length && cols[0].l > 0.45 ? 'Hoş' : 'Sakin');
    return out.slice(0, 3);
  }
  const moodHtml = (it) => moodsOf(it).map((m) => `<span class="mood" style="--mc:${MOOD_COLOR[m] || '#ddd'}">${esc(m)}</span>`).join('');

  // ---------- toasts ----------
  function toast(title, sub = '', type = '', ms = 3500) {
    const t = el('div', 'toast ' + type, `<i></i><div>${esc(title)}${sub ? `<small>${esc(sub)}</small>` : ''}</div>`);
    $('#toasts').append(t);
    const kill = () => { t.classList.add('out'); setTimeout(() => t.remove(), 300); };
    if (ms) setTimeout(kill, ms);
    return { kill, set(title2, sub2, type2, ms2 = 3500) { t.className = 'toast ' + (type2 || ''); t.innerHTML = `<i></i><div>${esc(title2)}${sub2 ? `<small>${esc(sub2)}</small>` : ''}</div>`; setTimeout(kill, ms2); } };
  }

  // ---------- monitors ----------
  // ---------- phone mode ----------
  // On a phone (or when the site is opened from another device) we can't touch the
  // computer's wallpaper, so "Apply" becomes "Save to phone".
  const IS_PHONE = (matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 820) || new URLSearchParams(location.search).has('phone');
  const IS_REMOTE = !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  // ONLINE = website without the PC helper (catalog files, "İndir").
  // When vexwalls.github.io is opened on a PC where the VexWalls helper runs (server.ps1, started
  // with Windows), detectHelper() switches back to full "Uygula" mode through http://localhost:8790.
  let ONLINE = IS_REMOTE || new URLSearchParams(location.search).has('online');
  // CATALOG: on the website, lists always come from the nightly catalog (instant, no Wallhaven
  // rate limit) — even when the PC helper is connected; the helper is then only used to APPLY
  // wallpapers and for tag searches.
  const CATALOG = ONLINE;
  let PHONE_MODE = IS_PHONE || ONLINE;
  let API = '';                        // '' = same server; 'http://localhost:8790' = PC helper from the website
  const HELPER_URL = 'http://localhost:8790';
  // Browsers (Edge/Chrome "local network access") ask the user before a website may talk to
  // localhost. We never trigger that question on page load — only when the user presses
  // "Bu bilgisayara bağlan". Once allowed, the browser remembers it and we connect silently.
  // The permission has had different names across browser versions; if ANY of them is
  // granted we may connect. (Checking only the first name made users press "bağlan" every visit.)
  async function lnaState() {
    let state = 'unsupported';                 // older browser: no permission needed
    for (const name of ['loopback-network', 'local-network-access', 'local-network']) {
      try {
        const s = (await navigator.permissions.query({ name })).state;
        if (s === 'granted') return 'granted';
        if (s === 'denied' || state === 'unsupported') state = s;
      } catch {}
    }
    return state;
  }
  const HELPER_FLAG = 'crywall.helper';        // this browser connected to the PC helper before
  const helperRemembered = () => { try { return localStorage.getItem(HELPER_FLAG) === '1'; } catch { return false; } };
  async function detectHelper(interactive = false) {
    if (!IS_REMOTE || IS_PHONE) return false;
    const state = await lnaState();
    if (!interactive && state === 'denied') return false;
    if (!interactive && state !== 'granted' && state !== 'unsupported' && !helperRemembered()) return false;
    try {
      const ctl = new AbortController();
      if (!interactive) setTimeout(() => ctl.abort(), 4000);      // interactive: wait for the user's answer
      const r = await fetch(HELPER_URL + '/api/status', { signal: ctl.signal, targetAddressSpace: 'loopback' });
      if (!r.ok) return false;
      API = HELPER_URL; ONLINE = false; PHONE_MODE = false;
      try { localStorage.setItem(HELPER_FLAG, '1'); } catch {}
      return true;
    } catch { return false; }       // helper not running / permission denied: stay in download mode
  }
  async function connectHelper() {
    const t = toast('Bilgisayara bağlanılıyor…', 'Tarayıcı izin sorarsa "İzin ver"e bas.', 'wait', 0);
    if (await detectHelper(true)) {
      t.set('Bağlandı', 'Artık duvar kağıtlarını tek tıkla uygulayabilirsin.', 'ok', 2500);
      setTimeout(() => location.reload(), 900);
    } else {
      const st = await lnaState();
      t.set('Bağlanılamadı', st === 'denied'
        ? 'Tarayıcı izni kapalı: adres çubuğundaki kilit simgesi › Site izinleri › "Yerel ağ" / "Diğer uygulamalar" › İzin ver.'
        : 'VexWalls yardımcısı bu bilgisayarda çalışmıyor. Belgeler › VexWalls › Baslat.bat ile başlat.', 'err', 9000);
    }
  }
  function applyModeUI() {
    document.documentElement.classList.toggle('online', ONLINE);
    document.documentElement.classList.toggle('phone-mode', PHONE_MODE);
    if (ONLINE) {
      // the website can't change the computer's wallpaper: adjust the promises in the hero
      // website: same promise, without 'apply' wording (handled by the helper / download)
      const st = $$('.hero__stats > div')[2]; if (st) st.innerHTML = '<b>Ücretsiz</b><span>Bilgisayar &amp; telefon</span>';
    }
  }
  const SAVE_LABEL = IS_PHONE ? 'Telefona kaydet' : 'İndir';
  const videoUrl = (it) => {
    const [src, n] = String(it.id).split('-');
    return src === 'mb' ? `https://motionbgs.com/dl/hd/${n}/` : `https://assets.mixkit.co/videos/${n}/${n}-1080.mp4`;
  };
  async function savePhone(it) {
    if (ONLINE) {
      // website: open the original picture (long-press / right-click to save it)
      addRecent(it);
      window.open(it.full, '_blank', 'noopener');
      toast(IS_PHONE ? 'Görsel açıldı' : 'Görsel yeni sekmede açıldı', IS_PHONE ? 'Görsele basılı tut › "Fotoğraflara kaydet" / "Resmi indir".' : 'Sağ tıkla › "Resmi farklı kaydet". Sonra resme sağ tıkla › "Masaüstü arka planı olarak ayarla".', 'ok', 7000);
      return;
    }
    const url = API + '/api/img?u=' + encodeURIComponent(it.full);
    const t = toast('Hazırlanıyor…', it.res, 'wait', 0);
    try {
      const blob = await fetch(url).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.blob(); });
      const file = new File([blob], 'crywall-' + it.id + (blob.type === 'image/png' ? '.png' : '.jpg'), { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        t.kill();
        await navigator.share({ files: [file], title: 'VexWalls duvar kağıdı' }).catch(() => {});
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = file.name; document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 30000);
        addRecent(it); t.set('İndirildi', 'Galeri / Fotoğraflar\'dan duvar kağıdı olarak ayarlayabilirsin.', 'ok', 5000);
      }
    } catch (e) { t.set('Kaydedilemedi', e.message, 'err'); }
  }

  const multi = () => !PHONE_MODE && S.monitors.length > 1;
  const monName = (m) => (m === 'all' ? 'Tüm ekranlar' : m === 'span' ? 'Tüm ekranlara yayılmış' : 'Ekran ' + (Number(m) + 1));
  function setMon(m) {
    S.mon = m; store.set('crywall.mon', m);
    if (cur && !$('#viewer').hidden) renderActions(cur);
  }
  // A mini map of the user's real monitor layout; click a screen to target it.
  function monitorPicker(kind) {
    if (!multi()) return '';
    const ms = S.monitors;
    const minX = Math.min(...ms.map((m) => m.x)), minY = Math.min(...ms.map((m) => m.y));
    const maxX = Math.max(...ms.map((m) => m.x + m.w)), maxY = Math.max(...ms.map((m) => m.y + m.h));
    const W = maxX - minX, H = maxY - minY;
    const sel = (m) => (S.mon === 'all' || S.mon === 'span' || S.mon === String(m.index) ? ' is-on' : '');
    const boxes = ms.map((m) => `
      <button class="mon${sel(m)}" data-mon="${m.index}" title="${m.w}×${m.h}"
        style="left:${((m.x - minX) / W) * 100}%;top:${((m.y - minY) / H) * 100}%;width:${(m.w / W) * 100}%;height:${(m.h / H) * 100}%">
        <b>${m.index + 1}</b><small>${m.w}×${m.h}${m.primary ? ' · Ana' : ''}</small>
      </button>`).join('');
    const opts = [['all', 'Hepsi'], ...ms.map((m) => [String(m.index), 'Ekran ' + (m.index + 1)])];
    if (kind === 'img') opts.push(['span', 'Yay']);
    return `
      <div class="monpick">
        <div class="monpick__head"><span>Hangi ekran?</span><small>${esc(monName(S.mon))}</small></div>
        <div class="monpick__map${S.mon === 'span' ? ' is-span' : ''}" style="aspect-ratio:${W} / ${H}">${boxes}</div>
        <div class="monpick__opts">${opts.map(([v, n]) => `<button class="chip${S.mon === v ? ' is-active' : ''}" data-mon="${v}">${n}</button>`).join('')}</div>
        ${S.mon === 'span' ? '<p class="note">Tek bir görsel tüm ekranlarına yayılır. En iyi sonuç için üstten <b>Ekran tipi › Ultra geniş</b> seç.</p>' : ''}
      </div>`;
  }

  // ---------- applying ----------
  const TARGET_TXT = { desktop: 'Masaüstüne', lock: 'Kilit ekranına', both: 'Masaüstüne ve kilit ekranına' };
  async function applyImg(it, target) {
    const mon = multi() ? S.mon : 'all';
    const t = toast('Uygulanıyor…', `${it.res} indiriliyor`, 'wait', 0);
    try {
      const r = await api(API + '/api/apply', { url: it.full, target, monitor: mon });
      const where = target !== 'lock' && multi() ? ` (${monName(mon)})` : '';
      if (r.lock === 'fail') {
        t.set(target === 'both' ? 'Masaüstü uygulandı, kilit ekranı uygulanamadı' : 'Kilit ekranı uygulanamadı',
          'Ayarlar › Kişiselleştirme › Kilit ekranı: "Resim" seçili olmalı.', 'err', 7000);
      } else {
        addRecent(it); t.set(`${TARGET_TXT[target]} uygulandı${where}`, 'Resimler › VexWalls klasörüne de kaydedildi.', 'ok');
      }
      if (target !== 'lock') status();
    } catch (e) {
      t.set('Uygulanamadı', serverHint(e), 'err', 6000);
    }
  }
  async function saveImg(it) {
    const t = toast('Kaydediliyor…', '', 'wait', 0);
    try { await api(API + '/api/save', { url: it.full }); addRecent(it); t.set('İndirildi', 'Resimler › VexWalls klasörüne kaydedildi.', 'ok'); }
    catch (e) { t.set('İndirilemedi', serverHint(e), 'err', 6000); }
  }
  async function applyLive(it) {
    const mon = multi() && S.mon !== 'span' ? S.mon : 'all';
    const t = toast('Hareketli duvar kağıdı hazırlanıyor…', 'Video ilk seferde indiriliyor, birkaç saniye sürebilir.', 'wait', 0);
    try {
      await api(API + '/api/live/apply', { id: it.id, title: it.title, monitor: mon });
      addRecent(it);
      t.set('Hareketli duvar kağıdı açıldı' + (multi() ? ` (${monName(mon)})` : ''), 'Masaüstüne geçince görebilirsin.', 'ok', 5000);
      await status();
    } catch (e) { t.set('Açılamadı', serverHint(e), 'err', 6000); }
  }
  async function stopLive(monitor = 'all') {
    try {
      await api(API + '/api/live/stop?monitor=' + encodeURIComponent(monitor));
      toast('Hareketli duvar kağıdı kapatıldı', monitor === 'all' ? '' : monName(monitor), 'ok', 2500);
      await status();
    } catch (e) { toast('Durdurulamadı', serverHint(e), 'err'); }
  }
  const serverHint = (e) => (/Failed to fetch|NetworkError/i.test(e.message) ? 'VexWalls sunucusu kapalı. Baslat.bat ile tekrar aç.'
    : /busy|429|Too Many/i.test(e.message) ? 'Şu an çok yoğun, birkaç saniye sonra tekrar dene.'
    : /Exception|DownloadString|HTTP 5/i.test(e.message) ? 'Duvar kağıtlarına şu an ulaşılamıyor, birazdan tekrar dene.' : e.message);

  function renderLiveBar() {
    const L = S.lives;
    $('#liveBar').hidden = !L.length;
    if (!L.length) return;
    $('#liveBarTitle').textContent = L.length === 1
      ? (L[0].title || 'Video') + (multi() ? ' · ' + monName(L[0].monitor) : '')
      : L.map((l) => monName(l.monitor) + ': ' + (l.title || 'Video')).join('  ·  ');
  }

  // ---------- categories ----------
  function renderCats() {
    const row = $('#cats');
    row.innerHTML = '';
    CATS.forEach((c) => {
      const b = el('button', 'cat' + (S.cat === c && !S.q && !S.colors ? ' is-active' : ''), `<img src="${c.img}" alt="" loading="lazy"><span>${esc(c.name)}</span>`);
      b.onclick = () => { S.cat = c; S.q = ''; S.colors = ''; S.title = c.name; renderCats(); reset(true); };
      row.append(b);
    });
    const lc = $('#liveCats');
    lc.innerHTML = '';
    let group = '';
    LIVE_CATS.forEach(([k, n, g]) => {
      if (g !== group) { group = g; lc.append(el('span', 'chip-group', esc(g))); }
      const b = el('button', 'chip' + (S.liveCat === k ? ' is-active' : ''), esc(n));
      b.onclick = () => { S.liveCat = k; renderCats(); reset(true); };
      lc.append(b);
    });
  }

  // ---------- grid ----------
  const grid = $('#grid');
  // browser Back button support: every view change is a history entry
  const navState = () => ({ mode: S.mode, cat: S.cat.key, q: S.q, colors: S.colors, title: S.title, live: S.liveCat });
  const sameNav = (a, b) => a && b && JSON.stringify(a) === JSON.stringify(b);
  let restoring = false;
  function remember() {
    if (restoring) return;
    const st = navState();
    if (!history.state) history.replaceState(st, '');
    else if (!sameNav(history.state, st)) history.pushState(st, '');
  }
  addEventListener('popstate', (e) => {
    // phone Back button / swipe: first closes an open wallpaper page
    if (!viewer.hidden) { closeViewer(true); return; }
    const st = e.state; if (!st || st.viewer) return;
    if (sameNav(st, navState())) return;       // same view: nothing to reload
    if (backTo && sameNav(backTo.nav, st)) { history.replaceState(st, ''); goBackToWallpaper(); return; }   // browser Back after a tag/colour jump
    restoring = true;
    S.cat = CATS.find((c) => c.key === st.cat) || CATS[0]; S.q = st.q || ''; S.colors = st.colors || '';
    S.title = st.title || S.cat.name; S.liveCat = st.live || S.liveCat;
    switchMode(st.mode || 'static', false); renderCats(); reset('force');
    restoring = false;
  });

  function reset(scroll) {
    remember();
    setTimeout(() => window.__cwUpdateBack && window.__cwUpdateBack(), 0);
    S.token++; S.page = 1; S.done = false; S.seed = ''; S.items = []; S.loading = false;
    grid.innerHTML = ''; $('#empty').hidden = true; $('#gridCount').textContent = '';
    grid.classList.toggle('is-portrait', S.mode === 'static' && S.ratio === 'portrait');
    if (S.mode === 'live') $('#gridTitle').textContent = 'Hareketli · ' + (LIVE_CATS.find((c) => c[0] === S.liveCat) || ['', ''])[1];
    else if (S.mode === 'fav') $('#gridTitle').textContent = 'Favorilerim';
    else if (S.mode === 'recent') $('#gridTitle').textContent = 'Son kullanılanlar';
    else $('#gridTitle').textContent = S.title;
    if (scroll) { const top = $('.browse').getBoundingClientRect().top + scrollY - 70; if (scrollY > top || scroll === 'force') (window.cwScrollTo ? window.cwScrollTo(top) : scrollTo(0, top)); }
    if (S.mode === 'fav') renderFavs(); else if (S.mode === 'recent') renderRecent(); else load();
  }

  async function load() {
    if (S.loading || S.done || S.mode === 'fav' || S.mode === 'recent') return;
    S.loading = true; $('#loader').classList.add('is-on');
    const token = S.token;
    try {
      let list = [];
      if (CATALOG && S.mode === 'static' && !(S.cat.key === 'kesfet' && !S.q && !S.colors) && !(API && S.title.startsWith('#'))) {
        // website version: filter the nightly catalog in the browser
        const all = await catalogQuery();
        if (token !== S.token) return;
        if (all === 'blocked') { S.done = true; showEmpty('', true); return; }
        if (S.page === 1) $('#gridCount').textContent = nf.format(all.length) + ' duvar kağıdı';
        list = all.slice((S.page - 1) * 24, S.page * 24);
        if (S.page * 24 >= all.length) S.done = true;
      } else if (CATALOG && S.mode === 'live') {
        const all = await liveCatalog(S.liveCat);
        if (token !== S.token) return;
        const lc = LIVE_CATS.find((c) => c[0] === S.liveCat);
        list = all.slice((S.page - 1) * 24, S.page * 24).map((v) => ({ kind: 'live', ...v, cat: S.liveCat, catName: lc ? lc[1].replace(/^\W+\s*/, '') : '' }));
        if (S.page * 24 >= all.length) S.done = true;
        if (S.page === 1) $('#gridCount').textContent = all.length + ' hareketli duvar kağıdı';
      } else if (S.mode === 'static' && S.cat.key === 'kesfet' && !S.q && !S.colors) {
        list = await loadMix();
        if (token !== S.token) return;
        if (S.page === 1) $('#gridCount').textContent = 'Her seferinde farklı · tüm kategorilerden karışık';
      } else if (S.mode === 'static') {
        const p = new URLSearchParams({ q: S.q || S.cat.q, categories: S.q ? '110' : S.cat.c, sorting: S.sort, atleast: S.res, page: S.page });
        const tagSearch = S.title.startsWith('#');            // tag pages: best of all time, so they're never empty
        if (tagSearch) p.set('sorting', 'favorites');
        else if (S.sort === 'toplist' && S.range) p.set('topRange', S.range);
        if (S.ratio) p.set('ratios', S.ratio);
        if (S.colors) p.set('colors', S.colors);
        if (S.seed) p.set('seed', S.seed);
        const r = await fetch(API + '/api/search?' + p).then((x) => x.json());
        if (token !== S.token) return;
        if (!r.data) throw new Error(r.error || 'Arama başarısız');
        if (r.blocked) { S.done = true; showEmpty('', true); return; }
        list = r.data.map((w) => toImg(w, S.q || S.colors ? null : S.cat));
        S.last = r.meta.last_page; S.seed = r.meta.seed || '';
        if (S.page === 1) $('#gridCount').textContent = nf.format(r.meta.total) + ' duvar kağıdı';
        if (S.page >= S.last) S.done = true;
      } else {
        const r = await api(API + `/api/live/list?cat=${encodeURIComponent(S.liveCat)}&page=${S.page}`);
        if (token !== S.token) return;
        const lc = LIVE_CATS.find((c) => c[0] === S.liveCat);
        list = (r.data || []).map((v) => ({ kind: 'live', ...v, cat: S.liveCat, catName: lc ? lc[1].replace(/^\W+\s*/, '') : '' }));
        if (!r.more) S.done = true;   // a page can be empty after filtering but still have more
        if (S.page === 1) $('#gridCount').textContent = 'Simgelerin arkasında sessizce oynar';
      }
      const start = S.items.length;
      S.items.push(...list);
      list.forEach((it, i) => grid.append(card(it, start + i, i)));
      S.page++;
      if (!S.items.length && S.done) showEmpty();
    } catch (e) {
      if (token === S.token) { S.done = true; if (!S.items.length) showEmpty(serverHint(e)); else toast('Daha fazla yüklenemedi', serverHint(e), 'err'); }
    } finally {
      if (token === S.token) { S.loading = false; $('#loader').classList.remove('is-on'); requestAnimationFrame(checkSentinel); }
    }
  }

  // ---------- website (online) catalog ----------
  // Online there is no PC server: GitHub builds data/c/<cat>.json and data/l/<live>.json
  // every night (tools/build-catalog.ps1) and the browser filters them.
  const catCache = {}, liveCache = {};
  const fromCat = (o, c) => ({
    kind: 'img', id: o.id, thumb: o.t, tall: o.p || o.o || '', phone: o.p || '', desk: o.dp || '', small: o.t, full: o.f, w: o.w, h: o.h, res: o.w + 'x' + o.h, ratio: o.r, size: o.s,
    views: o.v, favs: o.fv, colors: o.c || [], date: o.d, page: o.u, cat: c.c === '010' ? 'anime' : 'general', catKey: c.key, catName: c.name,
  });
  async function getCat(c) {
    if (!catCache[c.key]) {
      catCache[c.key] = fetch(`data/c/${c.key}.json`).then((r) => (r.ok ? r.json() : [])).then((a) => a.map((o) => fromCat(o, c))).catch(() => []);
    }
    return catCache[c.key];
  }
  async function liveCatalog(key) {
    if (!liveCache[key]) liveCache[key] = fetch(`data/l/${key.replace(':', '-')}.json`).then((r) => (r.ok ? r.json() : [])).catch(() => []);
    return liveCache[key];
  }
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function passFilters(it) {
    const [mw, mh] = S.res.split('x').map(Number);
    const big = Math.max(it.w, it.h), small = Math.min(it.w, it.h);
    if (big < mw || small < mh) return false;
    if (S.ratio === 'landscape') return it.ratio >= 1.2;
    if (S.ratio === 'portrait') return it.ratio < 1;
    if (S.ratio === '21x9,32x9') return it.ratio >= 2.2;
    return true;
  }
  function sortList(a) {
    if (S.sort === 'random') return shuffle(a);
    if (S.sort === 'date_added') return a.sort((x, y) => String(y.date).localeCompare(String(x.date)));
    if (S.sort === 'hot') return a.sort((x, y) => y.views - x.views);
    return a.sort((x, y) => y.favs - x.favs);
  }
  // search words -> categories (the online catalog has no free-text search)
  const SEARCH_WORDS = {
    doga: 'doğa doga nature ağaç agac tree çiçek cicek flower göl gol lake şelale selale waterfall yeşil yesil green nehir river',
    dag: 'dağ dag dağlar mountain mountains zirve kar snow tepe',
    deniz: 'deniz sea okyanus ocean sahil beach plaj dalga kıyı kiyi',
    orman: 'orman forest ağaçlar agaclar woods',
    karakter: 'karakter character kız kiz kızlar girl girls anime kızı',
    savasci: 'savaşçı savasci warrior oyun karakteri game character asker soldier',
    sovalye: 'şövalye sovalye knight zırh zirh armor',
    samuray: 'samuray samurai ninja katana',
    manzara: 'manzara landscape gökyüzü gokyuzu sky gün batımı sunset bulut cloud',
    anime: 'anime çizim cizim manga',
    japonya: 'japon japan japonya tokyo kiraz sakura tapınak tapinak torii kyoto',
    uzay: 'uzay space galaksi galaxy yıldız yildiz star gezegen planet ay moon nebula astronot',
    siberpunk: 'siberpunk cyberpunk neon fütüristik futuristik futuristic',
    fantastik: 'fantastik fantasy ejderha dragon büyü buyu magic şato sato castle',
    dijital: 'dijital digital sanat art 3d illüstrasyon illustrasyon render',
    araba: 'araba car cars otomobil spor araba bmw porsche drift',
    sehir: 'şehir sehir city kent bina building sokak street gece night',
    hayvan: 'hayvan animal kedi cat köpek kopek dog kuş kus bird aslan lion kaplan tiger kurt wolf',
    minimal: 'minimal sade basit simple',
    soyut: 'soyut abstract desen pattern renk color dalga wave',
    karanlik: 'karanlık karanlik dark siyah black gotik',
  };
  async function catalogQuery() {
    let cats;
    if (S.q) {
      if (/^id:/.test(S.q)) return [];
      const words = S.q.toLocaleLowerCase('tr').split(/\s+/).filter(Boolean);
      cats = CATS.filter((c) => SEARCH_WORDS[c.key] && words.some((w) => SEARCH_WORDS[c.key].split(' ').some((k) => k.startsWith(w) || w.startsWith(k))));
      if (!cats.length) return [];
    } else if (S.colors) cats = CATS.filter((c) => c.key !== 'kesfet');
    else cats = [S.cat];
    const lists = await Promise.all(cats.map(getCat));
    const seen = new Set();
    let all = lists.flat().filter((it) => !seen.has(it.id) && seen.add(it.id) && passFilters(it));
    if (S.colors) all = all.filter((it) => it.colors.some((c) => c.toLowerCase() === '#' + S.colors.toLowerCase()));
    return sortList(all);
  }
  // forHero: pictures that fill the hero — tall ones on phones, wide ones on computers
  async function staticMix(n = 6, forHero = false) {
    const pick = shuffle(mixPool()).slice(0, 4);
    const lists = await Promise.all(pick.map(getCat));
    const out = [];
    lists.forEach((l, i) => shuffle(l.filter((it) => !mix.seen.has(it.id) && (forHero ? (IS_PHONE ? it.ratio < 0.8 && it.h >= 1920 : it.ratio >= 1.5 && it.w >= 1920) : passFilters(it)))).slice(0, RARE_CATS.has(pick[i].key) ? 2 : n)
      .forEach((it) => { mix.seen.add(it.id); out.push(it); }));
    return shuffle(out);
  }

  // Keşfet: every page mixes random pages of 4 random categories, shuffled,
  // so the page looks different every visit.
  const mix = { pages: {}, seen: new Set() };
  async function loadMix() {
    if (CATALOG) { if (S.page === 1) mix.seen = new Set(); const out = await staticMix(); if (!out.length) S.done = true; return out; }
    if (S.page === 1) { mix.pages = {}; mix.seen = new Set(); }
    const pool = shuffle(mixPool()).slice(0, 4);
    const res = await Promise.all(pool.map((c) => {
      const info = mix.pages[c.key] || (mix.pages[c.key] = { used: [], last: 6 });
      const free = []; for (let i = 1; i <= Math.min(info.last, 8); i++) if (!info.used.includes(i)) free.push(i);
      if (!free.length) return Promise.resolve({ c, data: [] });
      const page = free[Math.floor(Math.random() * free.length)];
      info.used.push(page);
      const p = new URLSearchParams({ q: c.q, categories: c.c, sorting: S.sort === 'date_added' ? 'date_added' : 'toplist', topRange: S.range || '1y', atleast: S.res, page });
      if (S.ratio) p.set('ratios', S.ratio);
      return fetch(API + '/api/search?' + p).then((x) => x.json()).then((r) => {
        if (r.meta) info.last = r.meta.last_page;
        return { c, data: r.data || [] };
      }).catch(() => ({ c, data: [] }));
    }));
    const out = [];
    res.forEach(({ c, data }) => data.sort(() => Math.random() - 0.5).slice(0, 6).forEach((w) => {
      if (!mix.seen.has(w.id)) { mix.seen.add(w.id); out.push(toImg(w, c)); }
    }));
    if (!out.length && Object.values(mix.pages).every((i) => i.used.length >= Math.min(i.last, 8))) S.done = true;
    return out.sort(() => Math.random() - 0.5);
  }

  function showEmpty(msg, blocked) {
    const e = $('#empty');
    e.hidden = false;
    e.innerHTML = blocked ? '<b>Bu içerik VexWalls\'da yok</b>Telif hakkı nedeniyle oyun, film, dizi ve anime karakterlerine ait duvar kağıtlarını yayınlamıyoruz. Doğa, uzay, şehir veya sanat aramayı dene.'
      : msg ? `<b>Bir sorun oluştu</b>${esc(msg)}`
      : S.mode === 'recent' ? '<b>Henüz bir şey kullanmadın</b>Uyguladığın, indirdiğin ya da hareketli olarak açtığın duvar kağıtları burada görünür.'
      : S.mode === 'fav' ? '<b>Henüz favorin yok</b>Beğendiğin duvar kağıtlarındaki ♥ işaretine bas, burada toplansın.' + (window.CryWallAccount && !window.CryWallAccount.user ? '<br><br><button class="btn btn--primary btn--sm" onclick="CryWallAccount.open(\'signup\')">Giriş yap · favorilerin kaybolmasın</button>' : '')
      : '<b>Sonuç bulunamadı</b>Farklı bir kelime veya daha düşük çözünürlük dene.';
  }

  function card(it, idx, delayIdx) {
    const c = el('div', 'card');
    c.tabIndex = 0;
    c.style.animationDelay = Math.min(delayIdx, 12) * 35 + 'ms';
    const bg = it.colors?.[0] || '#151823';
    const fk = favKey(it);
    if (it.kind === 'img') {
      c.innerHTML = `
        <div class="card__ph" style="background:${esc(bg)}"></div>
        <img src="${esc(thumbOf(it))}" alt="Duvar kağıdı ${esc(it.res)}" loading="lazy" decoding="async">
        <div class="card__tags">
          ${it.catName ? `<span class="tagcat">${esc(it.catName)}</span>` : ''}${it.w >= 3840 ? '<span class="tagcat tagcat--4k">4K</span>' : ''}
          <div class="card__moods">${moodHtml(it)}</div>
        </div>
        <div class="card__overlay">
          <div class="card__top"><span></span><button class="iconbtn${isFav(it) ? ' is-fav' : ''}" data-fav="${fk}" title="Favori">${ICON.heart}</button></div>
          <div class="card__bottom">
            <div class="card__stats"><span>${esc(it.res)}</span><span>${ICON.eye}${compact.format(it.views)}</span><span>${ICON.heart}${compact.format(it.favs)}</span></div>
            <button class="btn btn--sm btn--primary" data-quick title="${PHONE_MODE ? 'Telefona kaydet' : 'Masaüstüne uygula'}">${PHONE_MODE ? ICON.down + (IS_PHONE ? 'Kaydet' : 'İndir') : ICON.monitor + 'Uygula'}</button>
          </div>
        </div>`;
    } else {
      c.innerHTML = `
        <div class="card__ph" style="background:#111"></div>
        <img src="${esc(it.thumb)}" alt="${esc(it.title)}" loading="lazy" decoding="async">
        <video muted loop playsinline preload="none"></video>
        <div class="card__tags">
          <span class="tagcat tagcat--live">● CANLI</span>${it.catName ? `<span class="tagcat">${esc(it.catName)}</span>` : ''}${it.uhd ? '<span class="tagcat tagcat--4k">4K</span>' : ''}
          <div class="card__moods">${moodHtml(it)}</div>
        </div>
        <div class="card__overlay">
          <div class="card__top"><span></span><button class="iconbtn${isFav(it) ? ' is-fav' : ''}" data-fav="${fk}" title="Favori">${ICON.heart}</button></div>
          <div class="card__bottom">
            <div class="card__title">${esc(it.title)}</div>
            <button class="btn btn--sm btn--primary" data-quick title="Hareketli olarak uygula">${ICON.play}Uygula</button>
          </div>
        </div>`;
      const v = $('video', c);
      c.addEventListener('mouseenter', () => { if (!v.src) v.src = it.preview; v.play().then(() => c.classList.add('is-playing')).catch(() => {}); });
      c.addEventListener('mouseleave', () => { v.pause(); c.classList.remove('is-playing'); });
    }
    const img = $('img', c);
    img.onload = () => img.classList.add('is-loaded');
    img.onerror = () => { img.remove(); };
    c.addEventListener('click', (e) => {
      if (e.target.closest('[data-fav]')) { e.stopPropagation(); return toggleFav(it); }
      if (e.target.closest('[data-quick]')) { e.stopPropagation(); if (PHONE_MODE) return it.kind === 'img' ? savePhone(it) : window.open(videoUrl(it), '_blank'); return it.kind === 'img' ? applyImg(it, 'desktop') : applyLive(it); }
      openViewer(idx);
    });
    c.addEventListener('keydown', (e) => { if (e.key === 'Enter') openViewer(idx); });
    return c;
  }

  // recently used (applied / downloaded / set live), newest first, kept on this device
  let recent = store.get('crywall.recent', []);
  function addRecent(it) {
    if (!it) return;
    recent = [it, ...recent.filter((f) => favKey(f) !== favKey(it))].slice(0, 40);
    store.set('crywall.recent', recent);
  }
  function renderRecent() {
    grid.innerHTML = '';
    S.items = recent.slice();
    $('#gridCount').textContent = S.items.length ? S.items.length + ' duvar kağıdı' : '';
    $('#empty').hidden = true;
    S.items.forEach((it, i) => grid.append(card(it, i, i)));
    if (!S.items.length) showEmpty();
  }
  function renderFavs() {
    grid.innerHTML = '';
    S.items = favs.slice();
    $('#gridCount').textContent = S.items.length ? S.items.length + ' kayıt' : '';
    $('#empty').hidden = true;
    S.items.forEach((it, i) => grid.append(card(it, i, i)));
    if (!S.items.length) showEmpty();
  }

  // infinite scroll
  // Pages load by themselves for the first few screens, then a "Daha fazla göster" button takes
  // over — otherwise the page never ends and nobody can reach the footer.
  const AUTO_PAGES = 3;
  const autoOK = () => S.page <= AUTO_PAGES;
  function updateMore() { const b = $('#moreBtn'); if (b) b.hidden = autoOK() || S.done || S.mode === 'fav' || S.mode === 'recent' || S.loading; }
  const io = new IntersectionObserver((en) => { if (en[0].isIntersecting && autoOK()) load(); updateMore(); }, { rootMargin: '900px' });
  io.observe($('#sentinel'));
  function checkSentinel() { const r = $('#sentinel').getBoundingClientRect(); if (r.top < innerHeight + 900 && autoOK()) load(); updateMore(); }

  // ---------- viewer ----------
  let curIdx = -1, cur = null, curList = S.items;
  const viewer = $('#viewer');

  // list: which collection the arrows walk through (grid items by default, or hero slides)
  // dir: 1 = next (slides in from the right), -1 = previous, 0 = open without slide
  function openViewer(idx, list, dir = 0) {
    if (list) curList = list; else if (!viewer.hidden && curList !== S.items) { /* keep hero list */ } else curList = S.items;
    curIdx = idx; cur = curList[idx];
    if (!cur) return;
    const wasOpen = !viewer.hidden;
    if (!wasOpen) history.pushState({ ...(history.state || navState()), viewer: true }, '');   // so the phone Back button closes it
    viewer.hidden = false; document.body.style.overflow = 'hidden';
    const m = $('#vMedia');
    const wrap = el('div', 'vwrap');
    const old = m.querySelector('.vwrap:not(.out-left):not(.out-right)');
    if (dir && wasOpen && old) {
      old.classList.add(dir > 0 ? 'out-left' : 'out-right');
      old.querySelector('video')?.pause();
      setTimeout(() => old.remove(), 520);
      wrap.classList.add(dir > 0 ? 'in-right' : 'in-left');
    } else {
      m.innerHTML = '';
    }
    m.append(wrap);
    if (cur.kind === 'img') {
      const it = cur;
      const ph = el('img', 'ph'); ph.src = thumbOf(it); ph.alt = '';
      const main = el('img', 'main-img is-blur'); main.src = thumbOf(it); main.alt = 'Önizleme';
      wrap.append(ph, main);
      // the sharp image fades in on top of the blurred one (no hard swap)
      const full = el('img', 'main-img full-in'); full.alt = 'Önizleme';
      full.src = heroSrc(it);          // phones: the 1080px picture is plenty for the screen (Kaydet still saves the original)
      const put = () => { if (wrap.isConnected && !full.isConnected) { wrap.append(full); setTimeout(() => main.remove(), 700); } };
      full.decode().then(put).catch(() => {            // huge images: decode() may fail although they display
        if (full.complete && full.naturalWidth) return put();
        full.onload = put;
        full.onerror = () => { if (full.src !== it.full) full.src = it.full; };
      });
    } else {
      const v = el('video', 'main-img'); v.src = cur.hd; v.poster = cur.thumb; v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
      v.onerror = () => { if (v.src !== cur.preview) v.src = cur.preview; };
      wrap.append(v);
    }
    $('#vKind').textContent = (cur.catName ? cur.catName + ' · ' : '') + (cur.kind === 'img' ? 'Duvar kağıdı' : 'Hareketli duvar kağıdı');
    $('#vMoods').innerHTML = moodHtml(cur);
    $('#vTitle').textContent = cur.kind === 'img' ? `${cur.res} ${cur.w >= 3840 ? '· 4K Ultra HD' : cur.w >= 2560 ? '· 2K QHD' : '· Full HD'}` : cur.title;
    $('#vMeta').innerHTML = cur.kind === 'img'
      ? `<div><span>Çözünürlük</span><b>${esc(cur.res)}</b></div><div><span>Oran</span><b>${esc(String(cur.ratio).replace('.', ','))}</b></div>
         <div><span>Görüntülenme</span><b>${nf.format(cur.views)}</b></div><div><span>Favori</span><b>${nf.format(cur.favs)}</b></div>
         <div><span>Boyut</span><b>${mb(cur.size)}</b></div><div><span>Kimlik</span><b>${esc(cur.id)}</b></div>`
      : `<div><span>Kalite</span><b>1080p HD</b></div><div><span>Ses</span><b>Sessiz</b></div><div><span>Döngü</span><b>Sonsuz</b></div><div><span>Kaynak</span><b>${esc(cur.source || 'Mixkit')}</b></div>`;
    const sw = $('#vColors'); sw.innerHTML = '';
    $('#vColorBox').hidden = !(cur.colors || []).length;
    (cur.colors || []).forEach((c) => {
      const b = el('button'); b.style.background = c; b.title = 'Bu renkteki diğer duvar kağıtlarını göster';
      b.onclick = () => { rememberViewer(); closeViewer(); S.colors = c.slice(1); S.q = ''; S.title = 'Renk ' + c; switchMode('static', false); renderCats(); reset('force'); };
      sw.append(b);
    });
    renderActions(cur);
    $('#vTags').innerHTML = '';
    if (cur.kind === 'img') loadTags(cur);
    const src = $('#vSource');
    src.href = cur.page || 'https://mixkit.co/free-stock-video/';
    src.textContent = cur.kind === 'img' ? 'Wallhaven\'da görüntüle ↗' : `${cur.source || 'Mixkit'} sayfasında görüntüle ↗`;
    $('#vPrev').style.visibility = idx > 0 ? '' : 'hidden';
    $('#vNext').style.visibility = idx < curList.length - 1 ? '' : 'hidden';
    $('#vPreviewBtn').hidden = cur.kind !== 'img';
    if (curList === S.items && idx >= S.items.length - 4) load();
  }

  function renderActions(it) {
    const a = $('#vActions');
    const fav = `<button class="btn${isFav(it) ? ' is-fav' : ''}" data-act="fav">${ICON.heart}${isFav(it) ? 'Favorilerde' : 'Favorilere ekle'}</button>`;
    if (PHONE_MODE) {
      // phones: a website can't set the wallpaper itself, so save it and show how
      a.innerHTML = it.kind === 'img' ? `
        <button class="btn btn--primary" data-act="phone">${ICON.down}${SAVE_LABEL}</button>
        <div class="row">${fav}</div>
        <p class="note">${IS_PHONE ? '' : '<b>Windows:</b> İndir › resme sağ tıkla › "Masaüstü arka planı olarak ayarla".<br><b>Telefonda:</b> '}<b>Duvar kağıdı yapmak için:</b><br>
          <b>iPhone:</b> Kaydet › "Görüntüyü Kaydet" › Fotoğraflar'da aç › Paylaş › "Duvar Kağıdı olarak kullan".<br>
          <b>Android:</b> Kaydet › Galeri'de aç › ⋮ › "Duvar kağıdı olarak ayarla" (ana ekran / kilit ekranı).</p>`
        : `
        <a class="btn btn--primary" href="${esc(videoUrl(it))}" target="_blank" rel="noopener">${ICON.down}Videoyu indir</a>
        <div class="row">${fav}</div>
        <p class="note">Hareketli duvar kağıdı için: <b>Android</b>'de "Video Live Wallpaper" gibi bir uygulamayla bu videoyu seçebilirsin. <b>iPhone</b> video duvar kağıdını desteklemiyor; "Canlı Fotoğraf"a çeviren bir uygulama gerekir.</p>`;
      if (!IS_PHONE && IS_REMOTE) {
        // desktop visitor on the website: offer the one-click Apply via the PC helper
        a.insertAdjacentHTML('afterbegin', `
          <div class="connect">
            <b>Tek tıkla masaüstüne uygula</b>
            <span>VexWalls yardımcısı bu bilgisayarda çalışıyorsa bağlan; duvar kağıdı doğrudan uygulanır.</span>
            <button class="btn btn--primary" data-act="connect">${ICON.monitor}Bu bilgisayara bağlan</button>
          </div>`);
      }
      a.onclick = (e) => {
        const b = e.target.closest('[data-act]'); if (!b) return;
        if (b.dataset.act === 'fav') { toggleFav(it); renderActions(it); }
        else if (b.dataset.act === 'phone') savePhone(it);
        else if (b.dataset.act === 'connect') connectHelper();
      };
      return;
    }
    if (it.kind === 'img') {
      a.innerHTML = monitorPicker('img') + `
        <button class="btn btn--primary" data-act="desktop">${ICON.monitor}Masaüstüne uygula</button>
        <div class="row">
          <button class="btn" data-act="lock">${ICON.lock}Kilit ekranı</button>
          <button class="btn" data-act="both">${ICON.both}İkisine birden</button>
        </div>
        <div class="row"><button class="btn" data-act="save">${ICON.down}İndir</button>${fav}</div>
        <p class="note">Görsel orijinal kalitede indirilir ve ekranını dolduracak şekilde ayarlanır.</p>`;
    } else {
      if (S.mon === 'span') S.mon = 'all';
      const mon = multi() ? S.mon : 'all';
      const here = S.lives.find((l) => String(l.id) === String(it.id) && (l.monitor === mon || l.monitor === 'all'));
      a.innerHTML = monitorPicker('live') + `
        ${here ? `<button class="btn" data-act="stop" data-stop="${esc(here.monitor)}">${ICON.stop}Bu ekranda durdur</button>`
               : `<button class="btn btn--primary" data-act="live">${ICON.play}Hareketli olarak uygula</button>`}
        <div class="row">${fav}${S.lives.length && !here ? `<button class="btn" data-act="stop" data-stop="all">${ICON.stop}Tümünü durdur</button>` : ''}</div>
        <p class="note">Video, masaüstü simgelerinin arkasında sessiz ve sonsuz döngüde oynar.${multi() ? ' Her ekrana ayrı video koyabilirsin.' : ''} Bilgisayar yeniden başlatılınca normal duvar kağıdına döner.</p>`;
    }
    a.onclick = (e) => {
      const m = e.target.closest('[data-mon]');
      if (m) return setMon(m.dataset.mon);
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'stop') return stopLive(b.dataset.stop || 'all');
      const act = b.dataset.act;
      if (act === 'fav') { toggleFav(it); renderActions(it); }
      else if (act === 'save') saveImg(it);
      else if (act === 'live') applyLive(it);
      else if (act === 'stop') stopLive();
      else applyImg(it, act);
    };
  }

  async function loadTags(it) {
    if (ONLINE) return;
    try {
      const r = await fetch(API + '/api/w/' + it.id).then((x) => x.json());
      if (cur !== it || !r.data) return;
      const box = $('#vTags');
      (r.data.tags || []).slice(0, 14).forEach((t) => {
        const b = el('button', '', '#' + esc(t.name));
        // search by the tag NAME, best of all time (searching by tag id never matched with our filters)
        b.onclick = () => { rememberViewer(); closeViewer(); S.q = '+"' + t.name.replace(/"/g, '') + '"'; S.colors = ''; S.title = '#' + t.name; switchMode('static', false); renderCats(); reset('force'); };
        box.append(b);
      });
    } catch {}
  }

  // Coming back to a wallpaper after jumping to one of its tags / colours
  let backTo = null;
  function rememberViewer() { if (cur) backTo = { it: cur, nav: navState() }; }
  function updateBack() { const b = $('#backBtn'); if (b) b.hidden = !backTo || sameNav(backTo.nav, navState()); }
  window.__cwUpdateBack = updateBack;
  function goBackToWallpaper() {
    if (!backTo) return;
    const { it, nav } = backTo; backTo = null;
    S.cat = CATS.find((c) => c.key === nav.cat) || CATS[0]; S.q = nav.q || ''; S.colors = nav.colors || ''; S.title = nav.title || S.cat.name; S.liveCat = nav.live || S.liveCat;
    switchMode(nav.mode || 'static', false); renderCats(); reset('force');
    setTimeout(() => openViewer(0, [it]), 250);
  }
  // fromHistory: closed by the Back button (history already moved back)
  function closeViewer(fromHistory = false) {
    if (viewer.hidden) return;
    viewer.hidden = true; document.body.style.overflow = '';
    $('#vMedia').innerHTML = ''; cur = null;
    if (!fromHistory && history.state && history.state.viewer) { const s = { ...history.state }; delete s.viewer; history.replaceState(s, ''); }
  }
  const step = (d) => { const n = curIdx + d; if (n >= 0 && n < curList.length) openViewer(n, curList, d); };
  $('#vPrev').onclick = () => step(-1);
  $('#vNext').onclick = () => step(1);
  viewer.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeViewer(); });

  // desktop / lock preview
  const mock = $('#mock');
  function openMock(it) {
    $('#mockScreen').style.backgroundImage = `url("${it.full}"), url("${it.thumb}")`;
    const d = new Date();
    $('#mockTime').textContent = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    $('#mockDate').textContent = d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
    mock.hidden = false;
  }
  $('#vPreviewBtn').onclick = () => cur && openMock(cur);
  mock.addEventListener('click', (e) => {
    const b = e.target.closest('[data-mock]');
    if (b) { $$('[data-mock]').forEach((x) => x.classList.toggle('is-active', x === b)); mock.classList.toggle('is-lock', b.dataset.mock === 'lock'); return; }
    if (!e.target.closest('.mock__switch')) mock.hidden = true;
  });

  document.addEventListener('keydown', (e) => {
    if (!mock.hidden && e.key === 'Escape') { mock.hidden = true; return; }
    if (viewer.hidden) { if (heroCtl) heroCtl.key(e); return; }
    if (e.key === 'Escape') closeViewer();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });

  // ---------- modes / filters / search ----------
  function switchMode(mode, doReset = true) {
    S.mode = mode;
    $$('.tab').forEach((t) => t.classList.toggle('is-active', t.dataset.mode === mode));
    $('#catsSection').hidden = mode !== 'static';
    $('#filters').hidden = mode !== 'static';
    $('#liveCats').hidden = mode !== 'live';
    if (typeof updateIndicators === 'function') requestAnimationFrame(updateIndicators);
    if (doReset) reset('force');
  }
  $$('.tab').forEach((t) => (t.onclick = () => switchMode(t.dataset.mode)));
  $('[data-home]').onclick = (e) => { e.preventDefault(); S.cat = CATS[0]; S.q = ''; S.colors = ''; S.title = 'Keşfet'; switchMode('static', false); renderCats(); reset(); (window.cwScrollTo ? window.cwScrollTo(0) : scrollTo(0, 0)); };

  $$('#sortSeg button').forEach((b) => (b.onclick = () => {
    S.sort = b.dataset.sort;
    $$('#sortSeg button').forEach((x) => x.classList.toggle('is-active', x === b));
    $('#rangeSel').hidden = S.sort !== 'toplist';
    reset(true);
  }));
  $('#rangeSel').onchange = (e) => { S.range = e.target.value; reset(true); };
  $('#resSel').onchange = (e) => { S.res = e.target.value; reset(true); };
  $('#ratioSel').onchange = (e) => { S.ratio = e.target.value; reset(true); };

  function doSearch(q) {
    q = q.trim(); if (!q) return;
    S.q = q; S.colors = ''; S.title = '“' + q + '”';
    switchMode('static', false); renderCats(); reset('force');
  }
  ['#heroSearch', '#navSearch'].forEach((id) => {
    $(id).addEventListener('submit', (e) => { e.preventDefault(); const v = $('input', e.currentTarget).value; doSearch(v); });
  });

  $('#liveStop').onclick = () => stopLive('all');
  // Set this before publishing: where copyright owners can send removal requests.
  const CONTACT_EMAIL = '';
  $('#openCopyright').onclick = () => $('#copyright').showModal();
  $('#contactMail').href = CONTACT_EMAIL ? 'mailto:' + CONTACT_EMAIL : 'https://github.com/VexWalls/vexwalls.github.io/issues/new?title=Kald%C4%B1rma%20talebi';
  $('#contactMail').target = '_blank';
  if (!CONTACT_EMAIL) $('#contactMail').textContent = 'GitHub üzerinden kaldırma talebi açarak bize';
  $('#moreBtn').onclick = () => { load(); updateMore(); };
  $('#backBtn').onclick = goBackToWallpaper;
  $('#openFolder').onclick = () => api(API + '/api/open-folder').catch((e) => toast('Klasör açılamadı', serverHint(e), 'err'));

  // ---------- micro-interactions ----------
  // click ripple on buttons
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('.btn, .tab, .seg button, .chip, .iconbtn, .hthumb');
    if (!b || b.disabled) return;
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2;
    const s = el('span', 'ripple');
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    b.append(s);
    setTimeout(() => s.remove(), 700);
  });
  // sliding highlight under the active tab / sort option
  const indicators = [];
  function slidingIndicator(box) {
    const ind = el('span', 'ind'); box.prepend(ind);
    const upd = () => {
      const a = box.querySelector(':scope > .is-active');
      if (!a || !a.offsetWidth) { ind.style.opacity = 0; return; }
      ind.style.opacity = 1; ind.style.width = a.offsetWidth + 'px'; ind.style.transform = `translateX(${a.offsetLeft}px)`;
    };
    new MutationObserver(upd).observe(box, { subtree: true, attributes: true, attributeFilter: ['class'] });
    indicators.push(upd); upd();
  }
  const updateIndicators = () => indicators.forEach((f) => f());
  addEventListener('resize', updateIndicators);
  document.fonts?.ready.then(updateIndicators);
  slidingIndicator($('.tabs')); slidingIndicator($('#sortSeg'));

  // nav background on scroll
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // ---------- hero slideshow ----------
  // Slides glide to the right every few seconds. Hovering the picture fades the text out
  // ("peek" mode): then the user can drag / swipe / use arrows or thumbnails, and clicking
  // a slide opens it in the viewer to apply it.
  let heroCtl = null;
  const HERO_MS = 7000;   // time each wallpaper stays on screen

  // Endless random feed for the hero: random categories, random pages, shuffled.
  // More pictures are fetched as the user swipes towards the end (Instagram-style).
  const heroFeed = { pages: {}, seen: new Set() };
  async function heroBatch() {
    if (CATALOG) return staticMix(5, true);
    const cats = shuffle(mixPool()).slice(0, 4);
    const res = await Promise.all(cats.map((c) => {
      const info = heroFeed.pages[c.key] || (heroFeed.pages[c.key] = { used: [], last: 8 });
      const free = []; for (let i = 1; i <= Math.min(info.last, 10); i++) if (!info.used.includes(i)) free.push(i);
      if (!free.length) return Promise.resolve({ c, data: [] });
      const page = free[Math.floor(Math.random() * free.length)];
      info.used.push(page);
      const p = new URLSearchParams({ q: c.q, categories: c.c, sorting: 'toplist', topRange: '1y', atleast: '1920x1080', ratios: '16x9,16x10', page });
      return fetch(API + '/api/search?' + p).then((x) => x.json())
        .then((r) => { if (r.meta) info.last = r.meta.last_page; return { c, data: r.data || [] }; })
        .catch(() => ({ c, data: [] }));
    }));
    const out = [];
    res.forEach(({ c, data }) => data.sort(() => Math.random() - 0.5).slice(0, 5).forEach((w) => {
      if (!heroFeed.seen.has(w.id)) { heroFeed.seen.add(w.id); out.push(toImg(w, c)); }
    }));
    return out.sort(() => Math.random() - 0.5);
  }

  async function hero() {
    const first = await heroBatch().catch(() => []);
    if (!first.length) return;
    heroCtl = buildHero(first);
  }

  function buildHero(items) {
    const heroEl = $('#hero'), stage = $('#heroBg'), thumbs = $('#heroThumbs'), credit = $('#heroCredit');
    stage.innerHTML = ''; thumbs.innerHTML = '';
    const slides = [];
    function addSlides(list) {
      list.forEach((it) => {
        const s = el('div', 'hslide');
        const ph = el('img', 'hslide__ph'); ph.src = thumbOf(it); ph.alt = '';
        s.append(ph);
        stage.append(s);
        slides.push(s);
      });
    }
    addSlides(items);
    let fetching = false;
    function maybeMore(n) {
      if (fetching || n < items.length - 4) return;
      fetching = true;
      heroBatch().then((more) => { if (more.length) { items.push(...more); addSlides(more); } }).finally(() => (fetching = false));
    }
    // Full-size images are downloaded AND decoded before their slide moves in,
    // so the transition never stutters on a huge 4K image.
    const ready = new Map();
    function loadFull(i) {
      i = (i + items.length) % items.length;
      if (ready.has(i)) return ready.get(i);
      const img = el('img', 'hslide__img'); img.alt = '';
      img.src = heroSrc(items[i]);
      const show = () => { if (!img.isConnected) { slides[i].append(img); slides[i].classList.add('is-sharp'); } };
      // decode() can fail on huge images even though they display fine: fall back to onload,
      // and if the screen-sized copy is missing, use the original — never stay blurry.
      const p = img.decode().then(show).catch(() => new Promise((res) => {
        if (img.complete && img.naturalWidth) { show(); return res(); }
        img.onload = () => { show(); res(); };
        img.onerror = () => { if (img.src !== items[i].full) img.src = items[i].full; else res(); };
      }));
      ready.set(i, p);
      return p;
    }

    let idx = -1, timer = 0, peek = false, peekTimer = 0;
    function go(n, dir = 1, fast = true) {
      heroEl.classList.toggle("is-fast", fast);   // user navigation = quick slide, autoplay = slow glide
      n = (n + items.length) % items.length;
      if (n === idx) return;
      maybeMore(n);
      const prev = slides[idx];
      if (prev) {
        prev.classList.remove('is-active', 'from-left', 'from-right');
        prev.classList.add(dir > 0 ? 'leave-left' : 'leave-right');   // next: old picture slides out to the left
        clearTimeout(prev._t);
        prev._t = setTimeout(() => prev.classList.remove('leave-right', 'leave-left'), 2200);
      }
      const cur = slides[n];
      clearTimeout(cur._t);
      cur.classList.remove('leave-right', 'leave-left', 'is-active');
      cur.classList.add(dir > 0 ? 'from-right' : 'from-left');   // next: new picture comes in from the right
      void cur.offsetWidth;                   // restart the transition
      cur.classList.add('is-active');
      idx = n;
      try { localStorage.setItem('crywall.heroLast', heroSrc(items[n])); } catch {}   // shown instantly on the next visit
      loadFull(n); loadFull(n + 1);
      $$('.hthumb', thumbs).forEach((t, i) => t.classList.toggle('is-active', i === n));
      $('.hthumb.is-active', thumbs)?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      $('span', credit).textContent = (items[n].catName ? items[n].catName + ' · ' : '') + (items[n].w >= 3840 ? '4K' : items[n].res);
      restart();
    }
    const next = () => go(idx + 1, 1);
    const prev = () => go(idx - 1, -1);
    // autoplay: wait for the interval AND for the next image to be ready
    // pause the slideshow while it's scrolled away or a wallpaper is open (it's a big 4K layer)
    let heroOnScreen = true;
    new IntersectionObserver((es) => { heroOnScreen = es[0].isIntersecting; if (heroOnScreen) restart(); }, { threshold: 0.15 }).observe(heroEl);
    function autoNext() {
      if (!heroOnScreen || !$('#viewer').hidden) return;          // resumes when visible again
      const want = (idx + 1) % items.length;
      Promise.race([loadFull(want), new Promise((r) => setTimeout(r, 8000))])
        .then(() => { if (!peek && !document.hidden && heroOnScreen && $('#viewer').hidden && idx !== want) go(want, 1, false); else restart(); });
    }
    function restart() {
      clearTimeout(timer);
      heroEl.style.setProperty('--hero-ms', HERO_MS + 'ms');
      heroEl.classList.remove('is-ticking'); void heroEl.offsetWidth;
      if (!peek && !document.hidden && window.CWPrefs?.autoplay !== false) { heroEl.classList.add('is-ticking'); timer = setTimeout(autoNext, HERO_MS); }
    }

    // peek mode: text fades when the pointer rests on the picture (not on the text / search)
    const overText = (t) => t.closest('.hero__content h1, .hero__content .hero__sub, .hero__content .eyebrow, .search--hero, .hero__stats, .nav');
    function setPeek(on) {
      if (on === peek) return;
      peek = on; heroEl.classList.toggle('is-peek', on); restart();
    }
    heroEl.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      clearTimeout(peekTimer);
      if (overText(e.target) || document.activeElement === $('#heroSearch input')) { setPeek(false); return; }
      if (!peek) peekTimer = setTimeout(() => setPeek(true), 450);
    });
    heroEl.addEventListener('pointerleave', () => { clearTimeout(peekTimer); setPeek(false); });
    $('#heroSearch input').addEventListener('focus', () => setPeek(false));

    // drag / swipe, horizontal wheel, click to open
    let dragX = null, dragged = false;
    stage.addEventListener('pointerdown', (e) => { dragX = e.clientX; dragged = false; });
    addEventListener('pointerup', (e) => {
      if (dragX == null) return;
      const dx = e.clientX - dragX; dragX = null;
      if (Math.abs(dx) > 50) { dragged = true; dx > 0 ? prev() : next(); }
    });
    stage.addEventListener('click', () => { if (!dragged) openViewer(idx, items); });
    let wheelLock = 0;
    heroEl.addEventListener('wheel', (e) => {
      if (!peek || Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 12) return;
      e.preventDefault();
      if (Date.now() < wheelLock) return;
      wheelLock = Date.now() + 260;
      e.deltaX > 0 ? next() : prev();
    }, { passive: false });
    $('#heroPrev').onclick = (e) => { e.stopPropagation(); prev(); };
    $('#heroNext').onclick = (e) => { e.stopPropagation(); next(); };
    $('#heroOpen').onclick = (e) => { e.stopPropagation(); openViewer(idx, items); };
    credit.hidden = false;
    credit.onclick = () => openViewer(idx, items);
    document.addEventListener('visibilitychange', restart);

    // first slide waits (max 3.5 s) for its sharp picture; meanwhile the cached last picture shows
    Promise.race([loadFull(0), new Promise((r) => setTimeout(r, $('#heroBg').style.background ? 3500 : 0))]).then(() => go(0));
    return {
      key(e) {
        if (!peek) return;
        if (e.key === 'ArrowRight') next();
        else if (e.key === 'ArrowLeft') prev();
        else if (e.key === 'Enter') openViewer(idx, items);
      },
    };
  }

  async function status() {
    if (ONLINE) return;
    try {
      const s = await api(API + '/api/status');
      S.lives = s.lives || []; S.monitors = s.monitors || [];
      const valid = ['all', 'span', ...S.monitors.map((m) => String(m.index))];
      if (!valid.includes(S.mon)) S.mon = 'all';
      renderLiveBar();
      if (cur && !$('#viewer').hidden) renderActions(cur);
    }
    catch { if (!PHONE_MODE) toast('VexWalls sunucusu bulunamadı', 'Siteyi Baslat.bat ile açarsan "Uygula" butonları çalışır.', 'err', 9000); }
  }
  S.mon = store.get('crywall.mon', 'all');
  if (IS_PHONE) { S.ratio = 'portrait'; const rs = $('#ratioSel'); if (rs) rs.value = 'portrait'; }   // phones: tall wallpapers by default
  // user's saved preferences (Settings panel)
  function applyPrefs(p, doReset = true) {
    if (!p) return;
    if (p.ratio) { S.ratio = p.ratio; const rs = $('#ratioSel'); if (rs) rs.value = p.ratio; }
    if (p.res) { S.res = p.res; const rr = $('#resSel'); if (rr) rr.value = p.res; }
    if (doReset) reset(true);
  }
  applyPrefs(window.CWPrefs, false);

  // small API used by fx.js (flowing category strips)
  window.CryWall = {
    CATS, LIVE_CATS,
    openCat(key) { const c = CATS.find((x) => x.key === key); if (!c) return; S.cat = c; S.q = ""; S.colors = ""; S.title = c.name; switchMode("static", false); renderCats(); reset("force"); },
    openLive(key) { S.liveCat = key; switchMode("live", false); renderCats(); reset("force"); },
    // favourites, used by account.js to keep them in the user's account
    applyPrefs,
    getFavs: () => favs.slice(),
    favKey,
    setFavs(list) {
      favs = Array.isArray(list) ? list : [];
      store.set('crywall.favs', favs);
      $$('[data-fav]').forEach((b) => b.classList.toggle('is-fav', favs.some((f) => favKey(f) === b.dataset.fav)));
      if (S.mode === 'fav') renderFavs();
    },
    toast,
    onFavsChange: null,
  };

  // ---------- go ----------
  (async () => {
    // Show the last hero picture right away (browser cache) and start the slideshow without
    // waiting for anything else, so the top of the page is never an empty grey box.
    try { const last = localStorage.getItem('crywall.heroLast'); if (last) $('#heroBg').style.background = `#0b0d14 url("${last}") center/cover no-repeat`; } catch {}
    hero();
    await detectHelper();      // on the website: is the VexWalls PC helper running here?
    applyModeUI();
    renderCats();
    switchMode('static', false);
    reset();
    // (hero already started above)
    status();
  })();
})();
