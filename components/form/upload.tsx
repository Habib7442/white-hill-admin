"use client"

import { FileText, ImagePlus, LoaderCircle, RefreshCw, Trash2, Upload } from "lucide-react"
import Image from "next/image"
import { useRef, useTransition } from "react"
import { toast } from "sonner"

import { pill } from "@/components/admin/styles"
import { uploadAsset, type UploadedAsset } from "@/lib/actions/assets"
import { IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/constants"
import { dataset, projectId } from "@/lib/sanity/config"
import { imageUrl } from "@/lib/sanity/image"
import { cn } from "@/lib/utils"

type Kind = "image" | "pdf"

/** Checks the file in the browser first (fast feedback), then uploads via a Server Action. */
export function useUpload(kind: Kind, onUploaded: (asset: UploadedAsset) => void) {
  const [pending, startTransition] = useTransition()

  function upload(file: File) {
    const allowed = kind === "image" ? IMAGE_TYPES : ["application/pdf"]
    if (!allowed.includes(file.type)) {
      toast.error(kind === "image" ? "Use a JPEG, PNG or WebP image." : "Use a PDF file.")
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("The file is larger than 4 MB. Please compress it first.")
      return
    }
    const body = new FormData()
    body.set("file", file)
    body.set("kind", kind)
    startTransition(async () => {
      const result = await uploadAsset(body)
      if (result.ok) onUploaded(result.data)
      else toast.error(result.error)
    })
  }

  return { pending, upload }
}

function HiddenFileInput({
  inputRef,
  kind,
  onFile,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>
  kind: Kind
  onFile: (file: File) => void
}) {
  return (
    <input
      ref={inputRef}
      type="file"
      tabIndex={-1}
      aria-hidden="true"
      className="hidden"
      accept={kind === "image" ? IMAGE_TYPES.join(",") : "application/pdf"}
      onChange={(event) => {
        const file = event.target.files?.[0]
        event.target.value = ""
        if (file) onFile(file)
      }}
    />
  )
}

/** Pack image / logo picker: preview on a --blue-25 panel, never cropped. */
export function ImagePicker({
  id,
  assetId,
  onChange,
  label,
  invalid,
  size = "lg",
}: {
  id?: string
  assetId: string | null
  onChange: (assetId: string | null) => void
  label: string
  invalid?: boolean
  size?: "lg" | "sm"
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { pending, upload } = useUpload("image", (asset) => onChange(asset.assetId))
  const box = size === "lg" ? "size-40 sm:size-44" : "size-24"

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-card border bg-blue-25",
          box,
          invalid ? "border-danger" : "border-blue-100",
          !assetId && "border-dashed"
        )}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          const file = event.dataTransfer.files?.[0]
          if (file) upload(file)
        }}
      >
        {assetId ? (
          <Image
            src={imageUrl(assetId, 400)}
            alt=""
            fill
            sizes="176px"
            unoptimized
            className="object-contain p-2"
          />
        ) : (
          <ImagePlus className="size-8 text-blue-300" strokeWidth={1.5} aria-hidden="true" />
        )}
        {pending ? (
          <span className="absolute inset-0 flex items-center justify-center bg-background/70">
            <LoaderCircle className="size-6 animate-spin text-primary" aria-label="Uploading" />
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          id={id}
          type="button"
          className={pill}
          disabled={pending}
          onClick={() => inputRef.current?.click()}
          aria-describedby={invalid && id ? `${id}-error` : undefined}
        >
          {assetId ? <RefreshCw strokeWidth={1.8} aria-hidden="true" /> : <Upload strokeWidth={1.8} aria-hidden="true" />}
          {assetId ? "Replace" : "Upload"} <span className="sr-only">{label}</span>
        </button>
        {assetId ? (
          <button
            type="button"
            className={cn(pill, "hover:bg-danger-bg hover:text-danger")}
            disabled={pending}
            onClick={() => onChange(null)}
          >
            <Trash2 strokeWidth={1.8} aria-hidden="true" />
            Remove <span className="sr-only">{label}</span>
          </button>
        ) : null}
        <p className="basis-full text-xs text-text-faint">JPEG, PNG or WebP, up to 4 MB.</p>
      </div>
      <HiddenFileInput inputRef={inputRef} kind="image" onFile={upload} />
    </div>
  )
}

/** "file-<hash>-pdf" → CDN URL, so the admin can open the current leaflet. */
function fileUrl(assetId: string) {
  const match = /^file-([a-f0-9]+)-(\w+)$/.exec(assetId)
  return match ? `https://cdn.sanity.io/files/${projectId}/${dataset}/${match[1]}.${match[2]}` : null
}

export function PdfPicker({
  id,
  value,
  onChange,
}: {
  id?: string
  value: { assetId: string; filename: string } | null
  onChange: (value: { assetId: string; filename: string } | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { pending, upload } = useUpload("pdf", (asset) => onChange(asset))
  const href = value ? fileUrl(value.assetId) : null

  return (
    <div className="flex flex-wrap items-center gap-3">
      {value ? (
        <span className="flex min-h-11 min-w-0 items-center gap-2.5 rounded-xl border border-card-border px-3.5 text-sm">
          <FileText className="size-4 shrink-0 text-primary" strokeWidth={1.8} aria-hidden="true" />
          {href ? (
            <a href={href} target="_blank" rel="noreferrer" className="truncate text-primary hover:underline">
              {value.filename || "leaflet.pdf"}
            </a>
          ) : (
            <span className="truncate">{value.filename || "leaflet.pdf"}</span>
          )}
        </span>
      ) : null}
      <button id={id} type="button" className={pill} disabled={pending} onClick={() => inputRef.current?.click()}>
        {pending ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : (
          <Upload strokeWidth={1.8} aria-hidden="true" />
        )}
        {pending ? "Uploading…" : value ? "Replace PDF" : "Upload PDF"}
      </button>
      {value ? (
        <button
          type="button"
          className={cn(pill, "hover:bg-danger-bg hover:text-danger")}
          disabled={pending}
          onClick={() => onChange(null)}
        >
          <Trash2 strokeWidth={1.8} aria-hidden="true" />
          Remove PDF
        </button>
      ) : null}
      <HiddenFileInput inputRef={inputRef} kind="pdf" onFile={upload} />
    </div>
  )
}

/** "Add image" button for the gallery: picks a file and uploads it. */
export function AddImageButton({ onUploaded }: { onUploaded: (asset: UploadedAsset) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { pending, upload } = useUpload("image", onUploaded)

  return (
    <>
      <button type="button" className={pill} disabled={pending} onClick={() => inputRef.current?.click()}>
        {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <ImagePlus strokeWidth={1.8} aria-hidden="true" />}
        {pending ? "Uploading…" : "Add image"}
      </button>
      <HiddenFileInput inputRef={inputRef} kind="image" onFile={upload} />
    </>
  )
}
