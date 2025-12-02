import { headers } from 'next/headers'
import AnalyticsManager from '@/components/admin/AnalyticsManager'

export default async function AdminAnalyticsPage() {
  const headersList = await headers()
  const barId = headersList.get('x-tenant-id') || 'bar_1'

  return <AnalyticsManager barId={barId} />
}
