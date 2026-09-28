import type { DoseStatus, Medication, Pet, Vaccine, WeightUnit } from "@/lib/petcare/types"
import { supabase } from "./supabaseClient"

export type NewMedication = Omit<Medication, "id" | "lastLog">
export type NewVaccine = Omit<Vaccine, "id">
export type PetInput = Omit<Pet, "id"> & { id?: string }

type PetRow = {
  id: string
  name: string
  species: string | null
  breed: string | null
  gender: string | null
  birthdate: string | null
  weight: number | string | null
  avatar_url: string | null
}

type MedicationRow = {
  id: string
  pet_id: string | null
  name: string
  dosage: string
  frequency: string | null
  status: string | null
  logged_at: string | null
  created_at: string | null
}

type VaccinationRow = {
  id: string
  pet_id: string | null
  vaccine_name: string
  administered_date: string
  vet_name: string | null
  next_due_date: string
  remind_days_before: number | null
}

async function unwrap<T>(result: { data: T; error: { message: string } | null }): Promise<T> {
  if (result.error) throw new Error(result.error.message)
  return result.data
}

function asGender(value: string | null): Pet["gender"] {
  return value === "Female" ? "Female" : "Male"
}

function asDoseStatus(value: string | null): DoseStatus | null {
  if (value === "given" || value === "skipped" || value === "missed") return value
  return null
}

function datePart(iso: string | null | undefined, fallback: string) {
  return iso?.slice(0, 10) || fallback
}

export function mapPet(row: PetRow): Pet {
  const weight = Number(row.weight)
  return {
    id: row.id,
    name: row.name,
    species: row.species ?? "",
    breed: row.breed ?? "",
    gender: asGender(row.gender),
    birthdate: datePart(row.birthdate, "2020-01-01"),
    weight: Number.isFinite(weight) ? weight : 0,
    weightUnit: "kg" as WeightUnit,
    avatarUrl: row.avatar_url,
  }
}

export function mapMedication(row: MedicationRow): Medication {
  const status = asDoseStatus(row.status)
  return {
    id: row.id,
    name: row.name,
    dosage: row.dosage,
    frequency: row.frequency ?? "Once daily",
    startDate: datePart(row.created_at, datePart(row.logged_at, new Date().toISOString())),
    endDate: null,
    lastLog:
      status && row.logged_at
        ? { status, date: datePart(row.logged_at, ""), time: row.logged_at }
        : null,
  }
}

export function mapVaccine(row: VaccinationRow): Vaccine {
  return {
    id: row.id,
    name: row.vaccine_name,
    administeredDate: datePart(row.administered_date, ""),
    vetName: row.vet_name ?? "",
    nextDueDate: datePart(row.next_due_date, ""),
  }
}

export async function fetchPets(): Promise<Pet[]> {
  const data = await unwrap(
    await supabase.from("pets").select("*").order("created_at", { ascending: true }),
  )
  return ((data ?? []) as PetRow[]).map(mapPet)
}

export async function fetchMedications(): Promise<Medication[]> {
  const data = await unwrap(
    await supabase.from("medications").select("*").order("created_at", { ascending: true }),
  )
  return ((data ?? []) as MedicationRow[]).map(mapMedication)
}

export async function fetchVaccinations(): Promise<Vaccine[]> {
  const data = await unwrap(
    await supabase.from("vaccinations").select("*").order("created_at", { ascending: true }),
  )
  return ((data ?? []) as VaccinationRow[]).map(mapVaccine)
}

export async function fetchCareLists() {
  const [pets, medications, vaccines] = await Promise.all([
    fetchPets(),
    fetchMedications(),
    fetchVaccinations(),
  ])
  return { pets, medications, vaccines }
}

export async function insertPet(pet: PetInput): Promise<Pet> {
  const data = await unwrap(
    await supabase
      .from("pets")
      .insert({
        name: pet.name,
        species: pet.species,
        breed: pet.breed || null,
        gender: pet.gender,
        birthdate: pet.birthdate || null,
        weight: pet.weight,
        avatar_url: pet.avatarUrl,
      })
      .select("*")
      .single(),
  )
  return mapPet(data as PetRow)
}

export async function updatePetRecord(pet: Pet): Promise<Pet> {
  if (!pet.id) return insertPet(pet)

  const data = await unwrap(
    await supabase
      .from("pets")
      .update({
        name: pet.name,
        species: pet.species,
        breed: pet.breed || null,
        gender: pet.gender,
        birthdate: pet.birthdate || null,
        weight: pet.weight,
        avatar_url: pet.avatarUrl,
      })
      .eq("id", pet.id)
      .select("*")
      .single(),
  )
  return mapPet(data as PetRow)
}

export async function insertMedication(petId: string, medication: NewMedication): Promise<Medication> {
  const data = await unwrap(
    await supabase
      .from("medications")
      .insert({
        pet_id: petId,
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        status: "pending",
        logged_at: null,
      })
      .select("*")
      .single(),
  )
  return mapMedication(data as MedicationRow)
}

export async function logMedicationDose(id: string, status: DoseStatus): Promise<Medication> {
  const data = await unwrap(
    await supabase
      .from("medications")
      .update({ status, logged_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single(),
  )
  return mapMedication(data as MedicationRow)
}

export async function clearMedicationDose(id: string): Promise<Medication> {
  const data = await unwrap(
    await supabase
      .from("medications")
      .update({ status: "pending", logged_at: null })
      .eq("id", id)
      .select("*")
      .single(),
  )
  return mapMedication(data as MedicationRow)
}

export async function deleteMedication(id: string): Promise<void> {
  await unwrap(await supabase.from("medications").delete().eq("id", id))
}

export async function insertVaccination(petId: string, vaccine: NewVaccine): Promise<Vaccine> {
  const data = await unwrap(
    await supabase
      .from("vaccinations")
      .insert({
        pet_id: petId,
        vaccine_name: vaccine.name,
        administered_date: vaccine.administeredDate,
        vet_name: vaccine.vetName,
        next_due_date: vaccine.nextDueDate,
      })
      .select("*")
      .single(),
  )
  return mapVaccine(data as VaccinationRow)
}

export async function deleteVaccination(id: string): Promise<void> {
  await unwrap(await supabase.from("vaccinations").delete().eq("id", id))
}
