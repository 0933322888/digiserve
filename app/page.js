import Announcements from '@/components/Announcements'
import HomeTemplate from '@/components/home/HomeTemplate'
import { siteConfig } from '@/config/siteConfig'
import { isModuleEnabled } from '@/lib/module-settings-service'
import { getBusinessHours, getSetting } from '@/lib/app-settings-service'
import { db } from '@/lib/db'
import { Utensils, Wine, Calendar, Gift } from 'lucide-react'
import { parseLocalDate } from '@/lib/utils'

/**
 * Home Page Metadata
 */
export const metadata = {
  title: 'Home',
  description: siteConfig.restaurant.description,
  openGraph: {
    title: `${siteConfig.restaurant.name} | ${siteConfig.restaurant.tagline}`,
    description: siteConfig.restaurant.description,
  },
}

/**
 * Home Page
 * Features hero section, highlights, and promotional banners
 */
import { headers } from 'next/headers'
import PlatformLandingPage from '@/components/marketing/PlatformLandingPage'

/**
 * Home Page
 * Features hero section, highlights, and promotional banners
 */
export default async function HomePage() {
  const headersList = await headers()
  const tenantId = headersList.get('x-tenant-id')
  console.log('Page: Received tenantId:', tenantId)

  // If no tenant is resolved (e.g. root domain or localhost), show the platform landing page
  if (!tenantId) {
    return <PlatformLandingPage />
  }

  const { restaurant, features } = siteConfig

  // Check if reservations are enabled
  const reservationsEnabled = await isModuleEnabled('reservations')

  // Fetch configured page content
  let pageContent = null
  try {
    const homeContentJson = await getSetting('PAGE_CONTENT_HOME')
    if (homeContentJson) {
      pageContent = JSON.parse(homeContentJson)
    }
  } catch (error) {
    console.error('Failed to load page content:', error)
  }

  // Fetch upcoming events within next 30 days if events are enabled
  let upcomingEvents = []
  if (features.events) {
    try {
      const eventsEnabled = await isModuleEnabled('events')
      if (eventsEnabled) {
        const allEvents = await db.collection('events').find()
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Calculate date 30 days from now
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(today.getDate() + 30)
        thirtyDaysFromNow.setHours(23, 59, 59, 999)

        // Filter upcoming events within next 30 days and sort by date
        upcomingEvents = allEvents
          .filter(event => {
            const eventDate = parseLocalDate(event.date)
            eventDate.setHours(0, 0, 0, 0)
            return eventDate >= today && eventDate <= thirtyDaysFromNow
          })
          .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date))
      }
    } catch (error) {
      console.error('Failed to fetch upcoming events:', error)
      // Continue without showing event section
    }
  }

  // Get highlights from configured content or use defaults
  const getHighlights = () => {
    if (pageContent?.highlights?.items) {
      const iconMap = {
        'menu': Utensils,
        'events': Calendar,
        'gift-cards': Gift,
        'wine': Wine,
      }

      return pageContent.highlights.items
        .filter(item => item.enabled !== false)
        .map(item => {
          // Try to determine icon from link
          let icon = Utensils
          if (item.link?.includes('events')) icon = Calendar
          else if (item.link?.includes('gift')) icon = Gift
          else if (item.link?.includes('menu')) icon = Utensils

          return {
            ...item,
            icon,
          }
        })
    }

    // Default highlights
    const defaultHighlights = [
      {
        icon: Utensils,
        title: 'Exquisite Cuisine',
        description: 'Our chef-curated menu features the finest ingredients and innovative flavors.',
        link: '/menu',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
      },
    ]

    if (features.events) {
      defaultHighlights.push({
        icon: Calendar,
        title: 'Special Events',
        description: 'Join us for live music, wine tastings, and exclusive dining experiences.',
        link: '/events',
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop',
      })
    }

    if (features.giftCards) {
      defaultHighlights.push({
        icon: Gift,
        title: 'Gift Cards',
        description: 'Give the gift of an unforgettable dining experience.',
        link: '/gift-cards',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
      })
    }

    return defaultHighlights
  }

  const highlights = getHighlights()

  // Fetch tenant configuration for theme and content
  // Note: getTenantConfig is cached so this is efficient
  const { getTenantConfig } = await import('@/lib/tenant-service')
  const tenant = await getTenantConfig(tenantId)
  const templateId = tenant?.theme?.templateId || 'bar'
  const { getActiveMenu } = await import('@/lib/menu-service')
  const galleryEnabled = await isModuleEnabled('gallery', tenantId)
  const [activeMenu, galleryImages, businessHours] = await Promise.all([
    getActiveMenu(tenant?.barId || tenantId).catch(error => {
      console.error('Failed to fetch active menu:', error)
      return null
    }),
    galleryEnabled
      ? db.collection('gallery').find().catch(error => {
        console.error('Failed to fetch gallery images:', error)
        return []
      })
      : Promise.resolve([]),
    getBusinessHours(),
  ])

  const gallery = galleryImages
    .sort((a, b) => {
      if (a.order !== b.order) return (a.order || 0) - (b.order || 0)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    .map(image => ({
      id: image.id,
      src: image.url,
      alt: image.alt || image.caption || 'Restaurant gallery image',
      caption: image.caption,
    }))

  return (
    <>
      <Announcements />
      <HomeTemplate
        templateId={templateId}
        title={tenant?.name || restaurant.name}
        tagline={restaurant.tagline}
        description={restaurant.description}
        restaurant={restaurant}
        pageContent={pageContent}
        reservationsEnabled={reservationsEnabled}
        giftCardsEnabled={features.giftCards}
        events={upcomingEvents}
        highlights={highlights}
        menuSections={activeMenu?.sections || []}
        galleryImages={gallery}
        businessHours={businessHours}
      />
    </>
  )
}
