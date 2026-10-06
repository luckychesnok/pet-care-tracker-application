"use client"

import { Pill } from "lucide-react"
import { getTodayLog, usePetCare } from "@/lib/petcare/store"
import { AddMedicationDialog } from "./add-medication-dialog"
import { MedicationItem } from "./medication-item"

interface MedicationPanelProps {
  petId?: string | number | null;
}

export function MedicationPanel({ petId: propPetId }: MedicationPanelProps) {
  const { medications, pet: currentPet } = usePetCare()
  
  const petId = propPetId !== undefined ? propPetId : currentPet?.id

  // 🎯 Универсальная фильтрация с проверкой всех возможных вариантов ключа связи
  const petMedications = petId != null
    ? medications.filter((m: any) => {
        const itemPetId = m.pet_id ?? m.petId ?? m.pet_uuid ?? m.pet?.id;
        return itemPetId != null && String(itemPetId).trim() === String(petId).trim();
      })
    : []

  const pending = petMedications.filter((m) => !getTodayLog(m)).length

  return (
    <div className="w-full">
      <section aria-labelledby="meds-heading" className="rounded-xl border border-border bg-card text-card-foreground w-full shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div>
            <h2 id="meds-heading" className="text-lg font-semibold tracking-tight text-foreground">
              Active medications
            </h2>
            <p className="text-sm text-muted-foreground">
              {petMedications.length === 0
                ? "Nothing scheduled yet."
                : pending === 0
                  ? "All doses logged for today."
                  : `${pending} dose${pending === 1 ? "" : "s"} still to log today.`}
            </p>
          </div>
          <div className="[&>button]:bg-[#00bfff] [&>button]:text-white [&>button]:hover:bg-[#0099cc]">
            <AddMedicationDialog petId={petId} />
          </div>
        </div>

        {petMedications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-muted">
              <Pill className="size-5 text-muted-foreground" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium text-foreground">No active medications</p>
            <p className="text-sm text-muted-foreground">Add a medication to start tracking daily doses.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {petMedications.map((m) => (
              <MedicationItem key={m.id} medication={m} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}