import { test, expect, request as pwRequest } from '@playwright/test';

function uniqueEmail() {
  return `api_${Date.now()}@example.com`;
}

test.describe('API: tasks CRUD happy path', () => {
  test('register → login (NextAuth) → create → list → delete', async ({ baseURL }) => {
    const api = await pwRequest.newContext({ baseURL });

    const email = uniqueEmail();
    const password = 'Qwerty123!';

    // 1) Регистрация
    const reg = await api.post('/api/auth/register', {
      data: { email, password, confirmPassword: password },
    });
    expect(reg.status(), 'register should be 200/201').toBeLessThan(300);

    // 2) NextAuth login: получаем CSRF
    const csrfResp = await api.get('/api/auth/csrf');
    expect(csrfResp.status()).toBe(200);
    const { csrfToken } = await csrfResp.json();
    expect(csrfToken).toBeTruthy();

    // 3) Логин через credentials callback
    const loginResp = await api.post('/api/auth/callback/credentials?json=true', {
      form: {
        csrfToken,
        email,
        password,
        callbackUrl: '/dashboard', 
        json: 'true',
      },
    });
    expect(loginResp.status(), 'login should be < 400').toBeLessThan(400);

    // 4) Создаём задачу
    const title = `API task ${Date.now()}`;
    const create = await api.post('/api/tasks', {
      data: {
        title,
        description: 'created via API e2e',
        priority: 'Medium',
      },
    });
    expect(create.status(), 'create task should be 200/201').toBeLessThan(300);
    const created = await create.json();
    expect(created?.title).toBe(title);
    const taskId = created?.id ?? created?._id ?? created?.taskId;

    // 5) Листинг — задача должна быть
    const list = await api.get('/api/tasks');
    expect(list.status()).toBe(200);
    const tasks = await list.json();
    const found = Array.isArray(tasks) && tasks.find((t: any) => t.title === title);
    expect(found, 'created task must be present in list').toBeTruthy();

    // 6) Удаление (если вернулся id)
    if (taskId) {
      const del = await api.delete(`/api/tasks/${taskId}`);
      expect([200, 202, 204]).toContain(del.status());

      const list2 = await api.get('/api/tasks');
      const tasks2 = await list2.json();
      const stillThere = Array.isArray(tasks2) && tasks2.find((t: any) => t.title === title);
      expect(stillThere, 'task should be deleted').toBeFalsy();
    } else {
      test.info().annotations.push({
        type: 'note',
        description: 'Task id not returned by API; skipped delete by id.',
      });
    }

    await api.dispose();
  });
});
