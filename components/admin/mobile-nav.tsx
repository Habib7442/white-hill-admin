"use client"

import { Menu } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

import { Brand } from "./brand"

/** Below 1024 px: dark top bar with a hamburger that opens the sidebar. */
export function MobileNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-frame px-4 lg:hidden">
      <Link href="/" className="flex h-11 items-center" aria-label="WhiteHill admin home">
        <Brand />
      </Link>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className="flex size-11 items-center justify-center rounded-lg text-frame-text transition-colors hover:bg-frame-raised"
          aria-label="Open menu"
        >
          <Menu className="size-5" strokeWidth={1.8} aria-hidden="true" />
        </SheetTrigger>
        <SheetContent
          side="left"
          className="no-scrollbar w-[min(18rem,85vw)] overflow-y-auto border-frame-line bg-frame px-4 py-5 text-frame-text"
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          {/* Close the sheet when any link inside it is followed. */}
          <div
            onClickCapture={(event) => {
              if ((event.target as HTMLElement).closest("a")) setOpen(false)
            }}
          >
            {children}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
