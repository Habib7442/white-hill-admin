import { createImageUrlBuilder } from "@sanity/image-url"

import { dataset, projectId } from "./config"

const builder = createImageUrlBuilder({ projectId, dataset })

/** Builds a CDN URL from an image asset id (`image-<hash>-<w>x<h>-<ext>`). */
export function imageUrl(assetId: string, width: number) {
  return builder.image(assetId).width(width).fit("max").auto("format").url()
}
