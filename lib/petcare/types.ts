export type Gender = "Male" | "Female"
export type WeightUnit = "kg" | "lb"

export type Pet = {
  id: string
  name: string
  species: string
  breed: string
  gender: Gender
  birthdate: string
  weight: number
  weightUnit: WeightUnit
  avatarUrl: string | null
  // Новые поля для расширенного профиля:
  microchipId?: string
  allergies?: string[]
  chronicConditions?: string[]
  ownerPhone?: string
  ownerEmail?: string
}

export type DoseStatus = "given" | "skipped" | "missed"

export type DoseLog = {
  status: DoseStatus
  date: string
  time: string
}

export type Medication = {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate: string | null
  lastLog: DoseLog | null
}

export type Vaccine = {
  id: string
  name: string
  administeredDate: string
  vetName: string
  nextDueDate: string
}

export type ReminderLeadDay = 30 | 7 | 1

export type ReminderSettings = {
  enabled: boolean
  leadDays: Record<ReminderLeadDay, boolean>
}

// Тип для кормления
export type Feeding = {
  id: string
  petId: string
  foodName: string
  dosage: string
  appetite: 'Отличный' | 'Сниженный' | 'Отказ'
  time: string
}

// Тип для груминга и ухода
export type GroomingRecord = {
  id: string
  petId: string
  title: string
  eventDate: string
  notes: string
}
