import { notFound } from 'next/navigation'
import SectionTitle from '@/components/SectionTitle'
import OrderMenuClient from '@/components/ordering/OrderMenuClient'
import { siteConfig } from '@/config/siteConfig'
import foodMenuData from '@/data/menu/food.json'
import drinksMenuData from '@/data/menu/drinks.json'

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

/**
 * Order Page - Browse Menu
 * Combines food and drink menus with category filtering
 */
export default function OrderPage() {

  // Combine all menu items
  const allSections = [
    ...(siteConfig.features.foodMenu
      ? foodMenuData.sections.map((section) => ({
          ...section,
          category: 'food',
        }))
      : []),
    ...(siteConfig.features.drinkMenu
      ? drinksMenuData.sections.map((section) => ({
          ...section,
          category: 'drinks',
        }))
      : []),
  ]

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title="Order Online"
          subtitle="Browse our menu and add items to your cart"
        />
        <OrderMenuClient sections={allSections} />
      </div>
    </div>
  )
}

