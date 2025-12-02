import { notFound } from 'next/navigation'
import SectionTitle from '@/components/SectionTitle'
import MenuClient from '@/components/FoodMenuClient'
import { siteConfig } from '@/config/siteConfig'
import { getActiveMenu } from '@/lib/menu-service'

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

export const dynamic = 'force-dynamic'

/**
 * Food Menu Page
 * Displays food menu from active menu
 */
import { getTenantFromRequest } from '@/lib/tenant-service'
import { headers } from 'next/headers'

// ... imports

export default async function MenuPage() {
  // Get tenant from request
  const headersList = await headers()
  const host = headersList.get('host')
  const { getTenantFromHost } = await import('@/lib/tenant-service')
  const barId = await getTenantFromHost(host)

  const activeMenu = await getActiveMenu(barId)

  if (!activeMenu || !activeMenu.sections || activeMenu.sections.length === 0) {
    return (
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionTitle title="Food Menu" subtitle="Menu is currently unavailable" />
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Please check back later or contact us directly.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const menuSchema = {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: `${siteConfig.restaurant.name} - Menu`,
    description: 'Our menu featuring food and drinks',
    hasMenuSection: activeMenu.sections.map(section => ({
      '@type': 'MenuSection',
      name: section.name,
      description: section.description,
      hasMenuItem: (section.items || [])
        .filter(item => !item.archived)
        .map(item => ({
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
          <SectionTitle title="Menu" subtitle="Crafted with passion, served with excellence" />

          <MenuClient sections={activeMenu.sections} />
        </div>
      </div>
    </>
  )
}
