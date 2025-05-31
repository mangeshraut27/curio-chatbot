const { test: base, expect } = require('@playwright/test');

// Extend the base test with custom fixtures
exports.test = base.extend({
  // Custom fixture for authenticated state
  authenticatedPage: async ({ page }, use) => {
    // Setup any authentication if needed
    await use(page);
  },

  // Custom fixture for location permissions
  locationEnabledPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      permissions: ['geolocation'],
      geolocation: { latitude: 40.7128, longitude: -74.0060, accuracy: 100 }
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // Custom fixture for offline mode
  offlinePage: async ({ browser }, use) => {
    const context = await browser.newContext({
      offline: true
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  }
});

// Export common test utilities
exports.expect = expect;

// Common test actions
exports.actions = {
  async sendMessage(page, message) {
    const input = page.locator('.message-input');
    await input.fill(message);
    await input.press('Enter');
    // Wait for bot response
    await page.waitForSelector('.message.bot:last-child');
  },

  async resetConversation(page) {
    const newChatButton = page.locator('button:has-text("New Conversation")');
    await newChatButton.click();
    // Wait for reset
    await page.waitForSelector('.message.bot:first-child');
  },

  async verifyMessageExists(page, messageText, type = 'bot') {
    const message = page.locator(`.message.${type}:has-text("${messageText}")`);
    await expect(message).toBeVisible();
  },

  async verifyUrgencyLevel(page, level) {
    const urgencyIndicator = page.locator(`.urgency-indicator-small.${level}`);
    await expect(urgencyIndicator).toBeVisible();
  },

  async verifyNGORecommendations(page) {
    const ngoPanel = page.locator('.ngo-panel');
    await expect(ngoPanel).toBeVisible();
    await expect(page.locator('.ngo-name')).toBeVisible();
    await expect(page.locator('.ngo-distance')).toBeVisible();
  }
}; 