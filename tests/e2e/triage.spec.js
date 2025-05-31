const { test, expect } = require('@playwright/test');

test.describe('Triage System Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should analyze and display triage score', async ({ page }) => {
    // Send a message requiring triage
    const input = page.locator('.message-input');
    await input.fill('I found a dog with a broken leg, it seems to be in pain');
    await input.press('Enter');

    // Wait for analysis
    await page.waitForSelector('.message.bot:last-child');

    // Verify triage score display
    const triageScore = page.locator('.triage-score-header');
    await expect(triageScore).toBeVisible();
    await expect(triageScore).toContainText('Score:');
  });

  test('should display appropriate urgency level', async ({ page }) => {
    const testCases = [
      {
        message: 'I found a healthy looking dog wandering around',
        expectedLevel: 'low'
      },
      {
        message: 'I found a dog with a minor limp',
        expectedLevel: 'medium'
      },
      {
        message: 'I found a dog that was hit by a car and is bleeding heavily',
        expectedLevel: 'high'
      }
    ];

    for (const testCase of testCases) {
      // Send message
      const input = page.locator('.message-input');
      await input.fill(testCase.message);
      await input.press('Enter');

      // Wait for analysis
      await page.waitForSelector('.message.bot:last-child');

      // Verify urgency level
      const urgencyIndicator = page.locator(`.urgency-indicator-small.${testCase.expectedLevel}`);
      await expect(urgencyIndicator).toBeVisible();
      
      // Reset conversation for next test
      const newChatButton = page.locator('button:has-text("New Conversation")');
      await newChatButton.click();
    }
  });

  test('should provide appropriate care tips', async ({ page }) => {
    // Send a message requiring care tips
    const input = page.locator('.message-input');
    await input.fill('I found an injured dog that seems scared');
    await input.press('Enter');

    // Wait for analysis
    await page.waitForSelector('.message.bot:last-child');

    // Verify care tips
    const careTips = page.locator('.general-tips');
    await expect(careTips).toBeVisible();

    // Check for specific tips
    await expect(page.locator('text=Approach with Caution')).toBeVisible();
    await expect(page.locator('text=Ensure Safety')).toBeVisible();
    await expect(page.locator('text=Offer Water')).toBeVisible();
    await expect(page.locator('text=Document & Observe')).toBeVisible();
  });

  test('should handle consistency checks', async ({ page }) => {
    // Send a message with potentially inconsistent information
    const input = page.locator('.message-input');
    await input.fill('I found a dog that was hit by a car but it seems perfectly fine and healthy');
    await input.press('Enter');

    // Wait for analysis
    await page.waitForSelector('.message.bot:last-child');

    // Verify consistency check message
    const consistencyMessage = page.locator('.message.consistency-check');
    await expect(consistencyMessage).toBeVisible();
    await expect(consistencyMessage).toContainText('need clarification');
  });

  test('should provide appropriate follow-up questions', async ({ page }) => {
    // Send an initial message
    const input = page.locator('.message-input');
    await input.fill('I found an injured dog');
    await input.press('Enter');

    // Wait for initial analysis
    await page.waitForSelector('.message.bot:last-child');

    // Verify follow-up questions
    const followUpMessage = page.locator('.message.follow-up-message');
    await expect(followUpMessage).toBeVisible();
    
    // Check that follow-up questions are relevant
    const followUpText = await followUpMessage.textContent();
    expect(followUpText).toMatch(/Could you provide|What is|How severe|Where exactly/);
  });

  test('should handle location accuracy feedback', async ({ page }) => {
    // Mock location permission with low accuracy
    await page.goto('http://localhost:3000', {
      permissions: ['geolocation'],
      geolocation: { latitude: 40.7128, longitude: -74.0060, accuracy: 1000 }
    });

    // Send a message
    const input = page.locator('.message-input');
    await input.fill('I found an injured dog');
    await input.press('Enter');

    // Wait for analysis
    await page.waitForSelector('.message.bot:last-child');

    // Verify location accuracy feedback
    const locationFeedback = page.locator('.message:has-text("location accuracy")');
    await expect(locationFeedback).toBeVisible();
    await expect(locationFeedback).toContainText('accuracy');
  });
}); 