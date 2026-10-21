import "server-only"

import { redirect } from "next/navigation"

import { readSession } from "./session"

/**
 * The real auth check. Call it at the top of every Server Action and in every
 * admin page. proxy.ts only does an optimistic redirect.
 */
export async function requireAdmin() {
  const session = await readSession()
  if (!session) redirect("/login")
  return session
}
