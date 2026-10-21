import { z } from "zod"

const text = (max = 300) => z.string().trim().max(max)

// Mirrors whitehill-lifecare/sanity/schemaTypes/site-settings.ts. Empty values
// are unset, and the website hides them.
export const settingsSchema = z.object({
  companyName: text(120),
  logo: z.object({ assetId: z.string().min(1) }).nullable(),
  address: text(500),
  phone: text(40).refine((v) => v === "" || /^[+\d][\d\s()-]{6,}$/.test(v), "Enter a valid phone number."),
  email: text(200).refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email."),
  whatsapp: text(40).refine((v) => v === "" || /^[+\d][\d\s()-]{6,}$/.test(v), "Enter a valid number."),
  cin: text(40),
  gstin: text(40),
  drugLicence: text(200),
  fssaiLicence: text(60),
})

export type SettingsFormValues = z.input<typeof settingsSchema>
export const settingsTextFields = [
  "companyName",
  "address",
  "phone",
  "email",
  "whatsapp",
  "cin",
  "gstin",
  "drugLicence",
  "fssaiLicence",
] as const
