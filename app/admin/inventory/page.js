export const metadata = {
  title: 'Inventory Management',
}

export default function InventoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track ingredients, stock levels, and manage inventory across all locations.
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
              <strong>Ingredient Tracking:</strong> Complete inventory of all ingredients and
              supplies with current stock levels
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Stock Level Monitoring:</strong> Real-time stock level tracking with automatic
              updates based on orders and usage
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Low Stock Alerts:</strong> Automated alerts when items fall below minimum
              threshold levels
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Supplier/Vendor Management:</strong> Manage supplier contacts, pricing, and
              order history
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Purchase Orders:</strong> Create and track purchase orders, manage deliveries
              and invoices
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Cost Tracking:</strong> Track cost per item, calculate total inventory value,
              monitor price changes
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Waste Tracking:</strong> Record and analyze food waste, identify waste
              patterns, improve sustainability
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Multi-Bar Inventory:</strong> Separate inventory tracking per location with
              cross-location transfer capabilities
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Inventory Reports:</strong> Generate inventory reports, usage reports, and
              cost analysis reports
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Recipe Integration:</strong> Link inventory items to menu items, track
              ingredient usage per dish
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
