"use client"

import { ChevronUp } from "lucide-react"
import { useId, useState } from "react"

import { cn } from "@/lib/utils"

/** The reference's "STORE" / "ARCHIVE" groups: a caps label with a chevron. */
export function CollapsibleGroup({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="flex h-10 w-full items-center gap-2.5 rounded-lg px-2 text-[0.8125rem] font-medium tracking-wide text-frame-text uppercase transition-colors hover:bg-frame-raised"
      >
        <ChevronUp
          className={cn("size-4 text-frame-text-muted transition-transform", !open && "rotate-180")}
          strokeWidth={1.8}
          aria-hidden="true"
        />
        {title}
      </button>
      <div id={id} hidden={!open} className="mt-1">
        {children}
      </div>
    </div>
  )
}
