"use client"

import { PackageOpen, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useOptimistic, useRef, useState, useTransition } from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"
import { SearchInput } from "@/components/admin/search-input"
import { primaryOutline } from "@/components/admin/styles"
import {
  duplicateProduct,
  moveProduct,
  updateProductQuick,
  type QuickPatch,
} from "@/lib/actions/products"
import { missingForSite, type CategoryListItem, type ProductListItem } from "@/lib/types"

import { Board } from "./board"
import { DeleteProductDialog } from "./delete-product-dialog"
import {
  activeFilterCount,
  buildColumns,
  emptyFilters,
  sortProducts,
  type Filters,
  type GroupBy,
  type SortBy,
} from "./grouping"
import { ProductList } from "./product-list"
import type { ProductActions } from "./product-menu"
import { FilterMenu, GroupMenu, SortMenu, ViewToggle } from "./toolbar-menus"

type View = "board" | "list"
const VIEW_KEY = "wh-admin:products-view"
const PAGE_SIZE = 20

export function ProductsView({
  products,
  categories,
  initialFilters,
  now,
  siteUrl,
}: {
  products: ProductListItem[]
  categories: CategoryListItem[]
  initialFilters: Filters
  now: number
  siteUrl: string
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState(initialFilters)
  const [sortBy, setSortBy] = useState<SortBy>("order")
  const [groupBy, setGroupBy] = useState<GroupBy>("category")
  const [view, setView] = useState<View>("list")
  const [deleting, setDeleting] = useState<ProductListItem | null>(null)
  const [, startTransition] = useTransition()

  // Sidebar links change the URL filters while this view stays mounted.
  // Compared by value: refresh() after each action sends a new object.
  const initialKey = JSON.stringify(initialFilters)
  const [syncedKey, setSyncedKey] = useState(initialKey)
  if (syncedKey !== initialKey) {
    setSyncedKey(initialKey)
    setFilters(initialFilters)
  }

  // List is the default; a browser that picked Board keeps it (a convenience only).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read once after hydration
      if (saved === "board" || saved === "list") setView(saved)
    } catch {}
  }, [])
  function changeView(next: View) {
    setView(next)
    try {
      localStorage.setItem(VIEW_KEY, next)
    } catch {}
  }

  const [optimistic, applyOptimistic] = useOptimistic(
    products,
    (state, update: { id: string; patch: Partial<ProductListItem> }) =>
      state.map((p) => (p._id === update.id ? { ...p, ...update.patch } : p))
  )

  const categoryTitles = useMemo(
    () => new Map(categories.map((c) => [c._id, c.title ?? "Untitled"])),
    [categories]
  )

  const visibleProducts = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = optimistic.filter((p) => {
      if (q && ![p.name, p.composition, p.slug, p.pack].some((v) => v?.toLowerCase().includes(q))) return false
      if (filters.visibility === "visible" && !p.visible) return false
      if (filters.visibility === "hidden" && p.visible) return false
      if (filters.categories.length && !filters.categories.includes(p.categoryId ?? "")) return false
      if (filters.schedules.length && !filters.schedules.includes(p.schedule ?? "otc")) return false
      if (filters.types.length && !filters.types.includes(p.productType ?? "")) return false
      if (filters.incompleteOnly && missingForSite(p).length === 0) return false
      return true
    })
    return sortProducts(filtered, sortBy)
  }, [optimistic, query, filters, sortBy])

  const columns = useMemo(
    () => buildColumns(visibleProducts, categories, groupBy),
    [visibleProducts, categories, groupBy]
  )

  // List view pagination: back to page 1 whenever search, filters or sort change.
  const [page, setPage] = useState(1)
  const listKey = JSON.stringify([query, filters, sortBy])
  const [pagedKey, setPagedKey] = useState(listKey)
  if (pagedKey !== listKey) {
    setPagedKey(listKey)
    setPage(1)
  }
  const pageCount = Math.max(1, Math.ceil(visibleProducts.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount) // e.g. after deleting the last item on the last page
  const offset = (currentPage - 1) * PAGE_SIZE
  const pageProducts = visibleProducts.slice(offset, offset + PAGE_SIZE)
  const listRef = useRef<HTMLDivElement>(null)

  function goToPage(next: number) {
    setPage(next)
    // Start the new page at its top (the panel scrolls on desktop, the window on mobile).
    listRef.current?.scrollTo({ top: 0 })
    document.getElementById("main")?.scrollIntoView({ block: "start" })
  }

  // Reordering changes the site-wide order, so only offer it on the full, ordered list.
  const canReorder = sortBy === "order" && !query && activeFilterCount(filters) === 0

  const patchProduct = useCallback((product: ProductListItem, patch: QuickPatch) => {
    startTransition(async () => {
      applyOptimistic({ id: product._id, patch })
      const result = await updateProductQuick(product._id, patch)
      if (result.ok) toast.success(`${product.name ?? "Product"} updated`)
      else toast.error(result.error)
    })
  }, [applyOptimistic])

  const actions: ProductActions = {
    onPatch: patchProduct,
    onMove: (product, direction) =>
      startTransition(async () => {
        const result = await moveProduct(product._id, direction)
        if (!result.ok) toast.error(result.error)
      }),
    onDuplicate: (product) =>
      startTransition(async () => {
        const result = await duplicateProduct(product._id)
        if (!result.ok) {
          toast.error(result.error)
          return
        }
        toast.success("Copy created. It stays hidden until you show it.", {
          action: { label: "Edit", onClick: () => router.push(`/products/${result.data.id}`) },
        })
      }),
    onDelete: setDeleting,
  }

  const moveTargetsFor = (product: ProductListItem) =>
    buildColumns([], categories, groupBy)
      .filter((c) => c.patch && !columnHas(groupBy, c.key, product))
      .map((c) => ({ key: c.key, title: c.title, patch: c.patch! }))

  return (
    <>
      <PageHeader
        title="Products"
        actions={
          <>
            <SearchInput
              value={query}
              onChange={setQuery}
              label="Search products"
              placeholder="Search …"
              className="min-w-0 flex-1 sm:w-64 sm:flex-none"
            />
            <Link href="/products/new" className={primaryOutline}>
              <Plus strokeWidth={2} aria-hidden="true" />
              New product
            </Link>
          </>
        }
        toolbar={
          <>
            <FilterMenu filters={filters} onChange={setFilters} categories={categories} />
            <div className="flex items-center gap-3 sm:ml-auto">
              <SortMenu value={sortBy} onChange={setSortBy} />
              {view === "board" ? <GroupMenu value={groupBy} onChange={setGroupBy} /> : null}
              <ViewToggle value={view} onChange={changeView} />
            </div>
          </>
        }
      />

      {products.length === 0 ? (
        <EmptyState />
      ) : visibleProducts.length === 0 ? (
        <div className="px-4 py-16 text-center sm:px-7">
          <p className="font-medium text-text">No products match.</p>
          <button
            type="button"
            className="mt-2 text-sm font-medium text-primary hover:underline"
            onClick={() => {
              setQuery("")
              setFilters(emptyFilters)
            }}
          >
            Clear search and filters
          </button>
        </div>
      ) : view === "board" ? (
        <Board
          columns={columns}
          pageSize={PAGE_SIZE}
          now={now}
          actions={actions}
          canReorder={canReorder}
          siteUrl={siteUrl}
        />
      ) : (
        <div ref={listRef} className="flex-1 lg:min-h-0 lg:overflow-y-auto">
          <ProductList
            products={pageProducts}
            offset={offset}
            total={visibleProducts.length}
            categoryTitles={categoryTitles}
            moveTargetsFor={moveTargetsFor}
            now={now}
            actions={actions}
            canReorder={canReorder}
            siteUrl={siteUrl}
          />
          <div className="px-4 pb-6 sm:px-7">
            <Pagination
              page={currentPage}
              pageSize={PAGE_SIZE}
              total={visibleProducts.length}
              onChange={goToPage}
            />
          </div>
        </div>
      )}

      <DeleteProductDialog product={deleting} onClose={() => setDeleting(null)} />
    </>
  )
}

function columnHas(groupBy: GroupBy, key: string, product: ProductListItem) {
  switch (groupBy) {
    case "category":
      return product.categoryId === key
    case "visibility":
      return (product.visible ? "visible" : "hidden") === key
    case "schedule":
      return (product.schedule ?? "otc") === key
    case "productType":
      return product.productType === key
  }
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-primary">
        <PackageOpen className="size-7" strokeWidth={1.6} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-medium text-text">No products yet</h2>
      <p className="mt-1 max-w-sm text-sm text-text-muted">
        Add the first medicine with its pack image and composition. It shows on the website once it is complete.
      </p>
      <Link href="/products/new" className={`${primaryOutline} mt-5`}>
        <Plus strokeWidth={2} aria-hidden="true" />
        New product
      </Link>
    </div>
  )
}
