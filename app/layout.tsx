import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/lib/auth-context'
import { CustomerAuthProvider } from '@/lib/customer-auth-context'
import ClientWrapper from '@/components/client-wrapper'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bloom Garden Cafe - Order Online',
  description: 'Order delicious food and drinks from Bloom Garden Cafe. Dine-in with QR code ordering or delivery to your home.',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body suppressHydrationWarning={true}>
        <ThemeProvider>
          <AuthProvider>
            <CustomerAuthProvider>
              <ClientWrapper>
                {children}
              </ClientWrapper>
            </CustomerAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
