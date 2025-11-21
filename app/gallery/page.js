import { notFound } from 'next/navigation'
import SectionTitle from '@/components/SectionTitle'
import GalleryGrid from '@/components/GalleryGrid'
import { siteConfig } from '@/config/siteConfig'

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
export default function GalleryPage() {
  if (!siteConfig.features.gallery) {
    notFound()
  }

  return (
    <>
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title="Gallery"
            subtitle="A glimpse into our world"
          />

          <GalleryGrid />
        </div>
      </div>
    </>
  )
}

