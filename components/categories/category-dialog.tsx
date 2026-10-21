"use client"

import { LoaderCircle } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { pill, primarySolid } from "@/components/admin/styles"
import { describedBy, Field, inputClass } from "@/components/form/field"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { saveCategory } from "@/lib/actions/categories"
import { slugify } from "@/lib/constants"
import type { CategoryListItem } from "@/lib/types"
import { categorySchema, type CategoryFormValues } from "@/lib/validation/category"
import { fieldErrors } from "@/lib/validation/product"

/** Add / edit a category. Used on the Categories page and inside the product form. */
export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: CategoryListItem | null
  onSaved?: (saved: { id: string; title: string }) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl p-6 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-semibold text-text">
            {category ? "Edit category" : "New category"}
          </DialogTitle>
          <DialogDescription className="text-sm text-text-muted">
            Shown as the tag on product cards on the website.
          </DialogDescription>
        </DialogHeader>
        {/* Remount per open so the form starts from the current values. */}
        {open ? (
          <CategoryForm
            category={category}
            onCancel={() => onOpenChange(false)}
            onSaved={(saved) => {
              onOpenChange(false)
              onSaved?.(saved)
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function CategoryForm({
  category,
  onCancel,
  onSaved,
}: {
  category: CategoryListItem | null
  onCancel: () => void
  onSaved: (saved: { id: string; title: string }) => void
}) {
  const [values, setValues] = useState<CategoryFormValues>({
    title: category?.title ?? "",
    slug: category?.slug ?? "",
    order: category?.order === null || category?.order === undefined ? "" : String(category.order),
  })
  const [slugTouched, setSlugTouched] = useState(Boolean(category))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const parsed = categorySchema.safeParse(values)
    if (!parsed.success) {
      const next = fieldErrors(parsed.error)
      setErrors(next)
      document.getElementById(`f-${Object.keys(next)[0]}`)?.focus()
      return
    }
    startTransition(async () => {
      const result = await saveCategory(category?._id ?? null, values)
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {})
        toast.error(result.error)
        return
      }
      toast.success(category ? "Category updated" : `${result.data.title} added`)
      onSaved(result.data)
    })
  }

  return (
    <form onSubmit={submit} noValidate className="mt-2 space-y-5">
      <Field name="title" label="Title" required error={errors.title} hint='e.g. "Bone & Calcium"'>
        <input
          {...describedBy("title", { error: errors.title, hint: true })}
          className={inputClass}
          value={values.title}
          autoFocus
          onChange={(event) => {
            const title = event.target.value
            setValues((v) => ({ ...v, title, slug: slugTouched ? v.slug : slugify(title) }))
          }}
        />
      </Field>
      <Field name="slug" label="Slug" required error={errors.slug} hint="Used in links. Lowercase letters, numbers and dashes.">
        <input
          {...describedBy("slug", { error: errors.slug, hint: true })}
          className={inputClass}
          value={values.slug}
          onChange={(event) => {
            setSlugTouched(true)
            setValues((v) => ({ ...v, slug: event.target.value }))
          }}
        />
      </Field>
      <Field
        name="order"
        label="Display order"
        error={errors.order}
        hint="Lower numbers come first. Leave empty to add at the end."
      >
        <input
          {...describedBy("order", { error: errors.order, hint: true })}
          className={inputClass}
          inputMode="numeric"
          value={values.order}
          onChange={(event) => setValues((v) => ({ ...v, order: event.target.value }))}
        />
      </Field>
      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <button type="button" className={pill} onClick={onCancel} disabled={pending}>
          Cancel
        </button>
        <button type="submit" className={primarySolid} disabled={pending}>
          {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
          {category ? "Save category" : "Add category"}
        </button>
      </div>
    </form>
  )
}
