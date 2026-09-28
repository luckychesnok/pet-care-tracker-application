import { PawPrint } from "lucide-react"
import { cn } from "@/lib/utils"

export function PetAvatar({ src, name, className }: { src: string | null; name: string; className?: string }) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-2xl border border-dashed bg-muted text-muted-foreground",
          className,
        )}
        role="img"
        aria-label={`${name || "Pet"} avatar placeholder`}
      >
        <PawPrint className="size-1/3" aria-hidden="true" />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Photo of ${name || "your pet"}`}
      className={cn("shrink-0 rounded-2xl object-cover ring-1 ring-border", className)}
    />
  )
}
