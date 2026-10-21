import { z } from "zod"

import { claimMessage, findClaimWord } from "@/lib/claim-check"
import {
  dosageForms,
  MAX_RELATED,
  MAX_SUPPORTS,
  packTypes,
  slugPattern,
  standards,
} from "@/lib/constants"

// Mirrors the rules in whitehill-lifecare/sanity/schemaTypes/product.ts.
// Shared by the product form (instant feedback) and the Server Action (the
// real check). Empty optional strings are unset in Sanity on save.

const text = (max = 2000) => z.string().trim().max(max)
const required = (label: string, max = 300) =>
  z.string().trim().min(1, `${label} is required.`).max(max)

export const productSchema = z
  .object({
    name: required("Brand name", 120).refine((v) => !/[™®]/.test(v), {
      message: "Remove ™ / ® from the name and use the Trademark symbol field.",
    }),
    mark: z.enum(["", "™", "®"]),
    slug: required("Slug", 96).regex(slugPattern, "Use lowercase letters, numbers and dashes only."),
    productType: z.enum(["pharmaceutical", "nutraceutical", "wellness"], {
      error: "Choose a product type.",
    }),
    categoryId: required("Category"),
    dosageForm: z.enum(dosageForms, { error: "Choose a dosage form." }),
    schedule: z.enum(["otc", "h", "h1"], { error: "Choose a schedule." }),

    composition: required("Composition", 300),
    unitStatement: text(200),
    ingredients: z
      .array(
        z.object({
          key: z.string().min(1),
          ingredient: required("Ingredient", 200),
          standard: z.enum(["", ...standards]),
          strength: text(60),
        })
      )
      .max(40),
    excipients: text(200),
    colour: text(200),

    description: text(600),
    supports: z
      .array(
        z.object({
          key: z.string().min(1),
          text: required("Line", 120).refine((v) => !findClaimWord(v), {
            error: (issue) => claimMessage(findClaimWord(issue.input) ?? ""),
          }),
        })
      )
      .max(MAX_SUPPORTS, `Up to ${MAX_SUPPORTS} lines.`),
    directions: text(300),
    pack: required("Pack size", 120),
    packType: z.union([z.literal(""), z.enum(packTypes)]),
    storage: text(400),
    shelfLife: text(60),
    manufacturer: z.object({
      name: text(200),
      address: text(400),
      licenceNo: text(100),
    }),

    packImage: z
      .object({
        assetId: z.string().min(1),
        alt: required("Alt text", 250),
      })
      .nullable()
      .refine((v) => v !== null, "Pack image is required."),
    gallery: z
      .array(
        z.object({
          key: z.string().min(1),
          assetId: z.string().min(1),
          alt: required("Alt text", 250),
          caption: required("Caption", 120),
        })
      )
      .max(12),
    leaflet: z.object({ assetId: z.string().min(1), filename: z.string() }).nullable(),

    relatedIds: z
      .array(z.string().min(1))
      .max(MAX_RELATED, `Up to ${MAX_RELATED} related products.`)
      .refine((ids) => new Set(ids).size === ids.length, "Each related product once."),
    order: z
      .string()
      .trim()
      .refine((v) => v === "" || /^-?\d{1,6}$/.test(v), "Use a whole number."),
    visible: z.boolean(),
    seo: z.object({
      title: z.string().trim().max(60, "Up to 60 characters."),
      description: z.string().trim().max(160, "Up to 160 characters."),
    }),
  })

export type ProductFormValues = z.input<typeof productSchema>
export type ProductValues = z.output<typeof productSchema>

/** Warnings don't block saving (same as Studio). */
export function productWarnings(values: ProductFormValues): Record<string, string> {
  const warnings: Record<string, string> = {}
  const claim = findClaimWord(values.description)
  if (claim) warnings.description = claimMessage(claim)
  if (/\d\s*x\s*\d/i.test(values.pack)) {
    warnings.pack = 'Use the × sign instead of the letter "x".'
  }
  return warnings
}

/** Flattens Zod issues to { "ingredients.0.ingredient": "message" }. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form"
    if (!out[key]) out[key] = issue.message
  }
  return out
}
