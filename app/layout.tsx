import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"

import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: { default: "WhiteHill Admin", template: "%s · WhiteHill Admin" },
  description: "Content admin for the WhiteHill Lifecares website.",
  robots: { index: false, follow: false, nocache: true },
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
