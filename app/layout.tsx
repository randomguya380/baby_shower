import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Baby Shower Celebration',
  description: 'A beautiful baby shower celebration website',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-serif">
        {children}
      </body>
    </html>
  )
}

