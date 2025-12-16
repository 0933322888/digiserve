'use client'

import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Loader2, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import PageContentManager from '@/components/admin/PageContentManager'
import SocialMediaConfig from '@/components/admin/SocialMediaConfig'
import SocialAccountManager from '@/components/admin/SocialAccountManager'
import ColorSettings from '@/components/admin/ColorSettings'
import ModuleActivationModal from '@/components/admin/ModuleActivationModal'

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [modules, setModules] = useState([])
  const [orderingSettings, setOrderingSettings] = useState({
    enabled: true,
    pickup: true,
    delivery: true,
    dineIn: true,
  })
  const [orderingConfig, setOrderingConfig] = useState({
    businessHours: {
      Monday: { open: '16:00', close: '00:00' },
      Tuesday: { open: '16:00', close: '00:00' },
      Wednesday: { open: '16:00', close: '00:00' },
      Thursday: { open: '11:00', close: '23:00' },
      Friday: { open: '16:00', close: '02:00' },
      Saturday: { open: '16:00', close: '02:00' },
      Sunday: { open: '16:00', close: '00:00' },
    },
    taxRate: 0.13,
  })
  const [reservationsConfig, setReservationsConfig] = useState({
    maxSeatsPerSlot: 40,
    slotDurationMinutes: 120,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  const [tenantInfo, setTenantInfo] = useState(null)
  const [verifyingDomain, setVerifyingDomain] = useState(false)

  // Social Media State
  const [socialAccounts, setSocialAccounts] = useState([])
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [connectingPlatform, setConnectingPlatform] = useState(null)
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    twitter: ''
  })

  // Activation Modal State
  const [activationModalOpen, setActivationModalOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState(null)

  const paidModules = ['ordering', 'reservations', 'staff', 'socialPosting', 'loyalty', 'inventory', 'giftCards']
  const freeModules = ['events', 'gallery']

  const modulePrices = {
    ordering: '$29/mo',
    reservations: '$19/mo',
    staff: '$14/mo',
    socialPosting: '$19/mo',
    loyalty: '$24/mo',
    inventory: '$19/mo',
    giftCards: '$14/mo',
  }

  const handleModuleAction = async (module) => {
    // 1. If turning ON a Paid Module: Show Activation Modal
    if (paidModules.includes(module.key) && !module.enabled) {
      setSelectedModule(module)
      setActivationModalOpen(true)
      return
    }

    // 2. If turning OFF a Paid Module: Confirm & Cancel Subscription
    if (paidModules.includes(module.key) && module.enabled) {
      if (!confirm(`Are you sure you want to cancel your ${module.name} subscription? This looks like a big change.`)) return

      setSaving(prev => ({ ...prev, [module.key]: true }))
      try {
        const res = await fetch('/api/billing/subscription', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            addonKey: module.key
          })
        })
        const data = await res.json()

        if (data.success) {
          setModules(prev =>
            prev.map(m => (m.key === module.key ? { ...m, enabled: false } : m))
          )
          toast.success('Subscription canceled')
          window.dispatchEvent(new CustomEvent('module-settings-updated'))
        } else {
          throw new Error(data.error || 'Cancellation failed')
        }
      } catch (err) {
        console.error(err)
        toast.error('Failed to cancel subscription: ' + err.message)
      } finally {
        setSaving(prev => ({ ...prev, [module.key]: false }))
      }
      return
    }

    // 3. If Free Module: Just toggle
    toggleModule(module.key, !module.enabled)
  }

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'content', label: 'Content' },
    { id: 'modules', label: 'Modules' },

    { id: 'integrations', label: 'Integrations' },
  ]

  useEffect(() => {
    // Check for success param and session_id from Stripe return
    const params = new URLSearchParams(window.location.search)
    const success = params.get('success')
    const sessionId = params.get('session_id')
    const addonKey = params.get('addon')

    if (success && sessionId) {
      verifySession(sessionId, addonKey)
    } else {
      fetchModuleSettings()
    }

    fetchOrderingSettings()
    fetchOrderingConfig()
    fetchReservationsConfig()
    fetchTenantInfo()
    fetchSocialAccounts()
  }, [])

  const verifySession = async (sessionId, addonKey) => {
    const toastId = toast.loading('Verifying subscription...')
    try {
      const res = await fetch('/api/billing/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Subscription verified! Module enabled.', { id: toastId })
        // Clean URL
        const url = new URL(window.location.href)
        url.searchParams.delete('success')
        url.searchParams.delete('session_id')
        url.searchParams.delete('addon')
        window.history.replaceState({}, '', url)

        // Refresh modules
        fetchModuleSettings()
      } else {
        toast.error('Verification failed: ' + (data.error || 'Unknown error'), { id: toastId })
      }
    } catch (err) {
      console.error('Verify error', err)
      toast.error('Verification failed', { id: toastId })
      fetchModuleSettings()
    }
  }



  const fetchTenantInfo = async () => {
    try {
      const res = await fetch('/api/tenants/me')
      const data = await res.json()
      if (data.barId) { // Check for barId instead of success flag as /api/tenants/[id] returns object directly
        setTenantInfo(data)
        if (data.social) {
          setSocialLinks({
            facebook: data.social.facebook || '',
            instagram: data.social.instagram || '',
            twitter: data.social.twitter || ''
          })
        }
      }
    } catch (err) {
      console.error('Failed to fetch tenant info', err)
    }
  }

  const fetchSocialAccounts = async () => {
    // We need tenant info for barId, but currently fetchTenantInfo is async.
    // However, the component fetches tenant info on mount.
    // Ideally we should wait for tenantInfo, but the API endpoint for accounts takes barId from headers (in a real app) or query param?
    // Looking at the route: "const barId = request.headers.get('x-tenant-id')".
    // Client components don't easily send custom headers unless we use an interceptor or manual fetch wrapper.
    // But middleware sets the header based on domain/subdomain.
    // So just fetching '/api/admin/social-posting/accounts' should work if middleware logic applies.
    // Let's rely on middleware.
    try {
      const response = await fetch('/api/admin/social-posting/accounts')
      const data = await response.json()
      if (data.accounts) {
        setSocialAccounts(data.accounts)
      }
    } catch (error) {
      console.error('Failed to fetch social accounts:', error)
    }
  }

  const handleOpenConnectModal = (platform) => {
    setConnectingPlatform(platform)
    setShowConnectModal(true)
  }

  const handleAccountConnected = () => {
    fetchSocialAccounts()
  }

  const fetchModuleSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/modules')
      const data = await response.json()
      if (data.success) {
        setModules(data.modules || [])
      }
    } catch (error) {
      console.error('Failed to fetch module settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderingSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/ordering')
      const data = await response.json()
      if (data.success) {
        setOrderingSettings(data.ordering || {})
      }
    } catch (error) {
      console.error('Failed to fetch ordering settings:', error)
    }
  }

  const fetchOrderingConfig = async () => {
    try {
      const response = await fetch('/api/admin/settings/ordering-config')
      const data = await response.json()
      if (data.success) {
        setOrderingConfig({
          businessHours: data.businessHours || {},
          taxRate: data.taxRate || 0.13,
        })
      }
    } catch (error) {
      console.error('Failed to fetch ordering config:', error)
    }
  }

  const fetchReservationsConfig = async () => {
    try {
      const response = await fetch('/api/admin/settings/reservations-config')
      const data = await response.json()
      if (data.success) {
        setReservationsConfig({
          maxSeatsPerSlot: data.reservations?.maxSeatsPerSlot ?? 40,
          slotDurationMinutes: data.reservations?.slotDurationMinutes ?? 120,
        })
      }
    } catch (error) {
      console.error('Failed to fetch reservations config:', error)
    }
  }

  const updateBusinessHours = async (day, field, value) => {
    const updatedHours = {
      ...orderingConfig.businessHours,
      [day]: {
        ...orderingConfig.businessHours[day],
        [field]: value,
      },
    }

    setSaving(prev => ({ ...prev, [`businessHours_${day}`]: true }))
    try {
      const response = await fetch('/api/admin/settings/ordering-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessHours: updatedHours,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOrderingConfig(prev => ({
          ...prev,
          businessHours: updatedHours,
        }))
        toast.success('Business hours updated')
      } else {
        throw new Error(data.error || 'Failed to update business hours')
      }
    } catch (error) {
      console.error('Failed to update business hours:', error)
      toast.error('Failed to update business hours: ' + error.message)
    } finally {
      setSaving(prev => ({ ...prev, [`businessHours_${day}`]: false }))
    }
  }

  const updateTaxRate = async taxRate => {
    const taxRateNum = typeof taxRate === 'string' ? parseFloat(taxRate) : taxRate
    if (isNaN(taxRateNum) || taxRateNum < 0 || taxRateNum > 1) {
      toast.error('Tax rate must be between 0 and 1 (e.g., 0.13 for 13%)')
      return
    }

    setSaving(prev => ({ ...prev, taxRate: true }))
    try {
      const response = await fetch('/api/admin/settings/ordering-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxRate: taxRateNum,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOrderingConfig(prev => ({
          ...prev,
          taxRate: taxRateNum,
        }))
        toast.success(`Tax rate updated to ${(taxRateNum * 100).toFixed(1)}%`)
      } else {
        throw new Error(data.error || 'Failed to update tax rate')
      }
    } catch (error) {
      console.error('Failed to update tax rate:', error)
      toast.error('Failed to update tax rate: ' + error.message)
    } finally {
      setSaving(prev => ({ ...prev, taxRate: false }))
    }
  }

  const updateReservationsConfig = async updates => {
    const hasMaxSeats = updates.maxSeatsPerSlot !== undefined
    const hasSlotDuration = updates.slotDurationMinutes !== undefined

    if (!hasMaxSeats && !hasSlotDuration) return

    const savingKey = [
      hasMaxSeats ? 'maxSeatsPerSlot' : null,
      hasSlotDuration ? 'slotDurationMinutes' : null,
    ]
      .filter(Boolean)
      .join('_')

    setSaving(prev => ({ ...prev, [`reservations_${savingKey}`]: true }))

    try {
      const body = {}
      if (hasMaxSeats) body.maxSeatsPerSlot = updates.maxSeatsPerSlot
      if (hasSlotDuration) body.slotDurationMinutes = updates.slotDurationMinutes

      const response = await fetch('/api/admin/settings/reservations-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        setReservationsConfig(prev => ({
          ...prev,
          ...updates,
        }))
        toast.success('Reservations settings updated')
      } else {
        throw new Error(data.error || 'Failed to update reservations settings')
      }
    } catch (error) {
      console.error('Failed to update reservations settings:', error)
      toast.error('Failed to update reservations settings: ' + error.message)
    } finally {
      setSaving(prev => ({ ...prev, [`reservations_${savingKey}`]: false }))
    }
  }

  const toggleModule = async (moduleKey, enabled) => {
    setSaving(prev => ({ ...prev, [moduleKey]: true }))
    try {
      const response = await fetch('/api/admin/settings/modules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleKey,
          enabled,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setModules(prev =>
          prev.map(m => (m.key === moduleKey ? { ...m, enabled } : m))
        )
        toast.success(`${data.module.name} ${enabled ? 'enabled' : 'disabled'}`)
        window.dispatchEvent(new CustomEvent('module-settings-updated'))
      } else {
        throw new Error(data.error || 'Failed to update setting')
      }
    } catch (error) {
      console.error('Failed to toggle module:', error)
      toast.error('Failed to update setting: ' + error.message)
    } finally {
      setSaving(prev => ({ ...prev, [moduleKey]: false }))
    }
  }

  const verifyDomain = async () => {
    if (!tenantInfo || !tenantInfo.customDomains || tenantInfo.customDomains.length === 0) {
      toast.error('No custom domain configured')
      return
    }

    const domain = tenantInfo.customDomains[0]
    setVerifyingDomain(true)
    try {
      const res = await fetch('/api/domains/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: tenantInfo.barId, domain }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Domain verified')
        fetchTenantInfo()
      } else {
        toast.error(data.message || data.error || 'Verification failed')
      }
    } catch (err) {
      console.error('Domain verify error', err)
      toast.error('Failed to verify domain')
    } finally {
      setVerifyingDomain(false)
    }
  }

  const toggleOrderingOption = async (option, enabled) => {
    setSaving(prev => ({ ...prev, [`ordering_${option}`]: true }))
    try {
      const response = await fetch('/api/admin/settings/ordering', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [option]: enabled,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOrderingSettings(prev => ({
          ...prev,
          [option]: enabled,
        }))
        toast.success(`${option.charAt(0).toUpperCase() + option.slice(1)} ${enabled ? 'enabled' : 'disabled'}`)
      } else {
        throw new Error(data.error || 'Failed to update setting')
      }
    } catch (error) {
      console.error('Failed to toggle ordering option:', error)
      toast.error('Failed to update setting: ' + error.message)
    } finally {
      setSaving(prev => ({ ...prev, [`ordering_${option}`]: false }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary dark:text-gold" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary dark:text-gold" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage module configurations and feature toggles
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-primary text-primary dark:border-gold dark:text-gold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">

        {/* --- GENERAL TAB --- */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Domain Verification */}
            {tenantInfo && (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Custom Domain</div>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">{tenantInfo.customDomains && tenantInfo.customDomains.length ? tenantInfo.customDomains[0] : 'Not configured'}</div>
                    {tenantInfo.domainVerification && (
                      <div className="text-xs mt-1 text-gray-500">Verification: {tenantInfo.domainVerification.verified ? 'Verified' : 'Pending'}</div>
                    )}
                  </div>
                  <div>
                    <button onClick={verifyDomain} disabled={verifyingDomain || !(tenantInfo.customDomains && tenantInfo.customDomains.length)} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded disabled:opacity-50 transition-colors">
                      {verifyingDomain ? 'Verifying...' : 'Verify Domain'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Business Hours */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Social Media Links</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Configure links for the "Follow Us" section in the footer.
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      id="facebook"
                      value={socialLinks.facebook}
                      onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                      placeholder="https://facebook.com/..."
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-3 py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      id="instagram"
                      value={socialLinks.instagram}
                      onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                      placeholder="https://instagram.com/..."
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-3 py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      X (Twitter) URL
                    </label>
                    <input
                      type="url"
                      id="twitter"
                      value={socialLinks.twitter}
                      onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                      placeholder="https://x.com/..."
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-3 py-2"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={async () => {
                      setSaving({ ...saving, socialLinks: true })
                      try {
                        const res = await fetch('/api/admin/settings/social-links', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(socialLinks)
                        })
                        const data = await res.json()
                        if (data.success) {
                          toast.success('Social links updated')
                        } else {
                          throw new Error(data.error)
                        }
                      } catch (err) {
                        console.error(err)
                        toast.error('Failed to update social links')
                      } finally {
                        setSaving({ ...saving, socialLinks: false })
                      }
                    }}
                    disabled={saving.socialLinks}
                    className="inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                  >
                    {saving.socialLinks ? 'Saving...' : 'Save Links'}
                  </button>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Business Hours</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Set the opening and closing times for each day (24-hour format).
                </p>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  {[
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday',
                  ].map(day => {
                    const hours =
                      orderingConfig.businessHours[day] || {
                        open: '',
                        close: '',
                      }
                    const isSaving = saving[`businessHours_${day}`]

                    return (
                      <div
                        key={day}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md"
                      >
                        <div className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {day}
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={hours.open || ''}
                            onChange={e => {
                              const updatedHours = {
                                ...orderingConfig.businessHours,
                                [day]: { ...hours, open: e.target.value },
                              }
                              setOrderingConfig(prev => ({
                                ...prev,
                                businessHours: updatedHours,
                              }))
                            }}
                            onBlur={() => updateBusinessHours(day, 'open', hours.open)}
                            disabled={isSaving}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white disabled:opacity-50"
                            placeholder="Open"
                          />
                          <span className="text-gray-500 dark:text-gray-400">to</span>
                          <input
                            type="time"
                            value={hours.close || ''}
                            onChange={e => {
                              const updatedHours = {
                                ...orderingConfig.businessHours,
                                [day]: { ...hours, close: e.target.value },
                              }
                              setOrderingConfig(prev => ({
                                ...prev,
                                businessHours: updatedHours,
                              }))
                            }}
                            onBlur={() => updateBusinessHours(day, 'close', hours.close)}
                            disabled={isSaving}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white disabled:opacity-50"
                            placeholder="Close"
                          />
                          {isSaving && (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  These hours are used across the site (footer, contact page, ordering validation) and can
                  be different from ordering availability flags.
                </p>
              </div>
            </div>

            {/* Color Settings */}
            <ColorSettings />
          </div>
        )}

        {/* --- CONTENT TAB --- */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <PageContentManager />

            {/* Website Content Modules */}
            {(() => {
              const contentModules = modules.filter(m => freeModules.includes(m.key))
              if (contentModules.length === 0) return null

              return (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Website Modules</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Enable or disable additional content sections for your website.
                    </p>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {contentModules.map(module => (
                      <div key={module.key} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-base font-medium text-gray-900 dark:text-white">{module.name}</h3>
                            {module.enabled ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                <CheckCircle className="w-3 h-3" /> Enabled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                                <XCircle className="w-3 h-3" /> Disabled
                              </span>
                            )}
                          </div>
                          {module.description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{module.description}</p>}
                        </div>
                        <div className="ml-4 relative">
                          <button
                            onClick={() => handleModuleAction(module)}
                            disabled={saving[module.key]}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed ${module.enabled ? 'bg-primary dark:bg-gold' : 'bg-gray-200 dark:bg-gray-600'}`}
                            role="switch"
                            aria-checked={module.enabled}
                          >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${module.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                          {saving[module.key] && <Loader2 className="absolute mt-2 ml-2 w-4 h-4 animate-spin text-gray-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* --- MODULES TAB --- */}
        {activeTab === 'modules' && (() => {
          // Filter modules to only show paid ones in this tab
          const displayModules = modules.filter(m => paidModules.includes(m.key))

          // Add any paid modules that might be missing from the API response (e.g. new ones)
          const existingKeys = displayModules.map(m => m.key)
          paidModules.forEach(key => {
            if (!existingKeys.includes(key)) {
              // Determine name based on key if not found
              let name = key.charAt(0).toUpperCase() + key.slice(1)
              if (key === 'socialPosting') name = 'Social Media Posting'
              if (key === 'giftCards') name = 'Gift Cards'

              displayModules.push({
                key,
                name,
                description: 'Unlock this feature.',
                enabled: false
              })
            }
          })

          return (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Premium Modules</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage your subscription add-ons.
                  </p>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {displayModules.map(module => (
                    <div key={module.key} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-base font-medium text-gray-900 dark:text-white">{module.name}</h3>
                            {module.enabled ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                <CheckCircle className="w-3 h-3" /> Enabled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                                <XCircle className="w-3 h-3" /> Disabled
                              </span>
                            )}
                            {modulePrices[module.key] && (
                              <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                {modulePrices[module.key]}
                              </span>
                            )}
                          </div>
                          {module.description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{module.description}</p>}
                        </div>
                        <div className="ml-4 relative">
                          <button
                            onClick={() => handleModuleAction(module)}
                            disabled={saving[module.key]}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed ${module.enabled ? 'bg-primary dark:bg-gold' : 'bg-gray-200 dark:bg-gray-600'}`}
                            role="switch"
                            aria-checked={module.enabled}
                          >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${module.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                          {saving[module.key] && <Loader2 className="absolute mt-2 ml-2 w-4 h-4 animate-spin text-gray-400" />}
                        </div>
                      </div>

                      {/* Ordering Configuration */}
                      {module.key === 'ordering' && module.enabled && (
                        <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700 mt-2 pt-4">
                          <div className="space-y-6">
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                  Ordering Options
                                </h3>
                              </div>
                              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {/* Pickup */}
                                <div className="px-4 py-3 flex items-center justify-between">
                                  <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Pickup</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Allow customers to place orders for pickup.</p>
                                  </div>
                                  <button
                                    onClick={() => toggleOrderingOption('pickup', !orderingSettings.pickup)}
                                    disabled={saving['ordering_pickup']}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed ${orderingSettings.pickup ? 'bg-primary dark:bg-gold' : 'bg-gray-200 dark:bg-gray-600'}`}
                                    role="switch"
                                    aria-checked={orderingSettings.pickup}
                                  >
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${orderingSettings.pickup ? 'translate-x-5' : 'translate-x-0'}`} />
                                  </button>
                                </div>

                                {/* Delivery */}
                                <div className="px-4 py-3 flex items-center justify-between">
                                  <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Delivery</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Allow delivery orders (requires Stripe).</p>
                                  </div>
                                  <button
                                    onClick={() => toggleOrderingOption('delivery', !orderingSettings.delivery)}
                                    disabled={saving['ordering_delivery']}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed ${orderingSettings.delivery ? 'bg-primary dark:bg-gold' : 'bg-gray-200 dark:bg-gray-600'}`}
                                    role="switch"
                                    aria-checked={orderingSettings.delivery}
                                  >
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${orderingSettings.delivery ? 'translate-x-5' : 'translate-x-0'}`} />
                                  </button>
                                </div>

                                {/* Dine-In */}
                                <div className="px-4 py-3 flex items-center justify-between">
                                  <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Dine-In</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Allow dine-in orders.</p>
                                  </div>
                                  <button
                                    onClick={() => toggleOrderingOption('dineIn', !orderingSettings.dineIn)}
                                    disabled={saving['ordering_dineIn']}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed ${orderingSettings.dineIn ? 'bg-primary dark:bg-gold' : 'bg-gray-200 dark:bg-gray-600'}`}
                                    role="switch"
                                    aria-checked={orderingSettings.dineIn}
                                  >
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${orderingSettings.dineIn ? 'translate-x-5' : 'translate-x-0'}`} />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Tax Rate */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tax Rate
                              </label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="number"
                                  min="0"
                                  max="1"
                                  step="0.01"
                                  value={orderingConfig.taxRate}
                                  onChange={e => {
                                    const value = parseFloat(e.target.value)
                                    if (!isNaN(value)) {
                                      setOrderingConfig(prev => ({ ...prev, taxRate: value }))
                                    }
                                  }}
                                  onBlur={e => updateTaxRate(e.target.value)}
                                  disabled={saving.taxRate}
                                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white disabled:opacity-50"
                                  placeholder="0.13"
                                />
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  ({(orderingConfig.taxRate * 100).toFixed(1)}%)
                                </span>
                                {saving.taxRate && (
                                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                )}
                              </div>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Enter as decimal (e.g., 0.13 for 13%).
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Reservations Configuration */}
                      {module.key === 'reservations' && module.enabled && (
                        <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700 mt-2 pt-4">
                          <div className="space-y-6">
                            {/* Max Seats Per Slot */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Maximum Seats Per Slot
                              </label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={reservationsConfig.maxSeatsPerSlot}
                                  onChange={e => {
                                    const value = parseInt(e.target.value, 10)
                                    if (!isNaN(value)) {
                                      setReservationsConfig(prev => ({ ...prev, maxSeatsPerSlot: value }))
                                    }
                                  }}
                                  onBlur={e => {
                                    const value = parseInt(e.target.value, 10)
                                    if (!isNaN(value) && value > 0) {
                                      updateReservationsConfig({ maxSeatsPerSlot: value })
                                    }
                                  }}
                                  disabled={saving['reservations_maxSeatsPerSlot']}
                                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white disabled:opacity-50"
                                />
                                {saving['reservations_maxSeatsPerSlot'] && (
                                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                )}
                              </div>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Total number of seats available in each reservation time slot.
                              </p>
                            </div>

                            {/* Slot Duration */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Slot Duration (minutes)
                              </label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="number"
                                  min="15"
                                  step="15"
                                  value={reservationsConfig.slotDurationMinutes}
                                  onChange={e => {
                                    const value = parseInt(e.target.value, 10)
                                    if (!isNaN(value)) {
                                      setReservationsConfig(prev => ({ ...prev, slotDurationMinutes: value }))
                                    }
                                  }}
                                  onBlur={e => {
                                    const value = parseInt(e.target.value, 10)
                                    if (!isNaN(value) && value > 0) {
                                      updateReservationsConfig({ slotDurationMinutes: value })
                                    }
                                  }}
                                  disabled={saving['reservations_slotDurationMinutes']}
                                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white disabled:opacity-50"
                                />
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {(reservationsConfig.slotDurationMinutes / 60).toFixed(2)} hours
                                </span>
                                {saving['reservations_slotDurationMinutes'] && (
                                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                )}
                              </div>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Length of each reservation time slot in minutes (e.g., 120 for 2 hours).
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                  }
                </div>
              </div>
            </div>
          )
        })()}




        {/* --- INTEGRATIONS TAB --- */}
        {activeTab === 'integrations' && (() => {
          const stripeModule = modules.find(m => m.key === 'stripe')

          return (
            <div className="space-y-6">

              {/* Social Media Integration */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Social Media Integration</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Connect your Facebook and Instagram accounts.
                  </p>
                </div>
                <div className="p-6 space-y-8">
                  <SocialMediaConfig onConnectAccount={handleOpenConnectModal} />
                  <SocialAccountManager
                    accounts={socialAccounts}
                    barId={tenantInfo?.barId}
                    onAccountConnected={handleAccountConnected}
                    onTokenRefreshed={fetchSocialAccounts}
                    onAccountDeleted={fetchSocialAccounts}
                    isConnectModalOpen={showConnectModal}
                    connectPlatform={connectingPlatform}
                    onCloseConnectModal={() => setShowConnectModal(false)}
                  />
                </div>
              </div>

              {/* Stripe Integration */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Stripe Integration</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Payment processing status.
                  </p>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Connection Status</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {stripeModule?.enabled ? 'Connected and ready to process payments.' : 'Not connected.'}
                      </p>
                    </div>
                    {stripeModule?.enabled ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        <XCircle className="w-4 h-4" />
                        Disconnected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

      </div>

      <ModuleActivationModal
        isOpen={activationModalOpen}
        onClose={() => setActivationModalOpen(false)}
        module={selectedModule}
      />
    </div >
  )
}
