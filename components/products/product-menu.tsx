"use client"

import {
  ArrowDown,
  ArrowRightLeft,
  ArrowUp,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react"
import Link from "next/link"

import { iconButton } from "@/components/admin/styles"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { QuickPatch } from "@/lib/actions/products"
import type { ProductListItem } from "@/lib/types"

export type ProductActions = {
  onPatch: (product: ProductListItem, patch: QuickPatch) => void
  onMove: (product: ProductListItem, direction: "up" | "down") => void
  onDuplicate: (product: ProductListItem) => void
  onDelete: (product: ProductListItem) => void
}

export type MoveTarget = { key: string; title: string; patch: QuickPatch }

/** The ⋮ menu on cards and rows. "Move to…" is the keyboard/touch alternative to drag and drop. */
export function ProductMenu({
  product,
  actions,
  moveTargets,
  canReorder,
  siteUrl,
}: {
  product: ProductListItem
  actions: ProductActions
  moveTargets: MoveTarget[]
  canReorder: boolean
  siteUrl: string
}) {
  const name = product.name ?? "Untitled product"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={iconButton} aria-label={`Actions for ${name}`}>
        <MoreVertical strokeWidth={1.8} aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuItem render={<Link href={`/products/${product._id}`} />}>
          <Pencil aria-hidden="true" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions.onPatch(product, { visible: !product.visible })}>
          {product.visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          {product.visible ? "Hide from website" : "Show on website"}
        </DropdownMenuItem>
        {moveTargets.length ? (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ArrowRightLeft aria-hidden="true" />
              Move to…
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="min-w-48">
              {moveTargets.map((target) => (
                <DropdownMenuItem key={target.key} onClick={() => actions.onPatch(product, target.patch)}>
                  {target.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : null}
        {canReorder ? (
          <>
            <DropdownMenuItem onClick={() => actions.onMove(product, "up")}>
              <ArrowUp aria-hidden="true" />
              Move up
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => actions.onMove(product, "down")}>
              <ArrowDown aria-hidden="true" />
              Move down
            </DropdownMenuItem>
          </>
        ) : null}
        <DropdownMenuItem onClick={() => actions.onDuplicate(product)}>
          <Copy aria-hidden="true" />
          Duplicate
        </DropdownMenuItem>
        {siteUrl && product.slug && product.visible ? (
          <DropdownMenuItem
            render={<a href={`${siteUrl}/medicines/${product.slug}`} target="_blank" rel="noreferrer" />}
          >
            <ExternalLink aria-hidden="true" />
            View on website
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => actions.onDelete(product)}>
          <Trash2 aria-hidden="true" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
