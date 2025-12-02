'use client'

import { useState, useEffect } from 'react'
import { Save, ChevronDown, ChevronUp, Info, CheckCircle, AlertCircle, Loader2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SocialMediaConfig({ onConnectAccount }) {
    const [appId, setAppId] = useState('')
    const [appSecret, setAppSecret] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [showInstructions, setShowInstructions] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        fetchCredentials()
    }, [])

    const fetchCredentials = async () => {
        try {
            const response = await fetch('/api/admin/social-posting/settings?key=FACEBOOK_APP_ID')
            const data = await response.json()

            if (data.success && data.value) {
                setAppId(data.value)
            }

            // Fetch app secret (will be masked)
            const secretResponse = await fetch('/api/admin/social-posting/settings?key=FACEBOOK_APP_SECRET')
            const secretData = await secretResponse.json()

            if (secretData.success && secretData.value && secretData.value !== '***') {
                setAppSecret(secretData.value)
            } else if (secretData.value === '***') {
                setAppSecret('***') // Show masked value
            }
        } catch (error) {
            console.error('Failed to fetch credentials:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!appId.trim() || !appSecret.trim()) {
            setError('Both Facebook App ID and App Secret are required')
            return
        }

        // Don't save if the secret is still masked
        if (appSecret === '***') {
            setError('Please enter a new App Secret or leave unchanged')
            return
        }

        setSaving(true)

        try {
            const response = await fetch('/api/admin/social-posting/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    facebookAppId: appId.trim(),
                    facebookAppSecret: appSecret.trim(),
                    updatedBy: 'admin', // In production, get from auth
                }),
            })

            const data = await response.json()

            if (data.success) {
                setSuccess('Facebook credentials saved successfully!')
                toast.success('Facebook credentials saved!')
                // Mask the secret after saving
                setAppSecret('***')
                setTimeout(() => setSuccess(''), 3000)
            } else {
                setError(data.error || 'Failed to save credentials')
                toast.error('Failed to save credentials')
            }
        } catch (error) {
            console.error('Save credentials error:', error)
            setError(`Failed to save credentials: ${error.message || 'Network error'}`)
            toast.error('Failed to save credentials')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header - Always Visible */}
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white text-left">
                            Social Media Configuration
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 text-left">
                            Configure app credentials and connect accounts
                        </p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
            </button>

            {/* Expandable Content */}
            {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-6">
                    {/* Connect Accounts Section */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            Connect Accounts
                        </h4>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onConnectAccount('facebook')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Connect Facebook
                            </button>
                            <button
                                onClick={() => onConnectAccount('instagram')}
                                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 flex items-center gap-2 transition-colors text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Connect Instagram
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-gray-700"></div>

                    {/* Facebook App Credentials */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            Facebook App Credentials
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Required for token refresh and analytics features
                        </p>

                        {loading ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading configuration...</span>
                            </div>
                        ) : (
                            <form onSubmit={handleSave} className="space-y-4">
                                {/* Instructions */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setShowInstructions(!showInstructions)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                            <p className="font-semibold text-blue-900 dark:text-blue-200 text-sm">
                                                How to get your Facebook App credentials
                                            </p>
                                        </div>
                                        {showInstructions ? (
                                            <ChevronUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        )}
                                    </button>

                                    {showInstructions && (
                                        <div className="px-4 pb-4 space-y-3 border-t border-blue-200 dark:border-blue-700">
                                            <div className="pt-4 text-sm text-blue-800 dark:text-blue-300 space-y-3">
                                                <div>
                                                    <p className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                                                        1. Go to Facebook Developers
                                                    </p>
                                                    <p className="ml-4">
                                                        Visit{' '}
                                                        <a
                                                            href="https://developers.facebook.com/apps/"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="underline hover:text-blue-900 dark:hover:text-blue-200 font-medium"
                                                        >
                                                            Facebook Developers - My Apps
                                                        </a>
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                                                        2. Select or Create Your App
                                                    </p>
                                                    <p className="ml-4">
                                                        If you don't have an app yet, click "Create App" and select "Business" type.
                                                        Make sure to add the "Manage everything on your Page" use case.
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                                                        3. Get Your Credentials
                                                    </p>
                                                    <ul className="ml-4 space-y-1 list-disc list-inside">
                                                        <li>Go to your app's Dashboard or Settings → Basic</li>
                                                        <li>Copy the <strong>App ID</strong></li>
                                                        <li>Click "Show" next to <strong>App Secret</strong> and copy it</li>
                                                    </ul>
                                                </div>

                                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                                                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                                        <strong>⚠️ Security Note:</strong> Keep your App Secret confidential. Never share it publicly or commit it to version control.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                                    </div>
                                )}

                                {/* Success Message */}
                                {success && (
                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-green-800 dark:text-green-300">{success}</p>
                                    </div>
                                )}

                                {/* App ID Field */}
                                <div>
                                    <label htmlFor="appId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Facebook App ID *
                                    </label>
                                    <input
                                        type="text"
                                        id="appId"
                                        value={appId}
                                        onChange={(e) => setAppId(e.target.value)}
                                        placeholder="Enter your Facebook App ID"
                                        disabled={saving}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                                    />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Found in your Facebook App Dashboard
                                    </p>
                                </div>

                                {/* App Secret Field */}
                                <div>
                                    <label htmlFor="appSecret" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Facebook App Secret *
                                    </label>
                                    <input
                                        type="password"
                                        id="appSecret"
                                        value={appSecret}
                                        onChange={(e) => setAppSecret(e.target.value)}
                                        placeholder={appSecret === '***' ? 'Already configured (enter new value to update)' : 'Enter your Facebook App Secret'}
                                        disabled={saving}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                                    />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Found in your Facebook App Settings → Basic (click "Show" to reveal)
                                    </p>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={saving || !appId.trim() || !appSecret.trim() || appSecret === '***'}
                                        className="px-4 py-2 bg-primary dark:bg-gold text-white rounded-md hover:bg-primary/90 dark:hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors text-sm"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Save Credentials
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
