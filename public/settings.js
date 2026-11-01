/* VexWalls — Settings panel (opened from the profile / "Giriş yap" button).
   Preferences live in localStorage 'crywall.prefs' (kept for existing users):
   { mode: 'dark'|'light'|'system', lang: 'tr'|'en', ratio, res, autoplay, calm } */
(() => {
  'use strict';
  const KEY = 'crywall.prefs';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } };
  const prefs = Object.assign({ mode: 'dark', lang: window.CW_LANG || 'tr', ratio: '', res: '', autoplay: true, calm: false }, read());
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch {} };
  window.CWPrefs = prefs;
  const T = (s) => (window.T ? window.T(s) : s);
  const root = document.documentElement;

  // ---------- apply ----------
  const mq = matchMedia('(prefers-color-scheme: light)');
  function applyMode() {
    const light = prefs.mode === 'light' || (prefs.mode === 'system' && mq.matches);
    root.dataset.mode = light ? 'light' : 'dark';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#f4f6fa' : '#070a0e');
  }
  mq.addEventListener?.('change', applyMode);
  applyMode();
  root.classList.toggle('calm', !!prefs.calm);

  // ---------- panel ----------
  let panel = null;
  const seg = (name, value, opts) => `<div class="st-seg" data-k="${name}">${opts.map(([v, l]) => `<button data-v="${v}" class="${String(value) === String(v) ? 'is-on' : ''}">${T(l)}</button>`).join('')}</div>`;
  const sw = (name, on) => `<button class="st-switch ${on ? 'is-on' : ''}" data-sw="${name}" role="switch" aria-checked="${on}"><i></i></button>`;

  function render() {
    const user = window.CryWallAccount?.user;
    const th = window.CWTheme;
    const ver = window.CW_VERSION;
    const name = user ? (user.displayName || (user.email || '').split('@')[0]) : '';
    panel.querySelector('.st-body').innerHTML = `
      <section class="st-acc">
        ${user ? `<div class="st-avatar">${user.photoURL ? `<img src="${user.photoURL}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : (name[0] || '?').toUpperCase()}</div>
          <div class="st-acc__txt"><b>${name}</b><span>${user.email || ''}</span></div>`
        : `<div class="st-avatar st-avatar--guest">?</div><div class="st-acc__txt"><b>${T('Giriş yapmadın')}</b><span>${T('Giriş yaparsan favorilerin her cihazda seninle olur.')}</span></div>`}
      </section>
      ${user ? '' : `<button class="btn btn--primary st-wide" data-act="login">${T('Giriş yap')} / ${T('Kayıt ol')}</button>`}

      <h4>${T('Görünüm')}</h4>
      <div class="st-row"><span>${T('Tema')}</span>${seg('mode', prefs.mode === 'light' ? 'light' : 'dark', [['dark', 'Koyu'], ['light', 'Açık']])}</div>
      <div class="st-row st-row--col"><span>${T('Vurgu rengi')}</span>
        <div class="st-colors">${(th?.THEMES || []).map(([k, n, c]) => `<button data-accent="${k}" title="${T(n)}" class="${th.current() === k ? 'is-on' : ''}" style="--c:${c}"></button>`).join('')}</div></div>
      <div class="st-row"><span>${T('Dil')}</span><select class="st-select" data-lang>${(window.CW_LANG_NAMES || [['tr', 'Türkçe'], ['en', 'English']]).map(([c, n]) => `<option value="${c}" ${c === (window.CW_LANG || prefs.lang) ? 'selected' : ''}>${n}</option>`).join('')}</select></div>

      <h4>${T('Duvar kağıdı tercihleri')}</h4>
      <div class="st-row st-row--col"><span>${T('Ekran tipi')}</span>${seg('ratio', prefs.ratio, [['', 'Otomatik'], ['landscape', 'Bilgisayar'], ['portrait', 'Telefon'], ['21x9,32x9', 'Ultra geniş']])}</div>
      <div class="st-row st-row--col"><span>${T('En düşük çözünürlük')}</span>${seg('res', prefs.res, [['', 'Otomatik'], ['1920x1080', 'Full HD'], ['2560x1440', '2K'], ['3840x2160', '4K']])}</div>
      <div class="st-row"><span>${T('Ana sayfa slaytı kendiliğinden geçsin')}</span>${sw('autoplay', prefs.autoplay)}</div>
      <div class="st-row"><span>${T('Animasyonları azalt')}</span>${sw('calm', prefs.calm)}</div>
      <div id="stRotate"></div>

      ${user ? `<h4>${T('Hesap')}</h4>
        <button class="st-item" data-act="logout">${T('Çıkış yap')}</button>
        <button class="st-item st-danger" data-act="delete">${T('Hesabımı sil')}</button>` : ''}

      <h4>${T('Kitaplığım')}</h4>
      <button class="st-item" data-act="favs">♥ ${T('Favorilerim')}</button>
      <button class="st-item" data-act="recent">🕘 ${T('Son kullanılanlar')}</button>

      <h4>${T('Veriler')}</h4>
      <button class="st-item" data-act="clearfavs">${T('Favorileri temizle')}</button>
      <button class="st-item" data-act="reset">${T('Ayarları sıfırla')}</button>

      <h4>${T('Hakkında')}</h4>
      <div class="st-about">
        <span>VexWalls ${ver ? 'v' + ver.v : ''}${ver?.date ? ' · ' + ver.date : ''}</span>
        <button class="st-link" data-act="privacy">${T('Gizlilik')}</button>
        <button class="st-link" data-act="copyright">${T('Telif')}</button>
      </div>`;
    renderRotate();
  }


  // ---------- automatic wallpaper changing (PC helper) ----------
  async function renderRotate() {
    const box = panel?.querySelector('#stRotate'); if (!box) return;
    const base = window.CryWall?.helperBase?.();
    if (base == null) { box.innerHTML = ''; return; }
    let c;
    try { c = await fetch(base + '/api/rotate').then((r) => r.json()); } catch { box.innerHTML = ''; return; }
    if (!c || !c.ok) { box.innerHTML = ''; return; }
    const cats = (window.CryWall?.CATS || []).filter((x) => x.key !== 'kesfet');
    box.innerHTML = `
      <h4>${T('Otomatik değiştir')}</h4>
      <div class="st-row"><span>${T('Duvar kağıdını kendiliğinden değiştir')}</span>${sw('rot-on', c.on)}</div>
      <div class="st-rot ${c.on ? '' : 'is-off'}">
        <div class="st-row st-row--col"><span>${T('Nereden')}</span>${seg('rot-source', c.source, [['cat', 'Kategori'], ['favs', 'Favorilerim']])}</div>
        ${c.source === 'cat' ? `<div class="st-row"><span>${T('Kategori')}</span><select class="st-select" data-rotcat>${cats.map((x) => `<option value="${x.key}" ${x.key === c.cat ? 'selected' : ''}>${T(x.name)}</option>`).join('')}</select></div>` : ''}
        <div class="st-row st-row--col"><span>${T('Ne sıklıkla')}</span>${seg('rot-every', c.every, [['60', 'Saatte bir'], ['180', '3 saatte bir'], ['1440', 'Günde bir']])}</div>
        <button class="st-item" data-act="rot-now">⟳ ${T('Şimdi değiştir')}</button>
        <p class="st-note">${T('Bilgisayar açıkken çalışır. Wallpaper Engine açıksa değişiklik onun arkasında kalır.')}</p>
      </div>`;
  }
  async function saveRotate(patch) {
    const base = window.CryWall?.helperBase?.(); if (base == null) return;
    const favs = (window.CryWall?.getFavs?.() || []).filter((f) => f.kind === 'img' && f.full).map((f) => f.full);
    try {
      await fetch(base + '/api/rotate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...patch, favs }) });
      if (patch.on === true || patch.now) window.CryWall?.toast(T('Duvar kağıdı değişiyor…'), T('Birkaç saniye içinde masaüstünde.'), 'ok', 3000);
      if (patch.source === 'favs' && !favs.length) window.CryWall?.toast(T('Favorin yok'), T('Önce birkaç duvar kağıdını ♥ ile favorilere ekle.'), 'err', 5000);
    } catch { window.CryWall?.toast(T('Kaydedilemedi'), T('Bilgisayar yardımcısına ulaşılamadı.'), 'err'); }
    renderRotate();
  }
  function open() {
    close();
    panel = document.createElement('div');
    panel.className = 'st';
    panel.innerHTML = `<div class="st__bg" data-x></div>
      <aside class="st__panel" role="dialog" aria-modal="true" aria-label="${T('Ayarlar')}">
        <header><h3>${T('Ayarlar')}</h3><button class="st__x" data-x aria-label="Kapat">✕</button></header>
        <div class="st-body"></div>
      </aside>`;
    document.body.append(panel);
    render();
    renderRotate();
    requestAnimationFrame(() => panel.classList.add('show'));
    panel.addEventListener('click', onClick);
    panel.addEventListener('change', (e) => {
      const s = e.target.closest('[data-lang]'); if (s) { prefs.lang = s.value; save(); location.reload(); }
      const rc = e.target.closest('[data-rotcat]'); if (rc) saveRotate({ cat: rc.value });
    });
  }
  function close() { if (!panel) return; const p = panel; panel = null; p.classList.remove('show'); setTimeout(() => p.remove(), 250); }

  async function onClick(e) {
    if (e.target.closest('[data-x]')) return close();
    // automatic wallpaper changing controls
    const rseg = e.target.closest('.st-seg [data-v]');
    if (rseg && rseg.parentElement.dataset.k.startsWith('rot-')) {
      const k = rseg.parentElement.dataset.k.slice(4);
      return saveRotate({ [k]: k === 'every' ? +rseg.dataset.v : rseg.dataset.v });
    }
    const rsw = e.target.closest('[data-sw="rot-on"]');
    if (rsw) return saveRotate({ on: !rsw.classList.contains('is-on') });
    if (e.target.closest('[data-act="rot-now"]')) return saveRotate({ now: true });
    const segBtn = e.target.closest('.st-seg [data-v]');
    if (segBtn) {
      const k = segBtn.parentElement.dataset.k, v = segBtn.dataset.v;
      prefs[k] = v; save();
      if (k === 'mode') applyMode();
      if (k === 'lang') { location.reload(); return; }
      if (k === 'ratio' || k === 'res') window.CryWall?.applyPrefs?.(prefs);
      render(); return;
    }
    const s = e.target.closest('[data-sw]');
    if (s) {
      const k = s.dataset.sw; prefs[k] = !prefs[k]; save();
      if (k === 'calm') root.classList.toggle('calm', prefs.calm);
      render(); return;
    }
    const acc = e.target.closest('[data-accent]');
    if (acc) { window.CWTheme?.apply(acc.dataset.accent); render(); return; }
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (!a) return;
    if (a === 'login') { close(); window.CryWallAccount?.open('login'); }
    if (a === 'logout') { close(); window.CryWallAccount?.signOut(); }
    if (a === 'delete') { close(); window.CryWallAccount?.deleteAccount(); }
    if (a === 'favs') { close(); document.querySelector('.tab[data-mode="fav"]')?.click(); }
    if (a === 'recent') { close(); window.CryWall?.openRecent?.(); }
    if (a === 'privacy') { document.getElementById('privacy')?.showModal(); }
    if (a === 'copyright') { document.getElementById('copyright')?.showModal(); }
    if (a === 'clearfavs' && confirm(T('Tüm favoriler silinsin mi?'))) { window.CryWall?.setFavs([]); window.CryWall?.onFavsChange?.([]); window.CryWall?.toast(T('Favoriler temizlendi'), '', 'ok'); }
    if (a === 'reset' && confirm(T('Tüm ayarlar varsayılana dönsün mü?'))) { try { localStorage.removeItem(KEY); localStorage.removeItem('crywall.theme'); } catch {} location.reload(); }
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panel) close(); });

  function setMode(m) { prefs.mode = m === 'light' ? 'light' : 'dark'; save(); applyMode(); }
  window.CWSettings = { open, close, prefs, setMode };
})();
