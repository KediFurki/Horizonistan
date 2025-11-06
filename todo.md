# Horizonistan Fikstür Tahmini - TODO

## Veritabanı ve Backend
- [x] Kullanıcı tablosunu genişletme (kullanıcı adı/şifre alanları)
- [x] Maç tablosu oluşturma (tarih, ev sahibi, deplasman, hafta, gün)
- [x] Takım istatistikleri tablosu oluşturma (son 5 maç: G/B/M)
- [x] Tahmin tablosu oluşturma (kullanıcı, maç, ev sahibi skoru, deplasman skoru, sonuç tahmini)
- [x] Veritabanı şemasını push etme

## Kimlik Doğrulama
- [x] Kullanıcı adı/şifre tabanlı kayıt sistemi
- [x] Kullanıcı adı/şifre ile giriş sistemi
- [x] Otomatik oturum yönetimi (aynı cihazda)
- [x] Session timeout kontrolü

## Admin Paneli
- [x] Admin rolü kontrolü ve yetkilendirme
- [x] Maç ekleme formu (tarih, takımlar, hafta, gün)
- [x] Son 5 maç istatistiği ekleme formu (G/B/M)
- [x] Maç listeleme ve düzenleme arayüzü
- [x] Maç silme fonksiyonu

## Kullanıcı Arayüzü
- [x] Ana sayfa - Haftalık fikstür görünümü
- [x] Maç kartları tasarımı (takımlar, tarih, istatistikler)
- [x] Tahmin formu (ev sahibi skoru, deplasman skoru, sonuç seçimi)
- [x] Kullanıcı tahminlerini kaydetme
- [x] Kayıt/Giriş sayfaları

## Tema ve Tasarım
- [x] Premier League renk paleti (mor/pembe tonları)
- [x] Premier League logosu ve tipografi
- [x] Responsive tasarım
- [x] Takım logoları entegrasyonu
- [x] Modern ve spor temalı UI bileşenleri

## Test ve Optimizasyon
- [x] Admin paneli test
- [x] Kullanıcı tahmin akışı test
- [x] Kimlik doğrulama akışı test
- [x] Mobil uyumluluk test
- [x] Son kontroller ve hata düzeltmeleri

## Yeni Özellikler (v2.0)

### Kullanıcı Tahmin Geçmişi ve Zaman Kısıtlaması
- [x] Kullanıcı tahmin geçmişi sayfası oluşturma (ana sayfada görüntüleniyor)
- [x] Maç başlangıcından 30 dakika öncesine kadar tahmin güncelleme
- [x] 30 dakikadan az kaldığında tahmin ekleme/güncelleme engelleme
- [x] Zaman kısıtlaması için backend kontrolü

### Admin İstatistik Paneli
- [x] Maç bazında kullanıcı tahmin istatistikleri (backend)
- [x] Hangi takımın daha çok seçildiğini gösteren grafik/yüzde (frontend)
- [x] Admin paneline istatistik görünümü ekleme (maç detay sayfasında)

### Yorum/Tartışma Sistemi
- [x] Yorum veritabanı tablosu oluşturma
- [x] Maç detay sayfası oluşturma
- [x] Yorum ekleme/görüntüleme arayüzü
- [x] Forum tarzı tartışma bölümü

### Takım Logoları
- [x] Takım logoları için veritabanı/dosya sistemi
- [x] Premier League takım logoları toplama
- [x] Takım adı ile logo otomatik eşleştirme
- [x] Ana sayfada maç kartlarında logo gösterimi

### Son 5 Maç Görselleştirme
- [x] Son 5 maç istatistiklerini ana sayfada gösterme
- [x] Renkli baloncuk tasarımı (Yeşil-G, Sarı-B, Kırmızı-M)
- [x] Görsel iyileştirmeler

### Logo Güncellemeleri
- [x] Giriş/kayıt sayfası için özel logo ekleme
- [x] Ana menüde Premier League logosu kullanma
- [x] Logo dosyalarını projeye ekleme

## Hata Düzeltmeleri ve Yeni Özellikler (v2.1)

### Hata Düzeltmeleri
- [x] Login sayfası 404 hatası düzeltme
- [x] Yorum yapan kullanıcı adını gerçek kullanıcı adıyla gösterme

### Puanlama Sistemi
- [x] Skor ve sonuç tahminini ayrı puanlama sistemine dönüştürme
- [x] Sonuç tahmini (kazanan/beraberlik) için ana puan (3 puan)
- [x] Skor tahmini için bonus puan (5 puan)
- [x] Veritabanına puan tablosu ekleme

### Liderlik Tablosu
- [x] Liderlik tablosu sayfası oluşturma
- [x] Kullanıcıların toplam doğru tahmin sayılarını hesaplama
- [x] Puan sistemine göre sıralama
- [x] Ana menüye liderlik tablosu linki ekleme

### Admin Resmi Skor Girişi
- [x] Admin paneline resmi skor girişi formu ekleme
- [x] Maç bittiğinde resmi skorları kaydetme
- [x] Ana sayfada resmi skorları gösterme (kullanıcı tahmininin üstünde)
- [x] Resmi skor girildikten sonra puanları otomatik hesaplama

## Yeni Özellikler ve Değişiklikler (v3.0)

### Puan Sistemi Güncelleme
- [x] Puan sistemini değiştirme: Sadece sonuç 1 puan, Tam skor 3 puan
- [x] calculateUserPoints fonksiyonunu güncelleme
- [ ] Mevcut puanları yeniden hesaplama (admin resmi skor girdiğinde otomatik)

### Ana Sayfa Layout Değişikliği
- [x] Ana sayfayı iki sütunlu yapma (Sol: Tahmin tablosu, Sağ: Resmi sonuçlar)
- [x] Resmi sonuçlar tablosu oluşturma (sadece bitmiş maçlar)
- [x] Her maç için "Doğru Tahmin" / "Tahmin Tutmadı" göstergesi ekleme
- [x] Kullanıcı tahminlerini sol tarafta gösterme

### Admin Kullanıcı Yönetimi
- [x] Admin paneline kullanıcı listesi sayfası ekleme
- [x] Tüm kayıtlı kullanıcıları listeleme
- [x] Kullanıcı silme fonksiyonu ekleme
- [x] Kullanıcı bilgilerini görüntüleme (kullanıcı adı, kayıt tarihi, toplam tahmin)

### Admin Tahmin Detayları
- [x] Admin paneline tahmin detayları sayfası ekleme
- [x] Hangi kullanıcının hangi maçta ne tahmin ettiğini gösterme
- [x] Görsel tahmin kartları (kullanıcı adı, skor, sonuç seçimi)
- [x] Maça göre filtreleme özelliği

## Hata Düzeltmeleri (v3.1)

### Premier League Logosu
- [x] Ana sayfadaki Premier League logosunun görünmeme sorunu

### Puan Sistemi Hatası
- [x] Puan hesaplama mantığını kontrol etme
- [x] Sadece sonuç: 1 puan (doğru)
- [x] Tam skor: 3 puan (doğru)
- [x] Mevcut puanları sıfırlama ve yeniden hesaplama

### Admin Tahmin Detayları
- [x] Tahmin kartlarına resmi skor ekleme
- [x] Resmi sonuç gösterimi

### Liderlik Tablosu
- [x] Açıklama metnini güncelleme (1 puan sonuç, 3 puan skor)

## Kullanıcı Deneyimi İyileştirmeleri (v3.2)

### Admin Tahmin Detayları
- [x] Kullanıcıya göre filtreleme ekleme
- [x] Kullanıcı seçildiğinde sadece o kullanıcının tahminlerini gösterme

### Ana Sayfa Layout
- [x] Skor tahminlerini takım logolarının yanına taşıma
- [x] "Tahmininiz" bölümünde sadece sonuç tahmini gösterme
- [x] Daha temiz ve anlaşılır layout

## Son İyileştirmeler (v3.3)

### Admin Paneli
- [x] Tahmin detaylarına hafta filtresi ekleme
- [x] Maç, kullanıcı ve hafta filtreleri birlikte çalışma

### Kullanıcı Profil Sayfası
- [x] Liderlik tablosunda kullanıcı adlarını tıklanabilir yapma
- [x] Kullanıcı profil sayfası oluşturma
- [x] Kullanıcının tahmin geçmişini gösterme
- [x] Kullanıcı istatistikleri (toplam tahmin, doğru tahmin, puan)

### Ana Sayfa Skor Düzeltmesi
- [x] Skorları logo altından logo yanına taşıma
- [x] Skorlar takım adının yanında ortada gösterilmeli

## Yeni Güncellemeler (v3.4)

### Ana Sayfa İyileştirmeleri
- [x] Resmi sonuçlar tablosuna hafta filtresi ekleme
- [x] Hafta seçildiğinde sadece o haftanın resmi sonuçlarını gösterme

### Admin Güncelleme
- [x] Admin kullanıcı adını "admin" olarak güncelleme
- [x] Admin şifresini "123kedi456" olarak güncelleme
- [x] Eski admin kullanıcısını silme

### Profil Fotoğrafı Sistemi
- [x] Kullanıcı tablosuna profilePhoto alanı ekleme
- [x] Backend profil fotoğrafı yükleme endpoint'i
- [x] Frontend profil fotoğrafı yükleme arayüzü (Profil Ayarları sayfası)
- [x] Avatar component oluşturma
- [x] S3 fotoğraf yükleme sistemi entegrasyonu
- [x] Profil fotoğrafını liderlik tablosunda gösterme
- [x] Profil fotoğrafını kullanıcı profil sayfasında gösterme
- [x] Profil fotoğrafını yorumlarda gösterme

### GitHub
- [x] Tüm güncellemeleri GitHub'a push etme
