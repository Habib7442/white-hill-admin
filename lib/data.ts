import "server-only"

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

// Every loader checks the session first, so no page can read content without
// a valid admin cookie, even if proxy.ts is bypassed. cache() dedupes calls
// within one request (the sidebar renders twice: desktop rail + mobile sheet).

export const getProducts = cache(async () => {
  await requireAdmin()
  return sanity.fetch<ProductListItem[]>(productListQuery)
})

export const getProduct = cache(async (id: string) => {
  await requireAdmin()
  if (!isPublishedId(id)) return null
  return sanity.fetch<ProductDetail | null>(productDetailQuery, { id })
})

export const getCategories = cache(async () => {
  await requireAdmin()
  return sanity.fetch<CategoryListItem[]>(categoryListQuery)
})

export const getSettings = cache(async () => {
  await requireAdmin()
  return sanity.fetch<SiteSettings | null>(settingsQuery)
})
