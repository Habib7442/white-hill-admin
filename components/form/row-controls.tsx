"use client"

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react"

import { iconButton } from "@/components/admin/styles"
import { cn } from "@/lib/utils"

/** Move up / move down / remove for one row of a repeatable list. */
export function RowControls({
  index,
  count,
  label,
  onMove,
  onRemove,
}: {
  index: number
  count: number
  label: string
  onMove: (from: number, to: number) => void
  onRemove: (index: number) => void
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        className={iconButton}
        disabled={index === 0}
        onClick={() => onMove(index, index - 1)}
        aria-label={`Move ${label} up`}
      >
        <ArrowUp strokeWidth={1.8} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={iconButton}
        disabled={index === count - 1}
        onClick={() => onMove(index, index + 1)}
        aria-label={`Move ${label} down`}
      >
        <ArrowDown strokeWidth={1.8} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={cn(iconButton, "hover:bg-danger-bg hover:text-danger")}
        onClick={() => onRemove(index)}
        aria-label={`Remove ${label}`}
      >
        <Trash2 strokeWidth={1.8} aria-hidden="true" />
      </button>
    </div>
  )
}

export function moveItem<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list
  const copy = [...list]
  const [item] = copy.splice(from, 1)
  copy.splice(to, 0, item)
  return copy
}
