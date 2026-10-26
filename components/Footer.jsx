import Link from 'next/link'
import { LogIn } from 'lucide-react'
import { siteConfig } from '@/config/siteConfig'
import { getBusinessHours } from '@/lib/app-settings-service'
import { isModuleEnabled } from '@/lib/module-settings-service'
import { headers } from 'next/headers'

function BusinessHoursList({ businessHours, compact = false }) {
  return (
    <dl className={compact ? 'grid grid-cols-2 gap-x-5 gap-y-1 text-xs' : 'space-y-2 text-sm'}>
      {Object.entries(businessHours).map(([day, hours]) => (
        <div key={day} className="flex justify-between gap-4">
          <dt className="font-medium">{day}</dt>
          <dd>{hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}</dd>
        </div>
      ))}
    </dl>
  )
}

function SocialLinks({ socialLinks, inline = false }) {
  return (
    <div className={inline ? 'flex flex-wrap gap-x-5 gap-y-2 text-sm' : 'space-y-2 text-sm'}>
      {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>}
      {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
      {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">Twitter</a>}
    </div>
  )
}

function QuickLinks({ footerLinks, inline = false }) {
  return (
    <ul className={inline ? 'flex flex-wrap gap-x-5 gap-y-2 text-sm' : 'space-y-2 text-sm'}>
      {footerLinks.map(link => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}
    </ul>
  )
}

/**
 * Footer Component
 * Displays contact information, hours, and quick links
 */
export default async function Footer({ templateId = 'bar' }) {
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

  const contact = (
    <address className="not-italic text-sm leading-6">
      <p>{restaurant.address.street}, {restaurant.address.city}, {restaurant.address.state} {restaurant.address.zip}</p>
      <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a>
      <span className="mx-2" aria-hidden="true">·</span>
      <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a>
    </address>
  )

  const copyright = (
    <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-current/15 pt-5 text-xs opacity-65 sm:flex-row">
      <p>© {new Date().getFullYear()} {restaurant.name}. All rights reserved.</p>
      {tenantId && <Link href="/admin/login" aria-label="Admin login" className="inline-flex items-center"><LogIn className="h-4 w-4" /><span className="sr-only">Admin Login</span></Link>}
    </div>
  )

  if (templateId === 'bar') {
    return (
      <footer className="bg-[var(--primary-dark-bg)] text-[var(--navbar-footer-text)]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="flex flex-col justify-between gap-6 border-b border-current/15 pb-8 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.2em] opacity-60">Visit after dark</p>
              <h2 className="font-serif text-3xl">{restaurant.name}</h2>
            </div>
            {contact}
          </div>
          <div className="grid grid-cols-1 gap-8 pt-8 sm:grid-cols-3">
            <div><h3 className="mb-3 text-xs uppercase tracking-widest opacity-60">Hours</h3><BusinessHoursList businessHours={businessHours} compact /></div>
            <div><h3 className="mb-3 text-xs uppercase tracking-widest opacity-60">Explore</h3><QuickLinks footerLinks={footerLinks} inline /></div>
            <div><h3 className="mb-3 text-xs uppercase tracking-widest opacity-60">Social</h3><SocialLinks socialLinks={socialLinks} inline /></div>
          </div>
          {copyright}
        </div>
      </footer>
    )
  }

  if (templateId === 'sushi') {
    return (
      <footer className="border-t border-black/10 bg-[var(--primary-light-bg)] text-[var(--navbar-footer-text)]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr] md:py-12">
          <div>
            <h2 className="mb-3 font-serif text-2xl">{restaurant.name}</h2>
            {contact}
          </div>
          <div><h3 className="mb-3 text-xs uppercase tracking-widest opacity-60">Hours</h3><BusinessHoursList businessHours={businessHours} compact /></div>
          <div><h3 className="mb-3 text-xs uppercase tracking-widest opacity-60">Navigate</h3><QuickLinks footerLinks={footerLinks} inline /></div>
          <div className="md:col-span-3"><SocialLinks socialLinks={socialLinks} inline />{copyright}</div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="border-t-4 border-double border-[var(--gold)]/50 bg-[var(--primary-light-bg)] text-[var(--navbar-footer-text)]">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.18em]">Established hospitality</p>
          <h2 className="font-serif text-3xl">{restaurant.name}</h2>
          <div aria-hidden="true" className="mx-auto mt-4 h-px w-20 bg-[var(--gold)]" />
        </div>
        <div className="grid grid-cols-1 gap-8 border-y border-[var(--gold)]/25 py-8 sm:grid-cols-2 lg:grid-cols-4">
          <div><h3 className="mb-3 font-serif text-lg">Visit Us</h3>{contact}</div>
          <div><h3 className="mb-3 font-serif text-lg">Opening Hours</h3><BusinessHoursList businessHours={businessHours} /></div>
          <div><h3 className="mb-3 font-serif text-lg">Information</h3><QuickLinks footerLinks={footerLinks} /></div>
          <div><h3 className="mb-3 font-serif text-lg">Follow Along</h3><SocialLinks socialLinks={socialLinks} /></div>
        </div>
        {copyright}
      </div>
    </footer>
  )
}
