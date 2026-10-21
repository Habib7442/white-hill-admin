"use client"

import { Clock3, TriangleAlert } from "lucide-react"
import Link from "next/link"

import { PackThumb } from "@/components/admin/pack-thumb"
import { isRx, scheduleLabel } from "@/lib/constants"
import { fullDate, shortAgo } from "@/lib/time"
import { missingForSite, type ProductListItem } from "@/lib/types"
import { cn } from "@/lib/utils"

import { ProductMenu, type MoveTarget, type ProductActions } from "./product-menu"

/**
 * Card from the reference board: logo + name + ⋮, a green highlight line
 * (pack size here), a hairline, a two-line note (composition), and a footer
 * with a badge and the "updated … ago" clock.
 */
export function ProductCard({
  product,
  now,
  actions,
  moveTargets,
  canReorder,
  siteUrl,
  draggable,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  product: ProductListItem
  now: number
  actions: ProductActions
  moveTargets: MoveTarget[]
  canReorder: boolean
  siteUrl: string
  draggable?: boolean
  dragging?: boolean
  onDragStart?: (event: React.DragEvent<HTMLElement>) => void
  onDragEnd?: () => void
}) {
  const name = product.name ?? "Untitled product"
  const missing = missingForSite(product)

  return (
    <article
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      aria-label={name}
      className={cn(
        "group/card relative rounded-card border border-card-border bg-background p-3.5 pb-3 transition-[box-shadow,border-color] hover:border-blue-100 hover:shadow-[0_2px_10px_rgb(19_35_74/0.06)]",
        draggable && "cursor-grab active:cursor-grabbing",
        // Reference: the card's old slot becomes a dashed placeholder while dragging.
        dragging && "border-dashed border-text-faint/50 bg-transparent shadow-none *:invisible"
      )}
    >
      <div className="flex items-center gap-2.5">
        <PackThumb assetId={product.packImage?.assetId} alt="" size={26} />
        <h3 className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium text-text">
          {/* Stretched link: the whole card opens the editor. */}
          <Link
            href={`/products/${product._id}`}
            className="outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:ring-2 focus-visible:after:ring-ring"
            draggable={false}
          >
            {name}
            {product.mark ? <sup className="ml-px text-[0.6em]">{product.mark}</sup> : null}
          </Link>
        </h3>
        <div className="relative z-10 -mr-1.5">
          <ProductMenu
            product={product}
            actions={actions}
            moveTargets={moveTargets}
            canReorder={canReorder}
            siteUrl={siteUrl}
          />
        </div>
      </div>

      <p className="mt-2 truncate text-[0.9375rem] font-semibold text-success">
        {product.pack || product.dosageForm || "—"}
      </p>

      <hr className="my-3 border-hairline" />

      <p className="line-clamp-2 min-h-10 text-sm leading-5 text-text-muted">
        {product.composition || <span className="italic text-text-faint">No composition yet</span>}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-6 items-center rounded-full px-2 text-xs font-semibold",
            isRx(product.schedule) ? "bg-navy-900 text-white" : "bg-blue-50 text-navy-900"
          )}
        >
          {scheduleLabel(product.schedule)}
        </span>
        {!product.visible ? (
          <span className="inline-flex h-6 items-center rounded-full bg-danger-bg px-2 text-xs font-medium text-danger">
            Hidden
          </span>
        ) : null}
        {missing.length ? (
          <span
            className="relative z-10 inline-flex h-6 items-center gap-1 rounded-full bg-warning-bg px-2 text-xs font-medium text-warning"
            title={`Not shown on the website: missing ${missing.join(", ")}`}
          >
            <TriangleAlert className="size-3" aria-hidden="true" />
            <span className="sr-only">Not shown on the website: missing {missing.join(", ")}</span>
            <span aria-hidden="true">Incomplete</span>
          </span>
        ) : null}
        <span
          className="ml-auto inline-flex items-center gap-1 text-xs text-text-faint"
          title={`Updated ${fullDate(product._updatedAt)}`}
        >
          <Clock3 className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
          <span className="sr-only">Updated</span>
          {shortAgo(product._updatedAt, now)}
        </span>
      </div>
    </article>
  )
}
