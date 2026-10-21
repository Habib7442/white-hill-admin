import { Info } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { PageHeader } from "@/components/admin/page-header"
import { FormSkeleton } from "@/components/admin/skeletons"
import { BackLink } from "@/components/products/form/back-link"
import { ProductForm } from "@/components/products/form/product-form"
import { ProductHeaderActions } from "@/components/products/form/product-header-actions"
import { getCategories, getProduct, getProducts } from "@/lib/data"
import { toFormValues } from "@/lib/product-form-values"
import { siteUrl } from "@/lib/sanity/config"
import { fullDate } from "@/lib/time"

export const metadata: Metadata = { title: "Edit product" }

export default function EditProductPage({ params }: PageProps<"/products/[id]">) {
  return (
    <Suspense fallback={<FormSkeleton title="Edit product" />}>
      <EditProduct params={params} />
    </Suspense>
  )
}

async function EditProduct({ params }: { params: PageProps<"/products/[id]">["params"] }) {
  const { id } = await params
  const [product, categories, products] = await Promise.all([getProduct(id), getCategories(), getProducts()])
  if (!product) notFound()

  const name = product.name ?? "Untitled product"
  const viewUrl = siteUrl && product.slug && product.visible ? `${siteUrl}/medicines/${product.slug}` : null

  return (
    <>
      <PageHeader
        back={<BackLink href="/products" label="Products" />}
        title={
          <>
            {name}
            {product.mark ? <sup className="ml-0.5 text-[0.55em]">{product.mark}</sup> : null}
          </>
        }
        description={`Last updated ${fullDate(product._updatedAt)}${product.visible ? "" : " · Hidden from website"}`}
        actions={<ProductHeaderActions product={{ _id: product._id, name: product.name }} viewUrl={viewUrl} />}
      />
      {product.hasDraft ? (
        <p className="mx-4 mt-4 flex gap-2 rounded-xl bg-warning-bg px-4 py-3 text-sm text-warning sm:mx-7">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          An unpublished draft of this product exists in Sanity Studio. Saving here publishes this version and
          discards that draft.
        </p>
      ) : null}
      <ProductForm
        productId={product._id}
        initialValues={toFormValues(product)}
        categories={categories.map((c) => ({ _id: c._id, title: c.title }))}
        relatedOptions={products.map((p) => ({ _id: p._id, name: p.name, assetId: p.packImage?.assetId ?? null }))}
      />
    </>
  )
}
