"use server"

import { fail, ok, type ActionResult } from "@/lib/action-result"
import { tags } from "@/lib/data"
import { sanity } from "@/lib/sanity/client"
import { fieldErrors } from "@/lib/validation/product"
import { settingsSchema, settingsTextFields } from "@/lib/validation/settings"

import { invalidate, requireAdmin, sanityErrorMessage } from "./guard"

// Fixed id of the singleton, as in whitehill-lifecare/sanity/structure.ts.
const SETTINGS_ID = "siteSettings"

export async function saveSettings(input: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = settingsSchema.safeParse(input)
  if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrors(parsed.error))
  const values = parsed.data

  const set: Record<string, unknown> = {}
  const unset: string[] = []
  for (const key of settingsTextFields) {
    if (values[key]) set[key] = values[key]
    else unset.push(key)
  }
  if (values.logo) {
    set.logo = { _type: "image", asset: { _type: "reference", _ref: values.logo.assetId } }
  } else unset.push("logo")

  try {
    await sanity
      .transaction()
      .createIfNotExists({ _id: SETTINGS_ID, _type: "siteSettings" })
      .patch(SETTINGS_ID, (p) => p.set(set).unset(unset))
      .delete(`drafts.${SETTINGS_ID}`)
      .commit()
    invalidate(tags.settings)
    return ok(undefined)
  } catch (error) {
    return fail(sanityErrorMessage(error))
  }
}
