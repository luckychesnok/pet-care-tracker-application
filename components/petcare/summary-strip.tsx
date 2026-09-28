"use client"

import { BellRing, Pill, Syringe } from "lucide-react"
import { getVaccineStatus } from "@/lib/petcare/dates"
import { getTodayLog, usePetCare } from "@/lib/petcare/store"
import { cn } from "@/lib/utils"

export function SummaryStrip() {
  const { pet, medications, vaccines, reminders } = usePetCare()

  const logged = medications.filter((m) => getTodayLog(m)).length
  const given = medications.filter((m) => getTodayLog(m)?.status === "given").length
  const progress = medications.length ? Math.round((logged / medications.length) * 100) : 0

  const nextVaccine = [...vaccines].sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate))[0]
  const nextStatus = nextVaccine ? getVaccineStatus(nextVaccine.nextDueDate) : null
  const activeLeads = ([30, 7, 1] as const).filter((d) => reminders.leadDays[d])

  return (
    <section aria-label="Today at a glance" className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance md:text-3xl">
          {"Good to see you — here's "}
          {pet.name}
          {"'s day."}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track doses, keep vaccines current, and update the profile as things change.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={Pill} label="Doses logged today">
          <p className="text-2xl font-semibold tabular-nums">
            {logged}
            <span className="text-base font-normal text-muted-foreground">/{medications.length}</span>
          </p>
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Doses logged"
          >
            <div className="h-full rounded-full bg-success transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{given} given</p>
        </StatCard>

        <StatCard icon={Syringe} label="Next vaccine">
          {nextVaccine && nextStatus ? (
            <>
              <p className="truncate text-base font-semibold">{nextVaccine.name}</p>
              <p
                className={cn(
                  "mt-1 text-sm font-medium",
                  nextStatus.tone === "overdue" && "text-destructive",
                  nextStatus.tone === "due-soon" && "text-warning",
                  nextStatus.tone === "ok" && "text-success",
                )}
              >
                {nextStatus.tone === "ok" ? `Due in ${nextStatus.days} days` : nextStatus.label}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No vaccines recorded</p>
          )}
        </StatCard>

        <StatCard icon={BellRing} label="Reminders">
          <p className="text-base font-semibold">{reminders.enabled ? "On" : "Paused"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {reminders.enabled && activeLeads.length
              ? `${activeLeads.map((d) => `${d}d`).join(", ")} before due`
              : "No reminders scheduled"}
          </p>
        </StatCard>
      </div>
    </section>
  )
}

function StatCard({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </div>
      {children}
    </div>
  )
}
