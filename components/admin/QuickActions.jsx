'use client'

import Link from 'next/link'
import { Plus, ShoppingCart, Calendar, Share2, UtensilsCrossed } from 'lucide-react'

export default function QuickActions() {
    const actions = [
        // {
        //     name: 'New Event',
        //     href: '/admin/orders/new', // Assumes this route exists or will exist
        //     icon: ShoppingCart,
        //     color: 'bg-blue-500',
        //     description: 'Create manual order',
        // },
        {
            name: 'Add Image to Gallery',
            href: '/admin/gallery', // Assumes this route exists or will exist
            icon: Calendar,
            color: 'bg-purple-500',
            description: 'Add image to gallery',
        },
        {
            name: 'Create Post',
            href: '/admin/social-posting?action=new',
            icon: Share2,
            color: 'bg-pink-500',
            description: 'Social media update',
        },
        {
            name: 'Update Menu',
            href: '/admin/menu',
            icon: UtensilsCrossed,
            color: 'bg-orange-500',
            description: 'Manage items',
        },
    ]

    return (
        <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {actions.map((action) => (
                    <Link
                        key={action.name}
                        href={action.href}
                        className="group relative flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all hover:border-primary dark:hover:border-gold"
                    >
                        <div className={`p-3 rounded-full ${action.color} text-white mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                            <action.icon className="h-6 w-6" />
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {action.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            {action.description}
                        </p>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="h-4 w-4 text-gray-400" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
