const { test, expect, actions } = require('./framework/base/BaseTest');

test.describe('Location Services Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should handle location permission grant', async ({ locationEnabledPage }) => {
    const page = locationEnabledPage;
    
    // Send message that requires location
    await actions.sendMessage(page, 'Find nearby vets');
    
    // Verify location permission handling
    await expect(page.locator('.location-status')).toHaveText('Location access granted');
    await expect(page.locator('.location-accuracy')).toBeVisible();
  });

  test('should handle location permission denial', async ({ page }) => {
    // Mock geolocation permission denial
    await page.route('**/*', route => {
      if (route.request().resourceType() === 'geolocation') {
        return route.fulfill({ status: 403 });
      }
      return route.continue();
    });

    // Send message that requires location
    await actions.sendMessage(page, 'Find nearby vets');
    
    // Verify fallback behavior
    await expect(page.locator('.location-status')).toHaveText('Location access denied');
    await expect(page.locator('.manual-location-input')).toBeVisible();
  });

  test('should handle manual location input', async ({ page }) => {
    // Send message that requires location
    await actions.sendMessage(page, 'Find nearby vets');
    
    // Enter manual location
    await page.locator('.manual-location-input').fill('New York, NY');
    await page.locator('button:has-text("Use Location")').click();
    
    // Verify location is used
    await expect(page.locator('.location-status')).toHaveText('Using manual location');
    await expect(page.locator('.ngo-distance')).toBeVisible();
  });

  test('should update location accuracy', async ({ locationEnabledPage }) => {
    const page = locationEnabledPage;
    
    // Send message that requires location
    await actions.sendMessage(page, 'Find nearby vets');
    
    // Verify initial accuracy
    await expect(page.locator('.location-accuracy')).toContainText('100m');
    
    // Update location with different accuracy
    await page.evaluate(() => {
      navigator.geolocation.getCurrentPosition(
        position => {
          position.coords.accuracy = 50;
        },
        error => console.error(error),
        { enableHighAccuracy: true }
      );
    });
    
    // Verify updated accuracy
    await expect(page.locator('.location-accuracy')).toContainText('50m');
  });

  test('should share location with emergency contacts', async ({ locationEnabledPage }) => {
    const page = locationEnabledPage;
    
    // Send emergency message
    await actions.sendMessage(page, 'Emergency! My dog is having seizures!');
    
    // Verify location sharing
    await expect(page.locator('.location-sharing-status')).toHaveText('Location shared with emergency contacts');
    await expect(page.locator('.share-location-button')).toBeVisible();
    
    // Test share button
    await page.locator('.share-location-button').click();
    await expect(page.locator('.share-options')).toBeVisible();
  });
}); 