import { notFound } from 'next/navigation'
import SectionTitle from '@/components/SectionTitle'
import MenuSection from '@/components/MenuSection'
import { siteConfig } from '@/config/siteConfig'
import foodMenuData from '@/data/menu/food.json'

/**
 * Food Menu Page Metadata
 */
export const metadata = {
  title: 'Food Menu',
  description:
    'Explore our exquisite food menu featuring appetizers, main courses, and desserts crafted with premium ingredients.',
  openGraph: {
    title: 'Food Menu | TRIO BISTRO AND LOUNGE',
    description:
      'Explore our exquisite food menu featuring appetizers, main courses, and desserts.',
  },
}

/**
 * Food Menu Page
 * Displays food menu with Schema.org markup
 */
export default function FoodMenuPage() {
  if (!siteConfig.features.foodMenu) {
    notFound()
  }

  const menuSchema = {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: `${siteConfig.restaurant.name} - Food Menu`,
    description: 'Our exquisite food menu featuring appetizers, main courses, and desserts',
    hasMenuSection: foodMenuData.sections.map((section) => ({
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
            title="Food Menu"
            subtitle="Crafted with passion, served with excellence"
          />

          {foodMenuData.sections.map((section, index) => (
            <MenuSection key={section.id} section={section} index={index} />
          ))}
        </div>
      </div>
    </>
  )
}

