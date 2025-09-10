# ErenAILab Academic AI Blog

Yapay zeka alanında akademik odaklı bir blog sitesi. DeepMind tarzı top-tier araştırma laboratuvarları için hazırlanmış profesyonel ve derinlemesine AI içerikleri.

## Özellikler

- 🤖 **Akademik Kalite**: Peer-reviewed standartlarda içerikler
- 🌍 **Çok Dilli**: Türkçe yazılmış, otomatik İngilizce çeviri
- 💬 **Yorum Sistemi**: Akademik tartışmalar için interaktif platform
- 🔐 **Kullanıcı Kimlik Doğrulama**: GitHub/Google OAuth
- 📱 **Responsive Design**: Tüm cihazlarda mükemmel görünüm
- ⚡ **Sürdürülebilir**: Enerji verimliliğine odaklanmış AI içerikleri

## Teknoloji Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL, Prisma ORM
- **Content**: MDX, KaTeX, Prism.js
- **Translation**: DeepL API
- **Deployment**: Vercel

## Kategoriler

1. **Theoretical AI** - Matematiksel modeller ve algoritma teorisi
2. **Machine Learning** - Makine öğrenmesi fundamentalleri
3. **Research Reviews** - Güncel akademik makalelerin analizi
4. **Energy & Sustainability** - Sürdürülebilir AI çözümleri
5. **Implementation** - Pratik kod örnekleri
6. **Career Insights** - Akademik kariyer rehberi

## Kurulum

### Gereksinimler

- Node.js 18+
- PostgreSQL
- npm veya yarn

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd erenailab-blog
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Çevre Değişkenlerini Ayarlayın

`.env.example` dosyasını `.env.local` olarak kopyalayın ve değerleri doldurun:

```bash
cp .env.example .env.local
```

### 4. Veritabanını Kurun

```bash
npm run db:push
```

### 5. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Site `http://localhost:3000` adresinde çalışacaktır.

## Geliştirme Komutları

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Production sunucusu
npm start

# Linting
npm run lint

# Veritabanı
npm run db:generate  # Prisma client generate
npm run db:push      # Schema'yı veritabanına push
npm run db:migrate   # Migration çalıştır
npm run db:studio    # Prisma Studio aç
```

## İçerik Yönetimi

Blog yazıları `/content/posts/` klasöründe MDX formatında saklanır:

```markdown
---
title: "Yazı Başlığı"
description: "Yazı açıklaması"
date: "2024-01-01"
category: "theoretical-ai"
tags: ["ai", "theory"]
author: "Eren"
---

# İçerik

Matematik formülleri için KaTeX kullanın:

$$E = mc^2$$

Kod blokları için syntax highlighting:

\`\`\`python
def hello_ai():
    print("Hello AI World!")
\`\`\`
```

## API Endpoints

### Comments API
- `GET /api/comments/[slug]` - Post yorumlarını getir
- `POST /api/comments` - Yeni yorum ekle
- `PUT /api/comments/[id]/like` - Yorumu beğen/beğenme
- `DELETE /api/comments/[id]` - Yorumu sil

### Translation API
- `POST /api/translate` - İçeriği çevir
- `GET /api/translate/[slug]` - Cache'lenmiş çeviriyi getir

### Admin API
- `GET /api/admin/comments` - Yorum moderasyonu
- `PUT /api/admin/comments/[id]/moderate` - Yorumu onayla/reddet

## Deployment

### Vercel'e Deploy

1. GitHub'a push edin
2. Vercel dashboard'da projeyi import edin
3. Environment variables'ları ayarlayın
4. Deploy edin

### Environment Variables (Production)

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="production-secret"
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
DEEPL_API_KEY="..."
```

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## İletişim

- **Email**: eren@erenailab.com
- **Twitter**: [@erenailab](https://twitter.com/erenailab)
- **GitHub**: [erenailab](https://github.com/erenailab)
- **LinkedIn**: [erenailab](https://linkedin.com/in/erenailab)

---

**ErenAILab** - Yapay zeka alanında akademik mükemmellik 🚀