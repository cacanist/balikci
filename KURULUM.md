# 🚀 Kurulum Kılavuzu

## 1️⃣ Bağımlılıkları Yükleyin

```bash
npm install
```

## 2️⃣ API Anahtarı Ayarlayın

### OpenRouter API Key Alın
1. [OpenRouter](https://openrouter.ai/keys) adresine gidin
2. Hesap oluşturun veya giriş yapın
3. "Create Key" butonuna tıklayın
4. Anahtarınızı kopyalayın (örnek: `sk-or-v1-xxxxxxxxxxxxxxxx`)

### .env.local Dosyasını Düzenleyin

Proje dizininde `.env.local` dosyası zaten mevcut. Bu dosyayı açın ve kendi API anahtarınızı ekleyin:

```bash
# Dosyayı düzenleyin
nano .env.local

# veya VS Code ile
code .env.local
```

İçeriği şu şekilde değiştirin:

```env
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-ASIL-ANAHTARINIZ-BURAYA
```

**ÖNEMLİ**: 
- `sk-or-v1-your-api-key-here` yerine kendi anahtarınızı yazın
- Tırnak işareti kullanmayın
- Boşluk bırakmayın

## 3️⃣ Uygulamayı Başlatın

```bash
npm run dev
```

Tarayıcınızda otomatik olarak açılacak veya manuel olarak şu adresi ziyaret edin:
```
http://localhost:3000
```

## ✅ Kontrol Edin

Eğer her şey doğru yapıldıysa:
- ✅ Siyah arka planlı minimal bir chat arayüzü göreceksiniz
- ✅ "Mesajınızı yazın..." input alanı aktif olacak
- ✅ Mesaj gönderdiğinizde AI cevap verecek

## ❌ Sorun Giderme

### "No auth credentials found" Hatası
- `.env.local` dosyasını kontrol edin
- API anahtarının doğru yazıldığından emin olun
- Uygulamayı yeniden başlatın (`npm run dev`)

### API Anahtarı Geçersiz
- [OpenRouter Dashboard](https://openrouter.ai/keys) üzerinden anahtarınızın aktif olduğundan emin olun
- Yeni bir anahtar oluşturmayı deneyin

### Port 3000 Kullanımda
```bash
# Farklı port kullanın
npm run dev -- -p 3001
```

## 📝 Production Build

```bash
# Build oluştur
npm run build

# Production modda çalıştır
npm start
```

## 🔒 Güvenlik Notları

1. **`.env.local` dosyasını asla git'e eklemeyin**
   - Zaten `.gitignore` içinde tanımlı
   
2. **API anahtarınızı kimseyle paylaşmayın**
   - Public repository'de paylaşmayın
   - Screenshot'larda göstermeyin

3. **OpenRouter kullanım limitlerini kontrol edin**
   - [Usage Dashboard](https://openrouter.ai/usage) üzerinden takip edin

