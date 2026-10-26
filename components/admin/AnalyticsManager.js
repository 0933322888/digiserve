/* eslint-disable */
"use client"

import { useState } from 'react'
import {
  Activity,
  BarChart3,
  Building2,
  Clock,
  FileText,
  Globe,
  LayoutDashboard,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'
import SalesReports from '@/components/admin/analytics/SalesReports'
import PopularItems from '@/components/admin/analytics/PopularItems'
import RevenueTrends from '@/components/admin/analytics/RevenueTrends'
import CustomerAnalytics from '@/components/admin/analytics/CustomerAnalytics'
import OrderPatterns from '@/components/admin/analytics/OrderPatterns'
import PeakHours from '@/components/admin/analytics/PeakHours'
import MultiBarComparison from '@/components/admin/analytics/MultiBarComparison'
import CustomDashboard from '@/components/admin/analytics/CustomDashboard'
import WebAnalyticsPage from '@/components/admin/analytics/WebAnalytics'

export default function AnalyticsManager({ barId }) {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'web', name: 'Web Analytics', icon: Globe },
    { id: 'sales', name: 'Sales Reports', icon: FileText },
    { id: 'popular', name: 'Popular Items', icon: Star },
    { id: 'revenue', name: 'Revenue Trends', icon: TrendingUp },
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'patterns', name: 'Order Patterns', icon: Activity },
    { id: 'peak', name: 'Peak Hours', icon: Clock },
    { id: 'comparison', name: 'Multi-Bar', icon: Building2 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-primary dark:text-primary">Analytics</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Comprehensive analytics and insights for your business performance.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 ">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            return <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === tab.id
                ? 'border-primary text-primary-text dark:border-gold dark:text-gold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {tab.name}
            </button>
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'dashboard' && <CustomDashboard barId={barId} />}
        {activeTab === 'web' && <WebAnalyticsPage barId={barId} />}
        {activeTab === 'sales' && <SalesReports barId={barId} />}
        {activeTab === 'popular' && <PopularItems barId={barId} />}
        {activeTab === 'revenue' && <RevenueTrends barId={barId} />}
        {activeTab === 'customers' && <CustomerAnalytics barId={barId} />}
        {activeTab === 'patterns' && <OrderPatterns barId={barId} />}
        {activeTab === 'peak' && <PeakHours barId={barId} />}
        {activeTab === 'comparison' && <MultiBarComparison barId={barId} />}
      </div>
    </div>
  )
}
