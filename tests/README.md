# UI Tests for tyldum.dev

This directory contains comprehensive UI tests for the tyldum.dev website, with a special focus on iOS Safari optimizations.

## Test Files

- **`ios-safari.spec.ts`** - Tests for iOS Safari-specific optimizations including:
  - Viewport meta tags
  - Safe-area padding for notched devices
  - Touch interactions
  - Scroll behavior
  - Font rendering
  - GPU acceleration

- **`accessibility.spec.ts`** - Accessibility tests using axe-core:
  - WCAG 2.1 AA compliance
  - Keyboard navigation
  - Color contrast
  - Screen reader compatibility
  - Zoom support

- **`performance.spec.ts`** - Performance tests:
  - First Contentful Paint (FCP)
  - Cumulative Layout Shift (CLS)
  - Resource loading priorities
  - Bundle size optimization
  - GPU-accelerated transforms

## Running Tests

### Prerequisites

Install Playwright browsers (only needed once):
```bash
npx playwright install
```

### Run all tests
```bash
npm test
```

### Run tests in UI mode (interactive)
```bash
npm run test:ui
```

### Run only Mobile Safari tests
```bash
npm run test:safari
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run specific test file
```bash
npx playwright test tests/ios-safari.spec.ts
```

## Test Configuration

Tests are configured in `playwright.config.ts` to run against:
- Desktop Chrome (Chromium)
- Desktop Safari (WebKit)
- Mobile Safari (iPhone 14 Pro)
- Mobile Safari Landscape (iPhone 14 Pro Max)

## iOS Safari Optimizations Tested

1. **Viewport Configuration**
   - `viewport-fit=cover` for notch support
   - Proper initial scale
   - User scalable for accessibility

2. **Safe Area Insets**
   - Header padding: `env(safe-area-inset-top)`
   - Footer padding: `env(safe-area-inset-bottom)`

3. **Touch Optimizations**
   - `-webkit-tap-highlight-color: transparent`
   - `-webkit-touch-callout: none`
   - Minimum 16px font size to prevent zoom

4. **Scrolling**
   - `-webkit-overflow-scrolling: touch`
   - `overscroll-behavior: none` to prevent bounce

5. **Performance**
   - GPU acceleration with `transform3d`
   - `will-change: transform` for animations
   - Hardware-accelerated transforms

6. **Font Rendering**
   - `-webkit-font-smoothing: antialiased`
   - `-webkit-text-size-adjust: 100%`

7. **iOS-Specific Meta Tags**
   - `apple-mobile-web-app-capable`
   - `apple-mobile-web-app-status-bar-style`
   - `format-detection` to disable auto-linking

## CI/CD Integration

Tests are configured to run in CI with:
- Retry on failure (2 retries)
- HTML reporter for results
- Trace collection on failure

## Writing New Tests

When adding new tests:
1. Use descriptive test names
2. Skip non-applicable tests on desktop/mobile with `test.skip()`
3. Include accessibility checks where relevant
4. Test on multiple viewports
5. Use proper assertions with `expect()`

## Debugging Tests

```bash
# Debug a specific test
npx playwright test --debug tests/ios-safari.spec.ts

# View test report
npx playwright show-report
```

## Performance Metrics

Target metrics for good user experience:
- First Contentful Paint (FCP): < 1.8s
- Cumulative Layout Shift (CLS): < 0.1
- Total JavaScript: < 500KB
- Touch target size: ≥ 44x44px (iOS HIG)
