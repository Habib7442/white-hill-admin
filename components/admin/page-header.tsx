import { cn } from "@/lib/utils"

/**
 * Panel header from the reference: title on the left, search + primary
 * action on the right, then an optional toolbar row and a hairline.
 */
export function PageHeader({
  title,
  description,
  actions,
  toolbar,
  back,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  toolbar?: React.ReactNode
  back?: React.ReactNode
}) {
  return (
    <header className="shrink-0 border-b border-hairline px-4 pt-5 pb-4 sm:px-7 sm:pt-6">
      {back}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h1 className="truncate text-[1.5rem] font-medium tracking-tight text-text sm:text-[1.625rem]">
            {title}
          </h1>
          {description ? <p className="mt-0.5 text-sm text-text-muted">{description}</p> : null}
        </div>
        {actions ? (
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">{actions}</div>
        ) : null}
      </div>
      {toolbar ? <div className="mt-4 flex flex-wrap items-center gap-3">{toolbar}</div> : null}
    </header>
  )
}

/** Scrolls inside the panel on desktop; the page scrolls on mobile. */
export function PageBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex-1 px-4 py-6 sm:px-7 lg:min-h-0 lg:overflow-y-auto", className)}>
      {children}
    </div>
  )
}
