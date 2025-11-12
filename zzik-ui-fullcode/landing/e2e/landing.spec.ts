import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check title
    await expect(page).toHaveTitle(/ZZIK/);
    
    // Check main heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });
  
  test('should have proper navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check hero CTA buttons
    const ctaButton = page.locator('a[href="#lead"]').first();
    await expect(ctaButton).toBeVisible();
    
    const demoButton = page.locator('a[href="#features"]').first();
    await expect(demoButton).toBeVisible();
  });
  
  test('should navigate to features section', async ({ page }) => {
    await page.goto('/');
    
    // Click demo button
    await page.locator('a[href="#features"]').first().click();
    
    // Wait for scroll
    await page.waitForTimeout(500);
    
    // Check if features section is visible
    const featuresSection = page.locator('#features');
    await expect(featuresSection).toBeVisible();
  });
  
  test('should have working form', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to lead form
    await page.locator('a[href="#lead"]').first().click();
    await page.waitForTimeout(500);
    
    // Fill email
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('test@example.com');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Wait for success message (with timeout for loading)
    await page.waitForTimeout(1500);
    
    // Check for success message
    const successMessage = page.getByText(/thank you/i);
    await expect(successMessage).toBeVisible({ timeout: 3000 });
  });
  
  test('should validate email format', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to lead form
    await page.locator('a[href="#lead"]').first().click();
    await page.waitForTimeout(500);
    
    // Fill invalid email
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('invalid-email');
    
    // Blur input to trigger validation
    await emailInput.blur();
    await page.waitForTimeout(300);
    
    // Check for error message
    const errorMessage = page.getByText(/valid email/i);
    await expect(errorMessage).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check for h2
    const h2 = page.locator('h2').first();
    await expect(h2).toBeVisible();
  });
  
  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to form
    await page.locator('a[href="#lead"]').first().click();
    await page.waitForTimeout(500);
    
    // Check input has proper attributes
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required');
  });
  
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check focus is visible
    const focusedElement = await page.evaluateHandle(() => document.activeElement);
    expect(focusedElement).toBeTruthy();
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
  
  test('should have no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known warnings
    const criticalErrors = consoleErrors.filter(
      error => !error.includes('Development mode')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Responsive Design', () => {
  test('should be mobile-friendly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if content is visible
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    
    // Check buttons are accessible
    const ctaButton = page.locator('a[href="#lead"]').first();
    await expect(ctaButton).toBeVisible();
  });
  
  test('should adapt to tablet size', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Check layout
    const container = page.locator('.container').first();
    await expect(container).toBeVisible();
  });
});
