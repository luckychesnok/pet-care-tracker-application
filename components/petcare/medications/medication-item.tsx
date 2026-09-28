"use client"

import { CalendarRange, Check, CircleAlert, Clock, Pill, SkipForward, Trash2, Undo2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, formatTime } from "@/lib/petcare/dates"
import { getTodayLog, usePetCare } from "@/lib/petcare/store"
import type { DoseStatus, Medication } from "@/lib/petcare/types"
import { cn } from "@/lib/utils"

const statusMeta: Record<DoseStatus, { label: string; icon: typeof Check; className: string }> = {
  given: { label: "Given", icon: Check, className: "bg-success/10 text-success" },
  skipped: { label: "Skipped", icon: SkipForward, className: "bg-muted text-muted-foreground" },
  missed: { label: "Missed", icon: CircleAlert, className: "bg-destructive/10 text-destructive" },
}

export function MedicationItem({ medication }: { medication: Medication }) {
  const { logDose, clearDose, removeMedication } = usePetCare()
  const todayLog = getTodayLog(medication)
  const meta = todayLog ? statusMeta[todayLog.status] : null

  return (
    <li className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:gap-6 md:px-6">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
            meta ? meta.className : "bg-muted text-foreground",
          )}
        >
          <Pill className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{medication.name}</h3>
            <Badge variant="outline" className="font-normal">
              {medication.frequency}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{medication.dosage}</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarRange className="size-3.5" aria-hidden="true" />
            {formatDate(medication.startDate)} – {medication.endDate ? formatDate(medication.endDate) : "Ongoing"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        {todayLog && meta ? (
          <>
            <span
              className={cn("inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium", meta.className)}
              aria-live="polite"
            >
              <meta.icon className="size-4" aria-hidden="true" />
              {meta.label}
              <span className="flex items-center gap-1 font-normal opacity-80">
                <Clock className="size-3" aria-hidden="true" />
                {formatTime(todayLog.time)}
              </span>
            </span>
            <Button variant="ghost" size="sm" onClick={() => clearDose(medication.id)}>
              <Undo2 data-icon="inline-start" aria-hidden="true" />
              Undo
            </Button>
          </>
        ) : (
          <div role="group" aria-label={`Log today's dose of ${medication.name}`} className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => logDose(medication.id, "given")}>
              <Check data-icon="inline-start" aria-hidden="true" />
              Mark as Given
            </Button>
            <Button size="sm" variant="outline" onClick={() => logDose(medication.id, "skipped")}>
              <SkipForward data-icon="inline-start" aria-hidden="true" />
              Skipped
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => logDose(medication.id, "missed")}
            >
              <CircleAlert data-icon="inline-start" aria-hidden="true" />
              Missed
            </Button>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          onClick={() => removeMedication(medication.id)}
          aria-label={`Remove ${medication.name}`}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    </li>
  )
}
