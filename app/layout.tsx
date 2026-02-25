import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zastav Ma!',
  description: 'Koľko hodín v práci ťa stojí tá blbosť?',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sk">
      <body>{children}</body>
    </html>
  )
}
