import { notFound } from 'next/navigation'
import SectionTitle from '@/components/SectionTitle'
import DrinksMenuClient from '@/components/DrinksMenuClient'
import { siteConfig } from '@/config/siteConfig'
import { getActiveMenu } from '@/lib/menu-service'
import { getTenantFromRequest } from '@/lib/tenant-service'
import { headers } from 'next/headers'

/**
 * Drinks Menu Page Metadata
 */
export const metadata = {
    title: 'Drinks Menu',
    description:
        'Discover our extensive collection of cocktails, wines, and spirits.',
    openGraph: {
        title: 'Drinks Menu | TRIO BISTRO AND LOUNGE',
        description:
            'Discover our extensive collection of cocktails, wines, and spirits.',
    },
}

export const dynamic = 'force-dynamic'

/**
 * Drinks Menu Page
 * Displays drinks menu from active menu
 */
export default async function DrinksPage() {
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
                    <SectionTitle title="Drinks Menu" subtitle="Menu is currently unavailable" />
                    <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400">
                            Please check back later or contact us directly.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Filter for drink sections if possible, or just pass all sections
    // Ideally we'd have a 'type' on sections, but for now we'll pass all
    // and let the client component handle it or the user organize it.
    // A common pattern is to have separate menus, but the current backend supports one active menu.
    // We'll assume the user puts drink sections in the active menu.

    const menuSchema = {
        '@context': 'https://schema.org',
        '@type': 'Menu',
        name: `${siteConfig.restaurant.name} - Drinks Menu`,
        description: 'Our drinks menu',
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
                    <SectionTitle title="Drinks" subtitle="Expertly crafted cocktails and fine wines" />

                    <DrinksMenuClient sections={activeMenu.sections} />
                </div>
            </div>
        </>
    )
}
