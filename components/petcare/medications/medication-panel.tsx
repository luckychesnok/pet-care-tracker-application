"use client"

import { Pill } from "lucide-react"
import { getTodayLog, usePetCare } from "@/lib/petcare/store"
import { AddMedicationDialog } from "./add-medication-dialog"
import { MedicationItem } from "./medication-item"

export function MedicationPanel() {
  const { medications } = usePetCare()
  const pending = medications.filter((m) => !getTodayLog(m)).length

  return (
    <section aria-labelledby="meds-heading" className="rounded-xl border bg-card">
      <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
        <div>
          <h2 id="meds-heading" className="text-lg font-semibold tracking-tight">
            Active medications
          </h2>
          <p className="text-sm text-muted-foreground">
            {medications.length === 0
              ? "Nothing scheduled yet."
              : pending === 0
                ? "All doses logged for today."
                : `${pending} dose${pending === 1 ? "" : "s"} still to log today.`}
          </p>
        </div>
        <AddMedicationDialog />
      </div>

      {medications.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-muted">
            <Pill className="size-5 text-muted-foreground" aria-hidden="true" />
          </span>
          <p className="text-sm font-medium">No active medications</p>
          <p className="text-sm text-muted-foreground">Add a medication to start tracking daily doses.</p>
        </div>
      ) : (
        <ul className="divide-y">
          {medications.map((m) => (
            <MedicationItem key={m.id} medication={m} />
          ))}
        </ul>
      )}
    </section>
  )
}
