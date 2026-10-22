"use client"

import { useState } from "react"

import { dotColours } from "@/components/admin/styles"
import { cn } from "@/lib/utils"

import type { Column } from "./grouping"
import { ProductCard } from "./product-card"
import type { ProductActions } from "./product-menu"

/**
 * Kanban board from the reference. Cards drag between columns (HTML5 drag and
 * drop on pointer devices); the ⋮ menu's "Move to…" does the same for
 * keyboard and touch users.
 */
export function Board({
  columns,
  pageSize,
  now,
  actions,
  canReorder,
  siteUrl,
}: {
  columns: Column[]
  /** Cards shown per column before "Show more". */
  pageSize: number
  now: number
  actions: ProductActions
  canReorder: boolean
  siteUrl: string
}) {
  const [dragging, setDragging] = useState<{ id: string; from: string } | null>(null)
  const [over, setOver] = useState<string | null>(null)
  const [shown, setShown] = useState<Record<string, number>>({})

  const productById = new Map(columns.flatMap((c) => c.products.map((p) => [p._id, p] as const)))

  function startDrag(event: React.DragEvent<HTMLElement>, id: string, from: string) {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", id)

    // Tilted, lavender drag image like the reference's lifted card.
    const source = event.currentTarget
    const ghost = source.cloneNode(true) as HTMLElement
    const rect = source.getBoundingClientRect()
    ghost.style.cssText = `position:fixed;top:-1000px;left:-1000px;width:${rect.width}px;transform:rotate(-2.5deg);background:var(--drag);border-color:transparent;box-shadow:0 12px 30px rgb(19 35 74 / 0.18);pointer-events:none;`
    document.body.appendChild(ghost)
    event.dataTransfer.setDragImage(ghost, event.clientX - rect.left, event.clientY - rect.top)
    requestAnimationFrame(() => ghost.remove())

    // Defer so the drag image is captured before the card turns into a placeholder.
    setTimeout(() => setDragging({ id, from }), 0)
  }

  function endDrag() {
    setDragging(null)
    setOver(null)
  }

  return (
    <div className="flex flex-1 gap-5 overflow-x-auto px-4 pt-5 pb-6 sm:px-7 lg:min-h-0">
      {columns.map((column, index) => {
        const droppable = Boolean(dragging && column.patch && dragging.from !== column.key)
        const isOver = droppable && over === column.key

        return (
          <section
            key={column.key}
            aria-labelledby={`col-${column.key}`}
            className="flex w-[min(19rem,82vw)] shrink-0 flex-col lg:min-h-0"
            onDragOver={(event) => {
              if (!droppable) return
              event.preventDefault()
              event.dataTransfer.dropEffect = "move"
              if (over !== column.key) setOver(column.key)
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOver(null)
            }}
            onDrop={(event) => {
              event.preventDefault()
              const product = dragging ? productById.get(dragging.id) : undefined
              if (droppable && product && column.patch) actions.onPatch(product, column.patch)
              endDrag()
            }}
          >
            <header className="mb-4 flex items-center gap-2.5">
              <span className={cn("size-2 shrink-0 rounded-full", dotColours[index % dotColours.length])} />
              <h2 id={`col-${column.key}`} className="min-w-0 flex-1 truncate text-lg font-medium text-text">
                {column.title}
              </h2>
              <span className="shrink-0 rounded-full bg-frame px-2.5 py-1 text-xs font-medium text-white tabular-nums">
                {column.products.length} {column.products.length === 1 ? "product" : "products"}
              </span>
            </header>

            <div
              className={cn(
                "flex flex-col gap-3 rounded-card transition-colors lg:-mx-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:px-1 lg:pb-1",
                isOver && "bg-blue-25"
              )}
            >
              {droppable ? (
                <div
                  className={cn(
                    "flex h-28 shrink-0 items-center justify-center rounded-card border-2 border-dashed text-2xl font-semibold transition-colors",
                    isOver ? "border-primary/50 text-primary/60" : "border-card-border text-text-faint/40"
                  )}
                >
                  Move here
                </div>
              ) : null}

              {column.products.slice(0, shown[column.key] ?? pageSize).map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  now={now}
                  actions={actions}
                  canReorder={canReorder}
                  siteUrl={siteUrl}
                  moveTargets={columns
                    .filter((c) => c.key !== column.key && c.patch)
                    .map((c) => ({ key: c.key, title: c.title, patch: c.patch! }))}
                  draggable
                  dragging={dragging?.id === product._id}
                  onDragStart={(event) => startDrag(event, product._id, column.key)}
                  onDragEnd={endDrag}
                />
              ))}

              {column.products.length > (shown[column.key] ?? pageSize) ? (
                <button
                  type="button"
                  onClick={() =>
                    setShown((s) => ({ ...s, [column.key]: (s[column.key] ?? pageSize) + pageSize }))
                  }
                  className="flex h-11 shrink-0 items-center justify-center rounded-card border border-dashed border-card-border text-sm font-medium text-text-muted transition-colors hover:border-blue-100 hover:bg-blue-25 hover:text-text"
                >
                  Show {Math.min(pageSize, column.products.length - (shown[column.key] ?? pageSize))} more
                  <span className="sr-only"> in {column.title}</span>
                  <span className="ml-1 text-text-faint">
                    ({column.products.length - (shown[column.key] ?? pageSize)} hidden)
                  </span>
                </button>
              ) : null}

              {column.products.length === 0 && !droppable ? (
                <div className="flex h-28 shrink-0 items-center justify-center rounded-card border-2 border-dashed border-card-border text-xl font-semibold text-text-faint">
                  No products
                </div>
              ) : null}
            </div>
          </section>
        )
      })}
    </div>
  )
}
