"use client"

import React from "react"
import { PawPrint, Plus, ChevronDown } from "lucide-react"
import { usePetCare } from "@/lib/petcare/store"

interface AppHeaderProps {
  onAddPetClick?: () => void
}

export function AppHeader({ onAddPetClick }: AppHeaderProps) {
  const { pet, pets, setPetId } = usePetCare()
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <header className="border-b bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 md:px-6">
        {/* Левая часть: Логотип */}
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <PawPrint className="size-4" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold tracking-tight">PetCare Tracker</span>
        </div>

        {/* Правая часть: Кнопка и выбор питомца */}
        <div className="flex items-center gap-3 text-sm">
          {/* Кнопка добавления нового питомца (Яркая салатовая/голубая) */}
          {onAddPetClick && (
            <button
              onClick={onAddPetClick}
              className="bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ADD NEW PET</span>
            </button>
          )}

          <span className="hidden text-muted-foreground sm:inline">{today}</span>
          <span className="hidden h-4 w-px bg-border sm:inline-block" aria-hidden="true" />
          
          {/* Выпадающий список (DDL) для выбора питомца */}
          <div className="relative flex items-center bg-muted/50 border border-border rounded-lg px-2.5 py-1.5">
            {pet.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pet.avatarUrl} alt="" className="size-6 rounded-full object-cover ring-1 ring-border mr-2" />
            ) : (
              <span className="flex size-6 items-center justify-center rounded-full bg-muted mr-2">
                <PawPrint className="size-3 text-muted-foreground" aria-hidden="true" />
              </span>
            )}
            
            <select
              value={pet.id}
              onChange={(e) => setPetId(e.target.value)}
              className="appearance-none bg-transparent text-foreground text-sm font-medium pr-6 focus:outline-none cursor-pointer"
            >
              {pets && pets.length > 0 ? (
                pets.map((p) => (
                  <option key={p.id} value={p.id} className="bg-card text-foreground">
                    {p.name}
                  </option>
                ))
              ) : (
                <option value={pet.id} className="bg-card text-foreground">
                  {pet.name}
                </option>
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2 pointer-events-none" />
          </div>
        </div>
      </div>
    </header>
  )
}