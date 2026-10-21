import type { Mark, ProductType, Schedule } from "./constants"

export type ProductListItem = {
  _id: string
  _updatedAt: string
  name: string | null
  mark: Mark | null
  slug: string | null
  composition: string | null
  description: string | null
  pack: string | null
  dosageForm: string | null
  schedule: Schedule | null
  productType: ProductType | null
  visible: boolean
  order: number | null
  categoryId: string | null
  packImage: { assetId: string | null; alt: string | null } | null
  hasDraft: boolean
}

export type ProductDetail = {
  _id: string
  _updatedAt: string
  name: string | null
  mark: Mark | null
  slug: string | null
  productType: ProductType | null
  categoryId: string | null
  dosageForm: string | null
  schedule: Schedule | null
  composition: string | null
  unitStatement: string | null
  ingredients:
    | { _key: string; ingredient: string | null; standard: string | null; strength: string | null }[]
    | null
  excipients: string | null
  colour: string | null
  description: string | null
  supports: string[] | null
  directions: string | null
  pack: string | null
  packType: string | null
  storage: string | null
  shelfLife: string | null
  manufacturer: { name: string | null; address: string | null; licenceNo: string | null } | null
  packImage: { assetId: string | null; alt: string | null } | null
  gallery:
    | { _key: string; assetId: string | null; alt: string | null; caption: string | null }[]
    | null
  leaflet: { assetId: string | null; filename: string | null } | null
  relatedIds: string[] | null
  order: number | null
  visible: boolean
  seo: { title: string | null; description: string | null } | null
  hasDraft: boolean
}

export type CategoryListItem = {
  _id: string
  title: string | null
  slug: string | null
  order: number | null
  productCount: number
}

export type SiteSettings = {
  companyName: string | null
  logo: { assetId: string | null } | null
  address: string | null
  phone: string | null
  email: string | null
  whatsapp: string | null
  cin: string | null
  gstin: string | null
  drugLicence: string | null
  fssaiLicence: string | null
}

/** Fields the website needs before it shows a product (whitehill-lifecare/lib/sanity/queries.ts). */
export function missingForSite(p: ProductListItem): string[] {
  const missing: string[] = []
  if (!p.name) missing.push("name")
  if (!p.slug) missing.push("slug")
  if (!p.composition) missing.push("composition")
  if (!p.categoryId) missing.push("category")
  if (!p.packImage?.assetId) missing.push("pack image")
  else if (!p.packImage.alt) missing.push("pack image alt text")
  return missing
}
