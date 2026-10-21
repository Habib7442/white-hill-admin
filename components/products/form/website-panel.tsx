"use client"

import { X } from "lucide-react"

import { PackThumb } from "@/components/admin/pack-thumb"
import { describedBy, Field, fieldId, FormSection, inputClass, textareaClass } from "@/components/form/field"
import { Switch } from "@/components/ui/switch"
import { MAX_RELATED } from "@/lib/constants"

import type { FormApi } from "./form-api"

export type RelatedOption = { _id: string; name: string | null; assetId: string | null }

export function WebsitePanel({
  form,
  productId,
  options,
}: {
  form: FormApi
  productId: string | null
  options: RelatedOption[]
}) {
  const { values, set, errors } = form
  const byId = new Map(options.map((o) => [o._id, o]))
  const available = options.filter((o) => o._id !== productId && !values.relatedIds.includes(o._id))

  return (
    <div className="space-y-5">
      <FormSection title="Visibility">
        <div className="flex items-center justify-between gap-4 rounded-xl bg-blue-25 px-4 py-3.5">
          <div>
            <label htmlFor="f-visible" className="text-sm font-medium text-text">
              Show on website
            </label>
            <p className="text-xs text-text-faint">
              Turn off to hide it from the site without deleting it. Products also need a pack image with alt text to appear.
            </p>
          </div>
          <Switch id="f-visible" checked={values.visible} onCheckedChange={(visible) => set("visible", visible)} />
        </div>
        <Field
          name="order"
          label="Display order"
          error={errors.order}
          hint="Lower numbers come first. You can also use Move up / Move down on the Products page."
          className="sm:max-w-xs"
          onClear={values.order ? () => set("order", "") : undefined}
        >
          <input
            {...describedBy("order", { error: errors.order, hint: true })}
            className={inputClass}
            inputMode="numeric"
            value={values.order}
            onChange={(event) => set("order", event.target.value)}
          />
        </Field>
      </FormSection>

      <FormSection title="Related products" description={`Shown at the bottom of the medicine page. Up to ${MAX_RELATED}.`}>
        {errors.relatedIds ? <p className="text-xs font-medium text-danger">{errors.relatedIds}</p> : null}
        {values.relatedIds.length ? (
          <ul className="space-y-2">
            {values.relatedIds.map((id) => {
              const product = byId.get(id)
              const name = product?.name ?? "Deleted product"
              return (
                <li key={id} className="flex items-center gap-3 rounded-xl border border-card-border p-2 pl-2.5">
                  <PackThumb assetId={product?.assetId} alt="" size={36} />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">{name}</span>
                  <button
                    type="button"
                    onClick={() => set("relatedIds", values.relatedIds.filter((r) => r !== id))}
                    className="flex size-9 items-center justify-center rounded-lg text-text-faint hover:bg-danger-bg hover:text-danger"
                    aria-label={`Remove ${name} from related products`}
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>
        ) : null}
        {values.relatedIds.length < MAX_RELATED ? (
          <div className="space-y-2">
            <label htmlFor={fieldId("relatedIds")} className="text-sm font-medium text-text">
              Add a related product
            </label>
            <select
              id={fieldId("relatedIds")}
              className={inputClass}
              value=""
              disabled={!available.length}
              onChange={(event) => {
                if (event.target.value) set("relatedIds", [...values.relatedIds, event.target.value])
              }}
            >
              <option value="">{available.length ? "Choose a product…" : "No other products"}</option>
              {available.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name ?? "Untitled product"}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </FormSection>

      <FormSection
        title="SEO"
        description="Optional. Used for the medicine page's search result title and description."
      >
        <Field
          name="seo.title"
          label="SEO title"
          error={errors["seo.title"]}
          counter={{ value: values.seo.title.length, max: 60 }}
          onClear={values.seo.title ? () => set("seo", { ...values.seo, title: "" }) : undefined}
        >
          <input
            {...describedBy("seo.title", { error: errors["seo.title"] })}
            className={inputClass}
            value={values.seo.title}
            onChange={(event) => set("seo", { ...values.seo, title: event.target.value })}
          />
        </Field>
        <Field
          name="seo.description"
          label="SEO description"
          error={errors["seo.description"]}
          counter={{ value: values.seo.description.length, max: 160 }}
          onClear={values.seo.description ? () => set("seo", { ...values.seo, description: "" }) : undefined}
        >
          <textarea
            {...describedBy("seo.description", { error: errors["seo.description"] })}
            className={textareaClass}
            rows={2}
            value={values.seo.description}
            onChange={(event) => set("seo", { ...values.seo, description: event.target.value })}
          />
        </Field>
      </FormSection>
    </div>
  )
}
