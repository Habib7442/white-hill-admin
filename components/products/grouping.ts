import { productTypes, schedules } from "@/lib/constants"
import type { QuickPatch } from "@/lib/actions/products"
import type { CategoryListItem, ProductListItem } from "@/lib/types"

export type GroupBy = "category" | "visibility" | "schedule" | "productType"
export type SortBy = "order" | "name" | "updated"

export const groupByOptions: { value: GroupBy; label: string }[] = [
  { value: "category", label: "Category" },
  { value: "visibility", label: "Visibility" },
  { value: "schedule", label: "Schedule" },
  { value: "productType", label: "Product type" },
]

export const sortOptions: { value: SortBy; label: string }[] = [
  { value: "order", label: "Display order" },
  { value: "name", label: "Name A–Z" },
  { value: "updated", label: "Recently updated" },
]

export type Column = {
  key: string
  title: string
  /** Patch applied when a card is dropped here. null = can't drop here. */
  patch: QuickPatch | null
  products: ProductListItem[]
}

const NO_CATEGORY = "__none"

function columnKey(product: ProductListItem, groupBy: GroupBy): string {
  switch (groupBy) {
    case "category":
      return product.categoryId ?? NO_CATEGORY
    case "visibility":
      return product.visible ? "visible" : "hidden"
    case "schedule":
      return product.schedule ?? "otc"
    case "productType":
      return product.productType ?? NO_CATEGORY
  }
}

function emptyColumns(groupBy: GroupBy, categories: CategoryListItem[]): Omit<Column, "products">[] {
  switch (groupBy) {
    case "category":
      return categories.map((c) => ({
        key: c._id,
        title: c.title ?? "Untitled",
        patch: { categoryId: c._id },
      }))
    case "visibility":
      return [
        { key: "visible", title: "On website", patch: { visible: true } },
        { key: "hidden", title: "Hidden", patch: { visible: false } },
      ]
    case "schedule":
      return schedules.map((s) => ({ key: s.value, title: s.long, patch: { schedule: s.value } }))
    case "productType":
      return productTypes.map((t) => ({ key: t.value, title: t.label, patch: { productType: t.value } }))
  }
}

export function buildColumns(
  products: ProductListItem[],
  categories: CategoryListItem[],
  groupBy: GroupBy
): Column[] {
  const columns: Column[] = emptyColumns(groupBy, categories).map((c) => ({ ...c, products: [] }))
  const byKey = new Map(columns.map((c) => [c.key, c]))

  for (const product of products) {
    const key = columnKey(product, groupBy)
    let column = byKey.get(key)
    if (!column) {
      // Products without a category / type (e.g. made in Studio and never finished).
      column = { key, title: groupBy === "category" ? "No category" : "Not set", patch: null, products: [] }
      byKey.set(key, column)
      columns.push(column)
    }
    column.products.push(product)
  }
  return columns
}

export function sortProducts(products: ProductListItem[], sortBy: SortBy) {
  if (sortBy === "order") return products
  const copy = [...products]
  if (sortBy === "name") copy.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
  else copy.sort((a, b) => b._updatedAt.localeCompare(a._updatedAt))
  return copy
}

export type Filters = {
  categories: string[]
  schedules: string[]
  types: string[]
  visibility: "all" | "visible" | "hidden"
  incompleteOnly: boolean
}

export const emptyFilters: Filters = {
  categories: [],
  schedules: [],
  types: [],
  visibility: "all",
  incompleteOnly: false,
}

export function activeFilterCount(f: Filters) {
  return (
    f.categories.length +
    f.schedules.length +
    f.types.length +
    (f.visibility !== "all" ? 1 : 0) +
    (f.incompleteOnly ? 1 : 0)
  )
}
