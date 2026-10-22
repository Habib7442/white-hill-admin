"use client"

import { ArrowDown, ArrowUp } from "lucide-react"
import Link from "next/link"

import { PackThumb } from "@/components/admin/pack-thumb"
import { iconButton } from "@/components/admin/styles"
import { Switch } from "@/components/ui/switch"
import { scheduleLabel } from "@/lib/constants"
import { fullDate, shortAgo } from "@/lib/time"
import { missingForSite, type ProductListItem } from "@/lib/types"

import { ProductCard } from "./product-card"
import { ProductMenu, type MoveTarget, type ProductActions } from "./product-menu"

/**
 * Dense list view: a table from 768 px, stacked cards below. Shows one page;
 * `offset` and `total` place it in the full list for Move up / down.
 */
export function ProductList({
  products,
  offset,
  total,
  categoryTitles,
  moveTargetsFor,
  now,
  actions,
  canReorder,
  siteUrl,
}: {
  products: ProductListItem[]
  offset: number
  total: number
  categoryTitles: Map<string, string>
  moveTargetsFor: (product: ProductListItem) => MoveTarget[]
  now: number
  actions: ProductActions
  canReorder: boolean
  siteUrl: string
}) {
  return (
    <div className="px-4 pt-5 pb-4 sm:px-7">
      <div className="grid gap-3 md:hidden">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            now={now}
            actions={actions}
            canReorder={canReorder}
            siteUrl={siteUrl}
            moveTargets={moveTargetsFor(product)}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-card border border-card-border md:block">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="bg-muted/60 text-xs font-medium text-text-muted">
            <tr>
              <th scope="col" className="w-14 py-3 pl-4 font-medium">
                <span className="sr-only">Pack</span>
              </th>
              <th scope="col" className="py-3 pr-4 font-medium">Product</th>
              <th scope="col" className="py-3 pr-4 font-medium">Category</th>
              <th scope="col" className="py-3 pr-4 font-medium">Pack size</th>
              <th scope="col" className="py-3 pr-4 font-medium">Schedule</th>
              <th scope="col" className="py-3 pr-4 font-medium">On website</th>
              {canReorder ? (
                <th scope="col" className="py-3 pr-4 font-medium">Order</th>
              ) : null}
              <th scope="col" className="py-3 pr-4 font-medium">Updated</th>
              <th scope="col" className="w-12 py-3 pr-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {products.map((product, index) => {
              const name = product.name ?? "Untitled product"
              const missing = missingForSite(product)
              return (
                <tr key={product._id} className="transition-colors hover:bg-blue-25/60">
                  <td className="py-2.5 pl-4">
                    <PackThumb assetId={product.packImage?.assetId} alt="" size={36} />
                  </td>
                  <td className="max-w-72 py-2.5 pr-4">
                    <Link
                      href={`/products/${product._id}`}
                      className="font-medium text-text hover:text-primary hover:underline"
                    >
                      {name}
                      {product.mark ? <sup className="ml-px text-[0.6em]">{product.mark}</sup> : null}
                    </Link>
                    <p className="truncate text-xs text-text-muted">{product.composition}</p>
                    {missing.length ? (
                      <p className="text-xs text-warning">Not on website: missing {missing.join(", ")}</p>
                    ) : null}
                  </td>
                  <td className="py-2.5 pr-4 text-text-muted">
                    {(product.categoryId && categoryTitles.get(product.categoryId)) || "—"}
                  </td>
                  <td className="py-2.5 pr-4 font-medium whitespace-nowrap text-success">{product.pack || "—"}</td>
                  <td className="py-2.5 pr-4 whitespace-nowrap text-text-muted">{scheduleLabel(product.schedule)}</td>
                  <td className="py-2.5 pr-4">
                    <Switch
                      checked={product.visible}
                      onCheckedChange={(visible) => actions.onPatch(product, { visible })}
                      aria-label={`Show ${name} on website`}
                    />
                  </td>
                  {canReorder ? (
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          className={iconButton}
                          disabled={offset + index === 0}
                          onClick={() => actions.onMove(product, "up")}
                          aria-label={`Move ${name} up`}
                        >
                          <ArrowUp strokeWidth={1.8} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className={iconButton}
                          disabled={offset + index === total - 1}
                          onClick={() => actions.onMove(product, "down")}
                          aria-label={`Move ${name} down`}
                        >
                          <ArrowDown strokeWidth={1.8} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  ) : null}
                  <td className="py-2.5 pr-4 whitespace-nowrap text-text-faint" title={fullDate(product._updatedAt)}>
                    {shortAgo(product._updatedAt, now)} ago
                  </td>
                  <td className="py-2.5 pr-3">
                    <ProductMenu
                      product={product}
                      actions={actions}
                      moveTargets={moveTargetsFor(product)}
                      canReorder={false}
                      siteUrl={siteUrl}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
