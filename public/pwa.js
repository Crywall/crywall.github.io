/* VexWalls — install as an app.
   Phones: a small "Uygulamayı yükle" banner (Android installs in one tap; iPhone shows the steps).
   Computers: a "Telefona yükle" button with a QR code, so nobody has to type the address. */
(() => {
  'use strict';
  const SITE = 'https://vexwalls.github.io/';
  const q = new URLSearchParams(location.search);
  const isRemote = !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const isPhone = (matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 820) || q.has('phone');
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const installed = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };

  // service worker (website only — on the PC version it would just cache the dev server)
  if (isRemote && 'serviceWorker' in navigator) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  let deferred = null;                       // Android/Chrome install prompt
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; });
  addEventListener('appinstalled', () => { closeSheet(); hideBanner(); store.set('crywall.installed', '1'); });

  const PHONE_ICON = '<svg viewBox="0 0 24 24"><path d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 2v16h8V4H8Zm3 13h2v2h-2v-2Z"/></svg>';
  const DL_ICON = '<svg viewBox="0 0 24 24"><path d="M11 3h2v10.2l3.6-3.6 1.4 1.4-6 6-6-6 1.4-1.4 3.6 3.6V3ZM4 19h16v2H4v-2Z"/></svg>';
  const SHARE_ICON = '<svg viewBox="0 0 24 24" class="ios-share"><path d="M12 2 7.8 6.2l1.4 1.4L11 5.8V15h2V5.8l1.8 1.8 1.4-1.4L12 2ZM5 10h3v2H6v8h12v-8h-2v-2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1Z"/></svg>';

  // ---------- sheet (steps / QR) ----------
  let sheet = null;
  function openSheet(html) {
    closeSheet();
    sheet = document.createElement('div');
    sheet.className = 'pwa-sheet';
    sheet.innerHTML = `<div class="pwa-sheet__bg" data-x></div><div class="pwa-sheet__card" role="dialog" aria-modal="true">
      <button class="pwa-sheet__x" data-x aria-label="Kapat">✕</button>${html}</div>`;
    sheet.addEventListener('click', (e) => { if (e.target.closest('[data-x]')) closeSheet(); });
    document.body.append(sheet);
  }
  function closeSheet() { sheet?.remove(); sheet = null; }

  async function install() {
    if (deferred) {
      deferred.prompt();
      const r = await deferred.userChoice.catch(() => null);
      deferred = null;
      if (r && r.outcome === 'accepted') hideBanner();
      return;
    }
    const steps = isIOS
      ? `<li>Alttaki <b>Paylaş</b> ${SHARE_ICON} simgesine dokun <small>(Safari'de)</small></li>
         <li>Listeyi kaydırıp <b>"Ana Ekrana Ekle"</b>ye dokun</li>
         <li>Sağ üstteki <b>Ekle</b>'ye bas</li>`
      : `<li>Sağ üstteki <b>⋮</b> menüsüne dokun</li>
         <li><b>"Uygulamayı yükle"</b> ya da <b>"Ana ekrana ekle"</b>yi seç</li>
         <li><b>Yükle</b>'ye bas</li>`;
    openSheet(`<img class="pwa-sheet__icon" src="icon-192.png" alt="">
      <h3>VexWalls'u telefonuna yükle</h3>
      <p>Ana ekranına VexWalls simgesi gelir; adres yazmadan, uygulama gibi tam ekran açılır.</p>
      <ol class="pwa-steps">${steps}</ol>`);
  }

  // ---------- phone banner ----------
  let banner = null;
  function hideBanner() { banner?.classList.remove('show'); setTimeout(() => banner?.remove(), 400); }
  function showBanner() {
    if (installed || store.get('crywall.installHidden') === '1') return;
    banner = document.createElement('div');
    banner.className = 'pwa-banner';
    banner.innerHTML = `<img src="icon-192.png" alt=""><div><b>VexWalls uygulaması</b><span>Ana ekrana ekle, tek dokunuşla aç</span></div>
      <button class="btn btn--primary btn--sm" data-i>${DL_ICON}Yükle</button><button class="pwa-banner__x" data-c aria-label="Kapat">✕</button>`;
    banner.addEventListener('click', (e) => {
      if (e.target.closest('[data-i]')) install();
      if (e.target.closest('[data-c]')) { store.set('crywall.installHidden', '1'); hideBanner(); }
    });
    document.body.append(banner);
    setTimeout(() => banner.classList.add('show'), 1500);
  }

  // ---------- computer: QR code to open/install on the phone ----------
  function loadQr() {
    return window.qrcode ? Promise.resolve() : new Promise((ok, fail) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
      s.onload = ok; s.onerror = fail; document.head.append(s);
    });
  }
  async function showQr() {
    const link = SITE + '?install=1';
    openSheet(`<h3>Telefonuna yükle</h3>
      <p>Telefonunun kamerasıyla bu kodu okut. VexWalls açılır ve <b>"Yükle"</b>ye basınca ana ekranına uygulama olarak eklenir.</p>
      <div class="pwa-qr" id="pwaQr"><span>QR kod hazırlanıyor…</span></div>
      <p class="pwa-link">ya da telefonda şunu aç: <b>vexwalls.github.io</b></p>`);
    try {
      await loadQr();
      const qr = window.qrcode(0, 'M'); qr.addData(link); qr.make();
      const box = document.getElementById('pwaQr'); if (box) box.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
    } catch { const box = document.getElementById('pwaQr'); if (box) box.innerHTML = '<span>QR yüklenemedi — telefonda vexwalls.github.io adresini aç.</span>'; }
  }

  function start() {
    if (isPhone) {
      if (!installed) showBanner();
      if (q.has('install') && !installed) setTimeout(install, 800);
    } else {
      // computer: "Telefona yükle" button in the menu bar
      const themes = document.querySelector('.themes');
      if (themes) {
        const b = document.createElement('button');
        b.className = 'btn btn--sm btn--ghost pwa-navbtn';
        b.innerHTML = `${PHONE_ICON}<span>Telefona yükle</span>`;
        b.addEventListener('click', showQr);
        themes.before(b);
      }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

// ---------- version in the corner + automatic update ----------
// The site/app always loads the newest files from the internet; this just shows the version
// (next to the logo) and, if a new version is published while the app is open, reloads it
// the next time you come back to it.
(() => {
  'use strict';
  let current = null;
  const get = () => fetch('version.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  function note(text) {
    const n = document.createElement('div');
    n.className = 'ver-note'; n.textContent = text;
    document.body.append(n);
    setTimeout(() => n.classList.add('show'), 50);
    setTimeout(() => { n.classList.remove('show'); setTimeout(() => n.remove(), 500); }, 4200);
  }
  async function init() {
    const v = await get();
    if (!v || !v.v) return;                       // PC version (no version file): nothing to show
    current = v.v;
    const brand = document.querySelector('.nav .brand');
    window.CW_VERSION = v;    // shown in Settings and at the bottom of the page (not in the menu bar)
    const legal = document.querySelector('.footer__legal'); if (legal && !legal.querySelector('.ver-foot')) legal.insertAdjacentHTML('beforeend', ` · <span class="ver-foot">v${v.v}</span>`);
    let seen = null; try { seen = localStorage.getItem('crywall.ver'); localStorage.setItem('crywall.ver', v.v); } catch {}
    if (seen && seen !== v.v) note(`VexWalls güncellendi: v${v.v}`);
  }
  async function check() {
    if (!current || document.hidden) return;
    const v = await get();
    if (!v || !v.v || v.v === current) return;
    const viewerOpen = !document.getElementById('viewer')?.hidden;
    if (viewerOpen) { current = v.v; note(`Yeni sürüm hazır (v${v.v}) — sayfayı kapatıp açınca gelecek`); return; }
    location.reload();
  }
  document.addEventListener('visibilitychange', check);
  setInterval(check, 15 * 60 * 1000);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
