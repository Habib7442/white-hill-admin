"use client"

import { describedBy, Field, FormSection, inputClass } from "@/components/form/field"
import { moveItem, RowControls } from "@/components/form/row-controls"
import { AddImageButton, ImagePicker, PdfPicker } from "@/components/form/upload"
import { pill } from "@/components/admin/styles"
import { newKey } from "@/lib/sanity/ids"

import type { FormApi } from "./form-api"

export function ImagesPanel({ form }: { form: FormApi }) {
  const { values, set, errors } = form
  const gallery = values.gallery
  const altExample = `${values.name || "WeCalix"} — ${values.composition || "Calcium Carbonate, Vitamin D3 & Folic Acid"}, ${values.pack || "10 × 15 Tablets"} pack`

  return (
    <div className="space-y-5">
      <FormSection
        title="Pack image"
        description="Front of the 3D pack, on a white or transparent background. Not the flat print artwork."
      >
        <Field name="packImage" label="Pack image" required error={errors.packImage}>
          <ImagePicker
            id="f-packImage"
            label="pack image"
            assetId={values.packImage?.assetId ?? null}
            invalid={Boolean(errors.packImage)}
            onChange={(assetId) =>
              set("packImage", assetId ? { assetId, alt: values.packImage?.alt ?? "" } : null)
            }
          />
        </Field>
        {values.packImage ? (
          <Field
            name="packImage.alt"
            label="Alt text"
            required
            error={errors["packImage.alt"]}
            hint={`Describe the pack for screen readers, e.g. “${altExample}”.`}
          >
            <input
              {...describedBy("packImage.alt", { error: errors["packImage.alt"], hint: true })}
              className={inputClass}
              value={values.packImage.alt}
              onChange={(event) =>
                set("packImage", { assetId: values.packImage!.assetId, alt: event.target.value })
              }
            />
          </Field>
        ) : null}
      </FormSection>

      <FormSection
        title="More pack images"
        description="Composition side, licence side, strip. Each needs alt text and a caption."
        action={
          gallery.length ? (
            <button type="button" className={pill} onClick={() => set("gallery", [])}>
              Remove all
            </button>
          ) : null
        }
      >
        {gallery.length ? (
          <ol className="space-y-3">
            {gallery.map((img, index) => {
              const base = `gallery.${index}`
              return (
                <li key={img.key} className="rounded-xl bg-blue-25 p-3 sm:p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-text-muted">Image {index + 1}</span>
                    <RowControls
                      index={index}
                      count={gallery.length}
                      label={`image ${index + 1}`}
                      onMove={(from, to) => set("gallery", moveItem(gallery, from, to))}
                      onRemove={(i) => set("gallery", gallery.filter((_, j) => j !== i))}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
                    <ImagePicker
                      size="sm"
                      label={`image ${index + 1}`}
                      assetId={img.assetId}
                      onChange={(assetId) =>
                        assetId
                          ? set("gallery", gallery.map((g, i) => (i === index ? { ...g, assetId } : g)))
                          : set("gallery", gallery.filter((_, i) => i !== index))
                      }
                    />
                    <div className="space-y-3">
                      <Field name={`${base}.alt`} label="Alt text" required error={errors[`${base}.alt`]}>
                        <input
                          {...describedBy(`${base}.alt`, { error: errors[`${base}.alt`] })}
                          className={inputClass}
                          value={img.alt}
                          onChange={(event) =>
                            set("gallery", gallery.map((g, i) => (i === index ? { ...g, alt: event.target.value } : g)))
                          }
                        />
                      </Field>
                      <Field name={`${base}.caption`} label="Caption" required error={errors[`${base}.caption`]}>
                        <input
                          {...describedBy(`${base}.caption`, { error: errors[`${base}.caption`] })}
                          className={inputClass}
                          placeholder="e.g. Composition side"
                          value={img.caption}
                          onChange={(event) =>
                            set(
                              "gallery",
                              gallery.map((g, i) => (i === index ? { ...g, caption: event.target.value } : g))
                            )
                          }
                        />
                      </Field>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        ) : (
          <p className="text-sm text-text-faint">No extra images.</p>
        )}
        <AddImageButton
          onUploaded={(asset) => set("gallery", [...gallery, { key: newKey(), assetId: asset.assetId, alt: "", caption: "" }])}
        />
      </FormSection>

      <FormSection title="Product leaflet" description="Optional PDF, offered as a download on the medicine page.">
        <PdfPicker id="f-leaflet" value={values.leaflet} onChange={(leaflet) => set("leaflet", leaflet)} />
      </FormSection>
    </div>
  )
}
