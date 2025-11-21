import Link from 'next/link'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { siteConfig } from '@/config/siteConfig'

/**
 * Footer Component
 * Displays contact information, hours, and quick links
 */
export default function Footer() {
  const { restaurant, features, seo } = siteConfig

  const footerLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    ...(features.foodMenu || features.drinkMenu
      ? [{ href: '/menu', label: 'Menu' }]
      : []),
    ...(features.events ? [{ href: '/events', label: 'Events' }] : []),
    ...(features.gallery ? [{ href: '/gallery', label: 'Gallery' }] : []),
    ...(features.reservations
      ? [{ href: '/reservations', label: 'Reservations' }]
      : []),
    ...(features.giftCards
      ? [{ href: '/gift-cards', label: 'Gift Cards' }]
      : []),
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <footer className="bg-primary dark:bg-gray-900 text-cream dark:text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Restaurant Info */}
          <div>
            <h3 className="text-2xl font-serif font-bold text-gold mb-4">
              {restaurant.name}
            </h3>
            <p className="text-cream/80 dark:text-gray-400 mb-4">
              {restaurant.tagline}
            </p>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                <p className="text-sm">
                  {restaurant.address.street}
                  <br />
                  {restaurant.address.city}, {restaurant.address.state}{' '}
                  {restaurant.address.zip}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-gold flex-shrink-0" />
                <a
                  href={`tel:${restaurant.phone}`}
                  className="text-sm hover:text-gold transition-colors"
                >
                  {restaurant.phone}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-gold flex-shrink-0" />
                <a
                  href={`mailto:${restaurant.email}`}
                  className="text-sm hover:text-gold transition-colors"
                >
                  {restaurant.email}
                </a>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-lg font-serif font-semibold text-gold mb-4">
              Hours
            </h4>
            <div className="space-y-2">
              {Object.entries(restaurant.hours).map(([day, hours]) => (
                <div key={day} className="flex justify-between text-sm">
                  <span className="font-medium">{day}:</span>
                  <span className="text-cream/80 dark:text-gray-400">{hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-serif font-semibold text-gold mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-serif font-semibold text-gold mb-4">
              Follow Us
            </h4>
            <div className="space-y-2">
              {seo.facebookUrl && (
                <a
                  href={seo.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm hover:text-gold transition-colors"
                >
                  Facebook
                </a>
              )}
              {seo.instagramUrl && (
                <a
                  href={seo.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm hover:text-gold transition-colors"
                >
                  Instagram
                </a>
              )}
              {seo.twitterHandle && (
                <a
                  href={`https://twitter.com/${seo.twitterHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm hover:text-gold transition-colors"
                >
                  Twitter
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-cream/20 dark:border-gray-700 text-center text-sm text-cream/60 dark:text-gray-500">
          <p>
            © {new Date().getFullYear()} {restaurant.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

