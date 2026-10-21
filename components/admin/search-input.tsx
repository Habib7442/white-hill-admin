"use client"

import { Search, X } from "lucide-react"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

/** The reference's grey search pill. Calls onChange 250 ms after typing stops. */
export function SearchInput({
  value,
  onChange,
  label,
  placeholder = "Search …",
  className,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  placeholder?: string
  className?: string
}) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    if (draft === value) return
    const timer = setTimeout(() => onChange(draft), 250)
    return () => clearTimeout(timer)
  }, [draft, value, onChange])

  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-text-faint"
        strokeWidth={1.8}
        aria-hidden="true"
      />
      <input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        aria-label={label}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl bg-muted pr-10 pl-10.5 text-sm text-text transition-colors outline-none placeholder:text-text-faint focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
      />
      {draft ? (
        <button
          type="button"
          onClick={() => {
            setDraft("")
            onChange("")
          }}
          aria-label="Clear search"
          className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-text-faint hover:bg-muted-hover hover:text-text"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}
