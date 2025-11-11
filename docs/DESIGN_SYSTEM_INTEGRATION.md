# ZZIK Design System Integration Guide

**Last Updated**: 2025-11-11  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

---

## 📋 Overview

The ZZIK Design System is a **Linear App 2025-inspired** design token system adapted for ZZIK's brand identity. It uses modern web standards (W3C Design Tokens Format, OKLCH color space) and supports both landing pages and mobile applications.

### **Key Features**
✅ **OKLCH Color Space** - Perceptually uniform colors  
✅ **W3C Design Tokens** - Industry-standard format  
✅ **Multi-language Support** - Korean (Pretendard), Chinese (Noto Sans SC)  
✅ **Dark Mode Ready** - Automatic color scheme switching  
✅ **Mobile-First** - Tokens for tab bars, maps, vertical video  
✅ **4px Base Unit** - Linear's spacing system  

---

## 🎨 ZZIK Brand Colors

### **Primary - Orange (#FF6B35)**
**Purpose**: Action, Rewards, Energy  
**Usage**: CTAs, active states, reward highlights

```css
--color-primary-500: oklch(65% 0.20 35);  /* #FF6B35 */
```

**Full Scale**:
```css
--color-primary-50: oklch(97% 0.03 35);   /* Lightest tint */
--color-primary-100: oklch(93% 0.07 35);
--color-primary-200: oklch(87% 0.12 35);
--color-primary-300: oklch(78% 0.16 35);
--color-primary-400: oklch(70% 0.19 35);
--color-primary-500: oklch(65% 0.20 35);  /* Main brand */
--color-primary-600: oklch(58% 0.19 35);
--color-primary-700: oklch(48% 0.16 35);
--color-primary-800: oklch(38% 0.12 35);
--color-primary-900: oklch(28% 0.08 35);  /* Darkest shade */
```

### **Secondary - Navy (#004E89)**
**Purpose**: Trust, B2B, Professionalism  
**Usage**: Headers, business landing, secondary CTAs

```css
--color-secondary-500: oklch(48% 0.13 245);  /* #004E89 */
```

**Full Scale**:
```css
--color-secondary-50: oklch(96% 0.02 245);
--color-secondary-100: oklch(92% 0.04 245);
--color-secondary-200: oklch(84% 0.07 245);
--color-secondary-300: oklch(72% 0.10 245);
--color-secondary-400: oklch(58% 0.12 245);
--color-secondary-500: oklch(48% 0.13 245);  /* Main navy */
--color-secondary-600: oklch(40% 0.12 245);
--color-secondary-700: oklch(32% 0.10 245);
--color-secondary-800: oklch(24% 0.07 245);
--color-secondary-900: oklch(16% 0.04 245);
```

### **Accent - Green (#00D9A3)**
**Purpose**: Success, Money, Achievement  
**Usage**: Success states, wallet, earnings

```css
--color-accent-500: oklch(75% 0.15 165);  /* #00D9A3 */
```

**Full Scale**:
```css
--color-accent-50: oklch(96% 0.03 165);
--color-accent-100: oklch(92% 0.07 165);
--color-accent-200: oklch(86% 0.11 165);
--color-accent-300: oklch(80% 0.13 165);
--color-accent-400: oklch(72% 0.14 165);
--color-accent-500: oklch(75% 0.15 165);  /* Main green */
--color-accent-600: oklch(65% 0.14 165);
--color-accent-700: oklch(55% 0.12 165);
--color-accent-800: oklch(45% 0.09 165);
--color-accent-900: oklch(35% 0.06 165);
```

---

## 📁 File Structure

```
webapp/
├── src/
│   └── design-system/
│       ├── tokens.json          # W3C Design Tokens (9.8KB)
│       └── globals.css          # CSS Variables (17KB)
└── docs/
    └── DESIGN_SYSTEM_INTEGRATION.md  # This file
```

### **tokens.json** (9.8KB)
- Format: W3C Design Tokens Format 2.0
- Schema: https://tr.designtokens.org/format/2.0/schema.json
- Contents:
  - Colors (gray, primary, secondary, accent, semantic)
  - Typography (fonts, sizes, weights, line-heights, letter-spacing)
  - Spacing (0-32, 4px base unit)
  - Border radius (none to full)
  - Shadows (6 elevation levels)
  - Animation (durations, easing)
  - Z-index (hierarchy)
  - Breakpoints (responsive)
  - Mobile-specific tokens (tab bar, map, video)

### **globals.css** (17KB)
- CSS Custom Properties from tokens.json
- Base styles (reset, typography)
- Semantic tokens (light/dark mode)
- Utility classes
- Responsive typography
- Language-specific fonts
- Print styles

---

## 🔗 Integration Methods

### **Method 1: Direct Import (Recommended)**

For landing pages and web apps:

```css
/* your-project/styles/globals.css */
@import url("../../../src/design-system/globals.css");
```

**Path Calculation Example**:
```
your-project/styles/globals.css
→ ../      (goes to your-project/)
→ ../      (goes to parent/)
→ ../      (goes to webapp/)
→ src/design-system/globals.css ✓
```

### **Method 2: Copy Files**

For standalone projects:

```bash
# Copy design system to your project
cp -r src/design-system your-project/
```

Then import:
```css
@import url("./design-system/globals.css");
```

### **Method 3: NPM Package** (Future)

When design system is published:

```bash
npm install @zzik/design-system
```

```css
@import "@zzik/design-system/globals.css";
```

---

## 🎭 Usage Examples

### **Using Brand Colors**

```tsx
// React component
export function PrimaryButton({ children }) {
  return (
    <button
      style={{
        background: 'var(--color-primary-500)',  // Orange
        color: 'white',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-base)',
      }}
    >
      {children}
    </button>
  );
}
```

```css
/* CSS stylesheet */
.btn-primary {
  background: var(--interactive-default);  /* Uses primary-500 */
  color: white;
  padding: var(--space-4);  /* 16px */
  border-radius: var(--radius-base);  /* 6px */
  transition: background-color var(--duration-base) var(--ease-out);
}

.btn-primary:hover {
  background: var(--interactive-hover);  /* Primary-600 */
}
```

### **Using Spacing (4px Base)**

```css
.card {
  padding: var(--space-6);  /* 24px */
  margin-bottom: var(--space-4);  /* 16px */
  gap: var(--space-2);  /* 8px */
}

.section {
  padding-top: var(--space-16);  /* 64px */
  padding-bottom: var(--space-12);  /* 48px */
}
```

### **Using Shadows (Multi-layer)**

```css
.card-elevated {
  box-shadow: var(--shadow-md);  /* 3-layer shadow */
}

.modal {
  box-shadow: var(--shadow-xl);  /* 3-layer deeper shadow */
}

.button:focus-visible {
  box-shadow: var(--shadow-focus);  /* Accessibility ring */
}
```

### **Using Typography**

```tsx
// Korean landing page
export default function PageKO() {
  return (
    <html lang="ko">  {/* Automatic Pretendard font */}
      <body>
        <h1>ZZIK — 위치 무결성 SaaS</h1>
      </body>
    </html>
  );
}
```

```tsx
// Chinese landing page
export default function PageZH() {
  return (
    <html lang="zh">  {/* Automatic Noto Sans SC font */}
      <body>
        <h1>ZZIK — 位置完整性 SaaS</h1>
      </body>
    </html>
  );
}
```

### **Using Mobile Tokens**

```tsx
// React Native mobile app
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  tabBar: {
    height: 56,  // --tab-bar-height
    flexDirection: 'row',
  },
  marker: {
    width: 40,   // --map-marker-size
    height: 40,
  },
  reelContainer: {
    aspectRatio: 9 / 16,  // --video-aspect-ratio
  },
});
```

---

## 🌐 Multi-language Font Support

### **Font Families Included**

| Language | Font Family | CDN Import |
|----------|-------------|------------|
| **English** | Inter Variable | `@import url('https://rsms.me/inter/inter.css')` |
| **Korean** | Pretendard | `@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css')` |
| **Chinese** | Noto Sans SC | `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap')` |

### **Automatic Language Detection**

```css
/* Automatic font switching based on HTML lang attribute */
:lang(ko) {
  font-family: var(--font-sans-ko);  /* Pretendard */
}

:lang(zh) {
  font-family: var(--font-sans-zh);  /* Noto Sans SC */
}

/* Default (English) */
body {
  font-family: var(--font-sans);  /* Inter */
}
```

### **Manual Font Classes**

```tsx
// Mixed language content
<div className="lang-ko">한국어 텍스트</div>
<div className="lang-zh">中文文本</div>
<div>English text (default)</div>
```

---

## 🌓 Dark Mode Support

### **Automatic Color Scheme**

```css
/* Light mode (default) */
:root {
  --bg-base: oklch(100% 0 240);  /* White */
  --text-primary: oklch(12% 0.004 240);  /* Dark gray */
}

/* Dark mode (automatic via prefers-color-scheme) */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-base: oklch(8% 0.002 240);  /* Near black */
    --text-primary: oklch(98% 0.002 240);  /* Off-white */
  }
}
```

### **Manual Dark Mode Toggle**

```tsx
// React component
export function DarkModeToggle() {
  const [dark, setDark] = useState(false);
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  
  return <button onClick={() => setDark(!dark)}>Toggle Dark Mode</button>;
}
```

---

## 📱 Mobile-Specific Tokens

Additional tokens for ZZIK mobile app (5-tab structure):

### **Tab Bar (iOS Standard)**
```css
--tab-bar-height: 56px;
--tab-icon-size: 24px;
--tab-spacing: 8px;  /* var(--space-2) */
```

### **Map (Mapbox GL)**
```css
--map-marker-size: 40px;        /* Voucher markers */
--map-radius-pulse: 100px;      /* GPS discovery radius */
--map-cluster-size: 48px;       /* Marker clusters */
```

### **Video (Reels)**
```css
--video-aspect-ratio: 0.5625;   /* 9:16 vertical (9/16) */
--video-controls-inset: 24px;   /* Safe area */
```

### **Cards**
```css
--card-reel-height: calc(100vh - 56px);  /* Full screen - tab bar */
--card-voucher-radius: 16px;             /* var(--radius-xl) */
```

---

## ✅ Verification Checklist

After integrating the design system:

- [ ] **Colors**: Verify orange/navy/green are used (not purple/blue)
- [ ] **Typography**: Check Korean pages use Pretendard, Chinese use Noto Sans SC
- [ ] **Spacing**: Confirm 4px base unit (8px, 16px, 24px, etc.)
- [ ] **Shadows**: Test multi-layer shadows on cards/modals
- [ ] **Dark Mode**: Toggle and verify contrast ratios
- [ ] **Mobile**: Check tab bar height, marker sizes, video aspect ratio
- [ ] **Responsive**: Test on mobile (320px), tablet (768px), desktop (1280px)
- [ ] **Accessibility**: Verify focus rings, ARIA labels, keyboard navigation

---

## 🔧 Troubleshooting

### **Problem: Colors are purple/blue instead of orange/navy/green**

**Solution**: Check if old Linear colors are being imported. Verify you're using the updated design system files.

```bash
# Check design system version
grep "ZZIK Brand Colors" src/design-system/globals.css
# Should show: "Brand Primary - Orange (#FF6B35)"
```

### **Problem: Import path not found**

**Solution**: Verify relative path from your CSS file to design system:

```bash
# From your project
cd your-project/styles
ls -la ../../../src/design-system/

# Should show:
# globals.css
# tokens.json
```

### **Problem: Korean/Chinese fonts not loading**

**Solution**: Check CDN imports in `globals.css`:

```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap');
```

### **Problem: Dark mode not working**

**Solution**: Ensure HTML has color-scheme meta tag:

```html
<meta name="color-scheme" content="light dark">
```

---

## 📚 Additional Resources

### **Design Token Tools**
- [Style Dictionary](https://amzn.github.io/style-dictionary/) - Token transformation
- [Theo](https://github.com/salesforce-ux/theo) - Salesforce's token tool
- [Token Studio](https://tokens.studio/) - Figma plugin for design tokens

### **OKLCH Color Tools**
- [OKLCH Color Picker](https://oklch.com/)
- [Coloraide](https://facelessuser.github.io/coloraide/) - Python color manipulation
- [CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/) - Spec

### **Typography**
- [Pretendard](https://github.com/orioncactus/pretendard) - Korean font
- [Noto Sans SC](https://fonts.google.com/noto/specimen/Noto+Sans+SC) - Chinese Simplified
- [Inter](https://rsms.me/inter/) - English variable font

---

## 🚀 Future Enhancements

### **Planned Features**
- [ ] **Design Token Studio Integration** - Figma plugin support
- [ ] **Theme Variants** - Tourist (vibrant) vs Business (professional)
- [ ] **Component Library** - Pre-built React/React Native components
- [ ] **Storybook** - Interactive component documentation
- [ ] **NPM Package** - `@zzik/design-system` for easy installation
- [ ] **CSS-in-JS Support** - Styled-components/Emotion integration
- [ ] **Tailwind Plugin** - Use ZZIK tokens with Tailwind CSS

### **Versioning**
Design system follows semantic versioning:
- **Major** (1.0.0): Breaking changes to token names/structure
- **Minor** (1.1.0): New tokens/features, backward compatible
- **Patch** (1.0.1): Bug fixes, color adjustments

---

## 📞 Support

For questions or issues:
- **Documentation**: `/docs/DESIGN_SYSTEM_INTEGRATION.md` (this file)
- **Design System Files**: `/src/design-system/`
- **Examples**: `/scripts/rehydrate_fullcode.sh` (full implementation)

---

**Version History**:
- **v1.0.0** (2025-11-11): Initial release with ZZIK brand colors adapted from Linear App 2025
