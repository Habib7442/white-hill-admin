import "server-only"

import { refresh, updateTag } from "next/cache"

import { requireAdmin } from "@/lib/auth/dal"
import { sanity } from "@/lib/sanity/client"
import { isPublishedId } from "@/lib/sanity/ids"

export { requireAdmin }

/**
 * After a write: expire the cached Sanity reads it touched (lib/data.ts tags)
 * so the next read is fresh, and re-render the current page.
 */
export function invalidate(...cacheTags: string[]) {
  for (const tag of cacheTags) updateTag(tag)
  refresh()
}

/** True when `id` is a published document of `type`. Stops crafted ids. */
export async function isDocOfType(id: unknown, type: string): Promise<boolean> {
  if (!isPublishedId(id)) return false
  const found = await sanity.fetch<string | null>(`*[_id == $id && _type == $type][0]._id`, {
    id,
    type,
  })
  return found === id
}

export function sanityErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    if (/reference/i.test(error.message)) {
      return "Another document still links to this one, so it can't be removed."
    }
    if (/permission|unauthori[sz]ed|forbidden/i.test(error.message)) {
      return "The Sanity token can't make this change. Check SANITY_API_WRITE_TOKEN (Editor role)."
    }
  }
  return "Something went wrong while saving to Sanity. Please try again."
}
