import { notFound } from 'next/navigation'
import SectionTitle from '@/components/SectionTitle'
import MenuSection from '@/components/MenuSection'
import { siteConfig } from '@/config/siteConfig'
import drinksMenuData from '@/data/menu/drinks.json'

/**
 * Drinks Menu Page Metadata
 */
export const metadata = {
  title: 'Drinks Menu',
  description:
    'Explore our curated drinks menu featuring craft cocktails, wine, beer, and premium spirits.',
  openGraph: {
    title: 'Drinks Menu | TRIO BISTRO AND LOUNGE',
    description:
      'Explore our curated drinks menu featuring craft cocktails, wine, beer, and premium spirits.',
  },
}

/**
 * Drinks Menu Page
 * Displays drinks menu with Schema.org markup
 */
export default function DrinksMenuPage() {
  if (!siteConfig.features.drinkMenu) {
    notFound()
  }

  const menuSchema = {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: `${siteConfig.restaurant.name} - Drinks Menu`,
    description: 'Our curated drinks menu featuring craft cocktails, wine, beer, and premium spirits',
    hasMenuSection: drinksMenuData.sections.map((section) => ({
      '@type': 'MenuSection',
      name: section.name,
      description: section.description,
      hasMenuItem: section.items.map((item) => ({
        '@type': 'MenuItem',
        name: item.name,
        description: item.description,
        offers: {
          '@type': 'Offer',
          price: item.price.toString(),
          priceCurrency: 'USD',
        },
      })),
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuSchema) }}
      />

      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title="Drinks Menu"
            subtitle="Handcrafted cocktails and fine beverages"
          />

          {drinksMenuData.sections.map((section, index) => (
            <MenuSection key={section.id} section={section} index={index} />
          ))}
        </div>
      </div>
    </>
  )
}

