"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

const pageButton =
  "inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-xl px-3 text-sm font-medium tabular-nums transition-colors disabled:pointer-events-none disabled:opacity-40"

/** 1 … 4 5 6 … 12: first, last, and the current page's neighbours. */
function pageList(page: number, count: number): (number | "gap")[] {
  const pages = new Set([1, count, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= count).sort((a, b) => a - b)
  const out: (number | "gap")[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap")
    out.push(p)
  })
  return out
}

export function Pagination({
  page,
  pageSize,
  total,
  onChange,
  label = "products",
}: {
  page: number
  pageSize: number
  total: number
  onChange: (page: number) => void
  label?: string
}) {
  const count = Math.max(1, Math.ceil(total / pageSize))
  if (total <= pageSize) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center justify-between gap-3 border-t border-hairline pt-4 sm:flex-row"
    >
      <p className="text-sm text-text-muted" aria-live="polite">
        Showing <span className="font-medium text-text">{from}–{to}</span> of{" "}
        <span className="font-medium text-text">{total}</span> {label}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={cn(pageButton, "bg-muted text-text-muted hover:bg-muted-hover hover:text-text")}
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft className="size-4" strokeWidth={1.8} aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sr-only sm:hidden">Previous page</span>
        </button>
        {pageList(page, count).map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} className="px-1 text-sm text-text-faint" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              aria-current={p === page ? "page" : undefined}
              aria-label={`Page ${p}`}
              onClick={() => onChange(p)}
              className={cn(
                pageButton,
                p === page ? "bg-frame text-white" : "text-text-muted hover:bg-muted hover:text-text"
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          className={cn(pageButton, "bg-muted text-text-muted hover:bg-muted-hover hover:text-text")}
          disabled={page >= count}
          onClick={() => onChange(page + 1)}
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sr-only sm:hidden">Next page</span>
          <ChevronRight className="size-4" strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}
