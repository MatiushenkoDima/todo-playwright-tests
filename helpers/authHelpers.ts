import { Page, expect } from '@playwright/test';

export type Creds = { email: string; password: string };
export type RegisterData = { email: string; password: string; confirmPassword: string };

export function generateTestUser(): Creds {
  const unique = Date.now();
  return { email: `auto_${unique}@example.com`, password: 'Qwerty123!' };
}

export async function register(page: Page, data: RegisterData) {
  await page.goto('/auth/register');
  await page.getByLabel(/email/i).fill(data.email);
  await page.getByLabel(/^password$/i).fill(data.password);
  await page.getByLabel(/confirm password/i).fill(data.confirmPassword);
  await page.getByRole('button', { name: /create an account/i }).click();
}

export async function login(page: Page, creds: Creds) {
  await page.goto('/auth/login');
  await page.getByLabel(/email/i).fill(creds.email);
  await page.getByLabel(/password/i).fill(creds.password);
  await page.getByRole('button', { name: /login/i }).click();
}

export async function registerAndLogin(page: Page, email: string, password: string) {
  await register(page, { email, password, confirmPassword: password });
  await expect(page).not.toHaveURL(/auth\/(login|register)/i);
}
