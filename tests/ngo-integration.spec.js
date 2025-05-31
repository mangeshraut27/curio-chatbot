const { test, expect, actions } = require('./framework/base/BaseTest');

test.describe('NGO Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display NGO recommendations', async ({ locationEnabledPage }) => {
    const page = locationEnabledPage;
    
    // Send message that requires NGO recommendations
    await actions.sendMessage(page, 'I found an injured stray dog');
    
    // Verify NGO panel
    await actions.verifyNGORecommendations(page);
    await expect(page.locator('.ngo-name')).toBeVisible();
    await expect(page.locator('.ngo-distance')).toBeVisible();
    await expect(page.locator('.ngo-contact')).toBeVisible();
  });

  test('should sort NGOs by distance', async ({ locationEnabledPage }) => {
    const page = locationEnabledPage;
    
    // Send message that requires NGO recommendations
    await actions.sendMessage(page, 'I found an injured stray dog');
    
    // Verify NGO sorting
    const distances = await page.locator('.ngo-distance').allTextContents();
    const sortedDistances = [...distances].sort((a, b) => {
      const distA = parseFloat(a.replace(/[^0-9.]/g, ''));
      const distB = parseFloat(b.replace(/[^0-9.]/g, ''));
      return distA - distB;
    });
    
    expect(distances).toEqual(sortedDistances);
  });

  test('should display NGO contact information', async ({ locationEnabledPage }) => {
    const page = locationEnabledPage;
    
    // Send message that requires NGO recommendations
    await actions.sendMessage(page, 'I found an injured stray dog');
    
    // Verify NGO contact information
    await expect(page.locator('.ngo-contact')).toBeVisible();
    await expect(page.locator('.ngo-phone')).toBeVisible();
    await expect(page.locator('.ngo-email')).toBeVisible();
    await expect(page.locator('.ngo-website')).toBeVisible();
  });

  test('should handle NGO phone calls', async ({ locationEnabledPage }) => {
    const page = locationEnabledPage;
    
    // Send message that requires NGO recommendations
    await actions.sendMessage(page, 'I found an injured stray dog');
    
    // Click NGO phone number
    const phoneButton = page.locator('.ngo-phone').first();
    await phoneButton.click();
    
    // Verify call initiation
    await expect(page.locator('.call-status')).toHaveText('Initiating call...');
  });

  test('should handle NGO email', async ({ locationEnabledPage }) => {
    const page = locationEnabledPage;
    
    // Send message that requires NGO recommendations
    await actions.sendMessage(page, 'I found an injured stray dog');
    
    // Click NGO email
    const emailButton = page.locator('.ngo-email').first();
    await emailButton.click();
    
    // Verify email client opening
    await expect(page.locator('.email-status')).toHaveText('Opening email client...');
  });

  test('should handle NGO website links', async ({ locationEnabledPage }) => {
    const page = locationEnabledPage;
    
    // Send message that requires NGO recommendations
    await actions.sendMessage(page, 'I found an injured stray dog');
    
    // Click NGO website
    const websiteLink = page.locator('.ngo-website').first();
    await websiteLink.click();
    
    // Verify website opening
    await expect(page.locator('.website-status')).toHaveText('Opening website...');
  });

  test('should update NGO recommendations based on location change', async ({ locationEnabledPage }) => {
    const page = locationEnabledPage;
    
    // Initial location
    await actions.sendMessage(page, 'I found an injured stray dog');
    const initialDistances = await page.locator('.ngo-distance').allTextContents();
    
    // Change location
    await page.evaluate(() => {
      navigator.geolocation.getCurrentPosition(
        position => {
          position.coords.latitude = 40.7128;
          position.coords.longitude = -74.0060;
        },
        error => console.error(error),
        { enableHighAccuracy: true }
      );
    });
    
    // Verify updated recommendations
    const updatedDistances = await page.locator('.ngo-distance').allTextContents();
    expect(updatedDistances).not.toEqual(initialDistances);
  });
}); 