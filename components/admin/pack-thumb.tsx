import { ImageOff } from "lucide-react"
import Image from "next/image"

import { imageUrl } from "@/lib/sanity/image"
import { cn } from "@/lib/utils"

/** Pack image on a --blue-25 tile, never cropped (object-contain). */
export function PackThumb({
  assetId,
  alt,
  size,
  className,
}: {
  assetId: string | null | undefined
  alt: string
  size: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-blue-25",
        className
      )}
      style={{ width: size, height: size }}
    >
      {assetId ? (
        <Image
          src={imageUrl(assetId, size * 2)}
          alt={alt}
          fill
          sizes={`${size}px`}
          unoptimized
          className="object-contain p-0.5"
        />
      ) : (
        <ImageOff className="size-1/2 text-text-faint" strokeWidth={1.6} aria-label="No pack image" />
      )}
    </span>
  )
}
