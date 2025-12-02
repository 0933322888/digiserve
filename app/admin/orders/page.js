import { headers } from 'next/headers'
import OrdersManager from '@/components/admin/OrdersManager'

export default async function AdminOrdersPage() {
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

  return <OrdersManager barId={barId} />
}
