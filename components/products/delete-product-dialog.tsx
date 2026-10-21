"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { deleteProduct, getProductReferrers } from "@/lib/actions/products"

type Target = { _id: string; name: string | null }

/** Confirms a delete and lists products whose "Related products" will lose it. */
export function DeleteProductDialog({
  product,
  onClose,
  fromEditPage = false,
}: {
  product: Target | null
  onClose: () => void
  /** The action redirects to /products after deleting. */
  fromEditPage?: boolean
}) {
  const [referrers, setReferrers] = useState<Target[] | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!product) return
    let cancelled = false
    getProductReferrers(product._id).then((list) => {
      if (!cancelled) setReferrers(list)
    })
    return () => {
      cancelled = true
      setReferrers(null)
    }
  }, [product])

  const name = product?.name ?? "this product"

  return (
    <ConfirmDialog
      open={product !== null}
      onOpenChange={(open) => !open && onClose()}
      title={`Delete ${name}?`}
      description="It is removed from the website and from Sanity. This cannot be undone."
      pending={pending}
      onConfirm={() =>
        startTransition(async () => {
          if (!product) return
          const result = await deleteProduct(product._id, fromEditPage)
          if (!result.ok) {
            toast.error(result.error)
            return
          }
          toast.success(`${name} deleted`)
          onClose()
        })
      }
    >
      {referrers && referrers.length > 0 ? (
        <div className="rounded-xl bg-warning-bg px-3.5 py-3 text-sm text-warning">
          It is also removed from “Related products” on:
          <ul className="mt-1 list-disc pl-5">
            {referrers.map((r) => (
              <li key={r._id}>{r.name ?? "Untitled product"}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </ConfirmDialog>
  )
}
