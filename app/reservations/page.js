import { notFound } from 'next/navigation'
import SectionTitle from '@/components/SectionTitle'
import ReservationForm from '@/components/forms/ReservationForm'
import { siteConfig } from '@/config/siteConfig'

/**
 * Reservations Page Metadata
 */
export const metadata = {
  title: 'Reservations',
  description: `Make a reservation at ${siteConfig.restaurant.name}. Book your table for an unforgettable dining experience.`,
  openGraph: {
    title: `Reservations | ${siteConfig.restaurant.name}`,
    description: `Make a reservation at ${siteConfig.restaurant.name}. Book your table for an unforgettable dining experience.`,
  },
}

/**
 * Reservations Page
 * Features reservation form
 */
export default function ReservationsPage() {
  if (!siteConfig.features.reservations) {
    notFound()
  }

  const { restaurant } = siteConfig

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
        name: 'Reservations',
        item: 'https://triobistro.com/reservations',
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
          <SectionTitle
            title="Make a Reservation"
            subtitle="Reserve your table for an unforgettable dining experience"
          />

          <div className="max-w-4xl mx-auto">
            <div className="bg-cream dark:bg-gray-800 p-8 rounded-lg shadow-lg mb-8">
              <h3 className="text-2xl font-serif font-semibold text-primary dark:text-gold mb-4">
                Contact Information
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Phone:</strong>{' '}
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="text-primary dark:text-gold hover:underline"
                  >
                    {restaurant.phone}
                  </a>
                </p>
                <p>
                  <strong>Email:</strong>{' '}
                  <a
                    href={`mailto:${restaurant.email}`}
                    className="text-primary dark:text-gold hover:underline"
                  >
                    {restaurant.email}
                  </a>
                </p>
                <p>
                  <strong>Address:</strong> {restaurant.address.street}, {restaurant.address.city},{' '}
                  {restaurant.address.state} {restaurant.address.zip}
                </p>
              </div>
            </div>

            <ReservationForm />
          </div>
        </div>
      </div>
    </>
  )
}
