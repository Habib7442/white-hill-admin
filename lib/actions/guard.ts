import "server-only"

import { refresh, updateTag } from "next/cache"

import { requireAdmin } from "@/lib/auth/dal"
import { sanity } from "@/lib/sanity/client"
import { isPublishedId } from "@/lib/sanity/ids"
import { refreshWebsite, type WebsiteContentType } from "@/lib/website"

export { requireAdmin }

export const websiteRefreshWarning =
  "Saved. The website couldn't be refreshed right now; it will update within a minute via Sanity."

/**
 * After a write: expire the admin's cached Sanity reads it touched
 * (lib/data.ts tags), re-render the current page, and tell the public
 * website to refresh `websiteType`. Returns a warning when the website
 * couldn't be reached (the save itself succeeded).
 */
export async function afterWrite(
  websiteType: WebsiteContentType,
  ...cacheTags: string[]
): Promise<string | undefined> {
  for (const tag of cacheTags) updateTag(tag)
  refresh()
  return (await refreshWebsite(websiteType)) ? undefined : websiteRefreshWarning
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
