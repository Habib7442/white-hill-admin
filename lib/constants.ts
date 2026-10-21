// Option lists copied from whitehill-lifecare/sanity/schemaTypes/product.ts.
// Keep them in sync with the schema so Studio and the admin agree.

export const productTypes = [
  { value: "pharmaceutical", label: "Pharmaceutical" },
  { value: "nutraceutical", label: "Nutraceutical" },
  { value: "wellness", label: "Wellness" },
] as const

export const schedules = [
  { value: "otc", label: "OTC", long: "OTC (not scheduled)" },
  { value: "h", label: "Rx · H", long: "Schedule H" },
  { value: "h1", label: "Rx · H1", long: "Schedule H1" },
] as const

export const marks = [
  { value: "", label: "None" },
  { value: "™", label: "™" },
  { value: "®", label: "®" },
] as const

export const dosageForms = [
  "Tablets",
  "Capsules",
  "Softgel Capsules",
  "Syrup",
  "Suspension",
  "Drops",
  "Sachet / Powder",
  "Gel / Cream",
  "Other",
] as const

export const packTypes = [
  "Alu-Alu",
  "Blister (Alu-PVC)",
  "Blister",
  "Strip",
  "Bottle",
  "Sachet",
  "Tube",
  "Other",
] as const

export const standards = ["IP", "BP", "USP"] as const

export type ProductType = (typeof productTypes)[number]["value"]
export type Schedule = (typeof schedules)[number]["value"]
export type Mark = (typeof marks)[number]["value"]

export const productDefaults = {
  dosageForm: "Tablets",
  schedule: "otc" as Schedule,
  excipients: "q.s.",
  directions: "As directed by the Physician.",
  storage: "Store in a cool, dry & dark place. Keep medicine out of reach of children.",
}

export const MAX_SUPPORTS = 6
export const MAX_RELATED = 3
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

export function isRx(schedule: string | null | undefined) {
  return schedule === "h" || schedule === "h1"
}

export function scheduleLabel(value: string | null | undefined) {
  return schedules.find((s) => s.value === value)?.label ?? "OTC"
}

export function productTypeLabel(value: string | null | undefined) {
  return productTypes.find((t) => t.value === value)?.label ?? "—"
}

/** "Hello World ™" → "hello-world", like Sanity's slug field. */
export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
}

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
