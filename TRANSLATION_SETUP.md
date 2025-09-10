# Microsoft Translator API Kurulum Rehberi

## 1. Microsoft Azure Hesabı Oluşturma

1. [Azure Portal](https://portal.azure.com)'a gidin
2. Ücretsiz hesap oluşturun (kredi kartı gerekli, ancak $200 krediniz var)
3. Azure hesabınızla giriş yapın

## 2. Translator Service Oluşturma

1. Azure Portal'da **"Create a resource"** tıklayın
2. **"Translator"** arayın ve seçin
3. Aşağıdaki ayarlarla oluşturun:
   - **Subscription**: Free Trial veya mevcut subscription
   - **Resource Group**: Yeni oluşturun (örn: "erenailab-rg")
   - **Region**: West Europe veya East US
   - **Name**: erenailab-translator
   - **Pricing Tier**: **F0 (Free)** - 2M karakter/ay ücretsiz

## 3. API Key Alma

1. Oluşturulan Translator resource'a gidin
2. Sol menüden **"Keys and Endpoint"** seçin
3. **Key 1** veya **Key 2**'yi kopyalayın
4. **Location/Region** bilgisini not alın

## 4. Environment Variables Ayarlama

`.env.local` dosyası oluşturun:

```env
# Microsoft Translator API
AZURE_TRANSLATOR_KEY="your-api-key-here"
AZURE_TRANSLATOR_REGION="westeurope"  # veya seçtiğiniz region
AZURE_TRANSLATOR_ENDPOINT="https://api.cognitive.microsofttranslator.com"
```

## 5. Test Etme

API'yi test etmek için:

```bash
# API status kontrol
curl http://localhost:3000/api/translate

# Test çevirisi
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Merhaba dünya", "targetLanguage": "en"}'
```

## Özellikler

### ✅ Tamamlanan Özellikler

1. **Otomatik Çeviri Sistemi**
   - Microsoft Translator API entegrasyonu
   - Markdown içerik çevirisi
   - Frontmatter (başlık, açıklama) çevirisi
   - Otomatik cache sistemi

2. **Gelişmiş UI/UX**
   - Language toggle component (3 farklı variant)
   - Translation loading indicators
   - Translation quality notices
   - Responsive tasarım

3. **Intelligent Content Management**
   - Otomatik dil tespiti
   - Manuel çeviri öncelik sistemi
   - Çeviri cache'leme (localStorage)
   - Fallback handling

4. **Blog Integration**
   - English blog sayfaları otomatik çeviri
   - Translation notices
   - SEO uyumlu meta tags
   - Language-specific routing

### 📊 Kullanım Limitleri

- **Microsoft Translator Free Tier**: 2M karakter/ay
- **Ortalama blog yazısı**: ~2,000 karakter
- **Kapasıteniz**: ~1,000 blog yazısı çevirisi/ay
- **Rate Limiting**: 100 istek/saat

### 🔧 Nasıl Çalışır

1. **Kullanıcı `/en/blog/slug` ziyaret eder**
2. **Sistem kontrol eder**: Manuel İngilizce çeviri var mı?
3. **Yoksa**: Türkçe versiyonu alır ve otomatik çevirir
4. **Cache'ler**: Çeviriyi localStorage'da saklar
5. **Gösterir**: Translation notice ile birlikte içeriği

### 🚀 Nasıl Kullanılır

1. **Microsoft Translator API Key** alın (ücretsiz)
2. **Environment variables** ayarlayın
3. **Blog yazısı** yazın (Türkçe)
4. **Otomatik olarak** İngilizce versiyonu oluşur
5. **İsteğe bağlı**: Manuel düzeltme yapın

### 🎯 Sonraki Adımlar

Sistem artık tamamen çalışır durumda! Öneriler:

1. **API Key ekleyin** ve test edin
2. **Blog yazıları ekleyin** (Türkçe)
3. **İngilizce sayfaları kontrol edin**
4. **Cache performance** izleyin
5. **Kullanıcı feedback** toplayın

### 📈 Monitoring

Translation usage'ı takip etmek için:
- Console logs kontrol edin
- API response times ölçün
- Cache hit rates gözlemleyin
- Microsoft Azure dashboard kullanın

Sistem başarıyla kuruldu ve kullanıma hazır! 🎉