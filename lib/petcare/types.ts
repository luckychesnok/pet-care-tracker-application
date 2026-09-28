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
