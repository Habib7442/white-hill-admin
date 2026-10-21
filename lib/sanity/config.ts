// Public Sanity settings (same project and dataset as the website).
// Next inlines NEXT_PUBLIC_* only when accessed as literal property names.

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "NEXT_PUBLIC_SANITY_PROJECT_ID"
)

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "NEXT_PUBLIC_SANITY_DATASET"
)

export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-10-01"

// Public website, for "View on site" links. Defaults to production.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://whitehilllifecares.com").replace(/\/$/, "")

function assertValue(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}. See .env.example.`)
  }
  return value
}
