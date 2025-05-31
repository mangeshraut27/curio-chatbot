const { test, expect, actions } = require('./framework/base/BaseTest');

test.describe('Basic Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load application and display welcome message', async ({ page }) => {
    // Verify initial load
    await expect(page.locator('.chat-container')).toBeVisible();
    await expect(page.locator('.robot-animation')).toBeVisible();
    await expect(page.locator('.message-input')).toBeVisible();
    
    // Verify welcome message
    await actions.verifyMessageExists(page, 'Hello! I am Curio, your AI companion for animal care.');
  });

  test('should handle empty messages', async ({ page }) => {
    await actions.sendMessage(page, '');
    await actions.verifyMessageExists(page, 'Please enter a message to continue.');
  });

  test('should handle short messages', async ({ page }) => {
    await actions.sendMessage(page, 'Hi');
    await actions.verifyMessageExists(page, 'Hello! How can I help you with your animal today?');
  });

  test('should handle long messages', async ({ page }) => {
    const longMessage = 'My dog has been acting strange for the past few days. ' + 
      'He is not eating properly and seems to be in pain when he walks. ' +
      'I noticed some swelling in his right hind leg. What should I do?';
    
    await actions.sendMessage(page, longMessage);
    await actions.verifyMessageExists(page, 'I understand you are concerned about your dog');
  });

  test('should handle special characters and emoji', async ({ page }) => {
    await actions.sendMessage(page, '🐕 My dog is sick! 😢');
    await actions.verifyMessageExists(page, 'I understand you are concerned about your dog');
  });

  test('should reset conversation', async ({ page }) => {
    // Send initial message
    await actions.sendMessage(page, 'Hi');
    
    // Reset conversation
    await actions.resetConversation(page);
    
    // Verify reset
    await actions.verifyMessageExists(page, 'Hello! I am Curio, your AI companion for animal care.');
  });
}); 