import { ArrowRight, Eye, EyeOff, Package, Plus, Settings2, Tag, TriangleAlert } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { PackThumb } from "@/components/admin/pack-thumb"
import { PageBody, PageHeader } from "@/components/admin/page-header"
import { ListSkeleton } from "@/components/admin/skeletons"
import { pill, primaryOutline } from "@/components/admin/styles"
import { getCategories, getProducts, getSettings } from "@/lib/data"
import { siteUrl } from "@/lib/sanity/config"
import { requestTime, shortAgo } from "@/lib/time"
import { missingForSite } from "@/lib/types"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Dashboard" }

export default function DashboardPage() {
  return (
    <Suspense fallback={<ListSkeleton title="Dashboard" />}>
      <Dashboard />
    </Suspense>
  )
}

async function Dashboard() {
  const [products, categories, settings] = await Promise.all([getProducts(), getCategories(), getSettings()])
  const now = requestTime()

  const shown = products.filter((p) => p.visible && missingForSite(p).length === 0)
  const hidden = products.filter((p) => !p.visible)
  const incomplete = products.filter((p) => p.visible && missingForSite(p).length > 0)
  const drafts = products.filter((p) => p.hasDraft)
  const recent = [...products].sort((a, b) => b._updatedAt.localeCompare(a._updatedAt)).slice(0, 6)
  const missingContact = (["phone", "email", "address"] as const).filter((key) => !settings?.[key])

  const tiles = [
    { label: "On the website", value: shown.length, icon: Eye, colour: "text-dot-3", href: "/products" },
    { label: "Hidden", value: hidden.length, icon: EyeOff, colour: "text-dot-4", href: "/products?show=hidden" },
    { label: "Categories", value: categories.length, icon: Tag, colour: "text-dot-1", href: "/categories" },
    { label: "Need attention", value: incomplete.length, icon: TriangleAlert, colour: "text-dot-5", href: "#attention" },
  ]

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="What’s live on the website, and what needs a look."
        actions={
          <>
            {siteUrl ? (
              <a href={siteUrl} target="_blank" rel="noreferrer" className={pill}>
                View website
              </a>
            ) : null}
            <Link href="/products/new" className={primaryOutline}>
              <Plus strokeWidth={2} aria-hidden="true" />
              New product
            </Link>
          </>
        }
      />
      <PageBody>
        <div className="mx-auto max-w-6xl space-y-8">
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {tiles.map(({ label, value, icon: Icon, colour, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="block rounded-card border border-card-border p-4 transition-colors hover:border-blue-100 hover:bg-blue-25 sm:p-5"
                >
                  <Icon className={cn("size-5", colour)} strokeWidth={1.8} aria-hidden="true" />
                  <p className="mt-4 text-3xl font-semibold tracking-tight text-text tabular-nums">{value}</p>
                  <p className="mt-0.5 text-sm text-text-muted">{label}</p>
                </Link>
              </li>
            ))}
          </ul>

          <div className="grid gap-6 lg:grid-cols-2">
            <section id="attention" aria-labelledby="attention-title" className="rounded-card border border-card-border p-4 sm:p-5">
              <h2 id="attention-title" className="flex items-center gap-2 text-lg font-medium text-text">
                <span className="size-2 rounded-full bg-dot-5" />
                Needs attention
              </h2>
              <ul className="mt-4 space-y-2">
                {incomplete.map((p) => (
                  <li key={p._id}>
                    <Link
                      href={`/products/${p._id}`}
                      className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
                    >
                      <PackThumb assetId={p.packImage?.assetId} alt="" size={36} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-text">{p.name ?? "Untitled product"}</span>
                        <span className="block truncate text-xs text-warning">
                          Not on the website: missing {missingForSite(p).join(", ")}
                        </span>
                      </span>
                      <ArrowRight className="size-4 text-text-faint" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
                {drafts.map((p) => (
                  <li key={`draft-${p._id}`}>
                    <Link
                      href={`/products/${p._id}`}
                      className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
                    >
                      <PackThumb assetId={p.packImage?.assetId} alt="" size={36} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-text">{p.name ?? "Untitled product"}</span>
                        <span className="block truncate text-xs text-text-muted">Has an unpublished draft in Sanity Studio</span>
                      </span>
                      <ArrowRight className="size-4 text-text-faint" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
                {missingContact.length ? (
                  <li>
                    <Link href="/settings" className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted">
                      <span className="flex size-9 items-center justify-center rounded-md bg-blue-25">
                        <Settings2 className="size-4 text-primary" strokeWidth={1.8} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-text">Contact details</span>
                        <span className="block truncate text-xs text-text-muted">
                          Not set yet: {missingContact.join(", ")}
                        </span>
                      </span>
                      <ArrowRight className="size-4 text-text-faint" aria-hidden="true" />
                    </Link>
                  </li>
                ) : null}
              </ul>
              {!incomplete.length && !drafts.length && !missingContact.length ? (
                <p className="mt-4 text-sm text-text-muted">All good. Every visible product is complete.</p>
              ) : null}
            </section>

            <section aria-labelledby="recent-title" className="rounded-card border border-card-border p-4 sm:p-5">
              <h2 id="recent-title" className="flex items-center gap-2 text-lg font-medium text-text">
                <span className="size-2 rounded-full bg-dot-2" />
                Recently updated
              </h2>
              {recent.length ? (
                <ul className="mt-4 space-y-2">
                  {recent.map((p) => (
                    <li key={p._id}>
                      <Link
                        href={`/products/${p._id}`}
                        className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
                      >
                        <PackThumb assetId={p.packImage?.assetId} alt="" size={36} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-text">{p.name ?? "Untitled product"}</span>
                          <span className="block truncate text-xs text-success">{p.pack}</span>
                        </span>
                        <span className="shrink-0 text-xs text-text-faint">{shortAgo(p._updatedAt, now)} ago</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 flex flex-col items-start gap-3">
                  <p className="text-sm text-text-muted">No products yet.</p>
                  <Link href="/products/new" className={primaryOutline}>
                    <Package strokeWidth={1.8} aria-hidden="true" />
                    Add the first product
                  </Link>
                </div>
              )}
            </section>
          </div>
        </div>
      </PageBody>
    </>
  )
}
