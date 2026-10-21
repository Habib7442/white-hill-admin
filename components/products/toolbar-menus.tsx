"use client"

import { ArrowDownUp, ChevronDown, Columns3, List, ListFilter } from "lucide-react"

import { pill } from "@/components/admin/styles"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { productTypes, schedules } from "@/lib/constants"
import type { CategoryListItem } from "@/lib/types"
import { cn } from "@/lib/utils"

import {
  activeFilterCount,
  emptyFilters,
  groupByOptions,
  sortOptions,
  type Filters,
  type GroupBy,
  type SortBy,
} from "./grouping"

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export function FilterMenu({
  filters,
  onChange,
  categories,
}: {
  filters: Filters
  onChange: (filters: Filters) => void
  categories: CategoryListItem[]
}) {
  const count = activeFilterCount(filters)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={pill}>
        <ListFilter strokeWidth={1.8} aria-hidden="true" />
        Filter
        {count ? (
          <span className="rounded-full bg-primary px-1.5 text-xs leading-5 font-semibold text-white">
            {count}
          </span>
        ) : null}
        <ChevronDown strokeWidth={2} aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-[70vh] min-w-60 overflow-y-auto">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Website</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={filters.visibility}
            onValueChange={(visibility) => onChange({ ...filters, visibility: visibility as Filters["visibility"] })}
          >
            <DropdownMenuRadioItem value="all">All products</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="visible">Shown on website</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="hidden">Hidden</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuCheckboxItem
            checked={filters.incompleteOnly}
            onCheckedChange={(incompleteOnly) => onChange({ ...filters, incompleteOnly })}
          >
            Incomplete only
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        {categories.length ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Category</DropdownMenuLabel>
              {categories.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c._id}
                  checked={filters.categories.includes(c._id)}
                  onCheckedChange={() => onChange({ ...filters, categories: toggle(filters.categories, c._id) })}
                >
                  {c.title ?? "Untitled"}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Schedule</DropdownMenuLabel>
          {schedules.map((s) => (
            <DropdownMenuCheckboxItem
              key={s.value}
              checked={filters.schedules.includes(s.value)}
              onCheckedChange={() => onChange({ ...filters, schedules: toggle(filters.schedules, s.value) })}
            >
              {s.long}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Product type</DropdownMenuLabel>
          {productTypes.map((t) => (
            <DropdownMenuCheckboxItem
              key={t.value}
              checked={filters.types.includes(t.value)}
              onCheckedChange={() => onChange({ ...filters, types: toggle(filters.types, t.value) })}
            >
              {t.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        {count ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onChange(emptyFilters)}>Clear filters</DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function SortMenu({ value, onChange }: { value: SortBy; onChange: (value: SortBy) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={pill} aria-label={`Sort: ${sortOptions.find((o) => o.value === value)?.label}`}>
        <ArrowDownUp strokeWidth={1.8} aria-hidden="true" className="sm:hidden" />
        <span className="hidden sm:inline">Sort</span>
        <ChevronDown strokeWidth={2} aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as SortBy)}>
          {sortOptions.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value}>
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function GroupMenu({ value, onChange }: { value: GroupBy; onChange: (value: GroupBy) => void }) {
  const label = groupByOptions.find((o) => o.value === value)?.label
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={pill}>
        <span>
          <span className="hidden sm:inline">Group by: </span>
          <span className="text-text">{label}</span>
        </span>
        <ChevronDown strokeWidth={2} aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as GroupBy)}>
          {groupByOptions.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value}>
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ViewToggle({
  value,
  onChange,
}: {
  value: "board" | "list"
  onChange: (value: "board" | "list") => void
}) {
  const options = [
    { value: "board" as const, label: "Board view", icon: Columns3 },
    { value: "list" as const, label: "List view", icon: List },
  ]
  return (
    <div role="group" aria-label="View" className="flex h-11 items-center rounded-xl bg-muted p-1">
      {options.map(({ value: v, label, icon: Icon }) => (
        <button
          key={v}
          type="button"
          aria-label={label}
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={cn(
            "flex size-9 items-center justify-center rounded-lg text-text-faint transition-colors hover:text-text",
            value === v && "bg-background text-text shadow-sm"
          )}
        >
          <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}
