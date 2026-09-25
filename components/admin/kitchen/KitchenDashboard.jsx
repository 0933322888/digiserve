'use client'

import { useKDS } from '@/hooks/useKDS'
import OrderCard from '@/components/admin/kitchen/OrderCard'
import { Loader2, AlertCircle } from 'lucide-react'

export default function KitchenPage({ barId }) {
    const { orders, loading, error, refresh, updateOrderStatus } = useKDS(barId)

    if (loading && orders.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-text" />
                <span className="ml-2 text-lg text-gray-600">Loading KDS...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    KDS Error: {error}
                    <button
                        onClick={refresh}
                        className="ml-4 px-3 py-1 bg-white border border-red-200 rounded hover:bg-red-50 text-sm"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        Kitchen Display System
                        <div className="flex items-center gap-2 text-sm font-normal px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            Live
                        </div>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {orders.length} Active Orders
                    </p>
                </div>
                <div className="flex gap-4">
                    {/* Stats or Filter controls could go here */}
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">All Caught Up!</h3>
                    <p>No active orders in the queue.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {orders.map(order => (
                        <div key={order.id} className="h-[500px]">
                            <OrderCard order={order} onUpdateStatus={updateOrderStatus} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
