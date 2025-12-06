import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CartProvider } from '@/providers/CartProvider'
import { ThemeProvider } from '@/components/ThemeProvider'
import { siteConfig } from '@/config/siteConfig'
import { getBusinessHours } from '@/lib/app-settings-service'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// Force dynamic rendering to ensure tenant config is always fresh
export const dynamic = 'force-dynamic'

export const metadata = {
  metadataBase: new URL('https://triobistro.com'), // Update with your domain
  title: {
    default: siteConfig.seo.defaultTitle,
    template: `%s | ${siteConfig.seo.siteName}`,
  },
  description: siteConfig.seo.defaultDescription,
  keywords: [
    'restaurant',
    'bistro',
    'fine dining',
    'bar',
    'lounge',
    siteConfig.restaurant.name.toLowerCase(),
    siteConfig.restaurant.city,
  ],
  authors: [{ name: siteConfig.restaurant.name }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://triobistro.com', // Update with your domain
    siteName: siteConfig.seo.siteName,
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
    images: [
      {
        url: siteConfig.seo.defaultImage,
        width: 1200,
        height: 630,
        alt: siteConfig.restaurant.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
    images: [siteConfig.seo.defaultImage],
    creator: siteConfig.seo.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

/**
 * Root Layout Component
 * Wraps all pages with Navbar, Footer, and SEO configuration
 */
import { headers } from 'next/headers'

// ... (imports)

import { getTenantConfig } from '@/lib/tenant-service'
import { getThemeVariables } from '@/lib/theme-utils'

// ... (previous imports)

export default async function RootLayout({ children }) {
  const headersList = await headers()
  const tenantId = headersList.get('x-tenant-id')

  let themeVariables = {}
  let initialTheme = null

  if (tenantId) {
    const tenant = await getTenantConfig(tenantId)
    if (tenant && tenant.theme) {
      initialTheme = tenant.theme
      themeVariables = getThemeVariables(tenant.theme)
    }
  }

  const businessHours = await getBusinessHours()

  return (
    <html lang="en" suppressHydrationWarning>
      {/* ... (head) */}
      <body className={inter.className} style={themeVariables}>
        <CartProvider>
// (imports cleaned up by task status)

          <ThemeProvider initialTheme={initialTheme}>
            {tenantId && <Navbar />}
            <main className={tenantId ? "min-h-screen pt-20" : "min-h-screen"}>{children}</main>
            {tenantId && <Footer />}
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </CartProvider>
      </body>
    </html>
  )
}
