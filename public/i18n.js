/* VexWalls — language support. Turkish is the source language; when the user picks English in
   Settings, every Turkish text on the page that is in this dictionary is swapped for English
   (also text added later, e.g. new cards, through a MutationObserver). Loaded before app.js. */
(() => {
  'use strict';
  let lang = 'tr';
  try { lang = (JSON.parse(localStorage.getItem('crywall.prefs') || '{}').lang) || (navigator.language || 'tr').slice(0, 2); } catch {}
  const SUPPORTED = ['tr', 'en', 'de', 'es', 'fr', 'pt', 'it', 'ru', 'az'];
  if (!SUPPORTED.includes(lang)) lang = 'tr';
  document.documentElement.lang = lang;
  window.CW_LANG = lang;

  const EN = {
    // menu / tabs
    'Duvar Kağıtları': 'Wallpapers', 'Hareketli': 'Live', 'Favorilerim': 'Favorites', 'Giriş yap': 'Sign in', 'Kayıt ol': 'Sign up',
    'Telefona yükle': 'Get on phone', 'Ayarlar': 'Settings', 'Çıkış yap': 'Sign out', 'Hesabımı sil': 'Delete my account', '♥ Favorilerim': '♥ Favorites',
    // hero
    'duvar kağıdı': 'wallpapers', 'her gece yenilenir': 'refreshed nightly', 'Her açılışta': 'A new view', 'yeni bir manzara.': 'every time you look.',
    'Dağlar, denizler, uzay ve sanat — en sevilen duvar kağıtları tek tıkla ekranında.': 'Mountains, seas, space and art — the most-loved wallpapers on your screen in one click.',
    'Ara': 'Search', 'Popüler': 'Popular', 'Şu an': 'Now',
    // sections / toolbar
    'Kategoriler': 'Categories', 'Ruh haline göre seç': 'Pick by mood', 'Kategoriler · birine tıkla': 'Categories · pick one',
    'Keşfet': 'Explore', 'En iyiler': 'Top', 'Trend': 'Trending', 'Yeni': 'New', 'Rastgele': 'Random',
    'Bu ay': 'This month', 'Son 3 ay': 'Last 3 months', 'Bu yıl': 'This year', 'Tüm zamanlar': 'All time',
    'Full HD+': 'Full HD+', '2K+': '2K+', '4K': '4K', 'Bilgisayar': 'Desktop', 'Telefon': 'Phone', 'Ultra geniş': 'Ultrawide', 'Hepsi': 'All',
    'Her seferinde farklı · tüm kategorilerden karışık': 'Different every time · mixed from all categories',
    'Simgelerin arkasında sessizce oynar': 'Plays silently behind your icons',
    // categories
    'Doğa': 'Nature', 'Manzara': 'Landscape', 'Dağ': 'Mountains', 'Deniz': 'Sea', 'Orman': 'Forest', 'Anime Manzara': 'Anime Scenery',
    'Anime Karakter': 'Anime Characters', 'Savaşçılar': 'Warriors', 'Şövalyeler': 'Knights', 'Samuray': 'Samurai', 'Japonya': 'Japan',
    'Uzay': 'Space', 'Siberpunk': 'Cyberpunk', 'Fantastik': 'Fantasy', 'Dijital Sanat': 'Digital Art', 'Arabalar': 'Cars', 'Şehir': 'City',
    'Hayvanlar': 'Animals', 'Minimal': 'Minimal', 'Soyut': 'Abstract', 'Karanlık': 'Dark', 'Yağmur': 'Rain', 'Gece': 'Night',
    'Gün batımı': 'Sunset', 'Kış': 'Winter', 'Sonbahar': 'Autumn', 'Su': 'Water', 'Spor Arabalar': 'Sports Cars', 'Kediler': 'Cats',
    'Galaksi': 'Galaxy', 'Okyanus': 'Ocean', 'Neon': 'Neon', 'Ateş': 'Fire', 'Şövalye': 'Knight',
    'Çizim & Sanat': 'Art & Drawing', 'Atmosfer': 'Atmosphere', 'Araba & Hayvan': 'Cars & Animals', 'Gerçek çekim': 'Real footage',
    // moods
    'Soft': 'Soft', 'Enerjik': 'Energetic', 'Rahatlatıcı': 'Relaxing', 'Hoş': 'Lovely', 'Huzurlu': 'Peaceful', 'Gizemli': 'Mysterious',
    'Sade': 'Clean', 'Sıcak': 'Warm', 'Hayalperest': 'Dreamy', 'Ferah': 'Airy', 'Zen': 'Zen', 'Epik': 'Epic', 'Modern': 'Modern',
    'Hızlı': 'Fast', 'Sevimli': 'Cute', 'Sanatsal': 'Artistic', 'Yaratıcı': 'Creative', 'Güneşli': 'Sunny', 'Doğal': 'Natural',
    'Sakin': 'Calm', 'Romantik': 'Romantic', 'Nostaljik': 'Nostalgic', 'Fütüristik': 'Futuristic', 'Güçlü': 'Powerful', 'Büyülü': 'Magical', 'Canlı': 'Vivid',
    // cards / viewer
    'Uygula': 'Apply', 'İndir': 'Download', 'Kaydet': 'Save', 'Telefona kaydet': 'Save to phone', 'Duvar kağıdı': 'Wallpaper',
    'Hareketli duvar kağıdı': 'Live wallpaper', '● CANLI': '● LIVE', 'Masaüstüne uygula': 'Set as desktop', 'Kilit ekranı': 'Lock screen',
    'İkisine birden': 'Both', 'Favorilere ekle': 'Add to favorites', 'Favorilerde': 'In favorites', 'Hareketli olarak uygula': 'Set as live wallpaper',
    'Bu ekranda durdur': 'Stop on this screen', 'Tümünü durdur': 'Stop all', 'Önizle': 'Preview', '← Geri': '← Back',
    'Çözünürlük': 'Resolution', 'Oran': 'Ratio', 'Görüntülenme': 'Views', 'Favori': 'Favorites', 'Boyut': 'Size', 'Kimlik': 'ID',
    'Kalite': 'Quality', 'Ses': 'Sound', 'Sessiz': 'Muted', 'Döngü': 'Loop', 'Sonsuz': 'Endless', 'Kaynak': 'Source',
    'Bu renklerde benzer duvar kağıtları bul': 'Find wallpapers in these colors',
    'Duvar kağıdının rengini değiştirmez. Bir renge tıklarsan o renkte olan diğer duvar kağıtlarını listeler.': "Doesn't change this wallpaper. Click a color to list other wallpapers in that color.",
    'Görsel orijinal kalitede indirilir ve ekranını dolduracak şekilde ayarlanır.': 'Downloaded in original quality and set to fill your screen.',
    'Hangi ekran?': 'Which screen?', 'Tüm ekranlar': 'All screens', 'Yay': 'Span',
    'Tek tıkla masaüstüne uygula': 'One-click set as desktop', 'Bu bilgisayara bağlan': 'Connect to this PC',
    'VexWalls yardımcısı bu bilgisayarda çalışıyorsa bağlan; duvar kağıdı doğrudan uygulanır.': 'If the helper runs on this PC, connect and wallpapers are applied directly.',
    // footer / legal
    'Telif & kaldırma talebi': 'Copyright & removal', 'Gizlilik & çerezler': 'Privacy & cookies', 'İndirilenler klasörünü aç': 'Open downloads folder',
    'Tüm hakları saklıdır.': 'All rights reserved.', 'Ücretsiz duvar kağıtları': 'Free wallpapers',
    'Çerez yok, takip yok.': 'No cookies, no tracking.', 'Tamam': 'OK', 'Ayrıntılar': 'Details',
    // toasts
    'Favorilere eklendi': 'Added to favorites', 'Favorilerden çıkarıldı': 'Removed from favorites', 'Uygulanıyor…': 'Applying…',
    'Masaüstüne uygulandı': 'Set as desktop', 'Kilit ekranına uygulandı': 'Set as lock screen', 'İndirildi': 'Downloaded',
    'Görsel yeni sekmede açıldı': 'Opened in a new tab', 'Görsel açıldı': 'Image opened', 'Çıkış yapıldı': 'Signed out',
    'Henüz favorin yok': 'No favorites yet', 'Sonuç bulunamadı': 'No results',
    // account window
    'VexWalls hesabı': 'VexWalls account', 'VexWalls hesabı': 'VexWalls account', 'Favorilerin kaybolmasın, her cihazda seninle olsun.': 'Keep your favorites safe, on every device.',
    'Google ile devam et': 'Continue with Google', 'ya da e-posta ile': 'or with e-mail', 'Adın': 'Name', 'E-posta': 'E-mail', 'Şifre': 'Password',
    'Hesap oluştur': 'Create account', 'Şifremi unuttum': 'Forgot password',
    // phone install
    'VexWalls uygulaması': 'VexWalls app', 'VexWalls uygulaması': 'VexWalls app', 'Yükle': 'Install', 'Ana ekrana ekle, tek dokunuşla aç': 'Add to home screen, open in one tap',
    // settings
    'Görünüm': 'Appearance', 'Koyu': 'Dark', 'Açık': 'Light', 'Sistem': 'System', 'Vurgu rengi': 'Accent color', 'Dil': 'Language',
    'Duvar kağıdı tercihleri': 'Wallpaper preferences', 'Ekran tipi': 'Screen type', 'En düşük çözünürlük': 'Minimum resolution',
    'Ana sayfa slaytı kendiliğinden geçsin': 'Home slideshow advances by itself', 'Animasyonları azalt': 'Reduce animations',
    'Hesap': 'Account', 'Veriler': 'Data', 'Favorileri temizle': 'Clear favorites', 'Ayarları sıfırla': 'Reset settings', 'Hakkında': 'About',
    'Sürüm': 'Version', 'Gizlilik': 'Privacy', 'Telif': 'Copyright', 'Giriş yapmadın': 'Not signed in',
    'Giriş yaparsan favorilerin her cihazda seninle olur.': 'Sign in to keep your favorites on every device.',
    'Daha fazla göster': 'Show more', '← Duvar kağıdına dön': '← Back to wallpaper', 'Tema': 'Theme', 'Otomatik': 'Auto', 'Türkçe': 'Türkçe', 'English': 'English', 'Tüm favoriler silinsin mi?': 'Delete all favorites?', 'Favoriler temizlendi': 'Favorites cleared', 'Tüm ayarlar varsayılana dönsün mü?': 'Reset all settings to default?',
    'VexWalls sadece favorilerini ve tercihlerini senin cihazında saklar.': 'Only your favorites and preferences are stored, on your own device.',
    'Bir manzara ara… dağ, okyanus, gece': 'Search a view… mountains, ocean, night',
    'Ara: dağ, okyanus, gece…': 'Search: mountains, ocean, night…',
    'Kategoriler · birine tıkla': 'Categories · pick one', 'Telif hakkı': 'Copyright', 'Gizlilik ve çerezler': 'Privacy and cookies',
    'Camgöbeği': 'Cyan', 'Mor': 'Purple', 'Yeşil': 'Green', 'Turuncu': 'Orange', 'Pembe': 'Pink', 'Mavi': 'Blue', 'Kırmızı': 'Red',
  };
  // Turkish -> English (EN), then English -> the chosen language (i18n-langs.js), else English.
  const X = (window.CW_LANGS && window.CW_LANGS[lang]) || {};
  const one = (p) => { const e = EN[p]; return e ? (X[e] || e) : (X[p] || p); };
  const T = (s) => {
    if (lang === 'tr' || s == null) return s;
    const str = String(s), t = str.trim();
    if (EN[t]) return str.replace(t, one(t));
    if (t.includes(' · ')) return str.replace(t, t.split(' · ').map(one).join(' · '));
    return str;
  };
  window.T = T;
  if (lang === 'tr') return;

  const ATTRS = ['placeholder', 'title', 'aria-label'];
  function translate(root) {
    if (root.nodeType === 3) { const v = T(root.nodeValue); if (v !== root.nodeValue) root.nodeValue = v; return; }
    if (root.nodeType !== 1 || root.closest?.('script,style')) return;
    ATTRS.forEach((a) => { if (root.hasAttribute?.(a)) root.setAttribute(a, T(root.getAttribute(a))); });
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) { if (n.nodeValue.trim()) { const v = T(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; } }
      else ATTRS.forEach((a) => { if (n.hasAttribute(a)) n.setAttribute(a, T(n.getAttribute(a))); });
    }
  }
  const start = () => {
    translate(document.body);
    new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach(translate))).observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
