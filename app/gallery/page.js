import { notFound } from 'next/navigation'
import SectionTitle from '@/components/SectionTitle'
import GalleryGrid from '@/components/GalleryGrid'
import { siteConfig } from '@/config/siteConfig'
import { isModuleEnabled } from '@/lib/module-settings-service'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * Gallery Page Metadata
 */
export const metadata = {
  title: 'Gallery',
  description: `View photos of ${siteConfig.restaurant.name} - our elegant dining space, delicious cuisine, and special events.`,
  openGraph: {
    title: `Gallery | ${siteConfig.restaurant.name}`,
    description: `View photos of ${siteConfig.restaurant.name} - our elegant dining space, delicious cuisine, and special events.`,
  },
}

/**
 * Gallery Page
 * Features masonry layout with images
 */
export default async function GalleryPage() {
  // Check if gallery module is enabled (from database or siteConfig)
  const galleryEnabled = await isModuleEnabled('gallery')
  if (!galleryEnabled) {
    notFound()
  }

  // Fetch gallery images from database
  let images = []
  try {
    const galleryImages = await db.collection('gallery').find()
    // Sort by order, then by creation date
    galleryImages.sort((a, b) => {
      if (a.order !== b.order) return (a.order || 0) - (b.order || 0)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    // Transform database images to format expected by GalleryGrid
    images = galleryImages.map(img => ({
      id: img.id,
      src: img.url,
      alt: img.alt || img.caption || `Gallery image ${img.id}`,
    }))
  } catch (error) {
    console.error('Failed to fetch gallery images:', error)
    // Continue with empty array, GalleryGrid will show placeholders
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://triobistro.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Gallery',
        item: 'https://triobistro.com/gallery',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionTitle title="Gallery" subtitle="A glimpse into our world" />

          <GalleryGrid images={images} />
        </div>
      </div>
    </>
  )
}
