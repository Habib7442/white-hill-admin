import type { Metadata } from "next"
import { Suspense } from "react"

import { ListSkeleton } from "@/components/admin/skeletons"
import { CategoriesView } from "@/components/categories/categories-view"
import { getCategories } from "@/lib/data"

export const metadata: Metadata = { title: "Categories" }

export default function CategoriesPage({ searchParams }: PageProps<"/categories">) {
  return (
    <Suspense fallback={<ListSkeleton title="Categories" />}>
      <Categories searchParams={searchParams} />
    </Suspense>
  )
}

async function Categories({ searchParams }: { searchParams: PageProps<"/categories">["searchParams"] }) {
  const [categories, params] = await Promise.all([getCategories(), searchParams])
  // ?new=1 comes from the sidebar's "Add category" link.
  return <CategoriesView categories={categories} openNew={params.new === "1"} />
}
