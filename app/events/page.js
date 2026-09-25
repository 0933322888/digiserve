import { notFound } from 'next/navigation'
import SectionTitle from '@/components/SectionTitle'
import EventCard from '@/components/EventCard'
import { siteConfig } from '@/config/siteConfig'
import { isModuleEnabled } from '@/lib/module-settings-service'
import { db } from '@/lib/db'
import { parseLocalDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

/**
 * Events Page Metadata
 */
export const metadata = {
  title: 'Events',
  description: `Join us for special events at ${siteConfig.restaurant.name} - live music, wine tastings, and exclusive dining experiences.`,
  openGraph: {
    title: `Events | ${siteConfig.restaurant.name}`,
    description: `Join us for special events at ${siteConfig.restaurant.name} - live music, wine tastings, and exclusive dining experiences.`,
  },
}

/**
 * Events Page
 * Displays upcoming events
 */
export default async function EventsPage() {
  // Check if events module is enabled (from database or siteConfig)
  const eventsEnabled = await isModuleEnabled('events')
  if (!eventsEnabled) {
    notFound()
  }

  // Fetch events from database
  let allEvents = []
  try {
    const events = await db.collection('events').find()
    // Sort by date ascending (upcoming events first)
    events.sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date))
    allEvents = events
  } catch (error) {
    console.error('Failed to fetch events:', error)
    // Continue with empty array
  }

  const featuredEvents = allEvents.filter(e => e.featured)
  const regularEvents = allEvents.filter(e => !e.featured)

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: process.env.NEXT_PUBLIC_APP_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Events',
        item: `${process.env.NEXT_PUBLIC_APP_URL}/events`,
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
          <SectionTitle title="Upcoming Events" subtitle="Join us for special experiences" />

          {featuredEvents.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-serif font-bold text-primary-text mb-8">
                Featured Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </div>
            </div>
          )}

          {regularEvents.length > 0 && (
            <div>
              <h2 className="text-3xl font-serif font-bold text-primary-text  mb-8">
                All Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={featuredEvents.length + index} />
                ))}
              </div>
            </div>
          )}

          {allEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                No upcoming events at this time. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
