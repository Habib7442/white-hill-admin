import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"

import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

// Absolute base for the share image: Vercel's production domain, or local dev.
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL
const siteUrl = productionHost ? `https://${productionHost}` : "http://localhost:3001"

const ogImage = {
  url: "/admin-og-image.webp",
  width: 1730,
  height: 909,
  type: "image/webp",
  alt: "WhiteHill Lifecares Admin Panel. Authorised access only.",
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "WhiteHill Admin", template: "%s · WhiteHill Admin" },
  description: "Content admin for the WhiteHill Lifecares website.",
  robots: { index: false, follow: false, nocache: true },
  openGraph: {
    type: "website",
    siteName: "WhiteHill Admin",
    title: "WhiteHill Admin",
    description: "Content admin for the WhiteHill Lifecares website.",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "WhiteHill Admin",
    description: "Content admin for the WhiteHill Lifecares website.",
    images: [ogImage],
  },
}

export const viewport: Viewport = {
  themeColor: "#0d0d10",
  colorScheme: "light",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full`}>
      <body className="min-h-full font-sans">
        {children}
        {/* Top: the forms' save bars sit at the bottom. */}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  )
}
