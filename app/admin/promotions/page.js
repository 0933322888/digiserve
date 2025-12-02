export const metadata = {
  title: 'Happy Hour & Promotions',
}

export default function PromotionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Happy Hour & Promotions
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage time-based pricing, special offers, and promotional campaigns.
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
              <strong>Time-Based Pricing Rules:</strong> Set automatic price changes for specific
              days and times (e.g., Happy Hour 4-6 PM)
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Dynamic Menu Pricing:</strong> Automatically adjust menu item prices based on
              time of day and day of week
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Special Offers Management:</strong> Create and manage promotional offers with
              start/end dates and conditions
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Promotional Campaigns:</strong> Design multi-day promotional campaigns with
              specific rules and eligibility criteria
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Discount Codes/Coupons:</strong> Generate and manage discount codes with usage
              limits and expiration dates
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Happy Hour Schedules:</strong> Configure recurring happy hour schedules with
              specific menu items and discounts
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Category-Based Promotions:</strong> Apply promotions to specific menu
              categories (e.g., all cocktails, appetizers)
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Buy-One-Get-One (BOGO):</strong> Set up BOGO offers and special combo deals
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Promotion Analytics:</strong> Track promotion performance, redemption rates,
              and revenue impact
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Customer Notifications:</strong> Send push notifications or emails about
              active promotions to customers
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Multi-Bar Promotions:</strong> Create location-specific or cross-location
              promotional campaigns
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
