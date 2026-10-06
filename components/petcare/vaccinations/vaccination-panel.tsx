"use client"

import { Stethoscope, Syringe, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/petcare/dates"
import { usePetCare } from "@/lib/petcare/store"
import { AddVaccineDialog } from "./add-vaccine-dialog"
import { VaccineStatusBadge } from "./vaccine-status-badge"

interface VaccinationPanelProps {
  petId?: string | number | null;
}

export function VaccinationPanel({ petId: propPetId }: VaccinationPanelProps) {
  const { vaccines, removeVaccine, pet: currentPet } = usePetCare()
  
  const petId = propPetId !== undefined ? propPetId : currentPet?.id

  // 🔍 Надежная фильтрация вакцин по ID текущего питомца
  const petVaccines = petId != null 
    ? vaccines.filter((v: any) => {
        const itemPetId = v.pet_id ?? v.petId ?? v.pet_uuid;
        return itemPetId != null && String(itemPetId).trim() === String(petId).trim();
      })
    : []

  const sorted = [...petVaccines].sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate))

  return (
    <div className="w-full">
      <section aria-labelledby="vax-heading" className="min-w-0 rounded-xl border border-border bg-card text-card-foreground shadow-sm w-full">
        <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div>
            <h2 id="vax-heading" className="text-lg font-semibold tracking-tight text-foreground">
              Vaccination records
            </h2>
            <p className="text-sm text-muted-foreground">Sorted by next due date.</p>
          </div>
          <div className="[&>button]:bg-[#00bfff] [&>button]:text-white [&>button]:hover:bg-[#0099cc]">
            <AddVaccineDialog petId={petId} />
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-muted">
              <Syringe className="size-5 text-muted-foreground" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium text-foreground">No vaccines recorded</p>
            <p className="text-sm text-muted-foreground">Add a vaccine record to get due-date reminders.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="hidden md:table-header-group">
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th scope="col" className="px-6 py-3 font-medium">Vaccine</th>
                  <th scope="col" className="px-3 py-3 font-medium">Administered</th>
                  <th scope="col" className="px-3 py-3 font-medium">Next due</th>
                  <th scope="col" className="px-3 py-3 font-medium">Status</th>
                  <th scope="col" className="py-3 pr-4"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sorted.map((v) => (
                  <tr key={v.id} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 p-5 md:table-row md:p-0">
                    <td className="md:px-6 md:py-4">
                      <p className="font-medium text-foreground">{v.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Stethoscope className="size-3" aria-hidden="true" />
                        {v.vetName}
                      </p>
                    </td>
                    <td className="col-start-1 text-muted-foreground md:px-3 md:py-4">
                      <span className="text-xs md:hidden">Given </span>
                      {formatDate(v.administeredDate)}
                    </td>
                    <td className="col-start-1 font-medium text-foreground md:px-3 md:py-4">
                      <span className="text-xs font-normal text-muted-foreground md:hidden">Due </span>
                      {formatDate(v.nextDueDate)}
                    </td>
                    <td className="col-start-2 row-start-1 md:px-3 md:py-4">
                      <VaccineStatusBadge nextDueDate={v.nextDueDate} />
                    </td>
                    <td className="col-start-2 row-span-2 row-start-2 self-end justify-self-end md:py-4 md:pr-4">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => removeVaccine(v.id)}
                        aria-label={`Remove ${v.name}`}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}