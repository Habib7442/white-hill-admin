"use client"

import { pill } from "@/components/admin/styles"

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-2xl font-medium text-text">Something went wrong</h1>
      <p className="mt-1 max-w-md text-sm text-text-muted">
        The content couldn’t be loaded from Sanity. Check your connection and try again.
      </p>
      <button type="button" onClick={reset} className={`${pill} mt-6`}>
        Try again
      </button>
    </div>
  )
}
