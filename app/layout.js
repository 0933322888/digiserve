import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CartProvider } from '@/providers/CartProvider'
import { siteConfig } from '@/config/siteConfig'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
export default function RootLayout({ children }) {
  const restaurantSchema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: siteConfig.restaurant.name,
    description: siteConfig.restaurant.description,
    image: siteConfig.seo.defaultImage,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.restaurant.address.street,
      addressLocality: siteConfig.restaurant.address.city,
      addressRegion: siteConfig.restaurant.address.state,
      postalCode: siteConfig.restaurant.address.zip,
      addressCountry: siteConfig.restaurant.address.country,
    },
    telephone: siteConfig.restaurant.phone,
    email: siteConfig.restaurant.email,
    servesCuisine: 'Contemporary American',
    priceRange: '$$',
    openingHoursSpecification: Object.entries(siteConfig.restaurant.hours).map(
      ([day, hours]) => {
        const [open, close] = hours.split(' - ')
        return {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: day,
          opens: open,
          closes: close,
        }
      }
    ),
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />
      </head>
      <body className={inter.className}>
        <CartProvider>
          <Navbar />
          <main className="min-h-screen pt-20">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}

