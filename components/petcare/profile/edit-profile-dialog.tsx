"use client"

import { useRef, useState } from "react"
import { Pencil, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { todayISO } from "@/lib/petcare/dates"
import { usePetCare } from "@/lib/petcare/store"
import type { Gender, Pet, WeightUnit } from "@/lib/petcare/types"
import { Field } from "../field"
import { PetAvatar } from "./pet-avatar"

const genderItems = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
]
const unitItems = [
  { value: "kg", label: "kg" },
  { value: "lb", label: "lb" },
]

export function EditProfileDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="self-start sm:self-center" />}>
        <Pencil data-icon="inline-start" aria-hidden="true" />
        Edit profile
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update your pet&apos;s details. Changes apply immediately.</DialogDescription>
        </DialogHeader>
        <ProfileForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function ProfileForm({ onDone }: { onDone: () => void }) {
  const { pet, updatePet } = usePetCare()
  const [draft, setDraft] = useState<Pet>(pet)
  const [weightInput, setWeightInput] = useState(String(pet.weight))
  const fileRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof Pet>(key: K, value: Pet[K]) => setDraft((d) => ({ ...d, [key]: value }))

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) set("avatarUrl", URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const weight = Number.parseFloat(weightInput)
    await updatePet({
      ...draft,
      name: draft.name.trim(),
      species: draft.species.trim(),
      breed: draft.breed.trim(),
      weight: Number.isFinite(weight) && weight > 0 ? Math.round(weight * 10) / 10 : pet.weight,
    })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <PetAvatar src={draft.avatarUrl} name={draft.name} className="size-16" />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload data-icon="inline-start" aria-hidden="true" />
            Upload photo
          </Button>
          {draft.avatarUrl && (
            <Button type="button" variant="ghost" size="sm" onClick={() => set("avatarUrl", null)}>
              <Trash2 data-icon="inline-start" aria-hidden="true" />
              Remove
            </Button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFile}
            aria-label="Upload pet photo"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="pet-name">
          <Input id="pet-name" required value={draft.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Species" htmlFor="pet-species">
          <Input
            id="pet-species"
            required
            placeholder="Dog, Cat, Rabbit…"
            value={draft.species}
            onChange={(e) => set("species", e.target.value)}
          />
        </Field>
        <Field label="Breed" htmlFor="pet-breed">
          <Input id="pet-breed" value={draft.breed} onChange={(e) => set("breed", e.target.value)} />
        </Field>
        <Field label="Gender" htmlFor="pet-gender">
          <Select items={genderItems} value={draft.gender} onValueChange={(v) => v && set("gender", v as Gender)}>
            <SelectTrigger id="pet-gender" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {genderItems.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Birthdate" htmlFor="pet-birthdate">
          <Input
            id="pet-birthdate"
            type="date"
            required
            max={todayISO()}
            value={draft.birthdate}
            onChange={(e) => set("birthdate", e.target.value)}
          />
        </Field>
        <Field label="Weight" htmlFor="pet-weight">
          <div className="flex gap-2">
            <Input
              id="pet-weight"
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.1"
              required
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
            />
            <Select
              items={unitItems}
              value={draft.weightUnit}
              onValueChange={(v) => v && set("weightUnit", v as WeightUnit)}
            >
              <SelectTrigger aria-label="Weight unit" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {unitItems.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Field>
      </div>

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
        <Button type="submit">Save changes</Button>
      </DialogFooter>
    </form>
  )
}
