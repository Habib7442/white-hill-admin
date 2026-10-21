import { EyeOff, Plus } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

import { getCategories, getProducts } from "@/lib/data"
import { readSession } from "@/lib/auth/session"
import { siteUrl } from "@/lib/sanity/config"
import { cn } from "@/lib/utils"

import { AccountMenu } from "./account-menu"
import { Brand } from "./brand"
import { CollapsibleGroup } from "./collapsible-group"
import { NavLinks, NavLinksFallback } from "./nav-links"
import { dotColours } from "./styles"

/** Sidebar contents, shared by the desktop rail and the mobile sheet. */
export function SidebarContent() {
  return (
    <div className="flex min-h-full flex-col gap-6">
      <Link href="/" className="flex h-10 items-center rounded-lg px-1" aria-label="WhiteHill admin home">
        <Brand />
      </Link>

      <Suspense fallback={<div className="h-14 rounded-xl bg-frame-raised" />}>
        <Account />
      </Suspense>

      <nav aria-label="Main">
        <Suspense fallback={<NavLinksFallback />}>
          <NavLinks />
        </Suspense>
      </nav>

      <hr className="border-frame-line" />

      <Suspense fallback={<GroupSkeleton title="Categories" />}>
        <CategoryGroup />
      </Suspense>

      <hr className="border-frame-line" />

      <Suspense fallback={<GroupSkeleton title="Archive" />}>
        <ArchiveGroup />
      </Suspense>
    </div>
  )
}

async function Account() {
  const session = await readSession()
  if (!session) return null
  return <AccountMenu email={session.email} siteUrl={siteUrl} />
}

const groupLink =
  "flex h-10 items-center gap-3 rounded-lg px-2 text-sm text-frame-text-muted transition-colors hover:bg-frame-raised hover:text-frame-text"

async function CategoryGroup() {
  const categories = await getCategories()

  return (
    <CollapsibleGroup title="Categories">
      <ul className="space-y-0.5">
        {categories.map((category, index) => (
          <li key={category._id}>
            <Link href={`/products?category=${category._id}`} className={groupLink}>
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-frame-raised">
                <span className={cn("size-2 rounded-full", dotColours[index % dotColours.length])} />
              </span>
              <span className="min-w-0 flex-1 truncate">{category.title ?? "Untitled"}</span>
              <span className="text-xs tabular-nums text-frame-text-muted">{category.productCount}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link href="/categories?new=1" className={groupLink}>
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-dashed border-frame-line">
              <Plus className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
            </span>
            Add category
          </Link>
        </li>
      </ul>
    </CollapsibleGroup>
  )
}

async function ArchiveGroup() {
  const hidden = (await getProducts()).filter((p) => !p.visible).length

  return (
    <CollapsibleGroup title="Archive" defaultOpen={hidden > 0}>
      <Link href="/products?show=hidden" className={groupLink}>
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-frame-raised">
          <EyeOff className="size-3.5 text-dot-4" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span className="flex-1">Hidden products</span>
        <span className="text-xs tabular-nums text-frame-text-muted">{hidden}</span>
      </Link>
    </CollapsibleGroup>
  )
}

function GroupSkeleton({ title }: { title: string }) {
  return (
    <div>
      <p className="flex h-10 items-center px-2 pl-8.5 text-[0.8125rem] font-medium tracking-wide text-frame-text uppercase">
        {title}
      </p>
      <div className="mt-1 space-y-2 px-2">
        <div className="h-6 animate-pulse rounded-md bg-frame-raised" />
        <div className="h-6 animate-pulse rounded-md bg-frame-raised" />
      </div>
    </div>
  )
}
