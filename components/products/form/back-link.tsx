import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="-ml-2 mb-1 inline-flex h-9 items-center gap-1 rounded-lg px-2 text-sm text-text-faint transition-colors hover:bg-muted hover:text-text"
    >
      <ChevronLeft className="size-4" strokeWidth={1.8} aria-hidden="true" />
      {label}
    </Link>
  )
}
