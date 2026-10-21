import "server-only"

import { cookies } from "next/headers"

import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "./jwt"

export async function createSession(email: string) {
  const token = await signSession({ sub: "admin", email })
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
}

export async function deleteSession() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

export async function readSession() {
  const store = await cookies()
  return verifySession(store.get(SESSION_COOKIE)?.value)
}
