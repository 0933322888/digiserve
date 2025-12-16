import { getGiftCardStats } from '@/lib/gift-card-service'
import { getReservationStats } from '@/lib/reservation-service'
import { getOrderStats } from '@/lib/order-service'
import { getRecentEvents } from '@/lib/event-service'
import { isModuleEnabled } from '@/lib/module-settings-service'
import RecentActivityList from '@/components/admin/RecentActivityList'
import HeroStats from '@/components/admin/HeroStats'
import QuickActions from '@/components/admin/QuickActions'
import SetupProgress from '@/components/admin/SetupProgress'

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

  // Setup Progress Calculation
  const steps = [
    {
      label: 'Enable Online Ordering',
      description: 'Start accepting orders for pickup or delivery.',
      completed: orderingEnabled,
      action: { label: 'Enable Ordering', href: '/admin/settings?tab=modules' }
    },
    {
      label: 'Accept Reservations',
      description: 'Allow customers to book tables online.',
      completed: reservationsEnabled,
      action: { label: 'Enable Reservations', href: '/admin/settings?tab=modules' }
    },
    {
      label: 'Create First Menu Item',
      description: 'Add dishes to your digital menu.',
      // Simple heuristic: if ordering is enabled, we assume they likely have a menu. 
      // Ideally we would check menu count, but for now we'll mark it pending if ordering orders = 0
      completed: orderingEnabled && (orderStats?.totalOrders > 0 || true), // Force true for now or check orders
      action: { label: 'Manage Menu', href: '/admin/menu' }
    },
    {
      label: 'Configure Settings',
      description: 'Set your business hours and contact info.',
      completed: true, // Assumed done during sign up
      action: { label: 'Go to Settings', href: '/admin/settings' }
    }
  ]
  const completedSteps = steps.filter(s => s.completed).length
  const completionPercentage = Math.round((completedSteps / steps.length) * 100)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard Overview</h2>

        <SetupProgress completion={completionPercentage} steps={steps} />

        {/* Main Stats Row */}
        <HeroStats
          orderStats={orderingEnabled ? orderStats : null}
          reservationStats={reservationsEnabled ? reservationStats : null}
        />

        {/* Quick Actions Grid */}
        <QuickActions />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Activity Feed */}
          <div className="lg:col-span-2">
            <RecentActivityList events={recentEvents} />
          </div>

          {/* Side Widgets (Future Implementation - for now placeholder or simplified view) */}
          <div className="space-y-6">
            {/* Example: Pending Actions Widget could go here */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Ordering System</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${orderingEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {orderingEnabled ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Reservations</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${reservationsEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {reservationsEnabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Gift Cards</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${giftCardsEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {giftCardsEnabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
