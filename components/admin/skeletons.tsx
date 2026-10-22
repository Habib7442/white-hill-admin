import { PageBody, PageHeader } from "./page-header"

const block = "animate-pulse rounded-xl bg-muted"

/** Products page in List view (the default): toolbar + table rows. */
export function TableSkeleton({ title }: { title: string }) {
  return (
    <>
      <PageHeader
        title={title}
        actions={<div className={`${block} h-11 w-full sm:w-80`} />}
        toolbar={<div className={`${block} h-11 w-28`} />}
      />
      <div className="px-4 pt-5 sm:px-7" aria-busy="true" aria-label="Loading">
        <div className="overflow-hidden rounded-card border border-card-border">
          <div className="h-11 bg-muted/60" />
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex items-center gap-4 border-t border-hairline px-4 py-3">
              <div className={`${block} size-9 shrink-0 rounded-md`} />
              <div className="flex-1 space-y-2">
                <div className={`${block} h-3.5 w-1/3`} />
                <div className={`${block} h-3 w-1/2`} />
              </div>
              <div className={`${block} hidden h-3.5 w-24 md:block`} />
              <div className={`${block} hidden h-5 w-9 rounded-full md:block`} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export function FormSkeleton({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <PageBody>
        <div className="max-w-[55rem] space-y-5" aria-busy="true" aria-label="Loading">
          <div className={`${block} h-11 w-full max-w-md`} />
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="space-y-2">
              <div className={`${block} h-4 w-32`} />
              <div className={`${block} h-11`} />
            </div>
          ))}
        </div>
      </PageBody>
    </>
  )
}

export function ListSkeleton({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <PageBody>
        <div className="space-y-3" aria-busy="true" aria-label="Loading">
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className={`${block} h-16`} />
          ))}
        </div>
      </PageBody>
    </>
  )
}
