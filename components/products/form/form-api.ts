import type { ProductFormValues } from "@/lib/validation/product"

export type FormApi = {
  values: ProductFormValues
  set: <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => void
  update: (fn: (values: ProductFormValues) => ProductFormValues) => void
  errors: Record<string, string>
  warnings: Record<string, string>
}

export type TabKey = "basics" | "composition" | "details" | "images" | "website"

export const tabs: { key: TabKey; label: string; fields: string[] }[] = [
  {
    key: "basics",
    label: "Basics",
    fields: ["name", "mark", "slug", "productType", "categoryId", "dosageForm", "schedule"],
  },
  {
    key: "composition",
    label: "Composition",
    fields: ["composition", "unitStatement", "ingredients", "excipients", "colour"],
  },
  {
    key: "details",
    label: "Details",
    fields: ["description", "supports", "directions", "pack", "packType", "storage", "shelfLife", "manufacturer"],
  },
  { key: "images", label: "Images", fields: ["packImage", "gallery", "leaflet"] },
  { key: "website", label: "Website", fields: ["relatedIds", "order", "visible", "seo"] },
]

export function tabForField(key: string): TabKey {
  const root = key.split(".")[0]
  return tabs.find((t) => t.fields.includes(root))?.key ?? "basics"
}

/** First error in tab + field order, so focus lands where the eye goes first. */
export function firstErrorKey(errors: Record<string, string>) {
  const order = tabs.flatMap((t) => t.fields)
  return Object.keys(errors).sort((a, b) => {
    const ia = order.indexOf(a.split(".")[0])
    const ib = order.indexOf(b.split(".")[0])
    return ia - ib || a.localeCompare(b, undefined, { numeric: true })
  })[0]
}
