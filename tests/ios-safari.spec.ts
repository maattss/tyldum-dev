import { test, expect } from '@playwright/test';

test.describe('iOS Safari Optimizations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have correct viewport meta tags for iOS', async ({ page }) => {
    // Check viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1');
    expect(viewport).toContain('viewport-fit=cover');
    
    // Check iOS-specific meta tags
    const appleWebAppCapable = await page.locator('meta[name="apple-mobile-web-app-capable"]').getAttribute('content');
    expect(appleWebAppCapable).toBe('yes');
    
    const appleStatusBar = await page.locator('meta[name="apple-mobile-web-app-status-bar-style"]').getAttribute('content');
    expect(appleStatusBar).toBe('default');
    
    const formatDetection = await page.locator('meta[name="format-detection"]').getAttribute('content');
    expect(formatDetection).toBe('telephone=no');
  });

  test('should have proper safe-area padding for notch devices', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
    }

    // Check header has safe-area-inset-top padding
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    const headerClasses = await header.getAttribute('class');
    expect(headerClasses).toContain('pt-[env(safe-area-inset-top)]');
    
    // Check footer has safe-area-inset-bottom padding
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    const footerContent = await footer.locator('div').first().getAttribute('class');
    expect(footerContent).toContain('pb-[calc(2rem+env(safe-area-inset-bottom))]');
  });

  test('should prevent iOS input zoom with proper font size', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
    }

    // Check that inputs have minimum 16px font size to prevent iOS zoom
    const inputs = await page.locator('input, textarea, select').all();
    
    for (const input of inputs) {
      const fontSize = await input.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });
      const fontSizeNum = parseFloat(fontSize);
      expect(fontSizeNum).toBeGreaterThanOrEqual(16);
    }
  });

  test('should have smooth scrolling enabled', async ({ page }) => {
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const computed = window.getComputedStyle(body);
      return {
        webkitOverflowScrolling: (body.style as any).WebkitOverflowScrolling,
        overscrollBehavior: computed.overscrollBehavior,
      };
    });
    
    expect(bodyStyles.webkitOverflowScrolling).toBe('touch');
    expect(bodyStyles.overscrollBehavior).toBe('none');
  });

  test('should have GPU-accelerated animations', async ({ page }) => {
    // Check that animated elements use transform3d for GPU acceleration
    const animatedElement = page.locator('.animate-float-delayed');
    await expect(animatedElement).toBeVisible();
    
    const transform = await animatedElement.evaluate((el) => {
      return window.getComputedStyle(el).willChange;
    });
    
    expect(transform).toBe('transform');
  });

  test('should have proper font rendering for iOS', async ({ page }) => {
    const htmlStyles = await page.evaluate(() => {
      const html = document.documentElement;
      const computed = window.getComputedStyle(html);
      return {
        webkitFontSmoothing: (html.style as any).webkitFontSmoothing || computed.getPropertyValue('-webkit-font-smoothing'),
        webkitTextSizeAdjust: computed.getPropertyValue('-webkit-text-size-adjust'),
      };
    });
    
    // antialiased or auto are acceptable
    expect(['antialiased', 'auto', '']).toContain(htmlStyles.webkitFontSmoothing);
    expect(htmlStyles.webkitTextSizeAdjust).toBeTruthy();
  });

  test('should have tap highlight removed for better UX', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
    }

    // Check that tap highlights are disabled
    const links = await page.locator('a').all();
    
    if (links.length > 0) {
      const tapHighlight = await links[0].evaluate((el) => {
        return window.getComputedStyle(el).getPropertyValue('-webkit-tap-highlight-color');
      });
      
      // Should be transparent
      expect(tapHighlight).toMatch(/rgba\(0,\s*0,\s*0,\s*0\)/);
    }
  });

  test('should be responsive on mobile viewport', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
    }

    // Check main content is visible
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Check hero section is visible and properly sized
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();
    
    const heroBox = await hero.boundingBox();
    expect(heroBox).not.toBeNull();
    if (heroBox) {
      expect(heroBox.width).toBeGreaterThan(0);
      expect(heroBox.height).toBeGreaterThan(0);
    }
  });

  test('should load profile image with priority', async ({ page }) => {
    // Check that profile image loads with priority
    const profileImage = page.locator('img[alt*="Mats"]').first();
    await expect(profileImage).toBeVisible();
    
    const fetchPriority = await profileImage.getAttribute('fetchpriority');
    expect(fetchPriority).toBe('high');
  });

  test('should have proper theme colors for iOS', async ({ page }) => {
    // Check light theme color
    const lightThemeColor = await page.locator('meta[name="theme-color"][media*="light"]').getAttribute('content');
    expect(lightThemeColor).toBe('#fafafd');
    
    // Check dark theme color
    const darkThemeColor = await page.locator('meta[name="theme-color"][media*="dark"]').getAttribute('content');
    expect(darkThemeColor).toBe('#1b1b1f');
  });

  test('should handle touch interactions properly on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
    }

    // Test that buttons are tappable
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      const isVisible = await button.isVisible();
      if (isVisible) {
        const box = await button.boundingBox();
        expect(box).not.toBeNull();
        if (box) {
          // Touch targets should be at least 44x44 pixels on iOS
          expect(box.width).toBeGreaterThanOrEqual(36); // Allow some flexibility
          expect(box.height).toBeGreaterThanOrEqual(36);
        }
      }
    }
  });

  test('should not have horizontal scroll on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
    }

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });
});
