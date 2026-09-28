const DAY_MS = 86_400_000

export function toISODate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function parseISODate(value: string) {
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function todayISO() {
  return toISODate(startOfToday())
}

export function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function isoFromToday(days: number) {
  return toISODate(addDays(startOfToday(), days))
}

export function daysUntil(value: string) {
  return Math.round((parseISODate(value).getTime() - startOfToday().getTime()) / DAY_MS)
}

export function formatDate(value: string) {
  return parseISODate(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatTime(isoDateTime: string) {
  return new Date(isoDateTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

export function getAge(birthdate: string) {
  const birth = parseISODate(birthdate)
  const today = startOfToday()
  let months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())
  if (today.getDate() < birth.getDate()) months -= 1
  if (months < 0) return "Not born yet"
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (years === 0) return `${rest} mo${rest === 1 ? "" : "s"}`
  if (rest === 0) return `${years} yr${years === 1 ? "" : "s"}`
  return `${years} yr${years === 1 ? "" : "s"} ${rest} mo${rest === 1 ? "" : "s"}`
}

export type VaccineTone = "overdue" | "due-soon" | "ok"

export function getVaccineStatus(nextDueDate: string): { tone: VaccineTone; label: string; days: number } {
  const days = daysUntil(nextDueDate)
  if (days < 0) {
    const overdue = Math.abs(days)
    return { tone: "overdue", days, label: `Overdue by ${overdue} day${overdue === 1 ? "" : "s"}` }
  }
  if (days === 0) return { tone: "due-soon", days, label: "Due today" }
  if (days <= 30) return { tone: "due-soon", days, label: `Due in ${days} day${days === 1 ? "" : "s"}` }
  return { tone: "ok", days, label: "Up to date" }
}
