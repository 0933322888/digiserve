'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'

export default function MockPortalPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const barId = searchParams.get('barId')
    const moduleId = searchParams.get('moduleId')
    const returnUrl = searchParams.get('returnUrl')

    const [loading, setLoading] = useState(false)

    const handleCancelSubscription = async () => {
        if (!confirm('Are you sure you want to cancel simulate canceling this subscription?')) return

        setLoading(true)
        try {
            // call mock webhook trigger
            await fetch('/api/billing/mock-webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'customer.subscription.deleted',
                    barId,
                    addonKey: moduleId
                })
            })

            alert('Subscription canceled')

            if (returnUrl) {
                window.location.href = returnUrl
            } else {
                router.push('/admin/settings')
            }

        } catch (error) {
            console.error(error)
            alert('Failed to cancel')
        } finally {
            setLoading(false)
        }
    }

    const handleReturn = () => {
        if (returnUrl) {
            window.location.href = returnUrl
        } else {
            router.push('/admin/settings')
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full border border-gray-200">
                <div className="mb-6">
                    <div className="uppercase tracking-wide text-xs font-bold text-gray-500 mb-1">Test Mode</div>
                    <h1 className="text-2xl font-bold text-gray-900">Billing Portal</h1>
                    <p className="text-gray-500 mt-1">Manage subscription for <span className="font-medium text-black">{moduleId}</span></p>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-100 mb-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">Subscription Active</h3>
                            <div className="mt-2 text-sm text-green-700">
                                <p>Your 5-day free trial is active.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleCancelSubscription}
                        disabled={loading}
                        className="w-full flex items-center justify-center py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                        Cancel Plan
                    </button>

                    <button
                        onClick={handleReturn}
                        className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Return to Settings
                    </button>
                </div>
            </div>
        </div>
    )
}
