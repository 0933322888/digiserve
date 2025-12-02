import { siteConfig } from '@/config/siteConfig'

/**
 * Robots.txt Configuration
 * Controls search engine crawling
 */
export default function robots() {
  const baseUrl = 'https://triobistro.com' // Update with your domain

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
