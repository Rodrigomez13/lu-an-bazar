import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Montserrat, Playfair_Display } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Lu An Bazar | Bazar, hogar y regalos en Formosa', template: '%s | Lu An Bazar' },
  description: 'Objetos para la cocina, organización, decoración, textiles y regalos elegidos con cuidado en Formosa.',
  generator: 'v0.app',
}

export const viewport: Viewport = { themeColor: '#0D1B2A', colorScheme: 'light', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" className="bg-background"><body className={`${montserrat.variable} ${playfair.variable} antialiased`}>{children}<Toaster richColors/>{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
