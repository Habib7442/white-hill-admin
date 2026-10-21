"use server"

import { fail, ok, type ActionResult } from "@/lib/action-result"
import { IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/constants"
import { sanity } from "@/lib/sanity/client"

import { requireAdmin, sanityErrorMessage } from "./guard"

export type UploadedAsset = { assetId: string; filename: string }

/**
 * Uploads one file to Sanity's asset store. `kind` "image" accepts JPEG, PNG
 * and WebP; "pdf" accepts PDF only. Max 4 MB each (Vercel's body limit).
 */
export async function uploadAsset(formData: FormData): Promise<ActionResult<UploadedAsset>> {
  await requireAdmin()

  const file = formData.get("file")
  const kind = formData.get("kind")
  if (!(file instanceof File) || file.size === 0) return fail("Choose a file to upload.")
  if (kind !== "image" && kind !== "pdf") return fail("Unsupported upload.")

  if (file.size > MAX_UPLOAD_BYTES) return fail("The file is larger than 4 MB. Please compress it first.")

  const bytes = Buffer.from(await file.arrayBuffer())
  if (kind === "image") {
    if (!IMAGE_TYPES.includes(file.type) || !looksLikeImage(bytes)) {
      return fail("Use a JPEG, PNG or WebP image.")
    }
  } else if (file.type !== "application/pdf" || bytes.subarray(0, 5).toString() !== "%PDF-") {
    return fail("Use a PDF file.")
  }

  try {
    const asset = await sanity.assets.upload(kind === "image" ? "image" : "file", bytes, {
      filename: file.name.slice(0, 120),
      contentType: file.type,
    })
    return ok({ assetId: asset._id, filename: asset.originalFilename ?? file.name })
  } catch (error) {
    return fail(sanityErrorMessage(error))
  }
}

/** Checks the file signature, not just the browser-supplied MIME type. */
function looksLikeImage(bytes: Buffer) {
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  const png = bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  const webp = bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP"
  return jpeg || png || webp
}
