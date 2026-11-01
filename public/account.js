/* VexWalls — user accounts (optional).
   Sign in with Google or e-mail + password (Firebase Authentication). Passwords are handled by
   Google; VexWalls never sees them. While signed in, favourites are kept in the user's own record
   (Firestore users/{uid}) so they are the same on every device and never get lost.
   Security rule on the database: a user can only read/write their own record. */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail,
  sendEmailVerification, updateProfile, signOut, deleteUser, setPersistence, browserLocalPersistence,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore, doc, getDoc, setDoc, deleteDoc, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const app = initializeApp({
  apiKey: 'AIzaSyCoMRK5s608JForIuO8Nkwz5qUhSK8BPMM',
  // On the website the sign-in helper pages are served from our own domain (public/__/auth/*),
  // so browsers that block cross-site storage (Edge tracking prevention, Safari) still work.
  authDomain: location.hostname === 'vexwalls.github.io' ? 'vexwalls.github.io' : 'crywall-7fb79.firebaseapp.com',
  projectId: 'crywall-7fb79',
  storageBucket: 'crywall-7fb79.firebasestorage.app',
  messagingSenderId: '1005137554586',
  appId: '1:1005137554586:web:0286534518d87de23bc323',
});
const auth = getAuth(app);
auth.languageCode = 'tr';
setPersistence(auth, browserLocalPersistence).catch(() => {});
const db = getFirestore(app);

const $ = (s, r = document) => r.querySelector(s);
const cw = () => window.CryWall || {};
const toast = (...a) => cw().toast?.(...a);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ICON_USER = '<svg viewBox="0 0 24 24"><path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5Z"/></svg>';
const ICON_LOCK = '<svg viewBox="0 0 24 24"><path d="M12 2a5 5 0 0 1 5 5v3h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h1V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v3h6V7a3 3 0 0 0-3-3Z"/></svg>';
const G_LOGO = '<svg viewBox="0 0 48 48" class="g-logo"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';

// ---------- Turkish error messages ----------
const ERR = {
  'auth/invalid-email': 'E-posta adresi geçersiz.',
  'auth/missing-password': 'Şifreni yaz.',
  'auth/weak-password': 'Şifre en az 6 karakter olmalı.',
  'auth/email-already-in-use': 'Bu e-posta ile zaten bir hesap var. "Giriş yap" sekmesini dene.',
  'auth/invalid-credential': 'E-posta ya da şifre yanlış.',
  'auth/wrong-password': 'E-posta ya da şifre yanlış.',
  'auth/user-not-found': 'Bu e-posta ile bir hesap bulunamadı.',
  'auth/too-many-requests': 'Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.',
  'auth/network-request-failed': 'İnternet bağlantısı yok gibi görünüyor.',
  'auth/popup-closed-by-user': 'Google penceresi kapatıldı.',
  'auth/unauthorized-domain': 'Bu adres henüz giriş için yetkilendirilmemiş.',
  'auth/operation-not-allowed': 'Bu giriş yöntemi henüz açılmamış.',
  'auth/requires-recent-login': 'Güvenlik için önce çıkış yapıp tekrar giriş yapmalısın.',
};
const errText = (e) => ERR[e?.code] || 'Bir sorun oluştu. Tekrar dene.';

// ---------- favourites in the account ----------
let user = null, saveTimer = 0, syncing = false;
const userDoc = (u) => doc(db, 'users', u.uid);
async function pullAndMerge(u) {
  syncing = true;
  try {
    const snap = await getDoc(userDoc(u));
    const remote = (snap.exists() && Array.isArray(snap.data().favs)) ? snap.data().favs : [];
    const local = cw().getFavs?.() || [];
    const key = cw().favKey || ((f) => f.id);
    const seen = new Set(), merged = [];
    for (const f of [...remote, ...local]) { const k = key(f); if (!seen.has(k)) { seen.add(k); merged.push(f); } }
    cw().setFavs?.(merged);
    if (merged.length !== remote.length) await save(u, merged);
    if (local.length && merged.length > remote.length) toast('Favoriler hesabına eklendi', `${merged.length} favori artık her cihazında.`, 'ok', 3500);
  } catch (e) { console.warn('[account] sync', e); }
  syncing = false;
}
async function save(u, favs) {
  await setDoc(userDoc(u), { favs, email: u.email || null, updatedAt: serverTimestamp() }, { merge: true });
}
function hookFavs() {
  if (!window.CryWall) return setTimeout(hookFavs, 200);
  window.CryWall.onFavsChange = (favs) => {
    if (!user || syncing) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => save(user, favs).catch((e) => console.warn('[account] save', e)), 600);
  };
}
hookFavs();

// ---------- menu bar button ----------
function navButton() {
  let b = $('#accBtn');
  if (!b) {
    const themes = $('.themes');
    if (!themes) return;
    b = document.createElement('button');
    b.id = 'accBtn';
    b.className = 'acc-btn';
    b.addEventListener('click', (e) => { e.stopPropagation(); user ? toggleMenu() : openDialog('login'); });   // settings only for signed-in users
    themes.after(b);
  }
  if (user) {
    const name = user.displayName || (user.email || '').split('@')[0];
    b.innerHTML = user.photoURL
      ? `<img src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'acc-initial',textContent:'${esc((name[0] || '?').toUpperCase())}'}))">`
      : `<span class="acc-initial">${esc((name[0] || '?').toUpperCase())}</span>`;
    b.title = name;
    b.classList.add('is-in');
  } else {
    b.innerHTML = `${ICON_USER}<span>Giriş yap</span>`;
    b.title = 'Giriş yap';
    b.classList.remove('is-in');
  }
}

let menu = null;
function toggleMenu() {
  if (menu) { menu.remove(); menu = null; return; }
  menu = document.createElement('div');
  menu.className = 'acc-menu';
  if (user) {
    const name = user.displayName || (user.email || '').split('@')[0];
    menu.innerHTML = `
      <div class="acc-menu__head"><b>${esc(name)}</b><span>${esc(user.email || '')}</span>
        ${user.emailVerified || user.providerData.some((p) => p.providerId === 'google.com') ? '' : '<em>E-postanı doğrulamayı unutma</em>'}</div>
      <button data-a="favs">♥ Favorilerim</button>
      <button data-a="settings">⚙ Ayarlar</button>
      <button data-a="out">Çıkış yap</button>`;
  } else {
    // guests: sign in, or just open the settings
    menu.innerHTML = `
      <button data-a="login" class="acc-menu__main">Giriş yap</button>
      <button data-a="signup">Kayıt ol</button>
      <button data-a="settings">⚙ Ayarlar</button>`;
  }
  menu.addEventListener('click', async (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
    menu.remove(); menu = null;
    if (a === 'favs') $('.tab[data-mode="fav"]')?.click();
    if (a === 'settings') window.CWSettings?.open();
    if (a === 'login' || a === 'signup') openDialog(a);
    if (a === 'out') doSignOut();
  });
  document.body.append(menu);
  const r = $('#accBtn').getBoundingClientRect();
  menu.style.top = r.bottom + 10 + 'px';
  menu.style.right = Math.max(12, innerWidth - r.right) + 'px';
}
document.addEventListener('click', (e) => { if (menu && !e.target.closest('.acc-menu')) { menu.remove(); menu = null; } });

async function deleteAccount() {
  if (!confirm('Hesabın ve hesabındaki favoriler kalıcı olarak silinecek. Emin misin?')) return;
  try {
    await deleteDoc(userDoc(user)).catch(() => {});
    await deleteUser(user);
    toast('Hesabın silindi', 'Tüm bilgilerin kaldırıldı.', 'ok', 4000);
  } catch (e) { toast('Hesap silinemedi', errText(e), 'err', 6000); }
}

// ---------- sign-in / sign-up window ----------
let dlg = null;
function openDialog(mode = 'login') {
  dlg?.remove();
  dlg = document.createElement('div');
  dlg.className = 'acc-dlg';
  dlg.innerHTML = `
    <div class="acc-dlg__bg" data-x></div>
    <div class="acc-dlg__card" role="dialog" aria-modal="true" aria-label="Giriş">
      <button class="acc-dlg__x" data-x aria-label="Kapat">✕</button>
      <img class="acc-dlg__logo" src="favicon.svg" alt="">
      <h3>VexWalls hesabı</h3>
      <p class="acc-dlg__sub">Favorilerin kaybolmasın, her cihazda seninle olsun.</p>
      <div class="acc-tabs"><button data-m="login">Giriş yap</button><button data-m="signup">Kayıt ol</button></div>
      <button class="acc-google" data-g>${G_LOGO}<span>Google ile devam et</span></button>
      <div class="acc-or"><span>ya da e-posta ile</span></div>
      <form class="acc-form" novalidate>
        <label class="acc-name"><span>Adın</span><input name="name" autocomplete="name" placeholder="İsteğe bağlı"></label>
        <label><span>E-posta</span><input name="email" type="email" autocomplete="email" required placeholder="ornek@mail.com"></label>
        <label><span>Şifre</span><input name="pass" type="password" autocomplete="current-password" required minlength="6" placeholder="En az 6 karakter"></label>
        <p class="acc-err" hidden></p>
        <button class="btn btn--primary acc-submit" type="submit">Giriş yap</button>
        <button class="acc-link" type="button" data-reset>Şifremi unuttum</button>
      </form>
      <div class="acc-trust">${ICON_LOCK}<span>Giriş, <b>Google Firebase</b> güvenliğiyle yapılır. Şifren şifrelenerek saklanır; <b>VexWalls şifreni göremez</b>. Reklam yok, bilgilerin satılmaz. Hesabını istediğin an silebilirsin. <a href="#" data-privacy>Gizlilik</a></span></div>
    </div>`;
  document.body.append(dlg);
  const form = $('.acc-form', dlg), err = $('.acc-err', dlg);
  const setMode = (m) => {
    mode = m;
    dlg.querySelectorAll('[data-m]').forEach((b) => b.classList.toggle('is-active', b.dataset.m === m));
    $('.acc-name', dlg).hidden = m !== 'signup';
    $('.acc-submit', dlg).textContent = m === 'signup' ? 'Hesap oluştur' : 'Giriş yap';
    $('[data-reset]', dlg).hidden = m === 'signup';
    form.pass.autocomplete = m === 'signup' ? 'new-password' : 'current-password';
    err.hidden = true;
  };
  setMode(mode);
  const showErr = (t) => { err.textContent = t; err.hidden = false; };
  const busy = (on) => dlg.querySelectorAll('button, input').forEach((x) => (x.disabled = on));

  dlg.addEventListener('click', async (e) => {
    if (e.target.closest('[data-x]')) return closeDialog();
    const m = e.target.closest('[data-m]'); if (m) return setMode(m.dataset.m);
    if (e.target.closest('[data-privacy]')) { e.preventDefault(); document.getElementById('privacy')?.showModal(); return; }
    if (e.target.closest('[data-g]')) {
      busy(true);
      try { await signInWithPopup(auth, new GoogleAuthProvider()); closeDialog(); }
      catch (ex) {
        if (ex.code === 'auth/popup-blocked' || ex.code === 'auth/operation-not-supported-in-this-environment') {
          await signInWithRedirect(auth, new GoogleAuthProvider());
        } else showErr(errText(ex));
      }
      busy(false);
    }
    if (e.target.closest('[data-reset]')) {
      const email = form.email.value.trim();
      if (!email) return showErr('Şifre sıfırlama bağlantısı için önce e-postanı yaz.');
      try { await sendPasswordResetEmail(auth, email); toast('E-posta gönderildi', 'Gelen kutunu (ve spam klasörünü) kontrol et.', 'ok', 6000); }
      catch (ex) { showErr(errText(ex)); }
    }
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value.trim(), pass = form.pass.value;
    busy(true); err.hidden = true;
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        const name = form.name.value.trim();
        if (name) await updateProfile(cred.user, { displayName: name });
        sendEmailVerification(cred.user).catch(() => {});
        toast('Hesabın oluşturuldu 🎉', 'E-postana bir doğrulama bağlantısı gönderdik.', 'ok', 6000);
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
      }
      closeDialog();
    } catch (ex) { showErr(errText(ex)); }
    busy(false);
  });
  setTimeout(() => dlg.classList.add('show'), 10);
}
function closeDialog() { dlg?.remove(); dlg = null; }
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && dlg) closeDialog(); });

// ---------- state ----------
let first = true;
onAuthStateChanged(auth, async (u) => {
  const wasIn = !!user;
  user = u;
  navButton();
  if (u) {
    await pullAndMerge(u);
    if (!first && !wasIn) toast(`Hoş geldin${u.displayName ? ', ' + u.displayName.split(' ')[0] : ''}!`, 'Favorilerin artık hesabında saklanıyor.', 'ok', 3500);
  }
  first = false;
});
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', navButton); else navButton();
// "Giriş yap" can also be opened from elsewhere (e.g. the favourites page)
async function doSignOut() { await signOut(auth); toast('Çıkış yapıldı', 'Favorilerin bu cihazda da duruyor.', 'ok'); }
window.CryWallAccount = { open: openDialog, signOut: doSignOut, deleteAccount: () => user && deleteAccount(), get user() { return user; } };
