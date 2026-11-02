# VexWalls

**Ücretsiz 4K ve hareketli duvar kağıtları** — https://vexwalls.github.io

Doğa, uzay, şehir, anime manzara, siberpunk, minimal ve daha fazlası. Bilgisayar ve telefon için, her gün otomatik güncellenen seçki.

## İki sürüm

| | Web sitesi (vexwalls.github.io) | Bilgisayar sürümü (`Baslat.bat`) |
|---|---|---|
| Açmak için | Herhangi bir tarayıcı, telefon dahil | Windows'ta `Baslat.bat` |
| Duvar kağıtları | Her gece hazırlanan katalog | Canlı arama |
| Uygulama | İndir / telefona kaydet | Tek tıkla masaüstü, kilit ekranı, hareketli duvar kağıdı, çoklu ekran |

## Klasörler
- `public/` — sitenin kendisi (HTML/CSS/JS)
- `tools/build-catalog.ps1` — duvar kağıdı kataloğunu hazırlar (GitHub Actions her gece çalıştırır)
- `tools/sources.ps1` — telif filtresi ve kaynak okuyucular (iki sürüm de kullanır)
- `server.ps1`, `live.ps1`, `Baslat.bat` — bilgisayar sürümü

## Kaynaklar ve telif
Görseller [Wallhaven](https://wallhaven.cc), hareketli videolar [MotionBGs](https://motionbgs.com) ve [Mixkit](https://mixkit.co) üzerinden gösterilir; VexWalls dosyaları barındırmaz ve her içerikte kaynağına bağlantı verir. Oyun, film, dizi, çizgi roman ve anime serilerine ait karakterler ile ünlü kişiler listelenmez. Hak sahibiyseniz kaldırma talebi için bir issue açabilirsiniz.

## Windows uygulaması
[**VexWalls.exe'yi indir**](https://github.com/VexWalls/vexwalls.github.io/releases/latest/download/VexWalls.exe) — çift tıkla, kendini kurar. Başlat menüsüne ve masaüstüne kısayol ekler; duvar kağıtları tek tıkla masaüstüne / kilit ekranına uygulanır, hareketli duvar kağıtları ve otomatik değiştirme çalışır. Kaldırmak için: Ayarlar › Uygulamalar › VexWalls.

Kaynak: `app/VexWalls.cs` · derleme: `powershell -File app\build.ps1`
