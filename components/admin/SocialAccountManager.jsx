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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className={`p-2 rounded-full ${connectPlatform === 'facebook' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-pink-100 dark:bg-pink-900/30'}`}>
                    {connectPlatform === 'facebook' ? <Facebook className="w-6 h-6 text-blue-600" /> : <Instagram className="w-6 h-6 text-pink-600" />}
                  </div>
                  Connect {connectPlatform === 'facebook' ? 'Facebook' : 'Instagram'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    To connect your {connectPlatform === 'facebook' ? 'Facebook Page' : 'Instagram Business Account'}, you need to:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-200 font-medium">
                    <li>Log in to Facebook</li>
                    <li>Grant permission to "App" to access your pages</li>
                    {connectPlatform === 'instagram' && <li>Ensure your Instagram account is linked to a Facebook Page</li>}
                    <li>Select the pages you want to connect</li>
                  </ol>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                    <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                  </div>
                )}

                <button
                  onClick={async () => {
                    setIsConnecting(true);
                    setError('');

                    // Open popup immediately to avoid blocker
                    const width = 600;
                    const height = 700;
                    const left = window.screen.width / 2 - width / 2;
                    const top = window.screen.height / 2 - height / 2;
                    const popup = window.open(
                      '',
                      'ConnectSocial',
                      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
                    );

                    if (!popup) {
                      setError('Popup blocked. Please allow popups for this site.');
                      setIsConnecting(false);
                      return;
                    }

                    popup.document.write('<div style="font-family: sans-serif; padding: 20px; text-align: center;">Loading Facebook Login...</div>');

                    try {
                      const res = await fetch('/api/admin/social-posting/auth-url');
                      const data = await res.json();
                      if (data.url) {
                        popup.location.href = data.url;

                        // Poll to see if popup is closed
                        const timer = setInterval(() => {
                          if (popup.closed) {
                            clearInterval(timer);
                            setIsConnecting(false);
                            // Trigger a refresh of the accounts list
                            if (onAccountConnected) onAccountConnected();
                            // Close modal
                            handleCloseModal();
                          }
                        }, 1000);
                      } else {
                        popup.close();
                        throw new Error(data.error || 'Failed to get auth URL');
                        setIsConnecting(false);
                      }
                    } catch (e) {
                      popup.close();
                      setError(e.message);
                      setIsConnecting(false);
                    }
                  }}
                  disabled={isConnecting}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all ${connectPlatform === 'facebook'
                    ? 'bg-[#1877F2] hover:bg-[#166fe5]'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                    } disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg`}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Redirecting to Facebook...
                    </>
                  ) : (
                    <>
                      {connectPlatform === 'facebook' ? <Facebook className="w-5 h-5" /> : <Instagram className="w-5 h-5" />}
                      Continue with Facebook
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  You will be redirected to Facebook to complete the connection securely.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
