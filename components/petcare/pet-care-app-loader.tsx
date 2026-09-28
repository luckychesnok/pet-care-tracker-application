"use client"

import dynamic from "next/dynamic"

// Dates and times depend on the viewer's local timezone, so render client-side only to avoid hydration mismatches.
const PetCareApp = dynamic(() => import("./pet-care-app").then((m) => m.PetCareApp), {
  ssr: false,
  loading: () => (
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
  ),
})

export function PetCareAppLoader() {
  return <PetCareApp />
}
