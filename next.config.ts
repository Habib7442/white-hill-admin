import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    // Pack images and leaflets are uploaded through Server Actions (max 4 MB
    // each, checked in lib/actions/assets.ts). Vercel caps bodies at 4.5 MB.
    serverActions: { bodySizeLimit: "4.5mb" },
    // Reuse a visited admin page for 60 s when navigating back to it, instead
    // of re-rendering behind a skeleton. Admin saves refresh it immediately.
    staleTimes: { dynamic: 60 },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ]
  },
}

export default nextConfig
