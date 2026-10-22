import "server-only"

import { encodeSignatureHeader } from "@sanity/webhook"

import { siteUrl } from "./sanity/config"

export type WebsiteContentType = "product" | "category" | "siteSettings"

/**
 * Tells the public website to drop its cached copy of `type` right away, so
 * the next page load shows the change. Signed exactly like Sanity's webhook
 * (same SANITY_REVALIDATE_SECRET); `source: "admin"` lets the website skip
 * the wait Sanity webhooks need, because our write is already committed and
 * visible. Sanity's webhook still fires as a backup.
 *
 * Never throws. Returns false if the website couldn't be reached.
 */
export async function refreshWebsite(type: WebsiteContentType): Promise<boolean> {
  const secret = process.env.SANITY_REVALIDATE_SECRET?.trim()
  if (!secret || !siteUrl) return false

  try {
    const body = JSON.stringify({ _type: type, source: "admin" })
    // Async in @sanity/webhook v4: without await the header is "[object Promise]".
    const signature = await encodeSignatureHeader(body, Date.now(), secret)
    const res = await fetch(`${siteUrl}/api/revalidate`, {
      method: "POST",
      headers: { "content-type": "application/json", "sanity-webhook-signature": signature },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })
    return res.ok
  } catch {
    return false
  }
}
