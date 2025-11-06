# Horizonistan Fikstür Tahmini

Premier League temalı maç tahmin sistemi. Kullanıcılar maç skorları ve sonuçları tahmin edebilir, admin kullanıcılar maçları yönetebilir.

## Özellikler

### Kullanıcı Özellikleri
- ✅ Kullanıcı adı ve şifre ile kayıt/giriş sistemi (e-posta gerektirmez)
- ✅ Otomatik oturum yönetimi (aynı cihazda otomatik giriş)
- ✅ Haftalık fikstür görünümü
- ✅ Maç skorları ve sonuç tahminleri yapma
- ✅ Tahminleri güncelleme
- ✅ Geçmiş tahminleri görüntüleme

### Admin Özellikleri
- ✅ Maç ekleme, düzenleme ve silme
- ✅ Takım istatistikleri yönetimi (son 5 maç: G/B/M)
- ✅ Tüm kullanıcı tahminlerini görüntüleme
- ✅ Maç sonuçlarını güncelleme

### Tasarım
- ✅ Premier League temalı mor/pembe renk paleti
- ✅ Modern ve responsive tasarım
- ✅ Kullanıcı dostu arayüz

## Kurulum

### Gereksinimler
- Node.js 22+
- MySQL/TiDB veritabanı
- pnpm paket yöneticisi

### Başlangıç

1. Bağımlılıkları yükleyin:
```bash
pnpm install
```

2. Veritabanı şemasını oluşturun:
```bash
pnpm db:push
```

3. Admin kullanıcısı oluşturun:
```bash
npx tsx scripts/create-admin.mjs <kullanıcı_adı> <şifre> "<isim>"
```

Örnek:
```bash
npx tsx scripts/create-admin.mjs admin admin123 "Admin User"
```

4. Geliştirme sunucusunu başlatın:
```bash
pnpm dev
```

## Kullanım

### İlk Giriş

1. **Admin Girişi:**
   - Kullanıcı adı: `admin`
   - Şifre: `admin123`
   - Admin paneline erişim için sağ üstteki "Admin Paneli" butonuna tıklayın

2. **Kullanıcı Kaydı:**
   - Ana sayfada "Kayıt Ol" butonuna tıklayın
   - Kullanıcı adı, şifre ve opsiyonel olarak isim girin
   - Kayıt olduktan sonra otomatik olarak giriş yapılır

### Maç Ekleme (Admin)

1. Admin paneline girin
2. "Yeni Maç Ekle" butonuna tıklayın
3. Maç bilgilerini girin:
   - Ev sahibi ve deplasman takımları
   - Hafta numarası
   - Gün (Pazartesi, Salı, vb.)
   - Tarih ve saat
   - Opsiyonel: Son 5 maç formu (örn: "GGBMG")
     - G: Galibiyet
     - B: Beraberlik
     - M: Mağlubiyet

### Tahmin Yapma (Kullanıcı)

1. Ana sayfada hafta seçin
2. Maç kartında "Tahmin Yap" butonuna tıklayın
3. Tahmin bilgilerini girin:
   - Ev sahibi skoru
   - Deplasman skoru
   - Maç sonucu (Ev Sahibi Kazanır / Beraberlik / Deplasman Kazanır)
4. "Tahmini Kaydet" butonuna tıklayın

### Tahminleri Görüntüleme (Admin)

1. Admin paneline girin
2. "Tüm Tahminler" butonuna tıklayın
3. Tüm kullanıcıların tahminlerini tabloda görüntüleyin

## Veritabanı Yapısı

### Tablolar

- **users**: Kullanıcı bilgileri (kullanıcı adı, şifre hash, rol)
- **matches**: Maç bilgileri (takımlar, tarih, hafta, skor)
- **teamStats**: Takım istatistikleri (son 5 maç formu)
- **predictions**: Kullanıcı tahminleri (skor, sonuç)

## Teknolojiler

### Backend
- Express.js
- tRPC (tip güvenli API)
- Drizzle ORM
- MySQL/TiDB
- bcryptjs (şifre hashleme)
- JWT (oturum yönetimi)

### Frontend
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui bileşenleri
- Wouter (routing)
- TanStack Query (veri yönetimi)

## Güvenlik

- Şifreler bcrypt ile hashlenmiş olarak saklanır
- JWT tabanlı oturum yönetimi
- Admin işlemleri için rol tabanlı yetkilendirme
- SQL injection koruması (Drizzle ORM)

## Lisans

Bu proje Manus platformu üzerinde oluşturulmuştur.
