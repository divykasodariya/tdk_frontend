import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import ClientLayout from "./client-layout"

const _geist = { subsets: ["latin"] }
const _geistMono = { subsets: ["latin"] }

export const metadata: Metadata = {
  title: "Cricket Tournament Manager",
  description: "Manage cricket tournaments with live scoring",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <ClientLayout>{children}</ClientLayout>
    </html>
  )
}
