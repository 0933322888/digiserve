import SectionTitle from '@/components/SectionTitle'
import ContactForm from '@/components/forms/ContactForm'
import { siteConfig } from '@/config/siteConfig'
import { getBusinessHours } from '@/lib/app-settings-service'
import { MapPin, Phone, Mail, Clock, Navigation, ExternalLink } from 'lucide-react'
import MapComponent from '@/components/MapComponent'
import { headers } from 'next/headers'
import PlatformContactPage from '@/components/marketing/PlatformContactPage'

/**
 * Contact Page Metadata
 */
export const metadata = {
  title: 'Contact Us',
  description: `Get in touch with ${siteConfig.restaurant.name}. Visit us, call us, or send us a message.`,
  openGraph: {
    title: `Contact Us | ${siteConfig.restaurant.name}`,
    description: `Get in touch with ${siteConfig.restaurant.name}. Visit us, call us, or send us a message.`,
  },
}

/**
 * Contact Page
 * Features contact form, map, and contact information
 */
export default async function ContactPage() {
  const headersList = await headers()
  const tenantId = headersList.get('x-tenant-id')

  // If no tenant is resolved, show the platform contact page
  if (!tenantId) {
    return <PlatformContactPage />
  }

  const { restaurant } = siteConfig
  const businessHours = await getBusinessHours()

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
        name: 'Contact',
        item: `${process.env.NEXT_PUBLIC_APP_URL}/contact`,
      },
    ],
  }

  const fullAddress = `${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.state} ${restaurant.address.zip}, ${restaurant.address.country}`

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionTitle title="Contact Us" subtitle="We'd love to hear from you" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <div className="bg-secondary dark:bg-[var(--secondary-dark-bg)] p-8 rounded-lg shadow-lg mb-8">
                <h3 className="text-2xl font-serif font-semibold text-primary-text mb-6">
                  Get in Touch
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-primary-text flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900  mb-1">
                        Address
                      </h4>
                      <p className="text-primary-text">
                        {restaurant.address.street}
                        <br />
                        {restaurant.address.city}, {restaurant.address.state}{' '}
                        {restaurant.address.zip}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Phone className="w-6 h-6 text-primary-text flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900  mb-1">Phone</h4>
                      <a
                        href={`tel:${restaurant.phone}`}
                        className="text-primary-text hover:underline"
                      >
                        {restaurant.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-primary-text flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">Email</h4>
                      <a
                        href={`mailto:${restaurant.email}`}
                        className="text-primary-text hover:underline"
                      >
                        {restaurant.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Clock className="w-6 h-6 text-primary-text flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900  mb-1">Hours</h4>
                      <div className="space-y-1 text-primary-text">
                        {Object.entries(businessHours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className="font-medium">{day}:</span>
                            <span>
                              {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="bg-secondary dark:bg-[var(--secondary-dark-bg)] p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-serif font-semibold text-primary-text">
                  Find Us
                </h3>

                {/* Map */}
                <div className="relative w-full h-96 rounded-lg overflow-hidden mb-6 border border-gray-200 dark:border-gray-600 shadow-md">
                  <MapComponent
                    address={fullAddress}
                    coordinates={restaurant.address.coordinates}
                  />
                </div>

                {/* Get Directions */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-primary-text" />
                    Get Directions
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Google Maps
                    </a>
                    <a
                      href={`https://maps.apple.com/?daddr=${encodeURIComponent(fullAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Apple Maps
                    </a>
                    <a
                      href={`https://www.waze.com/ul?q=${encodeURIComponent(fullAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Waze
                    </a>
                  </div>
                  <a
                    href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(fullAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm hover:text-primary-text dark:hover:text-gold transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on OpenStreetMap
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
