import { notFound } from 'next/navigation'
import SectionTitle from '@/components/SectionTitle'
import EventCard from '@/components/EventCard'
import { siteConfig } from '@/config/siteConfig'
import eventsData from '@/data/events.json'

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
export default function EventsPage() {
  if (!siteConfig.features.events) {
    notFound()
  }

  const featuredEvents = eventsData.events.filter((e) => e.featured)
  const regularEvents = eventsData.events.filter((e) => !e.featured)

  return (
    <>
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title="Upcoming Events"
            subtitle="Join us for special experiences"
          />

          {featuredEvents.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-serif font-bold text-primary dark:text-gold mb-8">
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
              <h2 className="text-3xl font-serif font-bold text-primary dark:text-gold mb-8">
                All Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularEvents.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={featuredEvents.length + index}
                  />
                ))}
              </div>
            </div>
          )}

          {eventsData.events.length === 0 && (
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

