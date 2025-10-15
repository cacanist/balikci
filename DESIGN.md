# 🎨 Tasarım Kılavuzu

Bu belge, Balıkçı projesinin tasarım sistemini ve March Dijital'in modern tasarım dilinden ilham alınarak oluşturulan UI/UX prensiplerini açıklar.

## Tasarım Felsefesi

March Dijital'in portföy sitesinden esinlenilerek:
- **Minimalizm**: Gereksiz detaylardan arındırılmış, temiz tasarım
- **Premium His**: Glassmorphism ve glow efektleri ile premium deneyim
- **Fonksiyonellik**: Her element bir amaca hizmet eder
- **Modernlik**: 2025'in en güncel tasarım trendleri

## Renk Sistemi

### Temel Renkler
```css
Background Gradient:
  - Start: #0a0f1c (Navy Dark)
  - Middle: #0d1420 (Transition)
  - End: #101b2d (Navy Blue)

Accent Colors:
  - Primary: Blue-500 (#3b82f6) → Cyan-500 (#06b6d4)
  - Secondary: Blue-600 (#2563eb) → Cyan-600 (#0891b2)
```

### Mesaj Baloncukları
```css
User Messages:
  - Background: gradient(blue-600 → cyan-600)
  - Border: blue-400/30 (30% opacity)
  - Shadow: blue-500/20 glow

AI Messages:
  - Background: white/5 (glassmorphism)
  - Border: white/10
  - Backdrop-blur: blur-sm
```

## Tipografi

### Font Ailesi
- **Primary**: Inter (Google Fonts)
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

### Font Boyutları
- **Başlıklar (h1)**: 2xl (24px) - Bold
- **Başlıklar (h2)**: 4xl (36px) - Bold
- **Body Text**: 15px (text-[15px])
- **Small Text**: 14px (text-sm)
- **Tiny Text**: 12px (text-xs)

## Layout & Spacing

### Container Genişlikleri
- **Header/Footer**: max-w-5xl (1280px)
- **Chat Area**: max-w-4xl (896px)
- **Welcome Cards**: max-w-3xl (768px)

### Padding & Margin
- **Section Padding**: py-6 px-6
- **Card Padding**: p-6
- **Message Padding**: px-6 py-4
- **Message Spacing**: space-y-6

## Components

### 1. Header (Top Bar)
```
Features:
- Sticky position (sticky top-0)
- Glassmorphism (bg-black/20 backdrop-blur-xl)
- Gradient logo icon with glow effect
- Subtitle text (text-xs text-gray-500)
- Action buttons with hover animations
```

### 2. Chat Bubbles
```
User Message:
- Gradient background (blue → cyan)
- Avatar icon (user silhouette)
- Right aligned
- Subtle shadow with color glow

AI Message:
- Glassmorphism background
- AI icon (lightbulb)
- Left aligned
- No color glow, just elevation shadow
```

### 3. Input Area
```
Features:
- Glassmorphism container
- Focus glow effect (gradient blur)
- "Enter" keyboard hint
- Gradient send button with shimmer animation
- Decorative divider lines
```

### 4. Welcome Screen
```
Features:
- Large gradient icon with blur glow
- Gradient text heading
- 3-column feature cards
- Hover scale effect (hover:scale-105)
```

## Animasyonlar

### Fade-in
```css
@keyframes fadeIn {
  0%: opacity 0, translateY(10px)
  100%: opacity 1, translateY(0)
}
Duration: 0.6s ease-in-out
```

### Hover Shimmer
```css
Shimmer effect on buttons:
- Gradient overlay
- Translate from left to right
- Duration: 700ms
```

### Loading Dots
```css
3 dots with:
- Bounce animation
- Staggered delay (0ms, 150ms, 300ms)
- Gradient colors (blue-400 → cyan-400)
```

## Efektler

### Glassmorphism
```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
}
```

### Glow Effect
```css
.glow {
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: gradient(blue-500 → cyan-500);
    border-radius: inherit;
    filter: blur(20px);
    opacity: 0.3;
  }
}
```

### Border Gradient
```css
.border-gradient {
  border: 1px solid;
  border-image: linear-gradient(to right, blue-500, cyan-500);
}
```

## Responsiveness

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations
- Welcome cards: 1 column (md:grid-cols-3)
- Hide "Enter" hint on small screens
- Smaller padding on mobile
- Adjusted font sizes

## Icons

### Icon System
- **Library**: Heroicons (SVG)
- **Style**: Outline (stroke)
- **Size**: w-5 h-5 (20px) for buttons, w-7 h-7 for logo
- **Stroke Width**: 2

### Icon Usage
- 🔑 API Key → Key icon
- 🗑️ Temizle → Trash icon
- 💡 AI → Lightbulb icon
- 👤 User → User circle icon
- 📨 Send → Send/Paper plane icon

## Scrollbar

### Custom Scrollbar
```css
Width: 10px
Track: rgba(10, 15, 28, 0.5) with radius
Thumb: gradient(blue → cyan) with border
Hover: Darker gradient
```

## Best Practices

1. **Consistent Spacing**: Her zaman 4'ün katları kullan (4, 8, 12, 16, 24px)
2. **Color Opacity**: Glassmorphism için /5, /10, /20 kullan
3. **Transitions**: Her interaktif element transition-all ile
4. **Border Radius**: Modern look için rounded-2xl (16px)
5. **Shadows**: Elevation için shadow-lg, shadow-xl, glow için custom shadow

## Accessibility

- Yeterli kontrast oranı (WCAG AA)
- Focus states her zaman görünür
- Keyboard navigasyonu destekli (Enter to send)
- Semantic HTML kullanımı

---

**Tasarım İlhamı**: [March Dijital](http://marchdijital.com)  
**Framework**: Next.js 14 + TailwindCSS  
**Icon Set**: Heroicons

