export const metadata = {
  title: 'Loyalty Program',
}

export default function LoyaltyProgramPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Customer Loyalty & Rewards Program
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Build customer loyalty with points, rewards, and personalized offers.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Coming Soon</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This module will include the following features:
        </p>

        <ul className="space-y-3 text-gray-700 dark:text-gray-300">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Points System:</strong> Award points for purchases, visits, and special
              actions with customizable point values
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Rewards Redemption:</strong> Allow customers to redeem points for discounts,
              free items, or special perks
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Customer Profiles:</strong> Complete customer database with order history,
              preferences, and loyalty status
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Birthday Rewards:</strong> Automated birthday rewards and special offers for
              loyal customers
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Referral Programs:</strong> Reward customers for referring friends and family
              with bonus points or discounts
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Tiered Membership:</strong> Create membership tiers (Bronze, Silver, Gold)
              with increasing benefits
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Loyalty Cards:</strong> Digital loyalty cards accessible via customer accounts
              or mobile app
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Points Expiration:</strong> Configure point expiration rules and send
              reminders before points expire
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Loyalty Analytics:</strong> Track program performance, redemption rates, and
              customer engagement metrics
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Personalized Offers:</strong> Send targeted offers based on customer
              preferences and purchase history
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
