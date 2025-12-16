'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function MockCheckoutPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const barId = searchParams.get('barId')
    const moduleId = searchParams.get('moduleId')
    const returnUrl = searchParams.get('returnUrl')

    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleConfirm = async () => {
        setLoading(true)
        try {
            // Simulate successful payment processing
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Call mock webhooktrigger to update DB
            await fetch('/api/billing/mock-webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'checkout.session.completed',
                    barId,
                    addonKey: moduleId
                })
            })

            setSuccess(true)
            setTimeout(() => {
                if (returnUrl) {
                    window.location.href = returnUrl
                } else {
                    router.push('/admin/settings')
                }
            }, 1000)
        } catch (error) {
            console.error(error)
            alert('Mock payment failed')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                    <p className="text-gray-500 mb-4">Your subscription for {moduleId} is now active.</p>
                    <p className="text-sm text-gray-400">Redirecting back to app...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full border border-gray-200">
                <div className="mb-6 text-center">
                    <div className="uppercase tracking-wide text-xs font-bold text-blue-600 mb-1">Test Mode</div>
                    <h1 className="text-2xl font-bold text-gray-900">Mock Stripe Checkout</h1>
                    <p className="text-gray-500 mt-2">Simulate payment for <span className="font-mono font-medium text-black">{moduleId}</span></p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="bg-gray-50 p-4 rounded border border-gray-100">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Tenant ID</span>
                            <span className="font-mono">{barId}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total due</span>
                            <span className="font-bold">$0.00 (Trial)</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Processing...
                        </>
                    ) : (
                        'Confirm Payment'
                    )}
                </button>
                <button
                    onClick={() => router.back()}
                    className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}
