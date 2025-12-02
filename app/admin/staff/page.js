import { headers } from 'next/headers'
import StaffManager from '@/components/admin/StaffManager'

export default async function AdminStaffPage() {
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

  return <StaffManager barId={barId} />
}
