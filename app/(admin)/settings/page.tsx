import type { Metadata } from "next"
import { Suspense } from "react"

import { PageHeader } from "@/components/admin/page-header"
import { FormSkeleton } from "@/components/admin/skeletons"
import { SettingsForm } from "@/components/settings/settings-form"
import { getSettings } from "@/lib/data"
import type { SettingsFormValues } from "@/lib/validation/settings"

export const metadata: Metadata = { title: "Site settings" }

export default function SettingsPage() {
  return (
    <Suspense fallback={<FormSkeleton title="Site settings" />}>
      <Settings />
    </Suspense>
  )
}

async function Settings() {
  const s = await getSettings()
  const initialValues: SettingsFormValues = {
    companyName: s?.companyName ?? "",
    logo: s?.logo?.assetId ? { assetId: s.logo.assetId } : null,
    address: s?.address ?? "",
    phone: s?.phone ?? "",
    email: s?.email ?? "",
    whatsapp: s?.whatsapp ?? "",
    cin: s?.cin ?? "",
    gstin: s?.gstin ?? "",
    drugLicence: s?.drugLicence ?? "",
    fssaiLicence: s?.fssaiLicence ?? "",
  }

  return (
    <>
      <PageHeader title="Site settings" description="Company details shown in the website’s contact section and footer." />
      <SettingsForm initialValues={initialValues} />
    </>
  )
}
