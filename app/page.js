import Hero from '@/components/Hero'
import SectionTitle from '@/components/SectionTitle'
import AnimatedCard from '@/components/AnimatedCard'
import EventsCarousel from '@/components/EventsCarousel'
import Announcements from '@/components/Announcements'
import { siteConfig } from '@/config/siteConfig'
import { isModuleEnabled } from '@/lib/module-settings-service'
import { getSetting } from '@/lib/app-settings-service'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Utensils, Wine, Calendar, Gift } from 'lucide-react'
import Image from 'next/image'
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

  // Generate grid classes based on number of highlights
  const getGridClasses = (count) => {
    const gridMap = {
      1: 'grid grid-cols-1 gap-8',
      2: 'grid grid-cols-1 md:grid-cols-2 gap-8',
      3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
      4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8',
    }
    return gridMap[count] || gridMap[4] // Default to 4 columns if more than 4
  }

  // Fetch tenant configuration for theme and content
  // Note: getTenantConfig is cached so this is efficient
  const { getTenantConfig } = await import('@/lib/tenant-service')
  const { getComponentVariants } = await import('@/lib/theme-utils')
  const tenant = await getTenantConfig(tenantId)

  // Determine Hero configuration
  const heroConfig = {
    title: siteConfig.restaurant.name, // Fallback
    tagline: siteConfig.restaurant.tagline,
    description: siteConfig.restaurant.description,
    backgroundImage: "/images/trio_main.png",
    variant: 'centered'
  }

  if (tenant) {
    if (tenant.name) heroConfig.title = tenant.name
    // TODO: Add tagline/description to Tenant schema if needed, or use appSettings

    if (tenant.theme) {
      const variants = getComponentVariants(tenant.theme.templateId)
      heroConfig.variant = variants.hero

      // Allow explicit override if we added it to schema later
      // if (tenant.theme.heroStyle) heroConfig.variant = tenant.theme.heroStyle
    }
  }

  return (
    <>
      {/* Announcements Section */}
      <Announcements />

      <Hero
        title={heroConfig.title}
        tagline={heroConfig.tagline}
        description={heroConfig.description}
        backgroundImage={heroConfig.backgroundImage}
        variant={heroConfig.variant}
        reservationsEnabled={reservationsEnabled}
        giftCardsEnabled={features.giftCards}
      />

      {/* Upcoming Events Carousel Section */}
      {upcomingEvents.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-gold/5 to-primary/5 dark:from-gray-800/50 dark:via-gray-700/30 dark:to-gray-800/50">
          <div className="max-w-7xl mx-auto">
            <SectionTitle
              title={upcomingEvents.length === 1 ? (pageContent?.eventsSection?.title || "Upcoming Event") : (pageContent?.eventsSection?.title || "Upcoming Events")}
              subtitle={pageContent?.eventsSection?.subtitle || "Don't miss out on these special experiences"}
            />
            <AnimatedCard>
              <EventsCarousel events={upcomingEvents} />
            </AnimatedCard>
          </div>
        </section>
      )}

      {/* Highlights Section */}
      {highlights.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <SectionTitle
              title={pageContent?.highlights?.sectionTitle || "Experience TRIO"}
              subtitle={pageContent?.highlights?.sectionSubtitle || "Discover what makes us special"}
            />
            <div className={getGridClasses(highlights.length)}>
              {highlights.map((highlight, index) => {
                const Icon = highlight.icon || Utensils
                return (
                  <AnimatedCard key={`${highlight.link}-${index}`} delay={index * 0.1}>
                    <Link href={highlight.link}>
                      <div className="group relative h-64 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                        <Image
                          src={highlight.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop'}
                          alt={highlight.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-primary/10 dark:bg-gray-900/80 group-hover:bg-primary/90 dark:group-hover:bg-gray-900/90 transition-colors" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-cream">
                          <Icon className="w-12 h-12 mb-4 text-gold" />
                          <h3 className="text-2xl font-serif font-bold mb-2">{highlight.title}</h3>
                          <p className="text-sm">{highlight.description}</p>
                        </div>
                      </div>
                    </Link>
                  </AnimatedCard>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* About Preview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <AnimatedCard>
              <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={pageContent?.aboutPreview?.image || "/images/interior.jpg"}
                  alt="Restaurant interior"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </AnimatedCard>
            <AnimatedCard delay={0.2}>
              <h2 className="text-4xl font-serif font-bold text-primary dark:text-gold mb-6">
                {pageContent?.aboutPreview?.title || restaurant.tagline}
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                {pageContent?.aboutPreview?.description || restaurant.description}
              </p>
              <Link
                href={pageContent?.aboutPreview?.buttonLink || "/about"}
                className="inline-block bg-primary dark:bg-gold text-cream dark:text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark dark:hover:bg-gold-light transition-colors"
              >
                {pageContent?.aboutPreview?.buttonText || "Learn More About Us"}
              </Link>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {reservationsEnabled && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedCard>
              <h2 className="text-4xl font-serif font-bold text-primary dark:text-gold mb-6">
                {pageContent?.ctaSection?.title || "Reserve Your Table"}
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                {pageContent?.ctaSection?.description || "Experience the perfect blend of vintage elegance and modern flavor. Book your table today."}
              </p>
              <Link
                href={pageContent?.ctaSection?.buttonLink || "/reservations"}
                className="inline-block bg-primary dark:bg-gold text-cream dark:text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark dark:hover:bg-gold-light transition-colors"
              >
                {pageContent?.ctaSection?.buttonText || "Make a Reservation"}
              </Link>
            </AnimatedCard>
          </div>
        </section>
      )}
    </>
  )
}
