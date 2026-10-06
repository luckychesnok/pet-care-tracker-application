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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { todayISO } from "@/lib/petcare/dates"
import { usePetCare } from "@/lib/petcare/store"
import { Field } from "../field"

const frequencies = [
  "Once daily",
  "Twice daily",
  "Every 8 hours",
  "Every other day",
  "Weekly",
  "Monthly",
  "As needed",
].map((f) => ({ value: f, label: f }))

export function AddMedicationDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus data-icon="inline-start" aria-hidden="true" />
        Add medication
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add medication</DialogTitle>
          <DialogDescription>{"Add a medication to your pet's daily tracking list."}</DialogDescription>
        </DialogHeader>
        <MedicationForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function MedicationForm({ onDone }: { onDone: () => void }) {
  const { addMedication } = usePetCare()
  const [name, setName] = useState("")
  const [dosage, setDosage] = useState("")
  const [frequency, setFrequency] = useState(frequencies[0].value)
  const [startDate, setStartDate] = useState(todayISO())
  const [endDate, setEndDate] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await addMedication({
      name: name.trim(),
      dosage: dosage.trim(),
      frequency,
      startDate,
      endDate: endDate || null,
    })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Medication name" htmlFor="med-name">
        <Input
          id="med-name"
          required
          autoFocus
          placeholder="e.g. Amoxicillin"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      <Field label="Dosage" htmlFor="med-dosage">
        <Input
          id="med-dosage"
          required
          placeholder="e.g. 250 mg tablet"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
        />
      </Field>
      <Field label="Frequency" htmlFor="med-frequency">
        <Select items={frequencies} value={frequency} onValueChange={(v) => v && setFrequency(v as string)}>
          <SelectTrigger id="med-frequency" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {frequencies.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Start date" htmlFor="med-start">
          <Input
            id="med-start"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Field>
        <Field label="End date" htmlFor="med-end" hint="Leave empty if ongoing">
          <Input
            id="med-end"
            type="date"
            min={startDate}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Field>
      </div>
      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
        <Button type="submit"className="bg-[#00bfff] text-white hover:bg-[#0099cc]">Add medication</Button>
      </DialogFooter>
    </form>
  )
}
