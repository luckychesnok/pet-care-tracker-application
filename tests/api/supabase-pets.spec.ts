import { test, expect } from '@playwright/test';

// Данные твоего проекта Supabase (можно вынести в .env)
const SUPABASE_URL = 'https://yaffchemygbreyohjwon.supabase.co'; // например https://xyz.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhZmZjaGVteWdicmV5b2hqd29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MDM5OTcsImV4cCI6MjEwNjE3OTk5N30.ULem9heKPnMi8CUYliTLEUFtKYRKwnNtT5Cui-S_rvU';

test.describe('API CRUD: Supabase PetCare Vaccinations Independent Suite', () => {
  let createdVaccineId: string | null = null;
  let targetPetId: string | null = null;

  const authHeaders = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  // Вспомогательная функция: получает ID любой существующей записи из БД, если памяти нет
  async function ensureVaccineId(request: any): Promise<string> {
    if (createdVaccineId) return createdVaccineId;

    // 1. Ищем существующую вакцину в БД
    const getRes = await request.get(`${SUPABASE_URL}/rest/v1/vaccinations?select=id,pet_id&limit=1`, {
      headers: authHeaders
    });
    
    if (getRes.ok()) {
      const list = await getRes.json();
      if (list.length > 0) {
        createdVaccineId = list[0].id;
        targetPetId = list[0].pet_id;
        return createdVaccineId!;
      }
    }

    // 2. Если таблица абсолютно пустая — создаем 1 запись
    const getPetRes = await request.get(`${SUPABASE_URL}/rest/v1/pets?select=id&limit=1`, { headers: authHeaders });
    const pets = await getPetRes.json();
    const petId = pets[0]?.id;

    const createRes = await request.post(`${SUPABASE_URL}/rest/v1/vaccinations`, {
      headers: authHeaders,
      data: {
        pet_id: petId,
        vaccine_name: 'Fallback Vaccine',
        administered_date: '2026-05-10',
        next_due_date: '2027-05-10',
        vet_name: 'Fallback Clinic'
      }
    });

    const created = await createRes.json();
    createdVaccineId = created[0].id;
    return createdVaccineId!;
  }

  // 1. POST — Создает новую запись
  test('POST /rest/v1/vaccinations — создание записи', async ({ request }) => {
    const getPetRes = await request.get(`${SUPABASE_URL}/rest/v1/pets?select=id&limit=1`, { headers: authHeaders });
    const pets = await getPetRes.json();
    const petId = pets[0]?.id;

    const response = await request.post(`${SUPABASE_URL}/rest/v1/vaccinations`, {
      headers: authHeaders,
      data: {
        pet_id: petId,
        vaccine_name: 'Nobivac Tricat AutoTest',
        administered_date: '2026-05-10',
        next_due_date: '2027-05-10',
        vet_name: 'Клиника "Айболит"',
        remind_days_before: 7
      }
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.length).toBeGreaterThan(0);
    createdVaccineId = body[0].id;
  });

  // 2. GET — Можно нажимать сразу, берет запись из БД
  test('GET /rest/v1/vaccinations — получение записи', async ({ request }) => {
    const vaccineId = await ensureVaccineId(request);

    const response = await request.get(`${SUPABASE_URL}/rest/v1/vaccinations?id=eq.${vaccineId}`, {
      headers: authHeaders
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.length).toBe(1);
    expect(body[0].id).toBe(vaccineId);
  });

  // 3. PATCH — Можно нажимать сразу, обновляет найденную или созданную запись
  test('PATCH /rest/v1/vaccinations — обновление названия клиники и вакцины', async ({ request }) => {
    const vaccineId = await ensureVaccineId(request);

    const response = await request.patch(`${SUPABASE_URL}/rest/v1/vaccinations?id=eq.${vaccineId}`, {
      headers: authHeaders,
      data: {
        vaccine_name: 'Nobivac DHPPi (Updated)',
        vet_name: 'Центральная Ветклиника'
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.length).toBe(1);
    expect(body[0].vet_name).toBe('Центральная Ветклиника');
  });

  // 4. DELETE — Удаляет текущую запись
  test('DELETE /rest/v1/vaccinations — удаление записи по ID', async ({ request }) => {
    const vaccineId = await ensureVaccineId(request);

    const deleteResponse = await request.delete(`${SUPABASE_URL}/rest/v1/vaccinations?id=eq.${vaccineId}`, {
      headers: authHeaders
    });

    expect(deleteResponse.status()).toBe(200);

    // Сбрасываем сохраненный ID после удаления
    createdVaccineId = null;
  });
});