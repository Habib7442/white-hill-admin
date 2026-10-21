// Shared class strings for the reference's controls: grey pill buttons,
// the outlined primary ("+ New Deal") button, and the solid save button.

export const pill =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-muted px-4 text-sm font-medium text-text-muted transition-colors hover:bg-muted-hover hover:text-text disabled:opacity-60 aria-expanded:bg-muted-hover aria-expanded:text-text [&_svg]:size-4 [&_svg]:shrink-0"

export const primaryOutline =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border-[1.5px] border-primary bg-background px-4 text-sm font-semibold text-primary transition-colors hover:bg-blue-50 disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0"

export const primarySolid =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-blue-700 disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0"

export const dangerSolid =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-danger px-5 text-sm font-semibold text-white transition-colors hover:bg-danger/90 disabled:opacity-60 [&_svg]:size-4"

export const iconButton =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-text-faint transition-colors hover:bg-muted hover:text-text aria-expanded:bg-muted aria-expanded:text-text disabled:opacity-40 [&_svg]:size-4"

/** Column / tile accent dots, cycled by index. */
export const dotColours = [
  "bg-dot-1",
  "bg-dot-2",
  "bg-dot-3",
  "bg-dot-4",
  "bg-dot-5",
  "bg-dot-6",
] as const

export const textColours = [
  "text-dot-1",
  "text-dot-2",
  "text-dot-3",
  "text-dot-4",
  "text-dot-5",
  "text-dot-6",
] as const
