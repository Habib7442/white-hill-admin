"use client"

import { ArrowDown, ArrowUp, Pencil, Plus, Tag, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { showWarning } from "@/components/admin/notify"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { PageBody, PageHeader } from "@/components/admin/page-header"
import { dotColours, iconButton, primaryOutline } from "@/components/admin/styles"
import { deleteCategory, moveCategory } from "@/lib/actions/categories"
import type { CategoryListItem } from "@/lib/types"
import { cn } from "@/lib/utils"

import { CategoryDialog } from "./category-dialog"

export function CategoriesView({
  categories,
  openNew,
}: {
  categories: CategoryListItem[]
  openNew: boolean
}) {
  const router = useRouter()
  const [editing, setEditing] = useState<CategoryListItem | null>(null)
  const [creating, setCreating] = useState(openNew)
  const [deleting, setDeleting] = useState<CategoryListItem | null>(null)
  const [pending, startTransition] = useTransition()
  const usedBy = deleting?.productCount ?? 0
  const inUse = usedBy > 0

  // The sidebar's "Add category" link can be followed while already here.
  const [syncedOpenNew, setSyncedOpenNew] = useState(openNew)
  if (syncedOpenNew !== openNew) {
    setSyncedOpenNew(openNew)
    if (openNew) setCreating(true)
  }

  function move(category: CategoryListItem, direction: "up" | "down") {
    startTransition(async () => {
      const result = await moveCategory(category._id, direction)
      if (!result.ok) toast.error(result.error)
      showWarning(result)
    })
  }

  return (
    <>
      <PageHeader
        title="Categories"
        description="Groups shown as tags and filters on the website's medicines section."
        actions={
          <button type="button" className={primaryOutline} onClick={() => setCreating(true)}>
            <Plus strokeWidth={2} aria-hidden="true" />
            New category
          </button>
        }
      />
      <PageBody>
        {categories.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-primary">
              <Tag className="size-7" strokeWidth={1.6} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-medium text-text">No categories yet</h2>
            <p className="mt-1 text-sm text-text-muted">Every product needs one. Add the first, e.g. “Bone & Calcium”.</p>
          </div>
        ) : (
          <ol className="max-w-3xl space-y-3" aria-busy={pending}>
            {categories.map((category, index) => {
              const title = category.title ?? "Untitled"
              return (
                <li
                  key={category._id}
                  className="flex flex-wrap items-center gap-3 rounded-card border border-card-border p-3 pl-4 sm:flex-nowrap"
                >
                  <span className={cn("size-2.5 shrink-0 rounded-full", dotColours[index % dotColours.length])} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-text">{title}</p>
                    <p className="truncate text-xs text-text-faint">/{category.slug ?? "—"}</p>
                  </div>
                  <Link
                    href={`/products?category=${category._id}`}
                    className="rounded-full bg-frame px-2.5 py-1 text-xs font-medium text-white tabular-nums hover:bg-frame-active"
                  >
                    {category.productCount} {category.productCount === 1 ? "product" : "products"}
                  </Link>
                  <div className="ml-auto flex items-center gap-0.5">
                    <button
                      type="button"
                      className={iconButton}
                      disabled={index === 0 || pending}
                      onClick={() => move(category, "up")}
                      aria-label={`Move ${title} up`}
                    >
                      <ArrowUp strokeWidth={1.8} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={iconButton}
                      disabled={index === categories.length - 1 || pending}
                      onClick={() => move(category, "down")}
                      aria-label={`Move ${title} down`}
                    >
                      <ArrowDown strokeWidth={1.8} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={iconButton}
                      onClick={() => setEditing(category)}
                      aria-label={`Edit ${title}`}
                    >
                      <Pencil strokeWidth={1.8} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={cn(iconButton, "hover:bg-danger-bg hover:text-danger")}
                      onClick={() => setDeleting(category)}
                      aria-label={`Delete ${title}`}
                    >
                      <Trash2 strokeWidth={1.8} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </PageBody>

      <CategoryDialog
        open={creating || editing !== null}
        onOpenChange={(open) => {
          if (open) return
          setCreating(false)
          setEditing(null)
          if (openNew) router.replace("/categories")
        }}
        category={editing}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={inUse ? `${deleting?.title ?? "This category"} is in use` : `Delete ${deleting?.title ?? "category"}?`}
        description={
          inUse
            ? `${usedBy} ${usedBy === 1 ? "product uses" : "products use"} this category. Move ${usedBy === 1 ? "it" : "them"} to another category first (drag the cards on the Products board), then delete it.`
            : "It is removed from Sanity. This cannot be undone."
        }
        pending={pending}
        onConfirm={
          inUse
            ? undefined
            : () =>
                startTransition(async () => {
                  if (!deleting) return
                  const result = await deleteCategory(deleting._id)
                  if (!result.ok) {
                    toast.error(result.error)
                    return
                  }
                  toast.success(`${deleting.title ?? "Category"} deleted`)
                  showWarning(result)
                  setDeleting(null)
                })
        }
      />
    </>
  )
}
