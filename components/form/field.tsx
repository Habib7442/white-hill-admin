"use client"

import { CircleAlert, TriangleAlert, X } from "lucide-react"

import { cn } from "@/lib/utils"

/** "ingredients.0.ingredient" → "f-ingredients-0-ingredient" */
export function fieldId(key: string) {
  return `f-${key.replace(/\./g, "-")}`
}

export const inputClass =
  "h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-text transition-colors outline-none placeholder:text-text-faint hover:border-text-faint/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 aria-invalid:border-danger aria-invalid:ring-danger/20 disabled:opacity-60"

export const textareaClass = cn(inputClass, "h-auto min-h-24 py-2.5 leading-6")

/**
 * Label above, control, then hint / warning / error. `onClear` adds the
 * "Clear" action that empties an optional field (unset in Sanity on save).
 */
export function Field({
  name,
  label,
  required,
  hint,
  error,
  warning,
  onClear,
  counter,
  className,
  children,
}: {
  name: string
  label: React.ReactNode
  required?: boolean
  hint?: React.ReactNode
  error?: string
  warning?: string
  onClear?: () => void
  counter?: { value: number; max: number }
  className?: string
  children: React.ReactNode
}) {
  const id = fieldId(name)

  return (
    <div className={cn("min-w-0 space-y-2", className)}>
      <div className="flex min-h-5 items-end justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
          {required ? (
            <span className="text-danger" aria-hidden="true">
              {" "}
              *
            </span>
          ) : null}
          {required ? <span className="sr-only"> (required)</span> : null}
        </label>
        <div className="flex items-center gap-2">
          {counter ? (
            <span
              className={cn(
                "text-xs tabular-nums",
                counter.value > counter.max ? "font-medium text-danger" : "text-text-faint"
              )}
            >
              {counter.value}/{counter.max}
            </span>
          ) : null}
          {onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="-my-2 inline-flex h-8 items-center gap-1 rounded-md px-1.5 text-xs font-medium text-text-faint transition-colors hover:bg-muted hover:text-text"
            >
              <X className="size-3" aria-hidden="true" />
              Clear
              <span className="sr-only"> {typeof label === "string" ? label : ""}</span>
            </button>
          ) : null}
        </div>
      </div>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs leading-5 text-text-faint">
          {hint}
        </p>
      ) : null}
      {warning && !error ? (
        <p id={`${id}-warning`} className="flex gap-1.5 text-xs leading-5 text-warning">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {warning}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="flex gap-1.5 text-xs leading-5 font-medium text-danger">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** aria props that link a control to its Field messages. */
export function describedBy(name: string, opts: { error?: string; warning?: string; hint?: boolean }) {
  const id = fieldId(name)
  const ids = [
    opts.error ? `${id}-error` : null,
    !opts.error && opts.warning ? `${id}-warning` : null,
    !opts.error && opts.hint ? `${id}-hint` : null,
  ].filter(Boolean)
  return {
    id,
    "aria-invalid": opts.error ? true : undefined,
    "aria-describedby": ids.length ? ids.join(" ") : undefined,
  } as const
}

/** Radio options shown as the reference's grey pills. */
export function Segmented<T extends string>({
  name,
  value,
  options,
  onChange,
  error,
}: {
  name: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
  error?: string
}) {
  const id = fieldId(name)
  return (
    <div
      role="radiogroup"
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}-label`}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className="flex flex-wrap gap-2"
    >
      {options.map((option) => (
        <label
          key={option.value || "none"}
          className={cn(
            "flex h-11 cursor-pointer items-center rounded-xl border px-4 text-sm font-medium transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring",
            value === option.value
              ? "border-primary bg-blue-50 text-navy-900"
              : "border-transparent bg-muted text-text-muted hover:bg-muted-hover hover:text-text"
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          {option.label}
        </label>
      ))}
    </div>
  )
}

/** Field wrapper for Segmented, which labels a group instead of one input. */
export function GroupField({
  name,
  label,
  required,
  hint,
  error,
  children,
}: {
  name: string
  label: string
  required?: boolean
  hint?: React.ReactNode
  error?: string
  children: React.ReactNode
}) {
  const id = fieldId(name)
  return (
    <div className="space-y-2">
      <p id={`${id}-label`} className="text-sm font-medium text-text">
        {label}
        {required ? (
          <span className="text-danger" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </p>
      {children}
      {hint && !error ? <p className="text-xs leading-5 text-text-faint">{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} className="flex gap-1.5 text-xs font-medium text-danger">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** Card wrapper for a group of fields inside a tab. */
export function FormSection({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-card border border-card-border p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text">{title}</h2>
          {description ? <p className="mt-0.5 text-sm text-text-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  )
}
