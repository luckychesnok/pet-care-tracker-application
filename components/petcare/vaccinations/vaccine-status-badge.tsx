import { CircleAlert, CircleCheck, Clock } from "lucide-react"
import { getVaccineStatus } from "@/lib/petcare/dates"
import { cn } from "@/lib/utils"

export function VaccineStatusBadge({ nextDueDate }: { nextDueDate: string }) {
  const status = getVaccineStatus(nextDueDate)
  const Icon = status.tone === "overdue" ? CircleAlert : status.tone === "due-soon" ? Clock : CircleCheck

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        status.tone === "overdue" && "bg-destructive/10 text-destructive",
        status.tone === "due-soon" && "bg-warning/15 text-warning",
        status.tone === "ok" && "bg-success/10 text-success",
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {status.label}
    </span>
  )
}
