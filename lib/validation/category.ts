import { z } from "zod"

import { slugPattern } from "@/lib/constants"

export const categorySchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(80),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(96)
    .regex(slugPattern, "Use lowercase letters, numbers and dashes only."),
  order: z
    .string()
    .trim()
    .refine((v) => v === "" || /^-?\d{1,6}$/.test(v), "Use a whole number."),
})

export type CategoryFormValues = z.input<typeof categorySchema>
