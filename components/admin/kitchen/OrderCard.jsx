'use client'

import React, { useState, useEffect } from 'react' // Explicitly import React
import { Clock, CheckCircle, ChefHat } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function OrderCard({ order, onUpdateStatus }) {
    const [elapsed, setElapsed] = useState('')
    const [timerColor, setTimerColor] = useState('text-green-600')

    useEffect(() => {
        const updateTime = () => {
            const created = new Date(order.createdAt)
            const now = new Date()
            const diffMinutes = (now - created) / 1000 / 60

            setElapsed(formatDistanceToNow(created, { addSuffix: true }))

            if (diffMinutes > 20) {
                setTimerColor('text-red-600 font-bold animate-pulse')
            } else if (diffMinutes > 10) {
                setTimerColor('text-yellow-600 font-bold')
            } else {
                setTimerColor('text-green-600')
            }
        }

        updateTime()
        const interval = setInterval(updateTime, 60000) // Update every minute
        return () => clearInterval(interval)
    }, [order.createdAt])

    const isPending = order.status === 'pending'
    const isPreparing = order.status === 'preparing'

    return (
        <div className={`flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 ${isPreparing ? 'border-primary dark:border-gold' : 'border-gray-200 dark:border-gray-700'}`}>
            {/* Header */}
            <div className={`px-4 py-3 border-b flex justify-between items-center ${isPreparing ? 'bg-primary/5 dark:bg-gold/10' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                <div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                        Table {order.tableId || 'N/A'}
                    </span>
                    {order.orderType && (
                        <span className="ml-2 text-xs uppercase tracking-wider text-gray-500 font-semibold border px-1 rounded">
                            {order.orderType}
                        </span>
                    )}
                </div>
                <div className={`flex items-center gap-1 text-sm ${timerColor}`}>
                    <Clock className="w-4 h-4" />
                    {elapsed}
                </div>
            </div>

            {/* Body (Items) */}
            <div className="flex-1 p-4 overflow-y-auto max-h-[300px]">
                <ul className="space-y-3">
                    {order.items.map((item, idx) => (
                        <li key={idx} className="flex items-start justify-between">
                            <div className="flex gap-3">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-bold text-gray-900 dark:text-white shrink-0">
                                    {item.quantity}
                                </div>
                                <div>
                                    <p className="text-base font-medium text-gray-900 dark:text-white">
                                        {item.name}
                                    </p>
                                    {item.options && Object.keys(item.options).length > 0 && (
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                            {Object.entries(item.options).map(([key, value]) => (
                                                <div key={key}>• {key}: {value}</div>
                                            ))}
                                        </div>
                                    )}
                                    {item.specialInstructions && (
                                        <p className="text-sm text-red-500 italic mt-1 bg-red-50 dark:bg-red-900/20 p-1 rounded">
                                            Note: {item.specialInstructions}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Footer (Actions) */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {isPending && (
                    <button
                        onClick={() => onUpdateStatus(order.id, 'preparing')}
                        className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary-dark text-white py-6 rounded-xl text-xl font-bold transition-transform active:scale-95 shadow-md"
                    >
                        <ChefHat className="w-8 h-8" />
                        Start Preparing
                    </button>
                )}
                {isPreparing && (
                    <button
                        onClick={() => onUpdateStatus(order.id, 'completed')}
                        className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white py-6 rounded-xl text-xl font-bold transition-transform active:scale-95 shadow-md"
                    >
                        <CheckCircle className="w-8 h-8" />
                        Mark Ready
                    </button>
                )}
            </div>
        </div>
    )
}
