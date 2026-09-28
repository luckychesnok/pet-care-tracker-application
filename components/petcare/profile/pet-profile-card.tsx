"use client"

import { Cake, Dna, Mars, PawPrint, Scale, Venus } from "lucide-react"
import { formatDate, getAge } from "@/lib/petcare/dates"
import { usePetCare } from "@/lib/petcare/store"
import { EditProfileDialog } from "./edit-profile-dialog"
import { PetAvatar } from "./pet-avatar"

export function PetProfileCard() {
  const { pet } = usePetCare()

  const details = [
    { icon: PawPrint, label: "Species", value: pet.species },
    { icon: Dna, label: "Breed", value: pet.breed },
    { icon: pet.gender === "Male" ? Mars : Venus, label: "Gender", value: pet.gender },
    { icon: Cake, label: "Birthdate", value: formatDate(pet.birthdate), hint: getAge(pet.birthdate) },
    { icon: Scale, label: "Weight", value: `${pet.weight} ${pet.weightUnit}` },
  ]

  return (
    <section aria-labelledby="profile-heading" className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center md:p-6">
        <PetAvatar src={pet.avatarUrl} name={pet.name} className="size-24 md:size-28" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Pet profile</p>
          <h2 id="profile-heading" className="truncate text-2xl font-semibold tracking-tight md:text-3xl">
            {pet.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {pet.breed} · {getAge(pet.birthdate)} old
          </p>
        </div>
        <EditProfileDialog />
      </div>

      <dl className="grid grid-cols-2 border-t md:grid-cols-5">
        {details.map(({ icon: Icon, label, value, hint }, i) => (
          <div
            key={label}
            className={`flex flex-col gap-1.5 p-4 md:p-5 ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t md:border-t-0" : ""} md:border-l md:first:border-l-0`}
          >
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="size-3.5" aria-hidden="true" />
              {label}
            </dt>
            <dd className="text-sm font-medium">
              {value}
              {hint && <span className="block text-xs font-normal text-muted-foreground">{hint}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
