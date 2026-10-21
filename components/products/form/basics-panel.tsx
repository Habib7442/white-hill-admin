"use client"

import { Plus, Wand2 } from "lucide-react"
import { useState } from "react"

import { CategoryDialog } from "@/components/categories/category-dialog"
import { describedBy, Field, FormSection, GroupField, inputClass, Segmented } from "@/components/form/field"
import { dosageForms, marks, productTypes, schedules, slugify } from "@/lib/constants"
import type { ProductFormValues } from "@/lib/validation/product"

import type { FormApi } from "./form-api"

export function BasicsPanel({
  form,
  categories,
  onCategoryAdded,
  isNew,
}: {
  form: FormApi
  categories: { _id: string; title: string | null }[]
  onCategoryAdded: (category: { _id: string; title: string }) => void
  isNew: boolean
}) {
  const { values, set, update, errors } = form
  const [categoryOpen, setCategoryOpen] = useState(false)

  return (
    <FormSection title="Basics" description="How the medicine is named and grouped on the website.">
      <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
        <Field
          name="name"
          label="Brand name"
          required
          error={errors.name}
          hint="Brand name only. Add ™ or ® with the Trademark symbol option."
        >
          <input
            {...describedBy("name", { error: errors.name, hint: true })}
            className={inputClass}
            value={values.name}
            onChange={(event) => {
              const name = event.target.value
              // New products: the slug follows the name until it is edited by hand.
              update((v) => ({
                ...v,
                name,
                slug: isNew && v.slug === slugify(v.name) ? slugify(name) : v.slug,
              }))
            }}
          />
        </Field>
        <GroupField name="mark" label="Trademark symbol">
          <Segmented name="mark" value={values.mark} options={marks} onChange={(mark) => set("mark", mark)} />
        </GroupField>
      </div>

      <Field
        name="slug"
        label="Slug"
        required
        error={errors.slug}
        hint={
          <>
            The page address: <span className="font-medium text-text-muted">/medicines/{values.slug || "…"}</span>
          </>
        }
      >
        <div className="flex gap-2">
          <input
            {...describedBy("slug", { error: errors.slug, hint: true })}
            className={inputClass}
            value={values.slug}
            onChange={(event) => set("slug", event.target.value)}
          />
          <button
            type="button"
            onClick={() => set("slug", slugify(values.name))}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-muted px-3.5 text-sm font-medium text-text-muted transition-colors hover:bg-muted-hover hover:text-text"
          >
            <Wand2 className="size-4" strokeWidth={1.8} aria-hidden="true" />
            <span className="hidden sm:inline">From name</span>
            <span className="sr-only sm:hidden">Generate slug from name</span>
          </button>
        </div>
      </Field>

      <GroupField name="productType" label="Product type" required error={errors.productType}>
        <Segmented
          name="productType"
          value={values.productType}
          options={productTypes}
          onChange={(productType) => set("productType", productType)}
          error={errors.productType}
        />
      </GroupField>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="categoryId" label="Category" required error={errors.categoryId} hint="Shown as the tag on the product card.">
          <div className="flex gap-2">
            <select
              {...describedBy("categoryId", { error: errors.categoryId, hint: true })}
              className={inputClass}
              value={values.categoryId}
              onChange={(event) => set("categoryId", event.target.value)}
            >
              <option value="">Choose a category…</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title ?? "Untitled"}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setCategoryOpen(true)}
              aria-label="New category"
              title="New category"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-text-muted transition-colors hover:bg-muted-hover hover:text-text"
            >
              <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </Field>

        <Field name="dosageForm" label="Dosage form" required error={errors.dosageForm}>
          <select
            {...describedBy("dosageForm", { error: errors.dosageForm })}
            className={inputClass}
            value={values.dosageForm}
            onChange={(event) => set("dosageForm", event.target.value as ProductFormValues["dosageForm"])}
          >
            {dosageForms.map((form) => (
              <option key={form} value={form}>
                {form}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <GroupField
        name="schedule"
        label="Schedule"
        required
        error={errors.schedule}
        hint="As printed on the pack. Schedule H / H1 products show an Rx tag and the prescription caution, and their Supports lines are not shown."
      >
        <Segmented
          name="schedule"
          value={values.schedule}
          options={schedules.map((s) => ({ value: s.value, label: s.long }))}
          onChange={(schedule) => set("schedule", schedule)}
          error={errors.schedule}
        />
      </GroupField>

      <CategoryDialog
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
        category={null}
        onSaved={(saved) => {
          onCategoryAdded({ _id: saved.id, title: saved.title })
          set("categoryId", saved.id)
        }}
      />
    </FormSection>
  )
}
