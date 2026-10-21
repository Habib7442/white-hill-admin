"use client"

import { Eye, EyeOff, LoaderCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useActionState, useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, type LoginState } from "@/lib/auth/actions"

export function LoginForm() {
  const next = useSearchParams().get("next") ?? "/"
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {})
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={action} className="mt-7 space-y-5" noValidate>
      <input type="hidden" name="next" value={next} />

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "login-error" : undefined}
          className="h-11 rounded-xl bg-muted px-3.5 not-focus-visible:border-transparent"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? "login-error" : undefined}
            className="h-11 rounded-xl bg-muted pr-12 pl-3.5 not-focus-visible:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-text-faint transition-colors hover:text-text"
          >
            {showPassword ? <EyeOff className="size-4.5" strokeWidth={1.8} /> : <Eye className="size-4.5" strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      {state.error ? (
        <p id="login-error" role="alert" className="rounded-xl bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-blue-700 disabled:opacity-70"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  )
}
