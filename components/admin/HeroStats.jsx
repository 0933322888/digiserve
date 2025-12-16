'use client'

import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingBag, Users, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function HeroStats({ orderStats, reservationStats }) {
    const stats = [
        {
            name: 'Total Revenue',
            value: formatPrice(orderStats?.todayRevenue || 0),
            change: '+12%', // This would ideally be calculated from yesterday
            changeType: 'increase',
            icon: DollarSign,
            color: 'bg-emerald-500',
        },
        {
            name: 'Active Orders',
            value: orderStats?.pending || 0,
            subtext: `${orderStats?.preparing || 0} Preparing`,
            icon: ShoppingBag,
            color: 'bg-blue-500',
        },
        {
            name: 'Reservations Today',
            value: reservationStats?.todayConfirmed || 0,
            subtext: `${reservationStats?.pending || 0} Pending`,
            icon: Users,
            color: 'bg-purple-500',
        },
        {
            name: 'Avg Prep Time',
            value: '24m', // Placeholder - would need backend support
            subtext: 'Target: 20m',
            icon: Clock,
            color: 'bg-orange-500',
        },
    ]

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((item) => (
                <div
                    key={item.name}
                    className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                    <dt>
                        <div className={`absolute rounded-md p-3 ${item.color} bg-opacity-10 dark:bg-opacity-20`}>
                            <item.icon className={`h-6 w-6 ${item.color.replace('bg-', 'text-')}`} aria-hidden="true" />
                        </div>
                        <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                            {item.name}
                        </p>
                    </dt>
                    <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {item.value}
                        </p>
                        {item.change && (
                            <p
                                className={`ml-2 flex items-baseline text-sm font-semibold ${item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                                    }`}
                            >
                                {item.changeType === 'increase' ? (
                                    <ArrowUpRight className="h-4 w-4 flex-shrink-0 self-center text-green-500" />
                                ) : (
                                    <ArrowDownRight className="h-4 w-4 flex-shrink-0 self-center text-red-500" />
                                )}
                                <span className="sr-only">
                                    {item.changeType === 'increase' ? 'Increased by' : 'Decreased by'}
                                </span>
                                {item.change}
                            </p>
                        )}
                        {item.subtext && (
                            <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                {item.subtext}
                            </p>
                        )}
                    </dd>
                </div>
            ))}
        </div>
    )
}
