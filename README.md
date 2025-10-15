# 🎣 Balıkçı

Öğrencilere yazılım geliştirme konseptlerini **öğreten** (kod yazmayan) AI asistan. Balık vermek yerine balık tutmayı öğretir.

## 🎯 Proje Amacı

Bu AI asistan, öğrencilere:
- ❌ **Direkt kod YAZMAZ** - Mantığı öğretir
- ❌ **Hazır çözüm VERMEZ** - Düşünmeyi öğretir
- ✅ **Algoritma mantığını** adım adım açıklar
- ✅ **Sokratik yöntemle** sorular sorarak öğretir
- ✅ **Sadece yazılım konularında** yardım eder

**Amaç**: Bağımlı değil, **bağımsız geliştiriciler** yetiştirmek.

## ✨ Özellikler

- 🎨 **GitHub Dark Tema**: Profesyonel, göz yormayan tasarım
- 🤖 **Akıllı AI**: Mistral Devstral (yazılım odaklı model)
- 💾 **Yerel Depolama**: Sohbet geçmişi tarayıcıda saklanır
- 📱 **Responsive**: Mobil ve masaüstü uyumlu
- ⚡ **Typing Animasyonu**: ChatGPT benzeri yazma efekti
- 🎯 **Eğitim Odaklı**: Öğretmen yaklaşımı, kod yazma yok

## 🚀 Kurulum

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```

3. **Tarayıcıda açın:**
   ```
   http://localhost:3000
   ```

## 🔑 API Key Ayarlama

Uygulamayı kullanmak için bir OpenRouter API anahtarına ihtiyacınız var:

1. **API Key Alın:**
   - [OpenRouter](https://openrouter.ai/keys) üzerinden hesap oluşturun
   - API anahtarınızı oluşturun ve kopyalayın

2. **Environment Variable Ekleyin:**
   ```bash
   # .env.local dosyasını düzenleyin
   NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-ASIL-ANAHTARINIZ-BURAYA
   ```

3. **Uygulamayı Başlatın:**
   ```bash
   npm run dev
   ```

**Not**: `.env.local` dosyası git'e yüklenmez (.gitignore'da tanımlı). API anahtarınızı asla git'e eklemeyin.

## 🎨 Tasarım

### Renk Paleti
- **Arka Plan**: Siyah (`#000000`)
- **Kullanıcı Mesajları**: Koyu mavi (`bg-blue-900`)
- **AI Mesajları**: Koyu gri (`bg-gray-900`)
- **Input Alanı**: Koyu gri (`bg-gray-900`)

### Tasarım Prensipleri
- **Minimalizm**: Sade ve temiz arayüz
- **Tek Renk**: Siyah ve koyu mavi tonları
- **Sabit Yükseklik**: Sayfa kaymaz, sadece chat alanı scroll edilir
- **Typography**: Inter font ailesi

## 📁 Proje Yapısı

```
chatbot-akdeniz/
├── app/
│   ├── layout.tsx       # Ana layout
│   ├── page.tsx         # Chat sayfası
│   └── globals.css      # Global stiller
├── tailwind.config.js   # Tailwind yapılandırması
├── next.config.js       # Next.js yapılandırması
└── package.json         # Bağımlılıklar
```

## 🛠️ Teknolojiler

- **Framework**: Next.js 14
- **Styling**: TailwindCSS
- **Language**: TypeScript
- **AI Model**: Mistral Devstral Small 2505 Free (OpenRouter API)
- **Font**: Inter

## 📝 Kullanım

### ✅ Sorabileceklerin:
- "Bubble sort nasıl çalışır?" → Mantık anlatılır
- "Recursion nedir?" → Kavram açıklanır
- "Binary search'ü nasıl düşünmeliyim?" → Adım adım yol gösterilir

### ❌ Soramazsınız:
- "Bana bubble sort kodu yaz" → REDDEDİLİR
- "Şu ödevi yap" → REDDEDİLİR
- "Hayat tavsiyeleri" → REDDEDİLİR

### 💡 AI'nin Yaklaşımı:
1. Soru sorarak düşündürür
2. Gerçek hayat örnekleri verir
3. Adım adım mantık oluşturur
4. Sen yazmaya cesaretlendirilirsin

## ⚙️ Özelleştirme

### Renk Teması
`tailwind.config.js` dosyasını düzenleyerek renkleri özelleştirebilirsiniz:

```js
colors: {
  'navy-dark': '#0a0f1c',
  'navy-blue': '#101b2d',
  'chat-bg': '#1a2335',
  'input-bg': '#0f1624',
}
```

### Animasyonlar
Animasyon süreleri ve efektler `tailwind.config.js` içinde:

```js
animation: {
  'fade-in': 'fadeIn 0.6s ease-in-out',
}
```

## 🤝 Katkıda Bulunma

Bu proje eğitim amaçlıdır. Geliştirme önerileri için issue açabilirsiniz.

## 📄 Lisans

MIT License - Kişisel ve ticari kullanım için özgürsünüz.

---

**Not**: Bu uygulama **eğitim amaçlıdır**. AI asistanı öğrencilere **düşünmeyi öğretir**, hazır çözüm vermez. Amacı bağımsız problem çözebilen geliştiriciler yetiştirmektir.

## 🎓 Eğitim Yaklaşımı

AI asistanı şu prensiplerle çalışır:

### Sokratik Yöntem
Direkt cevap yerine sorular sorar:
- ❓ "Bu problemde önce hangi adımı atmalısın?"
- ❓ "Bu veri yapısının avantajı ne olabilir?"
- ❓ "Peki bu durumda ne olur?"

### Adım Adım Öğretim
Karmaşık konuları parçalara böler:
1. Temel kavramı açıklar
2. Gerçek hayattan örnek verir
3. Mantık zinciri kurar
4. Senin denemen için cesaretlendirir

### Kod Yazmama Politikası
- ✅ Algoritma mantığı açıklanır
- ✅ Pseudo-kod mantığı anlatılır
- ❌ Çalışan kod yazılmaz
- ❌ Direkt çözüm verilmez

---

**Motto**: "Balık vermek değil, balık tutmayı öğretmek!" 🎣

