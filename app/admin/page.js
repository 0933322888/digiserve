import { getGiftCardStats } from '@/lib/gift-card-service'
import { getReservationStats } from '@/lib/reservation-service'
import { getOrderStats } from '@/lib/order-service'
import { getRecentEvents } from '@/lib/event-service'
import { isModuleEnabled } from '@/lib/module-settings-service'
import {
  CreditCard,
  DollarSign,
  Activity,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Wallet,
  ShoppingBag,
  ShoppingCart,
  ChefHat,
  Package,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import RecentActivityList from '@/components/admin/RecentActivityList'

export const dynamic = 'force-dynamic'

import { headers } from 'next/headers'

export default async function AdminDashboard() {
  const headersList = await headers()
  const barId = headersList.get('x-tenant-id')

  if (!barId) {
    // In production, this should never happen as middleware handles it
    // If it does, it's a configuration error
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Configuration Error</h1>
        <p>Tenant ID not found. Please contact support.</p>
      </div>
    )
  }

  // Check module status
  const [giftCardsEnabled, reservationsEnabled, orderingEnabled] = await Promise.all([
    isModuleEnabled('giftCards'),
    isModuleEnabled('reservations'),
    isModuleEnabled('ordering'),
  ])

  // Only fetch stats for enabled modules
  const [giftCardStats, reservationStats, orderStats, recentEvents] = await Promise.all([
    giftCardsEnabled ? getGiftCardStats() : Promise.resolve(null),
    reservationsEnabled ? getReservationStats() : Promise.resolve(null),
    orderingEnabled ? getOrderStats(barId) : Promise.resolve(null),
    getRecentEvents(10),
  ])

  // Only build stat cards if modules are enabled and stats are available
  const giftCardStatCards = giftCardsEnabled && giftCardStats
    ? [
      {
        name: 'Total Value',
        value: formatPrice(giftCardStats.totalValue),
        icon: DollarSign,
        color: 'bg-green-500',
      },
      {
        name: 'Outstanding Value',
        value: formatPrice(giftCardStats.totalValue - giftCardStats.totalRedeemed),
        icon: Wallet,
        color: 'bg-orange-500',
      },
      {
        name: 'Redeemed Value',
        value: formatPrice(giftCardStats.totalRedeemed),
        icon: ShoppingBag,
        color: 'bg-blue-500',
      },
      {
        name: 'Active Cards',
        value: giftCardStats.activeCards,
        icon: CreditCard,
        color: 'bg-purple-500',
      },
    ]
    : []

  const reservationStatCards = reservationsEnabled && reservationStats
    ? [
      { name: 'Pending', value: reservationStats.pending, icon: Clock, color: 'bg-yellow-500' },
      {
        name: 'Confirmed Today',
        value: reservationStats.todayConfirmed,
        icon: CheckCircle,
        color: 'bg-green-600',
      },
      { name: 'Total', value: reservationStats.total, icon: Calendar, color: 'bg-purple-500' },
    ]
    : []

  const orderStatCards = orderingEnabled && orderStats
    ? [
      { name: 'Pending Orders', value: orderStats.pending, icon: Clock, color: 'bg-yellow-500' },
      { name: 'Preparing', value: orderStats.preparing, icon: ChefHat, color: 'bg-purple-500' },
      { name: 'Ready', value: orderStats.ready, icon: Package, color: 'bg-green-500' },
      {
        name: "Today's Orders",
        value: orderStats.todayOrders,
        icon: ShoppingCart,
        color: 'bg-blue-500',
      },
      {
        name: "Today's Revenue",
        value: formatPrice(orderStats.todayRevenue),
        icon: DollarSign,
        color: 'bg-emerald-600',
      },
      {
        name: 'Total Revenue',
        value: formatPrice(orderStats.totalRevenue),
        icon: Wallet,
        color: 'bg-indigo-600',
      },
    ]
    : []

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>

      {/* Gift Cards Section */}
      {giftCardsEnabled && giftCardStatCards.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Gift Cards</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {giftCardStatCards.map(item => (
              <div
                key={item.name}
                className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`rounded-md p-3 ${item.color}`}>
                        <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          {item.name}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {item.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reservations Section */}
      {reservationsEnabled && reservationStatCards.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Reservations</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {reservationStatCards.map(item => (
              <div
                key={item.name}
                className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`rounded-md p-3 ${item.color}`}>
                        <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          {item.name}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {item.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Section */}
      {orderingEnabled && orderStatCards.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Online Orders</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {orderStatCards.map(item => (
              <div
                key={item.name}
                className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`rounded-md p-3 ${item.color}`}>
                        <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          {item.name}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {item.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <RecentActivityList events={recentEvents} />
      </div>
    </div>
  )
}
