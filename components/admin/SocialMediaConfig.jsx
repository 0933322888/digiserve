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
                </div>
            )}
        </div>
    )
}
