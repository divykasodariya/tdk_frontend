"use client"

import type React from "react"

import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/context/auth-context"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <body className={`font-sans antialiased`}>
      <AuthProvider>{children}</AuthProvider>
      <Analytics />
    </body>
  )
}
