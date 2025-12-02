import { getAllGiftCards } from '@/lib/gift-card-service'
import { formatPrice, formatDate } from '@/lib/utils'
import AdminRedeemForm from '@/components/admin/AdminRedeemForm'
import GiftCardList from '@/components/admin/GiftCardList'

export const dynamic = 'force-dynamic'

import { headers } from 'next/headers'

export default async function AdminGiftCardsPage() {
  const headersList = await headers()
  const barId = headersList.get('x-tenant-id') || 'bar_1'

  const giftCards = await getAllGiftCards(barId)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gift Cards Management</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Redeem gift cards and view transaction history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Redemption Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Redeem Gift Card
            </h3>
            <AdminRedeemForm />
          </div>
        </div>

        {/* Gift Cards List */}
        <div className="lg:col-span-2">
          <GiftCardList giftCards={giftCards} />
        </div>
      </div>
    </div>
  )
}
