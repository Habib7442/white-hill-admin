import "server-only"

import { createClient } from "@sanity/client"

import { apiVersion, dataset, projectId } from "./config"

const token = process.env.SANITY_API_WRITE_TOKEN
if (!token) {
  throw new Error("Missing SANITY_API_WRITE_TOKEN. See .env.example.")
}

// Server-only client with the Editor token. "raw" perspective so queries can
// see Studio drafts (drafts.<id>) and the admin can clean them up on save.
// Lists filter to published ids with `_id in path("*")`.
export const sanity = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
  perspective: "raw",
})
