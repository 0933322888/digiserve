import SectionTitle from '@/components/SectionTitle'
import ContactForm from '@/components/forms/ContactForm'
import { siteConfig } from '@/config/siteConfig'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

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
export default function ContactPage() {
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
        name: 'Contact',
        item: 'https://triobistro.com/contact',
      },
    ],
  }

  const fullAddress = `${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.state} ${restaurant.address.zip}`

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title="Contact Us"
            subtitle="We'd love to hear from you"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <div className="bg-cream dark:bg-gray-800 p-8 rounded-lg shadow-lg mb-8">
                <h3 className="text-2xl font-serif font-semibold text-primary dark:text-gold mb-6">
                  Get in Touch
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-primary dark:text-gold flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Address
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        {restaurant.address.street}
                        <br />
                        {restaurant.address.city}, {restaurant.address.state}{' '}
                        {restaurant.address.zip}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Phone className="w-6 h-6 text-primary dark:text-gold flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Phone
                      </h4>
                      <a
                        href={`tel:${restaurant.phone}`}
                        className="text-primary dark:text-gold hover:underline"
                      >
                        {restaurant.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-primary dark:text-gold flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Email
                      </h4>
                      <a
                        href={`mailto:${restaurant.email}`}
                        className="text-primary dark:text-gold hover:underline"
                      >
                        {restaurant.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Clock className="w-6 h-6 text-primary dark:text-gold flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Hours
                      </h4>
                      <div className="space-y-1 text-gray-700 dark:text-gray-300">
                        {Object.entries(restaurant.hours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className="font-medium">{day}:</span>
                            <span>{hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Maps */}
              <div className="bg-cream dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-serif font-semibold text-primary dark:text-gold mb-4">
                  Find Us
                </h3>
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(fullAddress)}`}
                    title="Restaurant Location"
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                  Note: Replace YOUR_API_KEY with your Google Maps API key in
                  the code.
                </p>
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

