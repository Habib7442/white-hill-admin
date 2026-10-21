import Link from "next/link"

import { pill } from "@/components/admin/styles"

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-medium text-text">Not found</h1>
      <p className="mt-1 text-sm text-text-muted">It may have been deleted, or the link is wrong.</p>
      <Link href="/products" className={`${pill} mt-6`}>
        Back to products
      </Link>
    </div>
  )
}
