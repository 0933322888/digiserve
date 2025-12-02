import { headers } from 'next/headers'
import EventsManager from '@/components/admin/EventsManager'

export default async function AdminEventsPage() {
  const headersList = await headers()
  const barId = headersList.get('x-tenant-id')

  if (!barId) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Configuration Error</h1>
        <p>Tenant ID not found. Please contact support.</p>
      </div>
    )
  }

  return <EventsManager barId={barId} />
}
