const { test, expect, actions } = require('./framework/base/BaseTest');

test.describe('Triage System Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should assess low urgency cases', async ({ page }) => {
    // Send low urgency message
    await actions.sendMessage(page, 'My dog is eating less than usual but otherwise seems fine');
    
    // Verify triage assessment
    await actions.verifyUrgencyLevel(page, 'low');
    await expect(page.locator('.triage-score')).toHaveText('Score: 2');
    await expect(page.locator('.care-tips')).toBeVisible();
  });

  test('should assess medium urgency cases', async ({ page }) => {
    // Send medium urgency message
    await actions.sendMessage(page, 'My dog has a small cut on his paw and is limping slightly');
    
    // Verify triage assessment
    await actions.verifyUrgencyLevel(page, 'medium');
    await expect(page.locator('.triage-score')).toHaveText('Score: 5');
    await expect(page.locator('.recommended-actions')).toBeVisible();
  });

  test('should assess high urgency cases', async ({ page }) => {
    // Send high urgency message
    await actions.sendMessage(page, 'My dog is bleeding heavily from a wound and seems very weak');
    
    // Verify triage assessment
    await actions.verifyUrgencyLevel(page, 'high');
    await expect(page.locator('.triage-score')).toHaveText('Score: 8');
    await expect(page.locator('.emergency-actions')).toBeVisible();
  });

  test('should update triage score based on additional information', async ({ page }) => {
    // Initial message
    await actions.sendMessage(page, 'My dog is not eating well');
    
    // Verify initial assessment
    await actions.verifyUrgencyLevel(page, 'low');
    await expect(page.locator('.triage-score')).toHaveText('Score: 2');
    
    // Provide additional information
    await actions.sendMessage(page, 'He is also vomiting and seems very lethargic');
    
    // Verify updated assessment
    await actions.verifyUrgencyLevel(page, 'high');
    await expect(page.locator('.triage-score')).toHaveText('Score: 7');
  });

  test('should provide appropriate care tips for low urgency', async ({ page }) => {
    // Send low urgency message
    await actions.sendMessage(page, 'My dog is eating less than usual but otherwise seems fine');
    
    // Verify care tips
    await expect(page.locator('.care-tips')).toBeVisible();
    await expect(page.locator('.care-tips')).toContainText('Monitor food intake');
    await expect(page.locator('.care-tips')).toContainText('Check for other symptoms');
  });

  test('should provide recommended actions for medium urgency', async ({ page }) => {
    // Send medium urgency message
    await actions.sendMessage(page, 'My dog has a small cut on his paw and is limping slightly');
    
    // Verify recommended actions
    await expect(page.locator('.recommended-actions')).toBeVisible();
    await expect(page.locator('.recommended-actions')).toContainText('Clean the wound');
    await expect(page.locator('.recommended-actions')).toContainText('Monitor for infection');
  });

  test('should trigger emergency response for high urgency', async ({ page }) => {
    // Send high urgency message
    await actions.sendMessage(page, 'My dog is bleeding heavily from a wound and seems very weak');
    
    // Verify emergency response
    await expect(page.locator('.emergency-actions')).toBeVisible();
    await expect(page.locator('.emergency-contacts')).toBeVisible();
    await expect(page.locator('.quick-actions')).toBeVisible();
  });
}); 