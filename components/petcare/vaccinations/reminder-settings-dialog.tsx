"use client"

import { useState } from "react"
import { Settings2 } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { usePetCare } from "@/lib/petcare/store"
import type { ReminderLeadDay, ReminderSettings } from "@/lib/petcare/types"
import { cn } from "@/lib/utils"

const options: { days: ReminderLeadDay; label: string; description: string }[] = [
  { days: 30, label: "30 days before", description: "Time to book a vet appointment" },
  { days: 7, label: "7 days before", description: "A week's heads-up" },
  { days: 1, label: "1 day before", description: "Final reminder the day before" },
]

export function ReminderSettingsDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Settings2 data-icon="inline-start" aria-hidden="true" />
        Settings
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notification settings</DialogTitle>
          <DialogDescription>Choose when to be reminded before a vaccine is due.</DialogDescription>
        </DialogHeader>
        <SettingsForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function SettingsForm({ onDone }: { onDone: () => void }) {
  const { reminders, updateReminders } = usePetCare()
  const [draft, setDraft] = useState<ReminderSettings>(reminders)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        updateReminders(draft)
        onDone()
      }}
      className="flex flex-col gap-4"
    >
      <label className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 p-4">
        <span>
          <span className="block text-sm font-medium">Vaccine reminders</span>
          <span className="block text-xs text-muted-foreground">Pause all notifications at once</span>
        </span>
        <Switch checked={draft.enabled} onCheckedChange={(enabled) => setDraft((d) => ({ ...d, enabled }))} />
      </label>

      <fieldset
        disabled={!draft.enabled}
        className={cn("flex flex-col divide-y rounded-lg border", !draft.enabled && "opacity-50")}
      >
        <legend className="sr-only">Remind me</legend>
        {options.map((o) => (
          <label key={o.days} className="flex items-center justify-between gap-4 p-4">
            <span>
              <span className="block text-sm font-medium">{o.label}</span>
              <span className="block text-xs text-muted-foreground">{o.description}</span>
            </span>
            <Switch
              checked={draft.leadDays[o.days]}
              disabled={!draft.enabled}
              onCheckedChange={(checked) =>
                setDraft((d) => ({ ...d, leadDays: { ...d.leadDays, [o.days]: checked } }))
              }
            />
          </label>
        ))}
      </fieldset>

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
        <Button type="submit">Save settings</Button>
      </DialogFooter>
    </form>
  )
}
