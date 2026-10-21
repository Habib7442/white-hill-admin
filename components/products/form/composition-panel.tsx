"use client"

import { Plus } from "lucide-react"

import { pill } from "@/components/admin/styles"
import { describedBy, Field, fieldId, FormSection, inputClass } from "@/components/form/field"
import { moveItem, RowControls } from "@/components/form/row-controls"
import { standards } from "@/lib/constants"
import { newKey } from "@/lib/sanity/ids"
import type { ProductFormValues } from "@/lib/validation/product"

import type { FormApi } from "./form-api"

type Ingredient = ProductFormValues["ingredients"][number]

export function CompositionPanel({ form }: { form: FormApi }) {
  const { values, set, errors } = form
  const rows = values.ingredients

  function setRow(index: number, patch: Partial<Ingredient>) {
    set(
      "ingredients",
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row))
    )
  }

  return (
    <div className="space-y-5">
      <FormSection title="Composition" description="Exactly as printed on the pack.">
        <Field
          name="composition"
          label="Composition (short)"
          required
          error={errors.composition}
          hint="The generic name printed on the pack front. Shown on the product card."
        >
          <input
            {...describedBy("composition", { error: errors.composition, hint: true })}
            className={inputClass}
            value={values.composition}
            onChange={(event) => set("composition", event.target.value)}
          />
        </Field>
        <Field
          name="unitStatement"
          label="Unit statement"
          hint='As printed, e.g. "Each film coated tablet contains:"'
          onClear={values.unitStatement ? () => set("unitStatement", "") : undefined}
        >
          <input
            {...describedBy("unitStatement", { hint: true })}
            className={inputClass}
            value={values.unitStatement}
            onChange={(event) => set("unitStatement", event.target.value)}
          />
        </Field>
      </FormSection>

      <FormSection
        title="Composition table"
        description="One row per ingredient. Never guess a strength: copy it from the pack."
        action={
          rows.length ? (
            <button type="button" className={pill} onClick={() => set("ingredients", [])}>
              Clear all
            </button>
          ) : null
        }
      >
        {rows.length ? (
          <ol className="space-y-3">
            {rows.map((row, index) => {
              const base = `ingredients.${index}`
              const rowError = errors[`${base}.ingredient`]
              return (
                <li key={row.key} className="rounded-xl bg-blue-25 p-3 sm:p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-text-muted">Row {index + 1}</span>
                    <RowControls
                      index={index}
                      count={rows.length}
                      label={`ingredient ${index + 1}`}
                      onMove={(from, to) => set("ingredients", moveItem(rows, from, to))}
                      onRemove={(i) => set("ingredients", rows.filter((_, j) => j !== i))}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[2fr_7rem_1fr]">
                    <Field name={`${base}.ingredient`} label="Ingredient" required error={rowError}>
                      <input
                        {...describedBy(`${base}.ingredient`, { error: rowError })}
                        className={inputClass}
                        value={row.ingredient}
                        onChange={(event) => setRow(index, { ingredient: event.target.value })}
                      />
                    </Field>
                    <Field name={`${base}.standard`} label="IP / BP / USP">
                      <select
                        id={fieldId(`${base}.standard`)}
                        className={inputClass}
                        value={row.standard}
                        onChange={(event) => setRow(index, { standard: event.target.value as Ingredient["standard"] })}
                      >
                        <option value="">—</option>
                        {standards.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field name={`${base}.strength`} label="Strength">
                      <input
                        id={fieldId(`${base}.strength`)}
                        className={inputClass}
                        placeholder="e.g. 150 mg"
                        value={row.strength}
                        onChange={(event) => setRow(index, { strength: event.target.value })}
                      />
                    </Field>
                  </div>
                </li>
              )
            })}
          </ol>
        ) : (
          <p className="text-sm text-text-faint">No ingredients added.</p>
        )}
        <button
          type="button"
          className={pill}
          onClick={() => set("ingredients", [...rows, { key: newKey(), ingredient: "", standard: "", strength: "" }])}
        >
          <Plus strokeWidth={2} aria-hidden="true" />
          Add ingredient
        </button>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="excipients" label="Excipients" onClear={values.excipients ? () => set("excipients", "") : undefined}>
            <input
              id={fieldId("excipients")}
              className={inputClass}
              value={values.excipients}
              onChange={(event) => set("excipients", event.target.value)}
            />
          </Field>
          <Field
            name="colour"
            label="Colour"
            hint='e.g. "Red Oxide of Iron"'
            onClear={values.colour ? () => set("colour", "") : undefined}
          >
            <input
              {...describedBy("colour", { hint: true })}
              className={inputClass}
              value={values.colour}
              onChange={(event) => set("colour", event.target.value)}
            />
          </Field>
        </div>
      </FormSection>
    </div>
  )
}
