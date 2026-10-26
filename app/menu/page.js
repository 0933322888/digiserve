import { notFound } from 'next/navigation'
import SectionTitle from '@/components/SectionTitle'
import OrderMenuClient from '@/components/ordering/OrderMenuClient'
import { siteConfig } from '@/config/siteConfig'
import { getActiveMenu } from '@/lib/menu-service'
import { isModuleEnabled } from '@/lib/module-settings-service'

/**
 * Order Page Metadata
 */
export const metadata = {
  title: 'Order Online',
  description: `Order delicious food and drinks online from ${siteConfig.restaurant.name}. Fast pickup and delivery available.`,
  openGraph: {
    title: `Order Online | ${siteConfig.restaurant.name}`,
    description: `Order delicious food and drinks online from ${siteConfig.restaurant.name}.`,
  },
}

export const dynamic = 'force-dynamic'

/**
 * Order Page - Browse Menu
 * Uses the active menu
 */
export default async function OrderPage() {
  const { headers } = await import('next/headers')
  const headersList = await headers()
  const tenantId = headersList.get('x-tenant-id')

  const orderingEnabled = await isModuleEnabled('ordering', tenantId)
  const { getTenantConfig } = await import('@/lib/tenant-service')
  const tenant = tenantId ? await getTenantConfig(tenantId) : null
  const activeMenu = await getActiveMenu(tenant?.barId || tenantId)

  if (!activeMenu || !activeMenu.sections || activeMenu.sections.length === 0) {
    return (
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionTitle title={orderingEnabled ? "Order Online" : "Menu"} subtitle="Menu is currently unavailable" />
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Please check back later or contact us directly.
            </p>
          </div>
        </div>
      </div>
    )
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
        name: 'Order Online',
        item: `${process.env.NEXT_PUBLIC_APP_URL}/menu`,
      },
    ],
  }

  // Fetch tenant config for theme
  const { getComponentVariants } = await import('@/lib/theme-utils')

  // tenantId is already fetched above

  let menuVariant = 'grid'
  if (tenantId) {
    if (tenant?.theme) {
      menuVariant = getComponentVariants(tenant.theme.templateId).menu
    }
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
            title={orderingEnabled ? "Order Online" : "Menu"}
            subtitle={orderingEnabled ? "Browse our menu and add items to your cart" : ""}
          />
          <OrderMenuClient sections={activeMenu.sections} variant={menuVariant} />
        </div>
      </div>
    </>
  )
}
