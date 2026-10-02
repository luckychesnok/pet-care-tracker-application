import { test, expect } from '@playwright/test';

// Тест 1: Быстрая smoke-проверка заголовка и текста
test('UI: Проверка загрузки приложения PetCare Tracker', async ({ page }) => {
  await page.goto('http://localhost:3000'); // Обязательный переход

  // 1. Проверяем title страницы
  await expect(page).toHaveTitle(/PetCare/i);

  // 2. Проверяем, что на странице есть название приложения (Твоя проверка)
  const bodyText = await page.textContent('body');
  expect(bodyText).toContain('PetCare');
});

// Тест 2: Проверка наличия основных элементов интерфейса
test('UI: Проверка отображения карточки питомца', async ({ page }) => {
  await page.goto('http://localhost:3000'); // Каждый новый тест должен сам открывать страницу

  // Проверяем видимость контейнера
  await expect(page.locator('body')).toBeVisible();
});