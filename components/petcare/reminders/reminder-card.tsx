"use client"

import { BellOff, BellRing } from "lucide-react"
import { addDays, parseISODate, startOfToday, toISODate } from "@/lib/petcare/dates"
import { usePetCare } from "@/lib/petcare/store"
import type { ReminderLeadDay } from "@/lib/petcare/types"
import { ReminderSettingsDialog } from "./reminder-settings-dialog"

const LEADS: ReminderLeadDay[] = [30, 7, 1]

export function ReminderCard() {
  const { vaccines, reminders } = usePetCare()
  const today = startOfToday().getTime()

  const upcoming = reminders.enabled
    ? vaccines
        .flatMap((v) =>
          LEADS.filter((d) => reminders.leadDays[d]).map((lead) => ({
            key: `${v.id}-${lead}`,
            vaccine: v.name,
            lead,
            date: addDays(parseISODate(v.nextDueDate), -lead),
          })),
        )
        .filter((r) => r.date.getTime() >= today)
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 4)
    : []

  return (
    <aside aria-labelledby="reminders-heading" className="flex flex-col rounded-xl border bg-card">
      <div className="flex items-start justify-between gap-3 border-b p-5">
        <div>
          <h2 id="reminders-heading" className="flex items-center gap-2 font-semibold tracking-tight">
            {reminders.enabled ? (
              <BellRing className="size-4" aria-hidden="true" />
            ) : (
              <BellOff className="size-4 text-muted-foreground" aria-hidden="true" />
            )}
            Reminders
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{reminders.enabled ? "Active" : "Paused"}</p>
        </div>
        <ReminderSettingsDialog />
      </div>

      <div className="flex flex-wrap gap-1.5 px-5 pt-4">
        {LEADS.map((d) => {
          const on = reminders.enabled && reminders.leadDays[d]
          return (
            <span
              key={d}
              className={
                on
                  ? "rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground"
                  : "rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground line-through"
              }
            >
              {d === 1 ? "1 day" : `${d} days`} before
            </span>
          )
        })}
      </div>

      <div className="flex-1 p-5">
        <h3 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">Upcoming</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {reminders.enabled ? "No reminders scheduled." : "Turn reminders on to get notified."}
          </p>
        ) : (
          <ol className="flex flex-col gap-3">
            {upcoming.map((r) => {
              const isToday = toISODate(r.date) === toISODate(startOfToday())
              return (
                <li key={r.key} className="flex items-center gap-3">
                  <time
                    dateTime={toISODate(r.date)}
                    className="flex w-11 shrink-0 flex-col items-center rounded-md border py-1 leading-none"
                  >
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {r.date.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="mt-0.5 text-sm font-semibold tabular-nums">{r.date.getDate()}</span>
                  </time>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.vaccine}</p>
                    <p className="text-xs text-muted-foreground">
                      {isToday ? "Today · " : ""}
                      {r.lead === 1 ? "1 day" : `${r.lead} days`} before due
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </aside>
  )
}
