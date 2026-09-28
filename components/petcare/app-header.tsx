"use client"

import { PawPrint } from "lucide-react"
import { usePetCare } from "@/lib/petcare/store"

export function AppHeader() {
  const { pet } = usePetCare()
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <header className="border-b bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <PawPrint className="size-4" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold tracking-tight">PetCare Tracker</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-muted-foreground sm:inline">{today}</span>
          <span className="hidden h-4 w-px bg-border sm:inline-block" aria-hidden="true" />
          <span className="flex items-center gap-2 font-medium">
            {pet.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pet.avatarUrl} alt="" className="size-7 rounded-full object-cover ring-1 ring-border" />
            ) : (
              <span className="flex size-7 items-center justify-center rounded-full bg-muted">
                <PawPrint className="size-3.5 text-muted-foreground" aria-hidden="true" />
              </span>
            )}
            {pet.name}
          </span>
        </div>
      </div>
    </header>
  )
}
