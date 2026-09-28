"use client"

import { PawPrint, Pill, Syringe } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getVaccineStatus } from "@/lib/petcare/dates"
import { PetCareProvider, usePetCare } from "@/lib/petcare/store"
import { AppHeader } from "./app-header"
import { MedicationPanel } from "./medications/medication-panel"
import { PetProfileCard } from "./profile/pet-profile-card"
import { SummaryStrip } from "./summary-strip"
import { VaccinationPanel } from "./vaccinations/vaccination-panel"

export function PetCareApp() {
  return (
    <PetCareProvider>
      <PetCareShell />
    </PetCareProvider>
  )
}

function PetCareShell() {
  const { loading, error } = usePetCare()

  if (loading) {
    return (
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
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-6 md:py-10">
        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Could not load data from Supabase: {error}
          </p>
        )}
        <SummaryStrip />
        <ModuleTabs />
      </main>
    </div>
  )
}

function ModuleTabs() {
  const { medications, vaccines } = usePetCare()
  const hasOverdue = vaccines.some((v) => getVaccineStatus(v.nextDueDate).tone === "overdue")

  return (
    <Tabs defaultValue="profile" className="gap-5">
      <TabsList className="h-10 w-full sm:w-fit">
        <TabsTrigger value="profile" className="px-3">
          <PawPrint aria-hidden="true" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="medications" className="px-3">
          <Pill aria-hidden="true" />
          Medications
          <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">
            {medications.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="vaccinations" className="px-3">
          <Syringe aria-hidden="true" />
          Vaccines
          {hasOverdue && (
            <span className="size-1.5 rounded-full bg-destructive">
              <span className="sr-only">(has overdue vaccines)</span>
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <PetProfileCard />
      </TabsContent>
      <TabsContent value="medications">
        <MedicationPanel />
      </TabsContent>
      <TabsContent value="vaccinations">
        <VaccinationPanel />
      </TabsContent>
    </Tabs>
  )
}
