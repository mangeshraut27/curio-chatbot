const { test, expect, actions } = require('./framework/base/BaseTest');

test.describe('Emergency Features Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display emergency contacts for critical cases', async ({ page }) => {
    // Send emergency message
    await actions.sendMessage(page, 'Emergency! My dog is bleeding heavily!');
    
    // Verify emergency mode activation
    await expect(page.locator('.emergency-mode')).toBeVisible();
    await expect(page.locator('.emergency-contacts')).toBeVisible();
    
    // Verify contact information
    await expect(page.locator('.emergency-contact-name')).toBeVisible();
    await expect(page.locator('.emergency-contact-phone')).toBeVisible();
    await expect(page.locator('.emergency-contact-email')).toBeVisible();
  });

  test('should handle emergency phone calls', async ({ page }) => {
    // Send emergency message
    await actions.sendMessage(page, 'Emergency! My dog is having seizures!');
    
    // Click phone call button
    const callButton = page.locator('.emergency-call-button').first();
    await callButton.click();
    
    // Verify call initiation
    await expect(page.locator('.call-status')).toHaveText('Initiating call...');
  });

  test('should handle emergency email', async ({ page }) => {
    // Send emergency message
    await actions.sendMessage(page, 'Emergency! My dog is having seizures!');
    
    // Click email button
    const emailButton = page.locator('.emergency-email-button').first();
    await emailButton.click();
    
    // Verify email client opening
    await expect(page.locator('.email-status')).toHaveText('Opening email client...');
  });

  test('should find nearby vets in emergency', async ({ locationEnabledPage }) => {
    const page = locationEnabledPage;
    
    // Send emergency message
    await actions.sendMessage(page, 'Emergency! My dog is having seizures!');
    
    // Click find nearby vets button
    await page.locator('button:has-text("Find Nearby Vets")').click();
    
    // Verify vet search
    await expect(page.locator('.vet-search-results')).toBeVisible();
    await expect(page.locator('.vet-distance')).toBeVisible();
  });

  test('should contact animal control', async ({ page }) => {
    // Send emergency message
    await actions.sendMessage(page, 'Emergency! My dog is having seizures!');
    
    // Click animal control button
    await page.locator('button:has-text("Contact Animal Control")').click();
    
    // Verify animal control contact
    await expect(page.locator('.animal-control-status')).toHaveText('Contacting animal control...');
  });

  test('should handle online reporting', async ({ page }) => {
    // Send emergency message
    await actions.sendMessage(page, 'Emergency! My dog is having seizures!');
    
    // Click report online button
    await page.locator('button:has-text("Report Online")').click();
    
    // Verify report form
    await expect(page.locator('.report-form')).toBeVisible();
    await expect(page.locator('input[name="animalType"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
  });

  test('should share location in emergency', async ({ locationEnabledPage }) => {
    const page = locationEnabledPage;
    
    // Send emergency message
    await actions.sendMessage(page, 'Emergency! My dog is having seizures!');
    
    // Click share location button
    await page.locator('button:has-text("Share Location")').click();
    
    // Verify location sharing
    await expect(page.locator('.location-sharing-status')).toHaveText('Location shared with emergency contacts');
    await expect(page.locator('.share-options')).toBeVisible();
  });
}); 