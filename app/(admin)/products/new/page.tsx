import type { Metadata } from "next"
import { Suspense } from "react"

import { PageHeader } from "@/components/admin/page-header"
import { FormSkeleton } from "@/components/admin/skeletons"
import { BackLink } from "@/components/products/form/back-link"
import { ProductForm } from "@/components/products/form/product-form"
import { getCategories, getProducts } from "@/lib/data"
import { toFormValues } from "@/lib/product-form-values"

export const metadata: Metadata = { title: "New product" }

export default function NewProductPage() {
  return (
    <Suspense fallback={<FormSkeleton title="New product" />}>
      <NewProduct />
    </Suspense>
  )
}

async function NewProduct() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()])

  return (
    <>
      <PageHeader
        back={<BackLink href="/products" label="Products" />}
        title="New product"
        description="Fill in what is printed on the pack. Required fields are marked *."
      />
      <ProductForm
        productId={null}
        initialValues={toFormValues(null)}
        categories={categories.map((c) => ({ _id: c._id, title: c.title }))}
        relatedOptions={products.map((p) => ({ _id: p._id, name: p.name, assetId: p.packImage?.assetId ?? null }))}
      />
    </>
  )
}
