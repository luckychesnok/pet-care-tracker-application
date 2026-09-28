"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
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
import { addDays, parseISODate, toISODate, todayISO } from "@/lib/petcare/dates"
import { usePetCare } from "@/lib/petcare/store"
import { Field } from "../field"

export function AddVaccineDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus data-icon="inline-start" aria-hidden="true" />
        Add vaccine
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add vaccine record</DialogTitle>
          <DialogDescription>Log a vaccination and when the next dose is due.</DialogDescription>
        </DialogHeader>
        <VaccineForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function VaccineForm({ onDone }: { onDone: () => void }) {
  const { addVaccine } = usePetCare()
  const [name, setName] = useState("")
  const [vetName, setVetName] = useState("")
  const [administeredDate, setAdministeredDate] = useState(todayISO())
  const [nextDueDate, setNextDueDate] = useState(toISODate(addDays(parseISODate(todayISO()), 365)))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await addVaccine({ name: name.trim(), vetName: vetName.trim(), administeredDate, nextDueDate })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Vaccine name" htmlFor="vax-name">
        <Input
          id="vax-name"
          required
          autoFocus
          placeholder="e.g. Canine Influenza"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      <Field label="Veterinarian" htmlFor="vax-vet">
        <Input
          id="vax-vet"
          required
          placeholder="e.g. Dr. Emily Carter"
          value={vetName}
          onChange={(e) => setVetName(e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Administered" htmlFor="vax-admin">
          <Input
            id="vax-admin"
            type="date"
            required
            max={todayISO()}
            value={administeredDate}
            onChange={(e) => setAdministeredDate(e.target.value)}
          />
        </Field>
        <Field label="Next due" htmlFor="vax-due">
          <Input
            id="vax-due"
            type="date"
            required
            min={administeredDate}
            value={nextDueDate}
            onChange={(e) => setNextDueDate(e.target.value)}
          />
        </Field>
      </div>
      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
        <Button type="submit">Save record</Button>
      </DialogFooter>
    </form>
  )
}
