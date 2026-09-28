"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  clearMedicationDose,
  deleteMedication as deleteMedicationRecord,
  deleteVaccination,
  fetchCareLists,
  insertMedication,
  insertVaccination,
  logMedicationDose,
  updatePetRecord,
  type NewMedication,
  type NewVaccine,
} from "@/src/petCareApi"
import { todayISO } from "./dates"
import type { DoseStatus, Medication, Pet, ReminderSettings, Vaccine } from "./types"

type PetCareContextValue = {
  loading: boolean
  error: string | null
  pet: Pet
  updatePet: (pet: Pet) => Promise<void>
  medications: Medication[]
  addMedication: (medication: NewMedication) => Promise<void>
  removeMedication: (id: string) => Promise<void>
  logDose: (id: string, status: DoseStatus) => Promise<void>
  clearDose: (id: string) => Promise<void>
  vaccines: Vaccine[]
  addVaccine: (vaccine: NewVaccine) => Promise<void>
  removeVaccine: (id: string) => Promise<void>
  reminders: ReminderSettings
  updateReminders: (settings: ReminderSettings) => void
}

const PetCareContext = createContext<PetCareContextValue | null>(null)

const emptyPet = (): Pet => ({
  id: "",
  name: "New pet",
  species: "Dog",
  breed: "",
  gender: "Male",
  birthdate: todayISO(),
  weight: 0,
  weightUnit: "kg",
  avatarUrl: null,
})

function replaceById<T extends { id: string }>(items: T[], next: T) {
  return items.map((item) => (item.id === next.id ? next : item))
}

export function PetCareProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pet, setPet] = useState<Pet>(emptyPet)
  const [medications, setMedications] = useState<Medication[]>([])
  const [vaccines, setVaccines] = useState<Vaccine[]>([])
  const [reminders, setReminders] = useState<ReminderSettings>({
    enabled: true,
    leadDays: { 30: true, 7: true, 1: false },
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const lists = await fetchCareLists()
        if (cancelled) return
        setPet(lists.pets[0] ?? emptyPet())
        setMedications(lists.medications)
        setVaccines(lists.vaccines)
        setError(null)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load pet care data")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const ensureSavedPet = useCallback(async (current: Pet) => {
    if (current.id) return current
    const saved = await updatePetRecord(current)
    setPet(saved)
    return saved
  }, [])

  const updatePet = useCallback(async (next: Pet) => {
    const saved = await updatePetRecord({ ...next, id: next.id || pet.id })
    setPet(saved)
  }, [pet.id])

  const addMedication = useCallback(
    async (medication: NewMedication) => {
      const owner = await ensureSavedPet(pet)
      const saved = await insertMedication(owner.id, medication)
      setMedications((prev) => [...prev, saved])
    },
    [ensureSavedPet, pet],
  )

  const removeMedication = useCallback(async (id: string) => {
    await deleteMedicationRecord(id)
    setMedications((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const logDose = useCallback(async (id: string, status: DoseStatus) => {
    const saved = await logMedicationDose(id, status)
    setMedications((prev) => replaceById(prev, saved))
  }, [])

  const clearDose = useCallback(async (id: string) => {
    const saved = await clearMedicationDose(id)
    setMedications((prev) => replaceById(prev, saved))
  }, [])

  const addVaccine = useCallback(
    async (vaccine: NewVaccine) => {
      const owner = await ensureSavedPet(pet)
      const saved = await insertVaccination(owner.id, vaccine)
      setVaccines((prev) => [...prev, saved])
    },
    [ensureSavedPet, pet],
  )

  const removeVaccine = useCallback(async (id: string) => {
    await deleteVaccination(id)
    setVaccines((prev) => prev.filter((v) => v.id !== id))
  }, [])

  const value = useMemo<PetCareContextValue>(
    () => ({
      loading,
      error,
      pet,
      updatePet,
      medications,
      addMedication,
      removeMedication,
      logDose,
      clearDose,
      vaccines,
      addVaccine,
      removeVaccine,
      reminders,
      updateReminders: setReminders,
    }),
    [
      loading,
      error,
      pet,
      medications,
      vaccines,
      reminders,
      updatePet,
      addMedication,
      removeMedication,
      logDose,
      clearDose,
      addVaccine,
      removeVaccine,
    ],
  )

  return <PetCareContext.Provider value={value}>{children}</PetCareContext.Provider>
}

export function usePetCare() {
  const ctx = useContext(PetCareContext)
  if (!ctx) throw new Error("usePetCare must be used within PetCareProvider")
  return ctx
}

export function getTodayLog(medication: Medication) {
  return medication.lastLog?.date === todayISO() ? medication.lastLog : null
}
