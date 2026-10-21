"use client"

import { Info, Plus } from "lucide-react"

import { pill } from "@/components/admin/styles"
import { describedBy, Field, fieldId, FormSection, inputClass, textareaClass } from "@/components/form/field"
import { moveItem, RowControls } from "@/components/form/row-controls"
import { isRx, MAX_SUPPORTS, packTypes, productDefaults } from "@/lib/constants"
import { newKey } from "@/lib/sanity/ids"
import type { ProductFormValues } from "@/lib/validation/product"

import type { FormApi } from "./form-api"

export function DetailsPanel({ form }: { form: FormApi }) {
  const { values, set, errors, warnings } = form
  const supports = values.supports

  return (
    <div className="space-y-5">
      <FormSection title="Description" description='Factual wording only: "supports" / "helps support". No cure or treatment claims.'>
        <Field
          name="description"
          label="Description"
          error={errors.description}
          warning={warnings.description}
          hint="One or two sentences."
          onClear={values.description ? () => set("description", "") : undefined}
        >
          <textarea
            {...describedBy("description", { error: errors.description, warning: warnings.description, hint: true })}
            className={textareaClass}
            rows={3}
            value={values.description}
            onChange={(event) => set("description", event.target.value)}
          />
        </Field>

        <div className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-text">Supports</p>
              <p className="text-xs text-text-faint">
                Short factual lines like the pack badges, e.g. “Supports nerve health”. Up to {MAX_SUPPORTS}.
              </p>
            </div>
            {supports.length ? (
              <button type="button" className={pill} onClick={() => set("supports", [])}>
                Clear all
              </button>
            ) : null}
          </div>

          {isRx(values.schedule) ? (
            <p className="flex gap-2 rounded-xl bg-blue-25 px-3.5 py-3 text-sm text-text-muted">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.8} aria-hidden="true" />
              Supports lines are not shown for Schedule H / H1 products (factual information only).
              {supports.length ? ` ${supports.length} saved line${supports.length === 1 ? " is" : "s are"} kept but hidden.` : ""}
            </p>
          ) : (
            <>
              {errors.supports ? <p className="text-xs font-medium text-danger">{errors.supports}</p> : null}
              <ol className="space-y-2">
                {supports.map((row, index) => {
                  const key = `supports.${index}.text`
                  return (
                    <li key={row.key} className="flex items-start gap-2">
                      <Field name={key} label={<span className="sr-only">Supports line {index + 1}</span>} error={errors[key]} className="flex-1 space-y-1">
                        <input
                          {...describedBy(key, { error: errors[key] })}
                          className={inputClass}
                          value={row.text}
                          maxLength={120}
                          onChange={(event) =>
                            set(
                              "supports",
                              supports.map((s, i) => (i === index ? { ...s, text: event.target.value } : s))
                            )
                          }
                        />
                      </Field>
                      <div className="pt-1">
                        <RowControls
                          index={index}
                          count={supports.length}
                          label={`supports line ${index + 1}`}
                          onMove={(from, to) => set("supports", moveItem(supports, from, to))}
                          onRemove={(i) => set("supports", supports.filter((_, j) => j !== i))}
                        />
                      </div>
                    </li>
                  )
                })}
              </ol>
              <button
                type="button"
                className={pill}
                disabled={supports.length >= MAX_SUPPORTS}
                onClick={() => set("supports", [...supports, { key: newKey(), text: "" }])}
              >
                <Plus strokeWidth={2} aria-hidden="true" />
                Add line
              </button>
            </>
          )}
        </div>
      </FormSection>

      <FormSection title="Pack and use">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="pack"
            label="Pack size"
            required
            error={errors.pack}
            warning={warnings.pack}
            hint='e.g. "10 × 10 Tablets". Use the × sign, not the letter x.'
          >
            <div className="flex gap-2">
              <input
                {...describedBy("pack", { error: errors.pack, warning: warnings.pack, hint: true })}
                className={inputClass}
                value={values.pack}
                onChange={(event) => set("pack", event.target.value)}
              />
              {warnings.pack ? (
                <button
                  type="button"
                  className="inline-flex h-11 shrink-0 items-center rounded-xl bg-warning-bg px-3 text-sm font-medium text-warning hover:brightness-95"
                  onClick={() => set("pack", values.pack.replace(/(\d)\s*[xX]\s*(\d)/g, "$1 × $2"))}
                >
                  Use ×
                </button>
              ) : null}
            </div>
          </Field>
          <Field name="packType" label="Pack type" onClear={values.packType ? () => set("packType", "") : undefined}>
            <select
              id={fieldId("packType")}
              className={inputClass}
              value={values.packType}
              onChange={(event) => set("packType", event.target.value as ProductFormValues["packType"])}
            >
              <option value="">Not set</option>
              {packTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <TextRow form={form} name="directions" label="Directions" defaultValue={productDefaults.directions} />
        <Field
          name="storage"
          label="Storage"
          onClear={values.storage ? () => set("storage", "") : undefined}
        >
          <textarea
            id={fieldId("storage")}
            className={textareaClass}
            rows={2}
            value={values.storage}
            onChange={(event) => set("storage", event.target.value)}
          />
        </Field>
        <Field
          name="shelfLife"
          label="Shelf life"
          hint='e.g. "24 months"'
          className="sm:max-w-xs"
          onClear={values.shelfLife ? () => set("shelfLife", "") : undefined}
        >
          <input
            {...describedBy("shelfLife", { hint: true })}
            className={inputClass}
            value={values.shelfLife}
            onChange={(event) => set("shelfLife", event.target.value)}
          />
        </Field>
      </FormSection>

      <FormSection
        title="Manufactured by"
        description="Exactly as printed on the pack."
        action={
          values.manufacturer.name || values.manufacturer.address || values.manufacturer.licenceNo ? (
            <button
              type="button"
              className={pill}
              onClick={() => set("manufacturer", { name: "", address: "", licenceNo: "" })}
            >
              Clear all
            </button>
          ) : null
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="manufacturer.name" label="Name">
            <input
              id={fieldId("manufacturer.name")}
              className={inputClass}
              value={values.manufacturer.name}
              onChange={(event) => set("manufacturer", { ...values.manufacturer, name: event.target.value })}
            />
          </Field>
          <Field name="manufacturer.licenceNo" label="Mfg. Lic. No.">
            <input
              id={fieldId("manufacturer.licenceNo")}
              className={inputClass}
              value={values.manufacturer.licenceNo}
              onChange={(event) => set("manufacturer", { ...values.manufacturer, licenceNo: event.target.value })}
            />
          </Field>
        </div>
        <Field name="manufacturer.address" label="Address">
          <textarea
            id={fieldId("manufacturer.address")}
            className={textareaClass}
            rows={2}
            value={values.manufacturer.address}
            onChange={(event) => set("manufacturer", { ...values.manufacturer, address: event.target.value })}
          />
        </Field>
      </FormSection>
    </div>
  )
}

function TextRow({
  form,
  name,
  label,
  defaultValue,
}: {
  form: FormApi
  name: "directions"
  label: string
  defaultValue: string
}) {
  const value = form.values[name]
  return (
    <Field name={name} label={label} onClear={value ? () => form.set(name, "") : undefined}>
      <div className="flex gap-2">
        <input
          id={fieldId(name)}
          className={inputClass}
          value={value}
          onChange={(event) => form.set(name, event.target.value)}
        />
        {!value ? (
          <button
            type="button"
            className="inline-flex h-11 shrink-0 items-center rounded-xl bg-muted px-3 text-sm font-medium text-text-muted hover:bg-muted-hover"
            onClick={() => form.set(name, defaultValue)}
          >
            Use default
          </button>
        ) : null}
      </div>
    </Field>
  )
}
