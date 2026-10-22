"use server"

import { fail, ok, type ActionResult } from "@/lib/action-result"
import { tags } from "@/lib/data"
import { sanity } from "@/lib/sanity/client"
import { newId } from "@/lib/sanity/ids"
import { categorySchema } from "@/lib/validation/category"
import { fieldErrors } from "@/lib/validation/product"

import { isDocOfType, invalidate, requireAdmin, sanityErrorMessage } from "./guard"

export async function saveCategory(
  id: string | null,
  input: unknown
): Promise<ActionResult<{ id: string; title: string }>> {
  await requireAdmin()
  if (id !== null && !(await isDocOfType(id, "category"))) {
    return fail("This category no longer exists.")
  }

  const parsed = categorySchema.safeParse(input)
  if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrors(parsed.error))
  const { title, slug, order } = parsed.data

  const taken = await sanity.fetch<string | null>(
    `*[_type == "category" && _id in path("*") && slug.current == $slug && _id != $id][0]._id`,
    { slug, id: id ?? "" }
  )
  if (taken) return fail("Please fix the highlighted fields.", { slug: "Another category uses this slug." })

  const fields = { title, slug: { _type: "slug", current: slug } }

  try {
    if (id === null) {
      // New categories go to the end unless an order is given.
      const last = await sanity.fetch<number | null>(
        `*[_type == "category" && _id in path("*")] | order(order desc)[0].order`
      )
      const created = await sanity.create({
        _id: newId(),
        _type: "category",
        ...fields,
        order: order !== "" ? Number(order) : (last ?? 0) + 10,
      })
      invalidate(tags.categories)
      return ok({ id: created._id, title })
    }

    const patch = sanity.patch(id).set(fields)
    if (order !== "") patch.set({ order: Number(order) })
    else patch.unset(["order"])
    await sanity.transaction().patch(patch).delete(`drafts.${id}`).commit()
    invalidate(tags.categories)
    return ok({ id, title })
  } catch (error) {
    return fail(sanityErrorMessage(error))
  }
}

export async function moveCategory(id: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdmin()
  if (!(await isDocOfType(id, "category"))) return fail("This category no longer exists.")

  const list = await sanity.fetch<{ _id: string; order: number | null }[]>(
    `*[_type == "category" && _id in path("*")] | order(coalesce(order, 99999) asc, lower(title) asc) { _id, order }`
  )
  const from = list.findIndex((c) => c._id === id)
  const to = direction === "up" ? from - 1 : from + 1
  if (from < 0 || to < 0 || to >= list.length) return ok(undefined)
  ;[list[from], list[to]] = [list[to], list[from]]

  const tx = sanity.transaction()
  list.forEach((c, index) => {
    const order = (index + 1) * 10
    if (c.order !== order) tx.patch(c._id, (patch) => patch.set({ order }))
  })

  try {
    await tx.commit()
    invalidate(tags.categories)
    return ok(undefined)
  } catch (error) {
    return fail(sanityErrorMessage(error))
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin()
  if (!(await isDocOfType(id, "category"))) return fail("This category no longer exists.")

  // Products require a category, so a category in use can't be deleted.
  const used = await sanity.fetch<number>(`count(*[_type == "product" && references($id)])`, { id })
  if (used > 0) {
    return fail(
      `${used} ${used === 1 ? "product uses" : "products use"} this category. Move ${used === 1 ? "it" : "them"} to another category first.`
    )
  }

  try {
    await sanity.transaction().delete(id).delete(`drafts.${id}`).commit()
    invalidate(tags.categories)
    return ok(undefined)
  } catch (error) {
    return fail(sanityErrorMessage(error))
  }
}
