"use client"

import { ChevronDown, ExternalLink, LogOut, UserRound } from "lucide-react"
import { useTransition } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from "@/lib/auth/actions"

/** The reference's "Accounts / My budget" box: who is signed in + menu. */
export function AccountMenu({ email, siteUrl }: { email: string; siteUrl: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex w-full items-center gap-3 rounded-xl bg-frame-raised p-2.5 pr-3 text-left transition-colors hover:bg-frame-active aria-expanded:bg-frame-active"
        aria-label={`Account: ${email}`}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
          <UserRound className="size-4.5" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-frame-text-muted">Signed in as</span>
          <span className="block truncate text-[0.8125rem] text-frame-text">{email}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-frame-text-muted" strokeWidth={1.8} aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-(--anchor-width) min-w-56">
        {siteUrl ? (
          <DropdownMenuItem render={<a href={siteUrl} target="_blank" rel="noreferrer" />}>
            <ExternalLink aria-hidden="true" />
            View website
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={pending}
          onClick={() => startTransition(() => logout())}
        >
          <LogOut aria-hidden="true" />
          {pending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
