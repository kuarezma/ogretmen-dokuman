# Öğretmen Döküman

Öğretmenlerin Word, Excel ve PDF dökümanlarını (yazılı, test, yıllık plan, proje vb.) arayabildiği, yükleyebildiği ve indirebildiği, üyelik sistemli bir platform. **Google araması** site içine entegre edilebilir.

## Özellikler

- **Üyelik:** Kullanıcı adı ile kayıt ve giriş
- **Belge türü:** Word, Excel, PDF
- **Kategoriler:** Yazılı, Test, Yıllık Plan, Proje, Sunum, Etkinlik, Diğer
- **Arama:** Tür ve kategori seçerek, metin ile arama
- **Yükleme:** Giriş yapan kullanıcılar belge yükleyebilir
- **İndirme:** Herkes (üye olmadan da) belgeleri indirebilir
- **Google'da Ara:** Arama sonuçları sitede gösterilir. İsteğe bağlı: [Google Programmable Search Engine](https://programmablesearchengine.google.com/) ile kendi arama motorunuzu oluşturup `index.html` içindeki `OGRETMEN_DOKUMAN.googleCx` değerine cx ID'nizi yapıştırın. cx yoksa arama “Google'da aç” ile yeni sekmede açılır.

## Kurulum

```bash
cd ogretmen-belge-merkezi
npm install
cp .env.example .env
# .env içinde PORT ve SESSION_SECRET'ı isteğe göre düzenleyin
npm start
```

Tarayıcıda: **http://localhost:3000**

## Alan adı entegrasyonu

WordPress veya başka bir yerden aldığınız alan adını kullanmak için:

1. Projeyi bir sunucuda (Node.js destekleyen hosting veya VPS) çalıştırın.
2. `.env` dosyasına `SITE_URL=https://alanadiniz.com` ekleyebilirsiniz (ileride e-posta vb. için kullanılabilir).
3. Alan adınızı sunucunuzun IP’sine veya hosting panelinden “domain bağlama” ile yönlendirin.
4. HTTPS için Let’s Encrypt (ör. Certbot) kullanmanız önerilir.

## Teknolojiler

- **Backend:** Node.js, Express, SQLite (better-sqlite3), Multer (dosya yükleme), bcryptjs (şifre)
- **Frontend:** Tek sayfa (SPA) yapıda HTML, CSS, JavaScript

## Veritabanı

Veriler `data.db` (SQLite) dosyasında tutulur. Yedek almak için bu dosyayı kopyalamanız yeterlidir.
