"use server"

import { refresh } from "next/cache"
import { redirect } from "next/navigation"

import { fail, ok, type ActionResult } from "@/lib/action-result"
import { slugify } from "@/lib/constants"
import { sanity } from "@/lib/sanity/client"
import { isPublishedId, newId, newKey } from "@/lib/sanity/ids"
import { fieldErrors, productSchema, type ProductValues } from "@/lib/validation/product"

import { isDocOfType, requireAdmin, sanityErrorMessage } from "./guard"

type SanityFields = Record<string, unknown>

/** Splits form values into fields to set and optional fields to unset. */
function toSanity(v: ProductValues): { set: SanityFields; unset: string[] } {
  const set: SanityFields = {
    name: v.name,
    mark: v.mark,
    slug: { _type: "slug", current: v.slug },
    productType: v.productType,
    category: { _type: "reference", _ref: v.categoryId },
    dosageForm: v.dosageForm,
    schedule: v.schedule,
    composition: v.composition,
    pack: v.pack,
    visible: v.visible,
    packImage: {
      _type: "image",
      asset: { _type: "reference", _ref: v.packImage!.assetId },
      alt: v.packImage!.alt,
    },
  }
  const unset: string[] = []

  const optionalText = {
    unitStatement: v.unitStatement,
    excipients: v.excipients,
    colour: v.colour,
    description: v.description,
    directions: v.directions,
    packType: v.packType,
    storage: v.storage,
    shelfLife: v.shelfLife,
  }
  for (const [key, value] of Object.entries(optionalText)) {
    if (value) set[key] = value
    else unset.push(key)
  }

  if (v.ingredients.length) {
    set.ingredients = v.ingredients.map((row) => ({
      _type: "ingredientRow",
      _key: row.key,
      ingredient: row.ingredient,
      ...(row.standard ? { standard: row.standard } : {}),
      ...(row.strength ? { strength: row.strength } : {}),
    }))
  } else unset.push("ingredients")

  if (v.supports.length) set.supports = v.supports.map((row) => row.text)
  else unset.push("supports")

  const manufacturer = Object.fromEntries(
    Object.entries(v.manufacturer).filter(([, value]) => value !== "")
  )
  if (Object.keys(manufacturer).length) set.manufacturer = manufacturer
  else unset.push("manufacturer")

  if (v.gallery.length) {
    set.gallery = v.gallery.map((img) => ({
      _type: "image",
      _key: img.key,
      asset: { _type: "reference", _ref: img.assetId },
      alt: img.alt,
      caption: img.caption,
    }))
  } else unset.push("gallery")

  if (v.leaflet) {
    set.leaflet = { _type: "file", asset: { _type: "reference", _ref: v.leaflet.assetId } }
  } else unset.push("leaflet")

  if (v.relatedIds.length) {
    set.relatedProducts = v.relatedIds.map((id) => ({
      _type: "reference",
      _key: newKey(),
      _ref: id,
    }))
  } else unset.push("relatedProducts")

  if (v.order !== "") set.order = Number(v.order)
  else unset.push("order")

  const seo = Object.fromEntries(Object.entries(v.seo).filter(([, value]) => value !== ""))
  if (Object.keys(seo).length) set.seo = seo
  else unset.push("seo")

  return { set, unset }
}

async function slugTaken(slug: string, exceptId: string | null) {
  const id = await sanity.fetch<string | null>(
    `*[_type == "product" && slug.current == $slug && _id in path("*") && _id != $exceptId][0]._id`,
    { slug, exceptId: exceptId ?? "" }
  )
  return Boolean(id)
}

export async function saveProduct(
  id: string | null,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin()

  if (id !== null && !(await isDocOfType(id, "product"))) {
    return fail("This product no longer exists.")
  }

  const parsed = productSchema.safeParse(input)
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", fieldErrors(parsed.error))
  }
  const values = parsed.data

  if (!(await isDocOfType(values.categoryId, "category"))) {
    return fail("Please fix the highlighted fields.", { categoryId: "Choose a category." })
  }
  if (values.relatedIds.some((relatedId) => relatedId === id || !isPublishedId(relatedId))) {
    return fail("Please fix the highlighted fields.", {
      relatedIds: "A product can't be related to itself.",
    })
  }
  if (await slugTaken(values.slug, id)) {
    return fail("Please fix the highlighted fields.", {
      slug: "Another product already uses this slug.",
    })
  }

  const { set, unset } = toSanity(values)

  try {
    if (id === null) {
      const created = await sanity.create({ _id: newId(), _type: "product", ...set })
      refresh()
      return ok({ id: created._id })
    }

    // Saving here publishes this version. A Studio draft would otherwise
    // shadow it in Studio, so it is discarded.
    await sanity
      .transaction()
      .patch(id, (p) => p.set(set).unset(unset))
      .delete(`drafts.${id}`)
      .commit()
    refresh()
    return ok({ id })
  } catch (error) {
    return fail(sanityErrorMessage(error))
  }
}

export type QuickPatch = {
  visible?: boolean
  categoryId?: string
  schedule?: "otc" | "h" | "h1"
  productType?: "pharmaceutical" | "nutraceutical" | "wellness"
}

/** Small changes from the board: visibility toggle and moving between columns. */
export async function updateProductQuick(id: string, patch: QuickPatch): Promise<ActionResult> {
  await requireAdmin()
  if (!(await isDocOfType(id, "product"))) return fail("This product no longer exists.")

  const set: SanityFields = {}
  if (typeof patch.visible === "boolean") set.visible = patch.visible
  if (patch.categoryId !== undefined) {
    if (!(await isDocOfType(patch.categoryId, "category"))) {
      return fail("That category no longer exists.")
    }
    set.category = { _type: "reference", _ref: patch.categoryId }
  }
  if (patch.schedule && ["otc", "h", "h1"].includes(patch.schedule)) set.schedule = patch.schedule
  if (
    patch.productType &&
    ["pharmaceutical", "nutraceutical", "wellness"].includes(patch.productType)
  ) {
    set.productType = patch.productType
  }
  if (!Object.keys(set).length) return fail("Nothing to change.")

  try {
    await sanity.patch(id).set(set).commit()
    refresh()
    return ok(undefined)
  } catch (error) {
    return fail(sanityErrorMessage(error))
  }
}

/** Moves a product one place up or down and renumbers `order` in steps of 10. */
export async function moveProduct(id: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdmin()
  if (!(await isDocOfType(id, "product"))) return fail("This product no longer exists.")

  const list = await sanity.fetch<{ _id: string; order: number | null }[]>(
    `*[_type == "product" && _id in path("*")] | order(coalesce(order, 99999) asc, lower(name) asc) { _id, order }`
  )
  const from = list.findIndex((p) => p._id === id)
  const to = direction === "up" ? from - 1 : from + 1
  if (from < 0 || to < 0 || to >= list.length) return ok(undefined)
  ;[list[from], list[to]] = [list[to], list[from]]

  const tx = sanity.transaction()
  list.forEach((p, index) => {
    const order = (index + 1) * 10
    if (p.order !== order) tx.patch(p._id, (patch) => patch.set({ order }))
  })

  try {
    await tx.commit()
    refresh()
    return ok(undefined)
  } catch (error) {
    return fail(sanityErrorMessage(error))
  }
}

export async function duplicateProduct(id: string): Promise<ActionResult<{ id: string }>> {
  await requireAdmin()
  if (!(await isDocOfType(id, "product"))) return fail("This product no longer exists.")

  const source = await sanity.getDocument(id)
  if (!source) return fail("This product no longer exists.")

  // Copy every field except Sanity's system fields.
  const fields = Object.fromEntries(
    Object.entries(source).filter(([key]) => !["_id", "_rev", "_createdAt", "_updatedAt"].includes(key))
  )

  const name = `${typeof fields.name === "string" ? fields.name : "Product"} (copy)`
  let slug = slugify(name)
  for (let n = 2; await slugTaken(slug, null); n++) slug = `${slugify(name)}-${n}`

  try {
    const created = await sanity.create({
      ...fields,
      _id: newId(),
      _type: "product",
      name,
      slug: { _type: "slug", current: slug },
      // Hidden until edited, so the copy never shows twice on the site.
      visible: false,
    })
    refresh()
    return ok({ id: created._id })
  } catch (error) {
    return fail(sanityErrorMessage(error))
  }
}

/** Products that list `id` as a related product. */
export async function getProductReferrers(
  id: string
): Promise<{ _id: string; name: string | null }[]> {
  await requireAdmin()
  if (!isPublishedId(id)) return []
  return sanity.fetch(
    `*[_type == "product" && _id in path("*") && references($id)] { _id, name }`,
    { id }
  )
}

/**
 * `fromEditPage`: redirect to /products instead of refreshing, so the
 * now-deleted product's page doesn't re-render as a 404 first.
 */
export async function deleteProduct(id: string, fromEditPage = false): Promise<ActionResult> {
  await requireAdmin()
  if (!(await isDocOfType(id, "product"))) return fail("This product no longer exists.")

  // Unlink it from other products' related lists (published and drafts),
  // then delete it and any Studio draft, all in one transaction.
  const referrers = await sanity.fetch<string[]>(
    `*[_type == "product" && references($id)]._id`,
    { id }
  )
  const tx = sanity.transaction()
  for (const referrer of referrers) {
    tx.patch(referrer, (p) => p.unset([`relatedProducts[_ref == "${id}"]`]))
  }
  tx.delete(id).delete(`drafts.${id}`)

  try {
    await tx.commit()
  } catch (error) {
    return fail(sanityErrorMessage(error))
  }
  if (fromEditPage) redirect("/products")
  refresh()
  return ok(undefined)
}
