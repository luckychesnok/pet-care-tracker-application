import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  /* Повтор упавшего теста для снятия trace */
  retries: 1, 

  /* Конфигурация отчётов (Встроенный HTML + Allure) */
  reporter: [
    ['html', { open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results' }]
  ],

  use: {
    baseURL: 'http://localhost:3000',

    /* 1. Запись трассировки (Trace) при первом ретрае упавшего теста */
    trace: 'on-first-retry',

    /* 2. Скриншот только при падении теста */
    screenshot: 'only-on-failure',

    /* 3. Запись видео при падении теста */
    video: 'retain-on-failure',
  },



  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});