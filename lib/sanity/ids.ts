/** Published document ids have no dots; drafts and versions do. */
export function isPublishedId(id: unknown): id is string {
  return typeof id === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(id)
}

export function newId() {
  return crypto.randomUUID()
}

export function newKey() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12)
}
