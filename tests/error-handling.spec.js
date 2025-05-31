const { test, expect, actions } = require('./framework/base/BaseTest');

test.describe('Error Handling Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should handle slow network connection', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', route => {
      return new Promise(resolve => {
        setTimeout(() => {
          route.continue();
          resolve();
        }, 2000);
      });
    });

    // Send message
    await actions.sendMessage(page, 'Hi');
    
    // Verify loading state
    await expect(page.locator('.loading-indicator')).toBeVisible();
    await expect(page.locator('.message-input')).toBeDisabled();
    
    // Verify message after delay
    await actions.verifyMessageExists(page, 'Hello! How can I help you with your animal today?');
  });

  test('should handle offline mode', async ({ offlinePage }) => {
    const page = offlinePage;
    
    // Send message while offline
    await actions.sendMessage(page, 'Hi');
    
    // Verify offline message
    await expect(page.locator('.offline-message')).toBeVisible();
    await expect(page.locator('.offline-message')).toContainText('You are currently offline');
    await expect(page.locator('.retry-button')).toBeVisible();
  });

  test('should handle reconnection', async ({ page }) => {
    // Go offline
    await page.route('**/*', route => route.abort());
    
    // Send message
    await actions.sendMessage(page, 'Hi');
    
    // Verify offline state
    await expect(page.locator('.offline-message')).toBeVisible();
    
    // Restore connection
    await page.unroute('**/*');
    await page.locator('.retry-button').click();
    
    // Verify reconnection
    await expect(page.locator('.offline-message')).not.toBeVisible();
    await actions.verifyMessageExists(page, 'Hello! How can I help you with your animal today?');
  });

  test('should handle invalid location input', async ({ page }) => {
    // Send message that requires location
    await actions.sendMessage(page, 'Find nearby vets');
    
    // Enter invalid location
    await page.locator('.manual-location-input').fill('Invalid Location');
    await page.locator('button:has-text("Use Location")').click();
    
    // Verify error message
    await expect(page.locator('.location-error')).toBeVisible();
    await expect(page.locator('.location-error')).toContainText('Invalid location');
  });

  test('should handle API failures', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/**', route => {
      return route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    // Send message
    await actions.sendMessage(page, 'Hi');
    
    // Verify error handling
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('Unable to process request');
    await expect(page.locator('.retry-button')).toBeVisible();
  });

  test('should handle location errors', async ({ page }) => {
    // Mock geolocation error
    await page.route('**/*', route => {
      if (route.request().resourceType() === 'geolocation') {
        return route.fulfill({
          status: 403,
          body: JSON.stringify({ error: 'Location permission denied' })
        });
      }
      return route.continue();
    });

    // Send message that requires location
    await actions.sendMessage(page, 'Find nearby vets');
    
    // Verify error handling
    await expect(page.locator('.location-error')).toBeVisible();
    await expect(page.locator('.location-error')).toContainText('Location access denied');
    await expect(page.locator('.manual-location-input')).toBeVisible();
  });

  test('should handle contact errors', async ({ page }) => {
    // Mock contact API failure
    await page.route('**/api/contacts/**', route => {
      return route.fulfill({
        status: 404,
        body: JSON.stringify({ error: 'Contact not found' })
      });
    });

    // Send emergency message
    await actions.sendMessage(page, 'Emergency! My dog is having seizures!');
    
    // Click contact button
    await page.locator('.emergency-call-button').first().click();
    
    // Verify error handling
    await expect(page.locator('.contact-error')).toBeVisible();
    await expect(page.locator('.contact-error')).toContainText('Unable to contact emergency services');
    await expect(page.locator('.alternative-contacts')).toBeVisible();
  });
}); 