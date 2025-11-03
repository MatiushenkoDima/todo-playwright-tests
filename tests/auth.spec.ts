import { test, expect } from '@playwright/test';
import { generateTestUser, register, login } from '../helpers/authHelpers';

test('Login page opens)', async ({ page }) => {
  await page.goto('/auth/login');
  await expect(page).toHaveURL(/\/auth\/login/i);
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
});

test.describe('Registration', () => {
  test('User can register with valid email and matching passwords', async ({ page }) => {
    const { email, password } = generateTestUser();
    await register(page, { email, password, confirmPassword: password });
   
    await expect(page).not.toHaveURL(/auth\/register/i);
    await expect(page).not.toHaveURL(/auth\/login/i);
  });

  test('Registration fails if passwords do not match', async ({ page }) => {
    const { email, password } = generateTestUser();
    await register(page, { email, password, confirmPassword: 'NotSame321!' });

    await expect(page).toHaveURL(/auth\/register/i);

    await expect(
      page.getByText(/passwords?\s+do(?:es)?\s*not\s+match|passwords? don't match/i)
    ).toBeVisible();
  });
});

test.describe('Login (optional explicit check)', () => {
  test('Existing user can login', async ({ page }) => {
    const { email, password } = generateTestUser();
    
    await register(page, { email, password, confirmPassword: password });
    
    await login(page, { email, password });
    await expect(page).not.toHaveURL(/auth\/login/i);
  });
});
