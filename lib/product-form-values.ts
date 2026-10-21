import { dosageForms, packTypes, productDefaults } from "./constants"
import { newKey } from "./sanity/ids"
import type { ProductDetail } from "./types"
import type { ProductFormValues } from "./validation/product"

function oneOf<T extends string>(list: readonly T[], value: string | null | undefined, fallback: T): T {
  return list.includes(value as T) ? (value as T) : fallback
}

/** Sanity document (or nothing, for a new product) → form state. */
export function toFormValues(p: ProductDetail | null): ProductFormValues {
  if (!p) {
    return {
      name: "",
      mark: "",
      slug: "",
      productType: "" as ProductFormValues["productType"],
      categoryId: "",
      dosageForm: productDefaults.dosageForm as ProductFormValues["dosageForm"],
      schedule: productDefaults.schedule,
      composition: "",
      unitStatement: "",
      ingredients: [],
      excipients: productDefaults.excipients,
      colour: "",
      description: "",
      supports: [],
      directions: productDefaults.directions,
      pack: "",
      packType: "",
      storage: productDefaults.storage,
      shelfLife: "",
      manufacturer: { name: "", address: "", licenceNo: "" },
      packImage: null,
      gallery: [],
      leaflet: null,
      relatedIds: [],
      order: "",
      visible: true,
      seo: { title: "", description: "" },
    }
  }

  return {
    name: p.name ?? "",
    mark: p.mark ?? "",
    slug: p.slug ?? "",
    productType: (p.productType ?? "") as ProductFormValues["productType"],
    categoryId: p.categoryId ?? "",
    dosageForm: oneOf(dosageForms, p.dosageForm, "Tablets"),
    schedule: p.schedule ?? "otc",
    composition: p.composition ?? "",
    unitStatement: p.unitStatement ?? "",
    ingredients: (p.ingredients ?? []).map((row) => ({
      key: row._key || newKey(),
      ingredient: row.ingredient ?? "",
      standard: oneOf(["", "IP", "BP", "USP"] as const, row.standard, ""),
      strength: row.strength ?? "",
    })),
    excipients: p.excipients ?? "",
    colour: p.colour ?? "",
    description: p.description ?? "",
    supports: (p.supports ?? []).map((text) => ({ key: newKey(), text })),
    directions: p.directions ?? "",
    pack: p.pack ?? "",
    packType: oneOf(["", ...packTypes] as const, p.packType, ""),
    storage: p.storage ?? "",
    shelfLife: p.shelfLife ?? "",
    manufacturer: {
      name: p.manufacturer?.name ?? "",
      address: p.manufacturer?.address ?? "",
      licenceNo: p.manufacturer?.licenceNo ?? "",
    },
    packImage: p.packImage?.assetId ? { assetId: p.packImage.assetId, alt: p.packImage.alt ?? "" } : null,
    gallery: (p.gallery ?? [])
      .filter((img) => img.assetId)
      .map((img) => ({
        key: img._key || newKey(),
        assetId: img.assetId as string,
        alt: img.alt ?? "",
        caption: img.caption ?? "",
      })),
    leaflet: p.leaflet?.assetId
      ? { assetId: p.leaflet.assetId, filename: p.leaflet.filename ?? "leaflet.pdf" }
      : null,
    relatedIds: p.relatedIds ?? [],
    order: p.order === null || p.order === undefined ? "" : String(p.order),
    visible: p.visible,
    seo: { title: p.seo?.title ?? "", description: p.seo?.description ?? "" },
  }
}
