"use client"

import { LoaderCircle, Save } from "lucide-react"
import { useEffect, useMemo, useState, useTransition } from "react"
import { toast } from "sonner"

import { primarySolid } from "@/components/admin/styles"
import { describedBy, Field, fieldId, FormSection, inputClass, textareaClass } from "@/components/form/field"
import { ImagePicker } from "@/components/form/upload"
import { saveSettings } from "@/lib/actions/settings"
import { cn } from "@/lib/utils"
import { fieldErrors } from "@/lib/validation/product"
import { settingsSchema, type SettingsFormValues } from "@/lib/validation/settings"

type TextKey = Exclude<keyof SettingsFormValues, "logo">

const contactFields: { key: TextKey; label: string; hint?: string; type?: string; multiline?: boolean }[] = [
  { key: "companyName", label: "Company name", hint: "Registered name, e.g. WhiteHill Lifecares Pvt Ltd." },
  { key: "address", label: "Address", multiline: true },
  { key: "phone", label: "Phone", type: "tel", hint: "Shown as a click-to-call link, e.g. +91 98765 43210." },
  { key: "email", label: "Email", type: "email" },
  { key: "whatsapp", label: "WhatsApp number", type: "tel" },
]

const legalFields: { key: TextKey; label: string; hint?: string }[] = [
  { key: "cin", label: "CIN" },
  { key: "gstin", label: "GSTIN" },
  { key: "drugLicence", label: "Drug licence no(s).", hint: "Wholesale drug licence numbers, e.g. 20B / 21B." },
  { key: "fssaiLicence", label: "FSSAI licence no." },
]

export function SettingsForm({ initialValues }: { initialValues: SettingsFormValues }) {
  const [values, setValues] = useState(initialValues)
  const [saved, setSaved] = useState(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()
  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(saved), [values, saved])

  useEffect(() => {
    if (!dirty) return
    const handler = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [dirty])

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const parsed = settingsSchema.safeParse(values)
    if (!parsed.success) {
      const next = fieldErrors(parsed.error)
      setErrors(next)
      document.getElementById(fieldId(Object.keys(next)[0]))?.focus()
      return
    }
    setErrors({})
    startTransition(async () => {
      const result = await saveSettings(values)
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {})
        toast.error(result.error)
        return
      }
      setSaved(values)
      toast.success("Site settings saved. The website updates within a minute.")
    })
  }

  function textField({ key, label, hint, type, multiline }: (typeof contactFields)[number]) {
    const error = errors[key]
    const common = {
      ...describedBy(key, { error, hint: Boolean(hint) }),
      value: values[key],
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setValues((v) => ({ ...v, [key]: event.target.value })),
    }
    return (
      <Field
        key={key}
        name={key}
        label={label}
        hint={hint}
        error={error}
        onClear={values[key] ? () => setValues((v) => ({ ...v, [key]: "" })) : undefined}
      >
        {multiline ? (
          <textarea {...common} rows={3} className={textareaClass} />
        ) : (
          <input {...common} type={type ?? "text"} className={inputClass} />
        )}
      </Field>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-1 flex-col lg:min-h-0">
      <div className="flex-1 px-4 py-6 sm:px-7 lg:min-h-0 lg:overflow-y-auto">
        <div className="mx-auto max-w-[55rem] space-y-5">
          <p className="text-sm text-text-muted">
            Empty fields are hidden on the website, so leave anything you don’t have yet blank.
          </p>
          <FormSection title="Company and contact">
            {contactFields.map(textField)}
          </FormSection>
          <FormSection title="Registration and licences" description="Shown in the footer only when filled in.">
            <div className="grid gap-5 sm:grid-cols-2">{legalFields.map(textField)}</div>
          </FormSection>
          <FormSection
            title="Logo"
            description="Optional. The website header uses the logo files in the site code; this one is for future use."
          >
            <ImagePicker
              id="f-logo"
              label="logo"
              assetId={values.logo?.assetId ?? null}
              onChange={(assetId) => setValues((v) => ({ ...v, logo: assetId ? { assetId } : null }))}
            />
          </FormSection>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 border-t border-hairline bg-background/95 px-4 py-3 backdrop-blur sm:px-7">
        <p className={cn("mr-auto text-sm", dirty ? "font-medium text-warning" : "text-text-faint")} aria-live="polite">
          {dirty ? "Unsaved changes" : "All changes saved"}
        </p>
        <button type="submit" className={primarySolid} disabled={pending || !dirty}>
          {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Save strokeWidth={1.8} aria-hidden="true" />}
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  )
}
