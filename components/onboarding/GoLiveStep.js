'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Globe, Check, Loader2 } from 'lucide-react'

export default function GoLiveStep({ tenantId, onBack, onComplete, loading }) {
    const [subdomain, setSubdomain] = useState('')
    const [showDomainModal, setShowDomainModal] = useState(false)
    const [loadingSubdomain, setLoadingSubdomain] = useState(true)

    useEffect(() => {
        // Fetch tenant info to get subdomain
        const fetchTenantInfo = async () => {
            try {
                const res = await fetch(`/api/tenants/${tenantId}`)
                if (res.ok) {
                    const data = await res.json()
                    setSubdomain(data.subdomain || '')
                }
            } catch (error) {
                console.error('Error fetching tenant info:', error)
            } finally {
                setLoadingSubdomain(false)
            }
        }

        fetchTenantInfo()
    }, [tenantId])

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Your Site is Ready!</h2>
                <p className="text-gray-400">Your restaurant website is live and ready to share</p>
            </div>

            {/* Subdomain Display */}
            <div className="mb-8">
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="text-sm text-gray-400 mb-2">Your Website URL</div>
                            {loadingSubdomain ? (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Loading...</span>
                                </div>
                            ) : (
                                <div className="text-xl font-mono text-white break-all">
                                    https://{subdomain}
                                </div>
                            )}
                        </div>
                        {!loadingSubdomain && subdomain && (
                            <a
                                href={`https://${subdomain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-4 p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                <ExternalLink className="w-5 h-5" />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Optional Features */}
            <div className="space-y-4 mb-8">
                <h3 className="text-lg font-semibold text-white">Optional: Enhance Your Site</h3>

                {/* Custom Domain */}
                <button
                    type="button"
                    onClick={() => setShowDomainModal(true)}
                    className="w-full p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700 hover:border-gray-600 rounded-lg text-left transition-colors group"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600/30 transition-colors">
                            <Globe className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-white mb-1">Connect Custom Domain</div>
                            <div className="text-sm text-gray-400">
                                Use your own domain (e.g., www.yourrestaurant.com)
                            </div>
                        </div>
                        <div className="text-gray-500 group-hover:text-gray-400">
                            →
                        </div>
                    </div>
                </button>

                {/* Social Media - Coming Soon */}
                <div className="w-full p-4 bg-gray-800/20 border border-gray-700/50 rounded-lg opacity-60">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-gray-400 mb-1">Connect Social Media</div>
                            <div className="text-sm text-gray-500">
                                Coming soon - Connect Facebook & Instagram
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* What's Next */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-8">
                <h4 className="font-semibold text-blue-200 mb-3">What's Next?</h4>
                <ul className="space-y-2 text-sm text-blue-100">
                    <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Add more menu items and customize your offerings</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Upload photos to your gallery</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Create events and promotions</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Configure online ordering and reservations</span>
                    </li>
                </ul>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={onComplete}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Finishing...
                        </>
                    ) : (
                        <>
                            <Check className="w-5 h-5" />
                            Go to Dashboard
                        </>
                    )}
                </button>
            </div>

            {/* Domain Modal Placeholder */}
            {showDomainModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4">Custom Domain</h3>
                        <p className="text-gray-400 mb-6">
                            Custom domain setup will be available in your admin dashboard after completing onboarding.
                        </p>
                        <button
                            onClick={() => setShowDomainModal(false)}
                            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
