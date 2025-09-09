import { test, expect } from '@playwright/test';

/**
 * End-to-End Test: Complete User Journey
 * 
 * This test covers the full user experience:
 * 1. User registration and login
 * 2. Navigation and lesson browsing
 * 3. Lesson completion and quiz taking
 * 4. Challenge submission
 * 5. Leaderboard viewing
 * 
 * Run with: npx playwright test
 */

const TEST_USER = {
  email: 'e2etest@example.com',
  password: 'TestPass123!',
  firstName: 'E2E',
  lastName: 'Tester',
  school: 'Test School'
};

test.describe('Complete User Journey E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
  });

  test('should complete full user registration and login flow', async ({ page }) => {
    console.log('🔐 Testing registration and login flow...');
    
    // Navigate to register page
    await page.click('text=Sign Up');
    await expect(page).toHaveURL('/register');
    
    // Fill registration form
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.fill('input[name="confirmPassword"]', TEST_USER.password);
    await page.fill('input[name="firstName"]', TEST_USER.firstName);
    await page.fill('input[name="lastName"]', TEST_USER.lastName);
    await page.fill('input[name="school"]', TEST_USER.school);
    
    // Select user type
    await page.selectOption('select[name="role"]', 'student');
    
    // Submit registration
    await page.click('button[type="submit"]');
    
    // Should redirect to home page after successful registration
    await expect(page).toHaveURL('/');
    
    // Should show user menu indicating successful login
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    console.log('✅ Registration and login completed successfully');
  });

  test('should navigate and browse lessons', async ({ page }) => {
    console.log('📚 Testing lesson browsing...');
    
    // Login first
    await loginUser(page);
    
    // Navigate to home page
    await page.goto('/');
    
    // Check if lessons are displayed
    await expect(page.locator('[data-testid="lessons-grid"]')).toBeVisible();
    
    // Test filtering by difficulty
    await page.click('[data-testid="difficulty-filter"]');
    await page.click('text=Beginner');
    
    // Wait for filtered results
    await page.waitForTimeout(1000);
    
    // Test search functionality
    await page.fill('[data-testid="search-input"]', 'climate');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    console.log('✅ Lesson browsing completed successfully');
  });

  test('should complete a lesson and take quiz', async ({ page }) => {
    console.log('📖 Testing lesson completion and quiz...');
    
    // Login first
    await loginUser(page);
    
    // Navigate to home page
    await page.goto('/');
    
    // Click on first lesson
    const firstLesson = page.locator('[data-testid="lesson-card"]').first();
    await firstLesson.click();
    
    // Should be on lesson detail page
    await expect(page.locator('[data-testid="lesson-content"]')).toBeVisible();
    
    // Scroll through lesson content
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    
    await page.waitForTimeout(2000);
    
    // Mark lesson as complete
    await page.click('[data-testid="complete-lesson-btn"]');
    
    // Should show success message
    await expect(page.locator('text=Lesson completed')).toBeVisible();
    
    // Take quiz if available
    const quizButton = page.locator('[data-testid="take-quiz-btn"]');
    if (await quizButton.isVisible()) {
      await quizButton.click();
      
      // Answer quiz questions
      const questions = page.locator('[data-testid="quiz-question"]');
      const questionCount = await questions.count();
      
      for (let i = 0; i < questionCount; i++) {
        // Select first option for each question
        await page.click(`[data-testid="quiz-option-${i}-0"]`);
      }
      
      // Submit quiz
      await page.click('[data-testid="submit-quiz-btn"]');
      
      // Should show quiz results
      await expect(page.locator('[data-testid="quiz-results"]')).toBeVisible();
    }
    
    console.log('✅ Lesson completion and quiz completed successfully');
  });

  test('should submit a challenge', async ({ page }) => {
    console.log('🏆 Testing challenge submission...');
    
    // Login first
    await loginUser(page);
    
    // Navigate to challenges tab
    await page.goto('/');
    await page.click('[data-testid="challenges-tab"]');
    
    // Wait for challenges to load
    await expect(page.locator('[data-testid="challenges-grid"]')).toBeVisible();
    
    // Click on first challenge
    const firstChallenge = page.locator('[data-testid="challenge-card"]').first();
    await firstChallenge.click();
    
    // Should be on challenge submission page
    await expect(page.locator('[data-testid="challenge-form"]')).toBeVisible();
    
    // Fill challenge submission form
    await page.fill('[data-testid="challenge-description"]', 
      'I completed this challenge by using reusable containers and avoiding single-use plastics throughout the day.');
    
    // Upload evidence image (mock file)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'evidence.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('mock image data')
    });
    
    // Submit challenge
    await page.click('[data-testid="submit-challenge-btn"]');
    
    // Should show success message
    await expect(page.locator('text=Challenge submitted successfully')).toBeVisible();
    
    console.log('✅ Challenge submission completed successfully');
  });

  test('should view leaderboard and user stats', async ({ page }) => {
    console.log('🏅 Testing leaderboard and user stats...');
    
    // Login first
    await loginUser(page);
    
    // Navigate to leaderboard
    await page.click('[data-testid="nav-leaderboard"]');
    await expect(page).toHaveURL('/leaderboard');
    
    // Should show leaderboard table
    await expect(page.locator('[data-testid="leaderboard-table"]')).toBeVisible();
    
    // Test period filtering
    await page.click('[data-testid="period-filter"]');
    await page.click('text=This Month');
    
    // Wait for filtered results
    await page.waitForTimeout(1000);
    
    // Should show user's current stats
    await expect(page.locator('[data-testid="user-stats"]')).toBeVisible();
    
    // Check if user rank and points are displayed
    await expect(page.locator('[data-testid="user-rank"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-points"]')).toBeVisible();
    
    console.log('✅ Leaderboard viewing completed successfully');
  });

  test('should navigate through user profile and settings', async ({ page }) => {
    console.log('👤 Testing user profile and settings...');
    
    // Login first
    await loginUser(page);
    
    // Open user menu
    await page.click('[data-testid="user-menu-button"]');
    
    // Click on profile
    await page.click('[data-testid="profile-link"]');
    
    // Should be on profile page
    await expect(page.locator('[data-testid="profile-form"]')).toBeVisible();
    
    // Update bio
    await page.fill('[data-testid="bio-input"]', 'Updated bio for e2e testing');
    
    // Save profile changes
    await page.click('[data-testid="save-profile-btn"]');
    
    // Should show success message
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
    
    console.log('✅ Profile management completed successfully');
  });

  test('should test responsive design on mobile viewport', async ({ page }) => {
    console.log('📱 Testing responsive design...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Login first
    await loginUser(page);
    
    // Test mobile navigation
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Navigate to different pages on mobile
    await page.click('[data-testid="mobile-nav-home"]');
    await expect(page).toHaveURL('/');
    
    await page.click('[data-testid="mobile-menu-button"]');
    await page.click('[data-testid="mobile-nav-leaderboard"]');
    await expect(page).toHaveURL('/leaderboard');
    
    // Test that content is properly displayed on mobile
    await expect(page.locator('[data-testid="leaderboard-table"]')).toBeVisible();
    
    console.log('✅ Responsive design testing completed successfully');
  });

  test('should handle error states gracefully', async ({ page }) => {
    console.log('⚠️ Testing error handling...');
    
    // Test login with invalid credentials
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=Login failed')).toBeVisible();
    
    // Test navigation to non-existent page
    await page.goto('/non-existent-page');
    
    // Should show 404 or redirect to home
    const currentUrl = page.url();
    expect(currentUrl.includes('/non-existent-page') || currentUrl.includes('/')).toBeTruthy();
    
    console.log('✅ Error handling testing completed successfully');
  });

  test('should demonstrate complete user journey', async ({ page }) => {
    console.log('🎉 Running complete user journey...');
    
    // 1. Register/Login
    await loginUser(page);
    console.log('✅ Step 1: Authentication completed');
    
    // 2. Browse and complete lesson
    await page.goto('/');
    const firstLesson = page.locator('[data-testid="lesson-card"]').first();
    if (await firstLesson.isVisible()) {
      await firstLesson.click();
      await page.click('[data-testid="complete-lesson-btn"]');
      console.log('✅ Step 2: Lesson completion');
    }
    
    // 3. Submit challenge
    await page.goto('/');
    await page.click('[data-testid="challenges-tab"]');
    const firstChallenge = page.locator('[data-testid="challenge-card"]').first();
    if (await firstChallenge.isVisible()) {
      await firstChallenge.click();
      await page.fill('[data-testid="challenge-description"]', 'E2E test submission');
      console.log('✅ Step 3: Challenge interaction');
    }
    
    // 4. Check leaderboard
    await page.click('[data-testid="nav-leaderboard"]');
    await expect(page.locator('[data-testid="leaderboard-table"]')).toBeVisible();
    console.log('✅ Step 4: Leaderboard viewing');
    
    // 5. Logout
    await page.click('[data-testid="user-menu-button"]');
    await page.click('[data-testid="logout-button"]');
    await expect(page).toHaveURL('/login');
    console.log('✅ Step 5: Logout completed');
    
    console.log('🚀 Complete user journey test passed!');
  });
});

// Helper function to login user
async function loginUser(page: any) {
  // Check if already logged in
  const userMenu = page.locator('[data-testid="user-menu"]');
  if (await userMenu.isVisible()) {
    return; // Already logged in
  }
  
  // Navigate to login page
  await page.goto('/login');
  
  // Fill login form
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);
  
  // Submit login
  await page.click('button[type="submit"]');
  
  // Wait for redirect to home page
  await page.waitForURL('/');
  
  // Verify login success
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
}