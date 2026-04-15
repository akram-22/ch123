import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { I18nProvider } from '@/lib/i18n'
import { ThemeProvider, ThemeScript } from '@/lib/theme'
import { AuthProvider } from '@/lib/auth'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-sans' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: { default: 'Mainteligence — AI-Powered Predictive Maintenance', template: '%s | Mainteligence' },
  description:
    'Mainteligence uses AI and real-time IoT data to predict equipment failures, estimate Remaining Useful Life, and optimize industrial maintenance operations.',
  keywords: 'predictive maintenance, industrial AI, IoT, RUL, machine learning, factory automation',
  icons: {
    icon: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/api-attachments/G5GBg0NwHnI0ygSX2aOgv-yHCBfxf9exqvRH4s5vViaYhdSw2A6T.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/api-attachments/G5GBg0NwHnI0ygSX2aOgv-yHCBfxf9exqvRH4s5vViaYhdSw2A6T.png',
        sizes: '16x16',
        type: 'image/png',
      },
    ],
    shortcut: {
      url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/api-attachments/G5GBg0NwHnI0ygSX2aOgv-yHCBfxf9exqvRH4s5vViaYhdSw2A6T.png',
      type: 'image/png',
    },
    apple: {
      url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/api-attachments/G5GBg0NwHnI0ygSX2aOgv-yHCBfxf9exqvRH4s5vViaYhdSw2A6T.png',
      sizes: '180x180',
      type: 'image/png',
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <head>
        <ThemeScript />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <I18nProvider>
              {children}
            </I18nProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
