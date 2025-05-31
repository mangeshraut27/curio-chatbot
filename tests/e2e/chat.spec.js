const { test, expect } = require('@playwright/test');

test.describe('Chat Interface Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('http://localhost:3000');
  });

  test('should display initial welcome message', async ({ page }) => {
    // Check for the welcome message
    const welcomeMessage = await page.locator('.message.bot').first();
    await expect(welcomeMessage).toContainText("Hello! I'm Curio 🐾");
  });

  test('should send and receive messages', async ({ page }) => {
    // Type and send a message
    const input = page.locator('.message-input');
    await input.fill('I found an injured dog near Central Park');
    await input.press('Enter');

    // Verify the message was sent
    const userMessage = page.locator('.message.user').last();
    await expect(userMessage).toContainText('I found an injured dog near Central Park');

    // Wait for bot response
    const botResponse = page.locator('.message.bot').last();
    await expect(botResponse).toBeVisible();
  });

  test('should handle location permission request', async ({ page }) => {
    // Send first message to trigger location request
    const input = page.locator('.message-input');
    await input.fill('I found an injured dog');
    await input.press('Enter');

    // Verify location request message
    const locationRequest = page.locator('.message.location-request');
    await expect(locationRequest).toBeVisible();
    await expect(locationRequest).toContainText('To provide the most accurate help');
  });

  test('should display typing indicator', async ({ page }) => {
    // Send a message
    const input = page.locator('.message-input');
    await input.fill('I found an injured dog');
    await input.press('Enter');

    // Verify typing indicator appears
    const typingIndicator = page.locator('.typing-indicator');
    await expect(typingIndicator).toBeVisible();
    await expect(typingIndicator).toContainText('Curio is analyzing');
  });

  test('should handle new conversation reset', async ({ page }) => {
    // Send a message first
    const input = page.locator('.message-input');
    await input.fill('I found an injured dog');
    await input.press('Enter');

    // Click new conversation button
    const newChatButton = page.locator('button:has-text("New Conversation")');
    await newChatButton.click();

    // Verify chat is reset
    const messages = page.locator('.message');
    await expect(messages).toHaveCount(1); // Only welcome message should remain
    await expect(messages.first()).toContainText("Hello! I'm Curio 🐾");
  });
}); 