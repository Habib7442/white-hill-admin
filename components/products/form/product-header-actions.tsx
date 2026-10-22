"use client"

import { Copy, ExternalLink, MoreHorizontal, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { showWarning } from "@/components/admin/notify"
import { pill } from "@/components/admin/styles"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { duplicateProduct } from "@/lib/actions/products"

import { DeleteProductDialog } from "../delete-product-dialog"

export function ProductHeaderActions({
  product,
  viewUrl,
}: {
  product: { _id: string; name: string | null }
  viewUrl: string | null
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <>
      {viewUrl ? (
        <a href={viewUrl} target="_blank" rel="noreferrer" className={pill}>
          <ExternalLink strokeWidth={1.8} aria-hidden="true" />
          View on site
        </a>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger className={`${pill} px-3`} aria-label="More actions">
          <MoreHorizontal strokeWidth={1.8} aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuItem
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await duplicateProduct(product._id)
                if (!result.ok) {
                  toast.error(result.error)
                  return
                }
                toast.success("Copy created. It stays hidden until you show it.")
                showWarning(result)
                router.push(`/products/${result.data.id}`)
              })
            }
          >
            <Copy aria-hidden="true" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDeleting(true)}>
            <Trash2 aria-hidden="true" />
            Delete product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteProductDialog
        product={deleting ? product : null}
        onClose={() => setDeleting(false)}
        fromEditPage
      />
    </>
  )
}
