const { test, expect, actions } = require('./framework/base/BaseTest');

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('.message-input')).toBeFocused();
    
    // Test enter key for sending messages
    await page.keyboard.type('Hi');
    await page.keyboard.press('Enter');
    await actions.verifyMessageExists(page, 'Hello! How can I help you with your animal today?');
    
    // Test tab navigation through buttons
    await page.keyboard.press('Tab');
    await expect(page.locator('button:has-text("New Conversation")')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button:has-text("Share Location")')).toBeFocused();
  });

  test('should support screen readers', async ({ page }) => {
    // Verify ARIA labels
    await expect(page.locator('.message-input')).toHaveAttribute('aria-label', 'Type your message');
    await expect(page.locator('button:has-text("New Conversation")')).toHaveAttribute('aria-label', 'Start new conversation');
    
    // Verify role attributes
    await expect(page.locator('.chat-container')).toHaveAttribute('role', 'log');
    await expect(page.locator('.message-input')).toHaveAttribute('role', 'textbox');
    
    // Verify live regions
    await expect(page.locator('.message.bot')).toHaveAttribute('aria-live', 'polite');
  });

  test('should maintain focus management', async ({ page }) => {
    // Send message
    await actions.sendMessage(page, 'Hi');
    
    // Verify focus returns to input
    await expect(page.locator('.message-input')).toBeFocused();
    
    // Test modal focus trap
    await page.locator('button:has-text("Share Location")').click();
    await expect(page.locator('.modal')).toBeVisible();
    
    // Verify focus is trapped in modal
    await page.keyboard.press('Tab');
    await expect(page.locator('.modal-close-button')).toBeFocused();
    
    // Close modal
    await page.keyboard.press('Enter');
    await expect(page.locator('.modal')).not.toBeVisible();
    
    // Verify focus returns to trigger button
    await expect(page.locator('button:has-text("Share Location")')).toBeFocused();
  });

  test('should support high contrast mode', async ({ page }) => {
    // Enable high contrast mode
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--high-contrast', 'true');
    });
    
    // Verify high contrast styles
    await expect(page.locator('.message-input')).toHaveCSS('background-color', 'rgb(0, 0, 0)');
    await expect(page.locator('.message-input')).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(page.locator('.message.bot')).toHaveCSS('border', '2px solid rgb(255, 255, 255)');
  });

  test('should support text scaling', async ({ page }) => {
    // Set large text size
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '20px';
    });
    
    // Verify text scaling
    await expect(page.locator('.message.bot')).toHaveCSS('font-size', '20px');
    await expect(page.locator('.message-input')).toHaveCSS('font-size', '20px');
    
    // Verify layout remains usable
    await expect(page.locator('.chat-container')).toBeVisible();
    await expect(page.locator('.message-input')).toBeVisible();
  });

  test('should provide keyboard shortcuts', async ({ page }) => {
    // Test new conversation shortcut
    await page.keyboard.press('Control+n');
    await expect(page.locator('.message.bot:first-child')).toBeVisible();
    
    // Test focus input shortcut
    await page.keyboard.press('Control+i');
    await expect(page.locator('.message-input')).toBeFocused();
    
    // Test emergency mode shortcut
    await page.keyboard.press('Control+e');
    await expect(page.locator('.emergency-mode')).toBeVisible();
  });

  test('should handle dynamic content updates', async ({ page }) => {
    // Send message
    await actions.sendMessage(page, 'Hi');
    
    // Verify dynamic content is announced
    await expect(page.locator('.message.bot')).toHaveAttribute('aria-live', 'polite');
    
    // Verify loading states
    await expect(page.locator('.loading-indicator')).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('.loading-indicator')).toHaveAttribute('aria-label', 'Loading response');
  });
}); 