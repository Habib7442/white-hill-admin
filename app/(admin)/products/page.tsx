import type { Metadata } from "next"
import { Suspense } from "react"

import { TableSkeleton } from "@/components/admin/skeletons"
import { emptyFilters, type Filters } from "@/components/products/grouping"
import { ProductsView } from "@/components/products/products-view"
import { getCategories, getProducts } from "@/lib/data"
import { siteUrl } from "@/lib/sanity/config"
import { requestTime } from "@/lib/time"

export const metadata: Metadata = { title: "Products" }

export default function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <Suspense fallback={<TableSkeleton title="Products" />}>
      <Products searchParams={searchParams} />
    </Suspense>
  )
}

async function Products({ searchParams }: { searchParams: PageProps<"/products">["searchParams"] }) {
  const [products, categories, params] = await Promise.all([
    getProducts(),
    getCategories(),
    searchParams,
  ])

  // Sidebar links: ?category=<id> and ?show=hidden
  const category = typeof params.category === "string" ? params.category : null
  const initialFilters: Filters = {
    ...emptyFilters,
    categories: category && categories.some((c) => c._id === category) ? [category] : [],
    visibility: params.show === "hidden" ? "hidden" : "all",
  }

  return (
    <ProductsView
      products={products}
      categories={categories}
      initialFilters={initialFilters}
      now={requestTime()}
      siteUrl={siteUrl}
    />
  )
}
