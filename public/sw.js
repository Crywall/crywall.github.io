/* CryWall service worker — makes the site installable as an app and keeps it
   working on a bad connection. Network first; the cached copy is only a fallback,
   so updates always show up. Pictures from other sites are not cached here. */
const CACHE = 'crywall-v2';
const SHELL = ['./', 'index.html', 'styles.css', 'theme.css', 'app.js', 'fx.js', 'pwa.js', 'favicon.svg', 'icon-192.png', 'icon-512.png', 'manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;   // other sites: browser handles it
  if (url.pathname.includes('/t/')) return;                               // big phone previews: normal browser cache
  if (url.pathname.includes('/t/')) return;                               // big phone previews: normal browser cache
  e.respondWith(
    fetch(req, { cache: 'no-cache' }).then((res) => {   // always ask the server for the newest file
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || caches.match('index.html')))
  );
});
