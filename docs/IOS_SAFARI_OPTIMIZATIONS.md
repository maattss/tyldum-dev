# iOS Safari Optimizations

This document outlines all iOS Safari optimizations implemented in the tyldum.dev website.

## Overview

The website has been optimized specifically for Safari on iOS to provide the best possible user experience on iPhones and iPads. All optimizations maintain the same colors, design, and performance while enhancing the mobile Safari experience.

## Optimizations Implemented

### 1. Viewport Configuration
- Proper device-width scaling
- Support for notched devices with viewport-fit
- Accessibility-friendly zoom support

### 2. iOS-Specific Meta Tags
- PWA-capable web app
- Native status bar styling
- Disabled auto phone number detection

### 3. Safe Area Insets
- Header padding for notch
- Footer padding for home indicator
- Consistent spacing across all devices

### 4. Touch Interactions
- Removed tap highlights
- Disabled callouts
- App-like feel

### 5. Input Zoom Prevention
- Minimum 16px font size
- No unwanted zooming on focus

### 6. Scroll Optimizations
- Momentum scrolling
- Prevented pull-to-refresh

### 7. Font Rendering
- Antialiased text
- Fixed text size on rotation

### 8. GPU Acceleration
- Hardware-accelerated animations
- 60fps smooth performance

### 9. Image Optimization
- Modern formats (AVIF, WebP)
- Responsive images
- Retina display support

### 10. Performance
- Optimized bundle sizes
- Fast load times
- Minimal layout shifts

## Testing

Run tests with:
```bash
npm test
npm run test:safari
```

## Performance Targets
- FCP < 1.8s
- LCP < 2.5s  
- CLS < 0.1
- Touch targets ≥ 44px

## Browser Support
- iOS Safari 14+
- iPadOS Safari 14+
