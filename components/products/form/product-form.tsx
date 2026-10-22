"use client"

import { CircleAlert, LoaderCircle, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, useTransition } from "react"
import { toast } from "sonner"

import { showWarning } from "@/components/admin/notify"
import { pill, primarySolid } from "@/components/admin/styles"
import { fieldId } from "@/components/form/field"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/products/form/tabs"
import { saveProduct } from "@/lib/actions/products"
import {
  fieldErrors,
  productSchema,
  productWarnings,
  type ProductFormValues,
} from "@/lib/validation/product"
import { cn } from "@/lib/utils"

import { BasicsPanel } from "./basics-panel"
import { CompositionPanel } from "./composition-panel"
import { DetailsPanel } from "./details-panel"
import { firstErrorKey, tabForField, tabs, type FormApi, type TabKey } from "./form-api"
import { ImagesPanel } from "./images-panel"
import { WebsitePanel, type RelatedOption } from "./website-panel"

export function ProductForm({
  productId,
  initialValues,
  categories: initialCategories,
  relatedOptions,
}: {
  productId: string | null
  initialValues: ProductFormValues
  categories: { _id: string; title: string | null }[]
  relatedOptions: RelatedOption[]
}) {
  const router = useRouter()
  const [values, setValues] = useState(initialValues)
  const [saved, setSaved] = useState(initialValues)
  const [categories, setCategories] = useState(initialCategories)
  const [tab, setTab] = useState<TabKey>("basics")
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [focusKey, setFocusKey] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(saved), [values, saved])

  // After the first save attempt, errors update live as fields are fixed.
  const clientErrors = useMemo(() => {
    if (!submitted) return {}
    const parsed = productSchema.safeParse(values)
    return parsed.success ? {} : fieldErrors(parsed.error)
  }, [submitted, values])
  const errors = useMemo(() => ({ ...serverErrors, ...clientErrors }), [serverErrors, clientErrors])
  const warnings = useMemo(() => productWarnings(values), [values])

  const errorCountByTab = useMemo(() => {
    const counts: Partial<Record<TabKey, number>> = {}
    for (const key of Object.keys(errors)) {
      const t = tabForField(key)
      counts[t] = (counts[t] ?? 0) + 1
    }
    return counts
  }, [errors])

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return
    const handler = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [dirty])

  // Focus the first invalid field once its tab has rendered.
  useEffect(() => {
    if (!focusKey) return
    const el =
      document.getElementById(fieldId(focusKey)) ??
      document.getElementById(fieldId(focusKey.split(".")[0]))
    el?.focus()
    el?.scrollIntoView({ block: "center", behavior: "smooth" })
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot focus request
    setFocusKey(null)
  }, [focusKey, tab])

  function showErrors(next: Record<string, string>) {
    const first = firstErrorKey(next)
    if (!first) return
    setTab(tabForField(first))
    setFocusKey(first)
  }

  function submit() {
    setSubmitted(true)
    setServerErrors({})
    const parsed = productSchema.safeParse(values)
    if (!parsed.success) {
      showErrors(fieldErrors(parsed.error))
      toast.error("Please fix the highlighted fields.")
      return
    }

    startTransition(async () => {
      const result = await saveProduct(productId, values)
      if (!result.ok) {
        setServerErrors(result.fieldErrors ?? {})
        if (result.fieldErrors) showErrors(result.fieldErrors)
        toast.error(result.error)
        return
      }
      setSaved(values)
      setSubmitted(false)
      if (productId === null) {
        toast.success(`${values.name} created`)
        showWarning(result)
        router.replace(`/products/${result.data.id}`)
      } else {
        toast.success("Changes saved. The website is updated.")
        showWarning(result)
      }
    })
  }

  // Ctrl/Cmd + S saves.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault()
        if (!pending) document.getElementById("product-save")?.click()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [pending])

  const form: FormApi = {
    values,
    set: (key, value) => setValues((v) => ({ ...v, [key]: value })),
    update: setValues,
    errors,
    warnings,
  }

  const errorCount = Object.keys(errors).length

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      className="flex flex-1 flex-col lg:min-h-0"
    >
      <Tabs value={tab} onValueChange={(next) => setTab(next as TabKey)} className="flex flex-1 flex-col lg:min-h-0">
        <div className="border-b border-hairline px-4 py-3 sm:px-7">
          <TabsList>
            {tabs.map((t) => (
              <TabsTab key={t.key} value={t.key}>
                {t.label}
                {errorCountByTab[t.key] ? (
                  <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-danger text-[0.6875rem] font-semibold text-white">
                    {errorCountByTab[t.key]}
                    <span className="sr-only"> errors</span>
                  </span>
                ) : null}
              </TabsTab>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 px-4 py-6 sm:px-7 lg:min-h-0 lg:overflow-y-auto">
          <div className="mx-auto max-w-[55rem]">
            {errorCount > 0 ? (
              <div role="alert" className="mb-5 flex gap-2 rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  {errorCount === 1 ? "1 field needs" : `${errorCount} fields need`} attention:{" "}
                  {tabs
                    .filter((t) => errorCountByTab[t.key])
                    .map((t) => t.label)
                    .join(", ")}
                  .
                </span>
              </div>
            ) : null}

            <TabsPanel value="basics">
              <BasicsPanel
                form={form}
                categories={categories}
                isNew={productId === null}
                onCategoryAdded={(category) => setCategories((list) => [...list, category])}
              />
            </TabsPanel>
            <TabsPanel value="composition">
              <CompositionPanel form={form} />
            </TabsPanel>
            <TabsPanel value="details">
              <DetailsPanel form={form} />
            </TabsPanel>
            <TabsPanel value="images">
              <ImagesPanel form={form} />
            </TabsPanel>
            <TabsPanel value="website">
              <WebsitePanel form={form} productId={productId} options={relatedOptions} />
            </TabsPanel>
          </div>
        </div>
      </Tabs>

      <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-end gap-3 border-t border-hairline bg-background/95 px-4 py-3 backdrop-blur sm:px-7">
        <p
          className={cn("mr-auto text-sm", dirty ? "font-medium text-warning" : "text-text-faint")}
          aria-live="polite"
        >
          {dirty ? "Unsaved changes" : productId ? "All changes saved" : "New product"}
        </p>
        <Link href="/products" className={pill}>
          {dirty ? "Cancel" : "Back"}
        </Link>
        <button id="product-save" type="submit" className={primarySolid} disabled={pending || (!dirty && productId !== null)}>
          {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Save strokeWidth={1.8} aria-hidden="true" />}
          {pending ? "Saving…" : productId ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  )
}
