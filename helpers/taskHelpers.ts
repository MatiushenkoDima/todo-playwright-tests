import { Page, expect, Locator } from '@playwright/test';

export async function createTask(page: Page, title: string, description: string) {

  await page.getByRole('button', { name: /add new task/i }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: /create new task/i })).toBeVisible();
  await expect(dialog.getByRole('button', { name: /create task/i })).toBeVisible();

  await dialog.getByLabel(/title/i).fill(title);
  await dialog.getByLabel(/description/i).fill(description);

  await dialog.getByRole('button', { name: /create task/i }).click();
}

export function generateTaskData(prefix = 'autotest task') {
  const unique = Date.now();
  return {
    title: `${prefix} ${unique}`,
    description: `description ${unique}`,
  };
}

export function getDroppableColumn(page: Page, name: 'Backlog' | 'Todo' | 'In Progress' | 'Done'): Locator {
  return page.locator(`[data-rfd-droppable-id="${name}"]`);
}

export async function openEditFor(page: Page, title: string) {
  const card = page.locator('[data-rfd-draggable-id]').filter({ hasText: title }).first();
  await card.scrollIntoViewIfNeeded();
  await card.locator('button[aria-haspopup="menu"]').click();
  await page.getByRole('menuitem', { name: /edit/i }).click();
}

export async function setStatusInDialog(page: Page, status: 'Backlog'|'Todo'|'In Progress'|'Done') {
  const dialog = page.getByRole('dialog');
  const statusCombo = dialog.getByText(/^Status$/i).locator('..').getByRole('combobox');
  await statusCombo.click();
  await page.getByRole('option', { name: status }).click();
}

export async function saveTaskDialog(page: Page) {
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: /save changes/i }).click();
}

export async function deleteTask(page: Page, title: string) {
  const card = page.locator('[data-rfd-draggable-id]').filter({ hasText: title }).first();

  await card.scrollIntoViewIfNeeded();
  await card.locator('button[aria-haspopup="menu"]').click();

  await page.getByRole('menuitem', { name: /delete/i }).click();

 const board = page.locator('[data-rfd-droppable-id]');
  await expect(board.getByText(title)).toHaveCount(0, { timeout: 5000 });
  
}