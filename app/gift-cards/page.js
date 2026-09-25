import { notFound } from 'next/navigation'
import SectionTitle from '@/components/SectionTitle'
import GiftCardForm from '@/components/forms/GiftCardForm'
import { siteConfig } from '@/config/siteConfig'

/**
 * Gift Cards Page Metadata
 */
export const metadata = {
  title: 'Gift Cards',
  description: `Give the gift of an unforgettable dining experience at ${siteConfig.restaurant.name}. Purchase a gift card today.`,
  openGraph: {
    title: `Gift Cards | ${siteConfig.restaurant.name}`,
    description: `Give the gift of an unforgettable dining experience at ${siteConfig.restaurant.name}. Purchase a gift card today.`,
  },
}

/**
 * Gift Cards Page
 * Features gift card request form
 */
export default function GiftCardsPage() {
  if (!siteConfig.features.giftCards) {
    notFound()
  }

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
        name: 'Gift Cards',
        item: `${process.env.NEXT_PUBLIC_APP_URL}/gift-cards`,
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
            title="Gift Cards"
            subtitle="Give the gift of an unforgettable dining experience"
          />

          <div className="max-w-4xl mx-auto">
            <div className="bg-secondary dark:bg-[var(--secondary-dark-bg)] p-8 rounded-lg shadow-lg mb-8">
              <h3 className="text-2xl font-serif font-semibold text-primary dark:text-gold mb-4">
                Perfect for Any Occasion
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our gift cards are the perfect way to share the Restaurant experience with friends and
                loved ones. Whether it&apos;s a birthday, anniversary, holiday, or just because, a gift
                card to {siteConfig.restaurant.name} is always appreciated.
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>Available in various denominations</li>
                <li>Never expires</li>
                <li>Can be used for dining, drinks, or special events</li>
                <li>Perfect for corporate gifts and client appreciation</li>
              </ul>
            </div>

            <GiftCardForm />
          </div>
        </div>
      </div>
    </>
  )
}
