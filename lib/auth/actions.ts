"use server"

import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { z } from "zod"

import { safeNextPath } from "./jwt"
import { createSession, deleteSession } from "./session"

export type LoginState = { error?: string; email?: string }

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
})

// Compared against when the email is wrong, so both paths cost one bcrypt run.
const DUMMY_HASH = "$2b$12$HmvqEWq88sD3AQGkahSYleXhjhMKP.IhjgPK35VzPFazJu/PIhUje"

function adminPasswordHash() {
  const encoded = process.env.ADMIN_PASSWORD_HASH
  if (!encoded) throw new Error("ADMIN_PASSWORD_HASH is not set. See .env.example.")
  return Buffer.from(encoded, "base64").toString("utf8")
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  const email = typeof formData.get("email") === "string" ? String(formData.get("email")) : ""
  if (!parsed.success) {
    return { error: "Enter your email and password.", email }
  }

  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase()
  const emailMatches = adminEmail !== "" && parsed.data.email === adminEmail
  const passwordMatches = await bcrypt.compare(
    parsed.data.password,
    emailMatches ? adminPasswordHash() : DUMMY_HASH
  )

  if (!emailMatches || !passwordMatches) {
    // Slows down guessing; there is no persistent rate limit (no datastore).
    await new Promise((resolve) => setTimeout(resolve, 600))
    return { error: "Email or password is incorrect.", email }
  }

  await createSession(process.env.ADMIN_EMAIL as string)
  redirect(safeNextPath(formData.get("next")))
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}
