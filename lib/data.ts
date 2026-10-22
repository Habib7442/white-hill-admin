import "server-only"

import { cacheLife, cacheTag } from "next/cache"
import { cache } from "react"

import { requireAdmin } from "./auth/dal"
import { sanity } from "./sanity/client"
import { isPublishedId } from "./sanity/ids"
import {
  categoryListQuery,
  productDetailQuery,
  productListQuery,
  settingsQuery,
} from "./sanity/queries"
import type { CategoryListItem, ProductDetail, ProductListItem, SiteSettings } from "./types"

// Every loader checks the session first (requireAdmin reads the cookie), so
// no page can read content without a valid admin login, even if proxy.ts is
// bypassed. The Sanity reads themselves are cached on the server
// (`"use cache"`, below), so pages and Back navigations don't wait on Sanity.
// Admin writes expire the matching tag at once (lib/actions/*, updateTag);
// edits made elsewhere (Sanity Studio) show within about a minute.
// cache() dedupes calls within one request (the sidebar renders twice).

export const tags = {
  products: "admin:products",
  product: (id: string) => `admin:product:${id}`,
  categories: "admin:categories",
  settings: "admin:settings",
} as const

// Fresh for 1 minute, then refreshed in the background on the next read.
const adminCache = { stale: 60, revalidate: 60, expire: 3600 }

async function fetchProducts() {
  "use cache"
  cacheLife(adminCache)
  cacheTag(tags.products)
  return sanity.fetch<ProductListItem[]>(productListQuery)
}

async function fetchProduct(id: string) {
  "use cache"
  cacheLife(adminCache)
  cacheTag(tags.products, tags.product(id))
  return sanity.fetch<ProductDetail | null>(productDetailQuery, { id })
}

async function fetchCategories() {
  "use cache"
  cacheLife(adminCache)
  // Category rows show product counts, so product writes refresh them too.
  cacheTag(tags.categories, tags.products)
  return sanity.fetch<CategoryListItem[]>(categoryListQuery)
}

async function fetchSettings() {
  "use cache"
  cacheLife(adminCache)
  cacheTag(tags.settings)
  return sanity.fetch<SiteSettings | null>(settingsQuery)
}

export const getProducts = cache(async () => {
  await requireAdmin()
  return fetchProducts()
})

export const getProduct = cache(async (id: string) => {
  await requireAdmin()
  if (!isPublishedId(id)) return null
  return fetchProduct(id)
})

export const getCategories = cache(async () => {
  await requireAdmin()
  return fetchCategories()
})

export const getSettings = cache(async () => {
  await requireAdmin()
  return fetchSettings()
})
