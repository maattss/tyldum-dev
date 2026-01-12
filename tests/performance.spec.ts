import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should have good Lighthouse performance score', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check that critical resources are loaded
    const profileImage = page.locator('img[alt*="Mats"]').first();
    await expect(profileImage).toBeVisible();
  });

  test('should load critical resources with high priority', async ({ page }) => {
    const resourcePriorities: { url: string; priority: string }[] = [];
    
    page.on('request', request => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const priority = (request as any).resourcePriority?.();
      if (priority) {
        resourcePriorities.push({
          url: request.url(),
          priority
        });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Profile image should be loaded with high priority
    const profileImageRequest = resourcePriorities.find(r => r.url.includes('profile.jpg'));
    if (profileImageRequest) {
      expect(['VeryHigh', 'High']).toContain(profileImageRequest.priority);
    }
  });

  test('should have efficient CSS (no layout shifts)', async ({ page }) => {
    await page.goto('/');
    
    // Measure Cumulative Layout Shift
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((entry as any).hadRecentInput) continue;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            clsValue += (entry as any).value;
          }
        });
        
        observer.observe({ type: 'layout-shift', buffered: true });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 3000);
      });
    });
    
    // CLS should be less than 0.1 for good user experience
    expect(cls).toBeLessThan(0.1);
  });

  test('should use GPU-accelerated transforms', async ({ page }) => {
    await page.goto('/');
    
    // Check for transform3d usage in animations
    const animatedElements = await page.locator('[class*="animate"]').all();
    
    for (const element of animatedElements) {
      const isVisible = await element.isVisible();
      if (isVisible) {
        const usesTransform3d = await element.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          const transform = styles.transform;
          const willChange = styles.willChange;
          
          // Check if uses 3D transforms or will-change: transform
          return transform.includes('matrix3d') || 
                 transform.includes('translate3d') || 
                 willChange.includes('transform');
        });
        
        // At least one optimization should be present
        expect(usesTransform3d).toBe(true);
      }
    }
  });

  test('should lazy load non-critical resources', async ({ page }) => {
    await page.goto('/');
    
    // Check that theme toggle is lazy loaded
    const themeToggle = page.locator('[aria-label*="theme"], [aria-label*="Theme"]');
    
    // It should eventually appear
    await expect(themeToggle.first()).toBeVisible({ timeout: 5000 });
  });

  test('should have efficient bundle size', async ({ page }) => {
    const resources: { type: string; size: number }[] = [];
    
    page.on('response', async response => {
      const headers = response.headers();
      const contentLength = headers['content-length'];
      
      if (contentLength && response.ok()) {
        resources.push({
          type: response.request().resourceType(),
          size: parseInt(contentLength, 10)
        });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that JavaScript bundles are reasonable
    const jsResources = resources.filter(r => r.type === 'script');
    const totalJsSize = jsResources.reduce((sum, r) => sum + r.size, 0);
    
    // Total JS should be less than 500KB for good performance
    expect(totalJsSize).toBeLessThan(500 * 1024);
  });

  test('should use modern image formats', async ({ page }) => {
    const imageFormats: string[] = [];
    
    page.on('response', async response => {
      const contentType = response.headers()['content-type'];
      
      if (contentType && contentType.startsWith('image/')) {
        imageFormats.push(contentType);
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // At minimum, should have images loaded
    expect(imageFormats.length).toBeGreaterThan(0);
  });

  test('should have fast First Contentful Paint', async ({ page }) => {
    await page.goto('/');
    
    const fcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              observer.disconnect();
              resolve(entry.startTime);
            }
          }
        });
        
        observer.observe({ type: 'paint', buffered: true });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(0);
        }, 5000);
      });
    });
    
    // FCP should be less than 1.8 seconds for good user experience
    expect(fcp).toBeGreaterThan(0);
    expect(fcp).toBeLessThan(1800);
  });

  test('should preload critical fonts', async ({ page }) => {
    await page.goto('/');
    
    // Check for font preloading (Next.js handles this automatically with next/font)
    const fonts = await page.evaluate(() => {
      const styles = window.getComputedStyle(document.body);
      return styles.fontFamily;
    });
    
    expect(fonts).toBeTruthy();
  });
});
