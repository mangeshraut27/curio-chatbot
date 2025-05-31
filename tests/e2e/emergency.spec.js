const { test, expect } = require('@playwright/test');

test.describe('Emergency Features Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display emergency contacts', async ({ page }) => {
    // Send a message to trigger emergency analysis
    const input = page.locator('.message-input');
    await input.fill('I found a severely injured dog bleeding from its leg');
    await input.press('Enter');

    // Wait for analysis to complete
    await page.waitForSelector('.message.bot:last-child');

    // Verify emergency contacts are visible
    const emergencyContacts = page.locator('.emergency-contacts');
    await expect(emergencyContacts).toBeVisible();
    
    // Check for specific emergency contacts
    await expect(page.locator('text=Local Animal Control')).toBeVisible();
    await expect(page.locator('text=Emergency Vet Clinic')).toBeVisible();
    await expect(page.locator('text=Wildlife Rescue Hotline')).toBeVisible();
  });

  test('should display quick action buttons', async ({ page }) => {
    // Send a message to trigger analysis
    const input = page.locator('.message-input');
    await input.fill('I found an injured dog');
    await input.press('Enter');

    // Wait for analysis to complete
    await page.waitForSelector('.message.bot:last-child');

    // Verify quick action buttons
    const actionButtons = page.locator('.action-grid');
    await expect(actionButtons).toBeVisible();

    // Check for specific action buttons
    await expect(page.locator('button:has-text("Find Nearby Vets")')).toBeVisible();
    await expect(page.locator('button:has-text("Contact Animal Control")')).toBeVisible();
    await expect(page.locator('button:has-text("Report Online")')).toBeVisible();
    await expect(page.locator('button:has-text("Share Location")')).toBeVisible();
  });

  test('should handle NGO recommendations', async ({ page }) => {
    // Mock location permission
    await page.goto('http://localhost:3000', {
      permissions: ['geolocation']
    });

    // Send a message with location context
    const input = page.locator('.message-input');
    await input.fill('I found an injured dog near Central Park, New York');
    await input.press('Enter');

    // Wait for analysis and NGO recommendations
    await page.waitForSelector('.ngo-panel');

    // Verify NGO panel
    const ngoPanel = page.locator('.ngo-panel');
    await expect(ngoPanel).toBeVisible();

    // Check for NGO details
    await expect(page.locator('.ngo-name')).toBeVisible();
    await expect(page.locator('.ngo-distance')).toBeVisible();
    await expect(page.locator('.ngo-contact')).toBeVisible();
  });

  test('should handle high urgency situations', async ({ page }) => {
    // Send a high urgency message
    const input = page.locator('.message-input');
    await input.fill('I found a dog that was hit by a car and is bleeding heavily');
    await input.press('Enter');

    // Wait for analysis
    await page.waitForSelector('.message.bot:last-child');

    // Verify urgency indicators
    const urgencyIndicator = page.locator('.urgency-indicator-small.high');
    await expect(urgencyIndicator).toBeVisible();
    
    // Check for emergency message
    const emergencyMessage = page.locator('.message.urgent-alert');
    await expect(emergencyMessage).toBeVisible();
    await expect(emergencyMessage).toContainText('HIGH URGENCY');
  });

  test('should handle location help request', async ({ page }) => {
    // Send a message with vague location
    const input = page.locator('.message-input');
    await input.fill('I found an injured dog somewhere in the city');
    await input.press('Enter');

    // Wait for analysis
    await page.waitForSelector('.message.bot:last-child');

    // Click location help button
    const locationHelpButton = page.locator('button:has-text("Location Help")');
    await expect(locationHelpButton).toBeVisible();
    await locationHelpButton.click();

    // Verify location guidance message
    const locationGuidance = page.locator('.message.location-guidance');
    await expect(locationGuidance).toBeVisible();
    await expect(locationGuidance).toContainText('landmarks or cross streets');
  });
}); 