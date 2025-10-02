# Quick Start Guide - Frontend Enhancements

## 🚀 Quick Implementation Guide

### 1. Theme Toggle (Dark Mode)
Add to any component:
```tsx
import ThemeToggle from '@/components/common/ThemeToggle'

<ThemeToggle />
```

### 2. Direction Toggle (RTL/LTR)
Add to any component:
```tsx
import DirectionToggle from '@/components/common/DirectionToggle'

<DirectionToggle />
```

### 3. Page Animations
Wrap your page components:
```tsx
import PageTransition from '@/components/common/PageTransition'

export default function MyPage() {
  return (
    <PageTransition>
      {/* Your page content */}
    </PageTransition>
  )
}
```

### 4. Loading Skeletons
Replace loading spinners:
```tsx
import { SkeletonStatCard } from '@/components/common/SkeletonCard'

{isLoading ? (
  <SkeletonStatCard count={4} />
) : (
  <YourActualContent />
)}
```

### 5. Animated Cards
Use in dashboards:
```tsx
import { AnimatedStatCard } from '@/components/common/AnimatedCard'

<AnimatedStatCard index={0}>
  <CardContent>
    {/* Your card content */}
  </CardContent>
</AnimatedStatCard>
```

### 6. Toast Notifications
Replace existing toasts:
```tsx
import { toast } from '@/components/common/EnhancedToast'

// Success
toast.success('تم بنجاح!')

// Error
toast.error('حدث خطأ', {
  title: 'خطأ',
  description: 'التفاصيل'
})

// Warning
toast.warning('تحذير')

// Info
toast.info('معلومة')
```

### 7. Mobile Menu
For responsive navigation:
```tsx
import MobileMenu from '@/components/common/MobileMenu'

const [isOpen, setIsOpen] = useState(false)

<MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <nav>
    {/* Your menu items */}
  </nav>
</MobileMenu>
```

## 📦 Components Summary

| Component | Path | Purpose |
|-----------|------|---------|
| ThemeToggle | `common/ThemeToggle.tsx` | Light/Dark mode switcher |
| DirectionToggle | `common/DirectionToggle.tsx` | RTL/LTR switcher |
| PageTransition | `common/PageTransition.tsx` | Page animations |
| AnimatedCard | `common/AnimatedCard.tsx` | Animated cards with hover |
| SkeletonCard | `common/SkeletonCard.tsx` | Loading skeletons |
| EnhancedToast | `common/EnhancedToast.tsx` | Beautiful notifications |
| MobileMenu | `common/MobileMenu.tsx` | Responsive mobile menu |

## 🎨 Styling Classes

### RTL Support
```tsx
<div className="space-x-4 rtl:space-x-reverse">
  {/* Reverses spacing in RTL mode */}
</div>

<div className="mr-4 rtl:mr-0 rtl:ml-4">
  {/* Swaps margins in RTL mode */}
</div>
```

### Animations
```css
.animate-fade-in       /* Fade in effect */
.animate-slide-in-*    /* Slide from direction */
.animate-bounce-in     /* Bounce effect */
.animate-pulse-slow    /* Slow pulse */
.animate-spin-slow     /* Slow spin */
```

### Shadows
```css
.shadow-soft           /* Soft shadow */
.shadow-medium         /* Medium shadow */
.shadow-hard           /* Hard shadow */
.shadow-glow           /* Blue glow */
.shadow-glow-green     /* Green glow */
.shadow-glow-red       /* Red glow */
```

## 🔧 Store Usage

### Theme Store
```tsx
import { useThemeStore } from '@/store/themeStore'

const { theme, direction, toggleTheme, toggleDirection } = useThemeStore()

// Current theme: 'light' | 'dark'
console.log(theme)

// Current direction: 'rtl' | 'ltr'
console.log(direction)

// Toggle functions
toggleTheme()
toggleDirection()
```

## ⚡ Best Practices

### 1. Always use RTL-aware classes
```tsx
// ❌ Bad
<div className="ml-4">

// ✅ Good
<div className="mr-4 rtl:mr-0 rtl:ml-4">
```

### 2. Add loading states
```tsx
// ❌ Bad
{data && <MyComponent data={data} />}

// ✅ Good
{isLoading ? (
  <SkeletonCard />
) : (
  <MyComponent data={data} />
)}
```

### 3. Animate list items with delays
```tsx
{items.map((item, index) => (
  <AnimatedListItem key={item.id} index={index}>
    {item.content}
  </AnimatedListItem>
))}
```

### 4. Use proper toast types
```tsx
// ❌ Bad
toast.success('Error occurred') // Wrong type

// ✅ Good
toast.error('Error occurred')
toast.success('Success!')
toast.warning('Warning!')
toast.info('FYI')
```

## 📱 Mobile Responsive

All components are mobile-responsive by default:
- Header adapts to mobile screens
- Cards stack on small screens
- Skeletons match responsive layouts
- Animations respect `prefers-reduced-motion`

## 🌙 Dark Mode Testing

Toggle dark mode in browser DevTools:
```js
// In Console
document.documentElement.classList.toggle('dark')
```

Or use the ThemeToggle button in the header!

## 🔥 Hot Tips

1. **Animations**: Use `delay` prop to stagger animations
2. **Skeletons**: Match skeleton count to expected data count
3. **Toasts**: Keep messages short and actionable
4. **RTL**: Test all layouts in both RTL and LTR modes
5. **Dark Mode**: Check contrast ratios in both themes

## 📚 Full Documentation

See [FRONTEND_ENHANCEMENTS.md](./FRONTEND_ENHANCEMENTS.md) for complete documentation.

---

Happy Coding! 🎉
