import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { business } from "@/lib/business";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
}); 

export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl),

  title: {
    default: "Lu An Bazar | Bazar, tecnología y hogar en Formosa",
    template: "%s | Lu An Bazar",
  },

  description:
    "Catálogo de bazar, electrodomésticos, cuidado personal, tecnología y productos para el hogar en Formosa.",

  applicationName: business.name,

  icons: {
    icon: "/images/brand/logo-favicon.png",
    shortcut: "/images/brand/logo-favicon.png",
    apple: "/images/brand/logo-favicon.png",
  },

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: business.name,
    title: "Lu An Bazar",
    description: "Todo lo que buscás, en un solo lugar.",
    images: ["/images/brand/logotipo.png"],
  },

  twitter: {
    card: "summary_large_image",
    title: "Lu An Bazar",
    description: "Bazar, tecnología, hogar y mucho más en Formosa.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF7" },
    { media: "(prefers-color-scheme: dark)", color: "#08131F" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${montserrat.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <Toaster richColors />
          {process.env.NODE_ENV === "production" && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  );
}
