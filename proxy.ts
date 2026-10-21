import { type NextRequest, NextResponse } from "next/server"

import { SESSION_COOKIE, verifySession } from "@/lib/auth/jwt"

// Optimistic check only: redirects signed-out visitors to /login and
// signed-in admins away from it. Every page loader and Server Action checks
// the session again with requireAdmin() (lib/auth/dal.ts).
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value)
  const onLogin = pathname === "/login"

  if (!session && !onLogin) {
    const url = new URL("/login", request.url)
    if (pathname !== "/") url.searchParams.set("next", pathname + search)
    const response = NextResponse.redirect(url)
    if (request.cookies.has(SESSION_COOKIE)) response.cookies.delete(SESSION_COOKIE)
    return response
  }

  if (session && onLogin) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|brand/|icon.png|admin-og-image.webp|robots.txt).*)"],
}
