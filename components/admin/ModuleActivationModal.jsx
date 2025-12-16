import { useState } from 'react'
import { Loader2, CheckCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ModuleActivationModal({ module, isOpen, onClose }) {
    const [loading, setLoading] = useState(false)

    if (!isOpen || !module) return null

    const handleActivate = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/billing/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    addonKey: module.key,
                    addonKey: module.key,
                    // returnUrl: window.location.href, // Let backend construct success URL with params
                }),
            })

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error(data.error || 'Failed to initiate checkout')
            }
        } catch (error) {
            console.error('Activation error:', error)
            toast.error(error.message)
            setLoading(false)
        }
    }

    // Price mapping helper (should match backend/stripe.js logic conceptually)
    const getPrice = (key) => {
        const prices = {
            ordering: '$29',
            reservations: '$19',
            events: '$9',
            gallery: '$0', // Maybe free? Plan said Add-ons grid. Let's assume paid or free.
            giftCards: '$14',
            socialPosting: '$19',
            loyalty: '$24',
        }
        return prices[key] || '$9'
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Enable {module.name}</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {module.description}
                    </p>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Subscription</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">{getPrice(module.key)}</span>
                                <span className="text-gray-500 text-sm">/mo</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg w-fit">
                            <CheckCircle className="w-4 h-4" />
                            <span>Includes 5-day free trial</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleActivate}
                            disabled={loading}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Redirecting to Stripe...
                                </>
                            ) : (
                                'Start 5-Day Free Trial'
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="w-full py-3 px-4 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                    </div>

                    <p className="text-xs text-center text-gray-400 mt-4">
                        You won't be charged until the trial ends. Cancel anytime.
                    </p>
                </div>
            </div>
        </div>
    )
}
