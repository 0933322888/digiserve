'use client'

import { useState, useEffect } from 'react'
import { Plus, RefreshCw, CheckCircle, XCircle, X, AlertCircle, Info, Loader2, ExternalLink, ChevronDown, ChevronUp, Trash2, Facebook, Instagram } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SocialAccountManager({
  accounts,
  barId,
  onAccountConnected,
  onTokenRefreshed,
  onAccountDeleted,
  // New props for external modal control
  isConnectModalOpen,
  connectPlatform,
  onCloseConnectModal,
}) {
  // Internal form state
  const [accessToken, setAccessToken] = useState('')
  const [pageId, setPageId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [refreshingAccountId, setRefreshingAccountId] = useState(null)
  const [refreshingError, setRefreshingError] = useState('')
  const [refreshingSuccess, setRefreshingSuccess] = useState('')
  const [showInstructions, setShowInstructions] = useState(true)
  const [deletingAccountId, setDeletingAccountId] = useState(null)
  const [deleteConfirmAccountId, setDeleteConfirmAccountId] = useState(null)

  // Reset form when modal opens
  useEffect(() => {
    if (isConnectModalOpen) {
      setAccessToken('')
      setPageId('')
      setError('')
      setSuccess('')
      setShowInstructions(true)
    }
  }, [isConnectModalOpen])

  const handleCloseModal = () => {
    if (onCloseConnectModal) {
      onCloseConnectModal()
    }
    // Reset internal state
    setAccessToken('')
    setPageId('')
    setError('')
    setSuccess('')
    setIsConnecting(false)
  }

  const handleConnectAccount = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!accessToken.trim() || !pageId.trim()) {
      setError('Please provide both Access Token and Page ID')
      return
    }

    setIsConnecting(true)

    try {
      const response = await fetch('/api/admin/social-posting/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barId,
          adminId: 'admin_1', // In production, get from auth
          barId,
          adminId: 'admin_1', // In production, get from auth
          platform: connectPlatform,
          accessToken: accessToken.trim(),
          pageId: pageId.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(`Successfully connected ${connectPlatform === 'facebook' ? 'Facebook Page' : 'Instagram'} account!`)
        if (onAccountConnected) {
          setTimeout(() => {
            onAccountConnected()
            handleCloseModal()
          }, 1500)
        } else {
          setTimeout(handleCloseModal, 2000)
        }
      } else {
        setError(data.error || 'Failed to connect account. Please check your credentials and try again.')
      }
    } catch (error) {
      console.error('Connect account error:', error)
      setError(`Failed to connect account: ${error.message || 'Network error. Please try again.'}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleRefreshToken = async accountId => {
    setRefreshingAccountId(accountId)
    setRefreshingError('')
    setRefreshingSuccess('')

    try {
      const response = await fetch('/api/admin/social-posting/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          barId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Facebook token refreshed successfully!')
        if (onTokenRefreshed) {
          setTimeout(() => {
            onTokenRefreshed()
          }, 500)
        }
      } else {
        toast.error(data.error || 'Failed to refresh token')
      }
    } catch (error) {
      console.error('Refresh token error:', error)
      toast.error(`Failed to refresh token: ${error.message || 'Network error'}`)
    } finally {
      setRefreshingAccountId(null)
    }
  }

  const handleDeleteAccount = async accountId => {
    if (deleteConfirmAccountId !== accountId) {
      // First click - show confirmation
      setDeleteConfirmAccountId(accountId)
      return
    }

    // Second click - confirm deletion
    setDeletingAccountId(accountId)
    setDeleteConfirmAccountId(null)

    try {
      const response = await fetch(
        `/api/admin/social-posting/accounts?accountId=${accountId}&barId=${barId}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (data.success) {
        toast.success('Account deleted successfully')
        if (onAccountDeleted) {
          onAccountDeleted()
        }
      } else {
        const errorMsg = data.error || 'Failed to delete account'
        toast.error(errorMsg)
        setRefreshingError(errorMsg)
        setTimeout(() => setRefreshingError(''), 5000)
      }
    } catch (error) {
      console.error('Delete account error:', error)
      setRefreshingError(`Failed to delete account: ${error.message || 'Network error'}`)
      setTimeout(() => setRefreshingError(''), 5000)
    } finally {
      setDeletingAccountId(null)
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Connected Accounts</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your connected social media accounts
          </p>
        </div>

        <div className="space-y-3">
          {accounts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No accounts connected. Connect a Facebook Page or Instagram Business Account to get
              started.
            </p>
          ) : (
            accounts.map(account => (
              <div
                key={account.accountId}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${account.platform === 'facebook'
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : 'bg-pink-100 dark:bg-pink-900'
                      }`}
                  >
                    {account.platform === 'facebook' ? '📘' : '📷'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {account.platform === 'facebook' ? 'Facebook Page' : 'Instagram Business'}
                      {account.username && ` • @${account.username}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {account.isActive ? (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                      <XCircle className="w-4 h-4" />
                      Inactive
                    </span>
                  )}
                  <button
                    onClick={() => handleRefreshToken(account.accountId)}
                    disabled={refreshingAccountId === account.accountId || deletingAccountId === account.accountId}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 transition-colors"
                    title="Refresh token"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${refreshingAccountId === account.accountId ? 'animate-spin' : ''}`}
                    />
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(account.accountId)}
                    disabled={deletingAccountId === account.accountId || refreshingAccountId === account.accountId}
                    className={`p-2 rounded transition-colors ${deleteConfirmAccountId === account.accountId
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                      } disabled:opacity-50`}
                    title={deleteConfirmAccountId === account.accountId ? 'Click again to confirm deletion' : 'Delete account'}
                  >
                    {deletingAccountId === account.accountId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Connect Account Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  {connectPlatform === 'facebook' ? (
                    <>
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <Facebook className="w-6 h-6 text-blue-600" />
                      </div>
                      Connect Facebook Page
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-full">
                        <Instagram className="w-6 h-6 text-pink-600" />
                      </div>
                      Connect Instagram Account
                    </>
                  )}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Instructions Header - Always Visible */}
              <button
                type="button"
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-full flex items-center justify-between p-4 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <p className="font-semibold text-blue-900 dark:text-blue-200 text-base">
                    {connectPlatform === 'instagram' 
                      ? 'Step-by-Step Guide to Connect Instagram (via Facebook Page)'
                      : 'Step-by-Step Guide to Get Your Facebook Credentials'}
                  </p>
                </div>
                {showInstructions ? (
                  <ChevronUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
              </button>

              {/* Instructions Content - Collapsible */}
              {showInstructions && (
                <div className="px-4 pb-4 space-y-4 border-t border-blue-200 dark:border-blue-700">
                  <div className="pt-4 text-sm text-blue-800 dark:text-blue-300">
                    {connectPlatform === 'instagram' && (
                      <div className="mb-4 p-3 bg-pink-50 dark:bg-pink-900/20 rounded border border-pink-200 dark:border-pink-800">
                        <p className="text-sm text-pink-800 dark:text-pink-200 font-medium mb-2">
                          📷 Instagram Business Account Requirements:
                        </p>
                        <ul className="ml-4 space-y-1 text-xs text-pink-700 dark:text-pink-300 list-disc">
                          <li>Your Instagram account must be a <strong>Business Account</strong> (not a personal account)</li>
                          <li>Your Instagram Business Account must be <strong>linked to a Facebook Page</strong></li>
                          <li>You need the <strong>Facebook Page ID</strong> and <strong>Page Access Token</strong> (not Instagram credentials)</li>
                          <li>To link Instagram to Facebook: Instagram App → Settings → Account → Switch to Professional Account → Connect to Facebook Page</li>
                        </ul>
                      </div>
                    )}

                    {/* Step 1: Get Page ID */}
                    <div className="mb-4 space-y-2">
                      <p className="font-medium text-blue-900 dark:text-blue-200">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold mr-2">1</span>
                        {connectPlatform === 'instagram' 
                          ? 'Get Your Facebook Page ID (Linked to Instagram)'
                          : 'Get Your Facebook Page ID'}
                      </p>
                      <ol className="ml-8 space-y-1.5 text-blue-700 dark:text-blue-400">
                        <li className="flex items-start gap-2">
                          <span className="font-medium">a.</span>
                          <span>
                            {connectPlatform === 'instagram' 
                              ? 'Go to the Facebook Page that is linked to your Instagram Business Account (you must be an admin)'
                              : 'Go to your Facebook Page (you must be an admin)'}
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">b.</span>
                          <span>Click on <strong>"Settings"</strong> in the left sidebar</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">c.</span>
                          <span>Scroll down to <strong>"Page Info"</strong> section</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">d.</span>
                          <span>Scroll to the bottom and find <strong>"Facebook Page ID"</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">e.</span>
                          <span>Copy the ID (it looks like: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">123456789012345</code>)</span>
                        </li>
                        <li className="flex items-start gap-2 mt-2">
                          <span className="font-medium">Alternative:</span>
                          <span>Or visit <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">facebook.com/your-page-name/about</code> - the Page ID is in the URL</span>
                        </li>
                      </ol>
                    </div>

                    {/* Step 2: Create Facebook App (if needed) */}
                    <div className="mb-4 space-y-2">
                      <p className="font-medium text-blue-900 dark:text-blue-200">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold mr-2">2a</span>
                        Create a Facebook App (If You Don't Have One)
                      </p>
                      <ol className="ml-8 space-y-1.5 text-blue-700 dark:text-blue-400">
                        <li className="flex items-start gap-2">
                          <span className="font-medium">a.</span>
                          <span>Go to{' '}
                            <a
                              href="https://developers.facebook.com/apps/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-blue-900 dark:hover:text-blue-200 inline-flex items-center gap-1 font-medium"
                            >
                              Facebook Developers - My Apps
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">b.</span>
                          <span>Click the <strong>"Create App"</strong> button (or "Add a New App" if you have existing apps)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">c.</span>
                          <span>Select <strong>"Business"</strong> as the app type and click <strong>"Next"</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">d.</span>
                          <span>On the <strong>"What do you want your app to do?"</strong> screen (Step 2), you'll see a list of use cases with checkboxes. Look for and check the following option:
                            <div className="ml-4 mt-2 p-3 bg-white dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                              <div className="flex items-start gap-2">
                                <span className="text-green-600 dark:text-green-400 font-bold text-lg">✓</span>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">🚩</span>
                                    <strong className="text-blue-900 dark:text-blue-100 text-base">Manage everything on your Page</strong>
                                  </div>
                                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                    <strong>Description:</strong> "Publish content and videos, moderate posts and comments from followers on your Page and get insights on engagement."
                                  </p>
                                  <p className="text-xs text-green-700 dark:text-green-300 mt-1 font-medium">✓ Check this box - This is the main use case you need for Facebook Page management</p>
                                </div>
                              </div>
                            </div>
                            {connectPlatform === 'facebook' && (
                              <div className="ml-4 mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                  <strong>Note about Instagram:</strong> If you also want to connect Instagram, there isn't a separate use case checkbox for it. You'll need to add Instagram integration later in your app settings after the app is created. For now, just select "Manage everything on your Page".
                                </p>
                              </div>
                            )}
                            {connectPlatform === 'instagram' && (
                              <div className="ml-4 mt-2 p-2 bg-pink-50 dark:bg-pink-900/20 rounded border border-pink-200 dark:border-pink-800">
                                <p className="text-xs text-pink-800 dark:text-pink-200">
                                  <strong>📷 For Instagram:</strong> Make sure your Facebook Page is linked to an Instagram Business Account. The same app and permissions work for both Facebook and Instagram posting.
                                </p>
                              </div>
                            )}
                            <p className="ml-4 mt-2 text-sm font-medium text-blue-800 dark:text-blue-200">After checking the box for "Manage everything on your Page", click <strong>"Next"</strong> to continue.</p>
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">e.</span>
                          <span>Fill in the app details:
                            <ul className="ml-4 mt-1 space-y-0.5 list-disc">
                              <li><strong>App Name:</strong> Enter a name (e.g., "My Restaurant Social Media")</li>
                              <li><strong>App Contact Email:</strong> Enter your email address</li>
                              <li><strong>Business Account:</strong> Select or create a business account (optional, but recommended)</li>
                            </ul>
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">f.</span>
                          <span>Click <strong>"Create App"</strong> to finish</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">g.</span>
                          <span>Complete any security checks (CAPTCHA, email verification) if prompted</span>
                        </li>
                        <li className="flex items-start gap-2 mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                          <span className="font-medium text-green-800 dark:text-green-200">✓ Note:</span>
                          <span className="text-green-700 dark:text-green-300">You only need to create the app once. After that, you can skip to Step 2b.</span>
                        </li>
                      </ol>
                    </div>

                    {/* Note about permissions */}
                    <div className="mb-4 space-y-2">
                      <div className="ml-8 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-800 dark:text-green-300">
                          <strong>✓ Good to know:</strong> By selecting <strong>"Manage everything on your Page"</strong> use case, Facebook automatically adds all necessary permissions (like <code className="bg-green-100 dark:bg-green-900 px-1 rounded text-xs">pages_read_engagement</code>, <code className="bg-green-100 dark:bg-green-900 px-1 rounded text-xs">pages_manage_posts</code>, etc.) to your app. These permissions will be available when you generate your access token.
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-2">
                          If you need additional permissions later, you can add them via your app's <strong>Use Case</strong> page or through <strong>App Review → Permissions and Features</strong>.
                        </p>
                      </div>
                    </div>

                    {/* Step 2b: Get Access Token */}
                    <div className="mb-4 space-y-2">
                      <p className="font-medium text-blue-900 dark:text-blue-200">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold mr-2">2b</span>
                        Get Your Page Access Token
                      </p>
                      <ol className="ml-8 space-y-1.5 text-blue-700 dark:text-blue-400">
                        <li className="flex items-start gap-2">
                          <span className="font-medium">a.</span>
                          <span>Go to{' '}
                            <a
                              href="https://developers.facebook.com/tools/explorer/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-blue-900 dark:hover:text-blue-200 inline-flex items-center gap-1 font-medium"
                            >
                              Facebook Graph API Explorer
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            {' '}(make sure you're logged into Facebook)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">b.</span>
                          <span>If you see <strong>"Create an app to get started"</strong> message, you need to create a Facebook App first. Go back to <strong>Step 2a</strong> above and complete the app creation, then return here.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">c.</span>
                          <span>At the top of the Graph Explorer, select your app from the dropdown menu (if you just created one, it should appear there)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">d.</span>
                          <span>Next to the <strong>"User or Page"</strong> dropdown (next to the token field), click <strong>"Get Token"</strong> → <strong>"Get User Access Token"</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">e.</span>
                          <span>In the permissions popup, you may only see a few permissions like:
                            <ul className="ml-4 mt-1 space-y-0.5 list-disc">
                              <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-xs">pages_show_list</code> - To see your pages</li>
                              <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-xs">business_management</code> - To manage business assets</li>
                            </ul>
                            <p className="ml-4 mt-2 text-sm">Check <strong>all available permissions</strong> shown in the popup. You should see permissions like:</p>
                            <ul className="ml-8 mt-1 space-y-0.5 list-disc text-sm">
                              <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-xs">pages_show_list</code> - To see your pages</li>
                              <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-xs">pages_read_engagement</code> - To read engagement data</li>
                              <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-xs">pages_manage_posts</code> - To create and manage posts</li>
                              <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-xs">pages_read_user_content</code> - To read page content</li>
                              <li>And potentially others...</li>
                            </ul>
                            <div className="ml-4 mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                              <p className="text-xs text-blue-800 dark:text-blue-200">
                                <strong>Note:</strong> The permissions available depend on the use case you selected. By selecting "Manage everything on your Page", all necessary page management permissions should be available. If you need additional permissions, you can add them later via your app's <strong>Use Case</strong> page or <strong>App Review → Permissions and Features</strong>.
                              </p>
                            </div>
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">f.</span>
                          <span>Click <strong>"Generate Access Token"</strong> and approve the permissions in the popup window</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">g.</span>
                          <span>After the token appears in the field, click the <strong>"User or Page"</strong> dropdown (next to the token) and select <strong>your Facebook Page name</strong> from the list</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">h.</span>
                          <span>The token in the field will automatically change - this is now your <strong>Page Access Token</strong> (different from the user token you generated earlier)</span>
                          <div className="ml-4 mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                            <p className="text-xs text-green-800 dark:text-green-200">
                              <strong>✓ Important:</strong> This Page Access Token includes all necessary permissions for managing your page (publishing posts, reading content, managing comments, etc.), even if you only saw <code className="bg-green-100 dark:bg-green-900 px-1 rounded text-xs">pages_show_list</code> and <code className="bg-green-100 dark:bg-green-900 px-1 rounded text-xs">business_management</code> in the user token permissions. Facebook automatically grants full page permissions when you select a page.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">i.</span>
                          <span>Click the <strong>"Copy"</strong> button (📋 icon) next to the token field to copy your Page Access Token</span>
                        </li>
                        <li className="flex items-start gap-2 mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                          <span className="font-medium text-yellow-800 dark:text-yellow-200">⚠️ Important:</span>
                          <span className="text-yellow-700 dark:text-yellow-300">This token expires in about 60 days. Make sure to select your Page from the dropdown (step f) to get a Page Access Token, not just a User Access Token.</span>
                        </li>
                      </ol>
                    </div>

                    {/* Step 3: Paste and Connect */}
                    <div className="space-y-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                      <p className="font-medium text-blue-900 dark:text-blue-200">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold mr-2">3</span>
                        Paste Your Credentials Below
                      </p>
                      <p className="ml-8 text-blue-700 dark:text-blue-400">
                        {connectPlatform === 'instagram' 
                          ? 'Paste the Facebook Page Access Token and Facebook Page ID (for the page linked to your Instagram) into the fields below, then click "Connect". The system will automatically detect and connect your Instagram Business Account.'
                          : 'Paste the Page Access Token and Page ID you copied into the fields below, then click "Connect".'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

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

              <form onSubmit={handleConnectAccount} className="space-y-4">
                {/* Access Token Field */}
                <div>
                  <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Access Token *
                  </label>
                  <input
                    type="text"
                    id="accessToken"
                    value={accessToken}
                    onChange={e => setAccessToken(e.target.value)}
                    placeholder="Paste your Page Access Token from Step 2"
                    disabled={isConnecting}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Paste the Page Access Token you generated in Step 2 above
                  </p>
                </div>

                {/* Page ID Field */}
                <div>
                  <label htmlFor="pageId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {connectPlatform === 'facebook' ? 'Facebook Page ID' : 'Facebook Page ID'} *
                  </label>
                  <input
                    type="text"
                    id="pageId"
                    value={pageId}
                    onChange={e => setPageId(e.target.value)}
                    placeholder="Paste your Facebook Page ID from Step 1"
                    disabled={isConnecting}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Paste the Page ID you found in Step 1 above (e.g., 123456789012345)
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isConnecting}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isConnecting || !accessToken.trim() || !pageId.trim()}
                    className="flex-1 px-4 py-2 bg-primary dark:bg-gold text-white rounded-md hover:bg-primary/90 dark:hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
