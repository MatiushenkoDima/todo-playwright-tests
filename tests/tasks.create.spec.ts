import { test, expect } from '@playwright/test';
import { registerAndLogin, generateTestUser } from '../helpers/authHelpers';
import { generateTaskData, createTask, deleteTask } from '../helpers/taskHelpers';
import { openEditFor, setStatusInDialog, saveTaskDialog } from '../helpers/taskHelpers';


test('User can create a new task and it appears in Backlog', async ({ page }) => {
  const { email, password } = generateTestUser();
  const { title, description } = generateTaskData('Buy milk');
  const backlog = page.locator('[data-rfd-droppable-id="Backlog"]');

  await registerAndLogin(page, email, password);
  await createTask(page, title, description);

  const createdCard = page.getByText(title).first();
  await expect(createdCard).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(description)).toBeVisible();


await expect(backlog.getByText(title)).toBeVisible({ timeout: 5000 });
await expect(backlog.getByText(description)).toBeVisible();
});

test('Move task: Backlog → Todo → In Progress (via Edit)', async ({ page }) => {
  const { email, password } = generateTestUser();
  await registerAndLogin(page, email, password);

  const title = `Flow A ${Date.now()}`;
  await createTask(page, title, `desc ${Date.now()}`);

  const backlog    = page.locator('[data-rfd-droppable-id="Backlog"]');
  const todo       = page.locator('[data-rfd-droppable-id="Todo"]');
  const inProgress = page.locator('[data-rfd-droppable-id="In Progress"]');
  const done       = page.locator('[data-rfd-droppable-id="Done"]');

  // старт в Backlog
  await expect(backlog.getByText(title)).toBeVisible();

  // Backlog → Todo
  await openEditFor(page, title);
  await setStatusInDialog(page, 'Todo');
  await saveTaskDialog(page);
  await expect(backlog.getByText(title)).toHaveCount(0);
  await expect(todo.getByText(title)).toBeVisible();

  // Todo → In Progress
  await openEditFor(page, title);
  await setStatusInDialog(page, 'In Progress');
  await saveTaskDialog(page);
  await expect(todo.getByText(title)).toHaveCount(0);
  await expect(inProgress.getByText(title)).toBeVisible();

   // In Progress → Done
  await openEditFor(page, title);
  await setStatusInDialog(page, 'Done');
  await saveTaskDialog(page);
  await expect(inProgress.getByText(title)).toHaveCount(0);
  await expect(done.getByText(title)).toBeVisible();
});

test('Delete task from board (via menu)', async ({ page }) => {
  const { email, password } = generateTestUser();
  await registerAndLogin(page, email, password);

  const title = `Delete me ${Date.now()}`;
  await createTask(page, title, `desc ${Date.now()}`);

  const backlog = page.locator('[data-rfd-droppable-id="Backlog"]');
  await expect(backlog.getByText(title)).toBeVisible();

  await deleteTask(page, title);
});