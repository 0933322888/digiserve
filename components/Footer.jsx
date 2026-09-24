import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, LogIn } from 'lucide-react'
import { siteConfig } from '@/config/siteConfig'
import { getBusinessHours } from '@/lib/app-settings-service'
import { isModuleEnabled } from '@/lib/module-settings-service'
import { headers } from 'next/headers'

/**
 * Footer Component
 * Displays contact information, hours, and quick links
 */
export default async function Footer() {
  const { restaurant, features, seo } = siteConfig
  const businessHours = await getBusinessHours()
  const headersList = await headers()
  const tenantId = headersList.get('x-tenant-id')

  // Check if modules are enabled
  const reservationsEnabled = await isModuleEnabled('reservations')
  const eventsEnabled = await isModuleEnabled('events')
  const galleryEnabled = await isModuleEnabled('gallery')
  const giftCardsEnabled = await isModuleEnabled('giftCards')

  const footerLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/menu', label: 'Menu' },
    ...(eventsEnabled ? [{ href: '/events', label: 'Events' }] : []),
    ...(galleryEnabled ? [{ href: '/gallery', label: 'Gallery' }] : []),
    ...(reservationsEnabled ? [{ href: '/reservations', label: 'Reservations' }] : []),
    ...(giftCardsEnabled ? [{ href: '/gift-cards', label: 'Gift Cards' }] : []),
    { href: '/contact', label: 'Contact' },
  ]

  // Fetch tenant config for social links
  let socialLinks = {
    facebook: seo.facebookUrl,
    instagram: seo.instagramUrl,
    twitter: seo.twitterHandle ? `https://twitter.com/${seo.twitterHandle.replace('@', '')}` : null
  }

  if (tenantId) {
    const { getTenantConfig } = await import('@/lib/tenant-service')
    const tenant = await getTenantConfig(tenantId)
    if (tenant?.social) {
      if (tenant.social.facebook) socialLinks.facebook = tenant.social.facebook
      if (tenant.social.instagram) socialLinks.instagram = tenant.social.instagram
      if (tenant.social.twitter) socialLinks.twitter = tenant.social.twitter
    }
  }

  return (
    <footer className="bg-[var(--primary-light-bg)] dark:bg-gray-900 text-[var(--primary-light-text)] dark:text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ... (previous layout code) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* ... (Restaurant Info) */}
          <div>
            <h3 className="text-2xl font-serif font-bold text-[var(--primary-light-text)] mb-4">{restaurant.name}</h3>
            {/* ... */}
            <div className="space-y-2">
              {/* ... (Address, Phone, Email) */}
              <div className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-[var(--primary-light-text)] mt-1 flex-shrink-0" />
                <p className="text-sm text-[var(--primary-light-text)]">
                  {restaurant.address.street}
                  <br />
                  {restaurant.address.city}, {restaurant.address.state} {restaurant.address.zip}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-[var(--primary-light-text)] flex-shrink-0" />
                <a
                  href={`tel:${restaurant.phone}`}
                  className="text-sm text-[var(--primary-light-text)] hover:text-[var(--primary-light-text)] transition-colors"
                >
                  {restaurant.phone}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-[var(--primary-light-text)] flex-shrink-0" />
                <a
                  href={`mailto:${restaurant.email}`}
                  className="text-sm text-[var(--primary-light-text)] hover:text-[var(--primary-light-text)] transition-colors"
                >
                  {restaurant.email}
                </a>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-lg font-serif font-semibold text-[var(--primary-light-text)] mb-4">Hours</h4>
            <div className="space-y-2">
              {Object.entries(businessHours).map(([day, hours]) => (
                <div key={day} className="flex justify-between text-sm">
                  <span className="font-medium text-[var(--primary-light-text)]">{day}:</span>
                  <span className="text-[var(--primary-light-text)]/80 dark:text-gray-400">
                    {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-serif font-semibold text-[var(--primary-light-text)] mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-[var(--primary-light-text)] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-serif font-semibold text-[var(--primary-light-text)] mb-4">Follow Us</h4>
            <div className="space-y-2">
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm hover:text-[var(--primary-light-text)] transition-colors"
                >
                  Facebook
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm hover:text-[var(--primary-light-text)] transition-colors"
                >
                  Instagram
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm hover:text-[var(--primary-light-text)] transition-colors"
                >
                  Twitter
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-text/20 dark:border-gray-700 text-center text-sm text-primary-text/60 dark:text-gray-500">
          <div className="flex items-center justify-center space-x-4 flex-col sm:flex-row">
            <p>
              © {new Date().getFullYear()} {restaurant.name}. All rights reserved.
            </p>
            {/* Show admin login for tenant sites only */}
            {tenantId && (
              <Link
                href="/admin/login"
                aria-label="Admin login"
                className="mt-2 sm:mt-0 inline-flex items-center text-primary-text/60 hover:text-primary-text transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="sr-only">Admin Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
