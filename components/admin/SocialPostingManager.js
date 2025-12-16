'use client'

import { useState, useEffect } from 'react'
import SocialPostForm from '@/components/admin/SocialPostForm'
import SocialPostList from '@/components/admin/SocialPostList'
import CampaignForm from '@/components/admin/CampaignForm'
import CampaignList from '@/components/admin/CampaignList'
import SocialAnalytics from '@/components/admin/SocialAnalytics'
import { Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SocialPostingManager({ barId, adminId, adminName }) {
    const [accounts, setAccounts] = useState([])
    const [posts, setPosts] = useState([])
    const [campaigns, setCampaigns] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('posts') // 'posts' or 'campaigns'
    const [moduleEnabled, setModuleEnabled] = useState(true)

    useEffect(() => {
        // Check if module is enabled via settings API
        const checkModuleEnabled = async () => {
            try {
                const response = await fetch('/api/admin/settings/modules')
                const data = await response.json()
                if (data.success && data.modules) {
                    const socialModule = data.modules.find(m => m.key === 'socialPosting')
                    if (socialModule) {
                        setModuleEnabled(socialModule.enabled)
                    }
                }
            } catch (error) {
                console.error('Module check error:', error)
            }
        }
        checkModuleEnabled()
    }, [])

    const fetchAccounts = async () => {
        try {
            const response = await fetch(
                `/api/admin/social-posting/accounts?barId=${barId}&adminId=${adminId}`
            )
            const data = await response.json()
            if (data.accounts) {
                setAccounts(data.accounts)
            }
        } catch (error) {
            console.error('Failed to fetch accounts:', error)
        }
    }

    const fetchPosts = async () => {
        try {
            const response = await fetch(`/api/admin/social-posting/posts?barId=${barId}`)
            const data = await response.json()
            if (data.posts) {
                setPosts(data.posts)
            }
        } catch (error) {
            console.error('Failed to fetch posts:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchCampaigns = async () => {
        try {
            const response = await fetch(`/api/admin/social-posting/campaigns?barId=${barId}`)
            const data = await response.json()
            if (data.campaigns) {
                setCampaigns(data.campaigns)
            }
        } catch (error) {
            console.error('Failed to fetch campaigns:', error)
        }
    }

    useEffect(() => {
        if (!moduleEnabled || !barId) {
            if (!barId) setLoading(true) // Keep loading if waiting for session
            else setLoading(false)
            return
        }

        fetchAccounts()
        fetchPosts()
        fetchCampaigns()
    }, [moduleEnabled, barId, adminId])

    const handlePostCreated = () => {
        fetchPosts()
    }

    const handlePostUpdated = () => {
        fetchPosts()
    }

    const handlePostDeleted = () => {
        fetchPosts()
    }

    const handleCampaignCreated = () => {
        fetchCampaigns()
    }

    const handleCampaignUpdated = () => {
        fetchCampaigns()
        fetchPosts() // Refresh posts in case new ones were generated
    }

    const handleCampaignDeleted = () => {
        fetchCampaigns()
    }

    const processScheduledPosts = async (showToast = true) => {
        try {
            const response = await fetch('/api/admin/social-posting/process-scheduled', {
                method: 'POST',
            })
            const data = await response.json()

            if (data.success) {
                if (data.processed > 0 && showToast) {
                    toast.success(
                        `Processed ${data.processed} scheduled post(s). ${data.published} published, ${data.failed} failed.`
                    )
                    fetchPosts() // Refresh the posts list
                } else if (data.processed > 0) {
                    // Silent refresh if no toast requested
                    fetchPosts()
                } else if (showToast) {
                    toast.info('No scheduled posts to process')
                }
            } else if (showToast) {
                toast.error('Failed to process scheduled posts: ' + (data.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Process scheduled posts error:', error)
            if (showToast) {
                toast.error('Failed to process scheduled posts: ' + error.message)
            }
        }
    }

    // Auto-process scheduled posts every minute when page is open
    useEffect(() => {
        if (!moduleEnabled) return

        // Process immediately on mount (silently)
        processScheduledPosts(false)

        // Then process every minute (silently to avoid spam)
        const interval = setInterval(() => {
            processScheduledPosts(false)
        }, 60000) // 60 seconds

        return () => clearInterval(interval)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moduleEnabled])

    // Check if module is enabled - AFTER all hooks
    if (!moduleEnabled) {
        return (
            <div className="space-y-8">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-yellow-800 dark:text-yellow-200">
                        Social Media Posting module is disabled. Enable it in{' '}
                        <a href="/admin/settings" className="font-medium underline hover:text-yellow-900 dark:hover:text-yellow-100">
                            Settings &gt; Integrations
                        </a>
                        .
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Social Media Posting</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Create, schedule, and manage social media posts for Facebook Pages and Instagram Business
                        Accounts.
                    </p>
                </div>
                <button
                    onClick={processScheduledPosts}
                    className="flex items-center gap-2 px-4 py-2 bg-primary dark:bg-gold text-white rounded-md hover:bg-primary-dark dark:hover:bg-gold/90 transition-colors"
                    title="Process scheduled posts now (also runs automatically every minute)"
                >
                    <Clock className="w-4 h-4" />
                    Process Scheduled
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'posts'
                            ? 'border-primary dark:border-gold text-primary dark:text-gold'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Single Posts
                    </button>
                    <button
                        onClick={() => setActiveTab('campaigns')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'campaigns'
                            ? 'border-primary dark:border-gold text-primary dark:text-gold'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Campaigns
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'analytics'
                            ? 'border-primary dark:border-gold text-primary dark:text-gold'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Analytics
                    </button>
                </nav>
            </div>

            {/* Posts Tab */}
            {activeTab === 'posts' && (
                <>
                    {/* Post Creation Form */}
                    <SocialPostForm
                        accounts={accounts}
                        barId={barId}
                        adminId={adminId}
                        adminName={adminName}
                        onPostCreated={handlePostCreated}
                    />

                    {/* Post History */}
                    {loading ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            Loading posts...
                        </div>
                    ) : (
                        <SocialPostList
                            posts={posts}
                            barId={barId}
                            onPostUpdated={handlePostUpdated}
                            onPostDeleted={handlePostDeleted}
                        />
                    )}
                </>
            )}

            {/* Campaigns Tab */}
            {activeTab === 'campaigns' && (
                <>
                    {/* Campaign Creation Form */}
                    <CampaignForm
                        accounts={accounts}
                        barId={barId}
                        adminId={adminId}
                        adminName={adminName}
                        onCampaignCreated={handleCampaignCreated}
                    />

                    {/* Campaigns List */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Active Campaigns
                        </h3>
                        <CampaignList
                            campaigns={campaigns}
                            barId={barId}
                            onCampaignUpdated={handleCampaignUpdated}
                            onCampaignDeleted={handleCampaignDeleted}
                        />
                    </div>
                </>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && <SocialAnalytics barId={barId} />}
        </div>
    )
}
