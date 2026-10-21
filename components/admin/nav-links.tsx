"use client"

import { LayoutGrid, Package, Settings2, Tag } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Dashboard", icon: LayoutGrid, colour: "text-dot-5" },
  { href: "/products", label: "Products", icon: Package, colour: "text-dot-1" },
  { href: "/categories", label: "Categories", icon: Tag, colour: "text-dot-4" },
  { href: "/settings", label: "Site settings", icon: Settings2, colour: "text-dot-3" },
] as const

export function NavLinks() {
  const pathname = usePathname()

  return (
    <NavList isActive={(href) => (href === "/" ? pathname === "/" : pathname.startsWith(href))} />
  )
}

/** Same list without an active item, for the Suspense fallback. */
export function NavLinksFallback() {
  return <NavList isActive={() => false} />
}

function NavList({ isActive }: { isActive: (href: string) => boolean }) {
  return (
    <ul className="space-y-1">
      {links.map(({ href, label, icon: Icon, colour }) => {
        const active = isActive(href)
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                active
                  ? "bg-frame-active font-medium text-frame-text"
                  : "text-frame-text-muted hover:bg-frame-raised hover:text-frame-text"
              )}
            >
              <Icon className={cn("size-4", colour)} strokeWidth={1.8} aria-hidden="true" />
              {label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
