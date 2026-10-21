import { jwtVerify, SignJWT } from "jose"

// Shared by proxy.ts (optimistic redirect) and lib/auth/session.ts (real check).
export const SESSION_COOKIE = "wh_admin_session"
export const SESSION_MAX_AGE = 60 * 60 * 8 // 8 hours, in seconds

export type SessionPayload = { sub: "admin"; email: string }

function secretKey() {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters. See .env.example.")
  }
  return new TextEncoder().encode(secret)
}

export function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey())
}

/** Returns the payload of a valid, unexpired token, or null. */
export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] })
    if (payload.sub !== "admin" || typeof payload.email !== "string") return null
    // A token signed for an email that is no longer the admin is rejected.
    if (payload.email !== process.env.ADMIN_EMAIL) return null
    return { sub: "admin", email: payload.email }
  } catch {
    return null
  }
}

/** Only same-origin relative paths are allowed as a post-login redirect. */
export function safeNextPath(value: unknown): string {
  if (typeof value !== "string") return "/"
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/"
  return value
}
