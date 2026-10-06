"use client"

import { useState } from "react"
import { PawPrint, Pill, Syringe, Scissors, X, BellRing } from "lucide-react"
import { getVaccineStatus } from "@/lib/petcare/dates"
import { PetCareProvider, usePetCare } from "@/lib/petcare/store"
import { AppHeader } from "./app-header"
import { MedicationPanel } from "./medications/medication-panel"
import { PetProfileCard } from "./profile/pet-profile-card"
import { SummaryStrip } from "./summary-strip"
import { VaccinationPanel } from "./vaccinations/vaccination-panel"
import {GroomingPanel} from "./grooming/grooming-panel"
import { ReminderCard } from "./reminders/reminder-card"

export function PetCareApp() {
  return (
    <PetCareProvider>
      <PetCareShell />
    </PetCareProvider>
  )
}

function PetCareShell() {
  const { loading, error, addPet } = usePetCare()
  
  const [isAddPetOpen, setIsAddPetOpen] = useState(false)
  const [newPetName, setNewPetName] = useState("")
  const [newPetSpecies, setNewPetSpecies] = useState("Dog")

  const handleAddPetClick = () => {
    setIsAddPetOpen(true)
  }

  const handleSaveNewPet = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPetName.trim()) return

    try {
      await addPet({
        name: newPetName,
        species: newPetSpecies,
      })
      setIsAddPetOpen(false)
      setNewPetName("")
    } catch (err) {
      console.error("Failed to add pet:", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-background" aria-busy="true">
        <div className="h-16 border-b bg-card" />
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-10 md:px-6">
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-muted" />
          <div className="grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background relative">
      <AppHeader onAddPetClick={handleAddPetClick} />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-6 md:py-10">
        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Could not load data from Supabase: {error}
          </p>
        )}
        <SummaryStrip />
        <ModuleTabs />
      </main>

      {/* Модальное окно создания питомца */}
      {isAddPetOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="relative z-[101] w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <PawPrint className="w-5 h-5 text-sky-500" />
                Add New Pet
              </h3>
              <button 
                type="button"
                onClick={() => setIsAddPetOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewPet} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Pet Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newPetName}
                  onChange={(e) => setNewPetName(e.target.value)}
                  placeholder="Enter pet name..."
                  className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500 relative z-[102]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Species
                </label>
                <select
                  value={newPetSpecies}
                  onChange={(e) => setNewPetSpecies(e.target.value)}
                  className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer relative z-[102]"
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPetOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00bfff] hover:bg-[#0099cc] text-white font-medium text-sm px-4 py-2 rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  Save Pet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function ModuleTabs() {
  const { medications, vaccines, grooming, pet } = usePetCare()
  const currentPetId = pet?.id
  const [activeTab, setActiveTab] = useState("profile")
  // Считаем лекарства строго для текущего питомца по pet_id
const petMedications = medications.filter((m: any) => {
    const itemPetId = String(m.pet_id ?? m.petId ?? "").trim();
    const activeId = String(currentPetId ?? pet?.id ?? "").trim();
    
    // Если у питомца еще не задан ID (новый питомец), показываем пустой список или по совпадению
    if (!activeId) return false;
    return itemPetId === activeId;
  });

  // Считаем вакцины строго для текущего питомца по pet_id
  const petVaccines = vaccines.filter((v: any) => {
    const itemPetId = v.pet_id ?? v.petId;
    return itemPetId != null && String(itemPetId).trim() === String(currentPetId).trim();
  });

  const hasOverdue = petVaccines.some((v) => getVaccineStatus(v.nextDueDate).tone === "overdue")

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Кнопки вкладок со счетчиками */}
      <div className="flex flex-wrap items-center gap-2 bg-card border border-border p-1.5 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "profile" ? "bg-muted text-foreground font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <PawPrint aria-hidden="true" className="w-4 h-4" />
          Profile
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("medications")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "medications" ? "bg-muted text-foreground font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Pill aria-hidden="true" className="w-4 h-4" />
          Medications
          <span className="rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-xs tabular-nums text-foreground">
            {petMedications.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("vaccinations")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "vaccinations" ? "bg-muted text-foreground font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Syringe aria-hidden="true" className="w-4 h-4" />
          Vaccines
          <span className="rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-xs tabular-nums text-foreground">
            {petVaccines.length}
          </span>
          {hasOverdue && (
            <span className="size-2 rounded-full bg-destructive inline-block ml-1" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("grooming")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "grooming" ? "bg-muted text-foreground font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Scissors aria-hidden="true" className="w-4 h-4 mr-1" />
          Grooming
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reminders")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "reminders" ? "bg-muted text-foreground font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BellRing aria-hidden="true" className="w-4 h-4 mr-1" />
          Reminders
        </button>
      </div>

      {/* Панель содержимого */}
      <div className="w-full">
        {activeTab === "profile" && <PetProfileCard petId={currentPetId} />}
        {activeTab === "medications" && <MedicationPanel petId={currentPetId} />}
        {activeTab === "vaccinations" && <VaccinationPanel petId={currentPetId} />}
        {activeTab === "grooming" && <GroomingPanel petId={currentPetId} />}
        {activeTab === "reminders" && <ReminderCard petId={currentPetId} />}
      </div>
    </div>
  )
}