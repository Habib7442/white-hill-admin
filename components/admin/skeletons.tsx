import { PageBody, PageHeader } from "./page-header"

const block = "animate-pulse rounded-xl bg-muted"

export function BoardSkeleton({ title }: { title: string }) {
  return (
    <>
      <PageHeader
        title={title}
        actions={<div className={`${block} h-11 w-full sm:w-80`} />}
        toolbar={<div className={`${block} h-11 w-28`} />}
      />
      <div className="flex gap-5 overflow-hidden px-4 pt-5 sm:px-7" aria-busy="true" aria-label="Loading">
        {[0, 1, 2].map((column) => (
          <div key={column} className="w-[min(19rem,82vw)] shrink-0 space-y-3">
            <div className={`${block} h-7 w-2/3`} />
            {[0, 1, 2].map((card) => (
              <div key={card} className={`${block} h-40 rounded-card`} />
            ))}
          </div>
        ))}
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
