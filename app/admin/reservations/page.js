import { getReservations, getSettings } from '@/lib/reservation-service'
import { formatDate } from '@/lib/utils'
import ReservationList from '@/components/admin/ReservationList'

export const dynamic = 'force-dynamic'

import { headers } from 'next/headers'

export default async function AdminReservationsPage() {
  const headersList = await headers()
  const barId = headersList.get('x-tenant-id')

  const reservations = await getReservations(barId)
  const settings = await getSettings(barId) // Updated to be tenant aware

  // Since this is a server component, we can't use client-side state for immediate UI updates without hydration.
  // However, for this prototype, we'll make the whole page a client component or use a client wrapper.
  // Actually, the file is marked 'force-dynamic' but not 'use client'.
  // To add interactivity (buttons), we need to make this a Client Component or extract the table to one.
  // Let's convert this page to a Client Component for simplicity in this prototype phase.

  // Wait, I can't change a page to client component if it uses server-side imports like `getReservations` directly if those use `fs`.
  // `getReservations` uses `fs`, so it MUST run on server.
  // I need to create a Client Component for the Table.

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reservations</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage table bookings and capacity.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Max Capacity (Seats/Slot):
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {settings.maxSeatsPerSlot}
          </span>
        </div>
      </div>

      <ReservationList initialReservations={reservations} />
    </div>
  )
}
