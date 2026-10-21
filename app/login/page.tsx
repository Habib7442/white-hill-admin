import type { Metadata } from "next"
import { Suspense } from "react"

import { Brand } from "@/components/admin/brand"

import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Sign in" }

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="mb-8">
        <Brand />
      </div>
      <div className="w-full max-w-[400px] rounded-panel bg-background p-6 shadow-xl sm:p-8">
        <h1 className="text-[1.625rem] font-medium tracking-tight text-text">Sign in</h1>
        <p className="mt-1.5 text-sm text-text-muted">
          Manage medicines, categories and company details on the website.
        </p>
        <Suspense fallback={<div className="mt-7 h-[17rem]" />}>
          <LoginForm />
        </Suspense>
      </div>
      <p className="mt-6 text-xs text-frame-text-muted">
        WhiteHill Lifecares Pvt Ltd · Admin
      </p>
    </main>
  )
}
