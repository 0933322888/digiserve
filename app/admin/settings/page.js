'use client'

import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Loader2, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import PageContentManager from '@/components/admin/PageContentManager'

export default function AdminSettingsPage() {
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

  useEffect(() => {
    fetchModuleSettings()
    fetchOrderingSettings()
    fetchOrderingConfig()
    fetchReservationsConfig()
  }, [])

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
        // Dispatch event to notify admin layout to refresh module status
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
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-primary dark:text-gold" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage module configurations and feature toggles
          </p>
        </div>
      </div>

      {/** Derive grouped modules */}
      {(() => {
        const stripeModule = modules.find(m => m.key === 'stripe')
        const giftCardsModule = modules.find(m => m.key === 'giftCards')
        const orderingModule = modules.find(m => m.key === 'ordering')
        const otherModules = modules.filter(
          m => !['stripe', 'giftCards', 'ordering'].includes(m.key)
        )

        return (
          <>
            {/* General Modules (excluding Stripe, Gift Cards, Ordering) */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Modules</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Enable or disable modules to control which features are available in your admin
                  panel
                </p>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {otherModules.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No configurable modules found
                  </div>
                ) : (
                  otherModules.map(module => (
                    <div
                      key={module.key}
                      className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-base font-medium text-gray-900 dark:text-white">
                            {module.name}
                          </h3>
                          {module.enabled ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Enabled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                              <XCircle className="w-3 h-3" />
                              Disabled
                            </span>
                          )}
                        </div>
                        {module.description && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {module.description}
                          </p>
                        )}
                      </div>

                      <div className="ml-4">
                        <button
                          onClick={() => toggleModule(module.key, !module.enabled)}
                          disabled={saving[module.key]}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed ${
                            module.enabled
                              ? 'bg-primary dark:bg-gold'
                              : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                          role="switch"
                          aria-checked={module.enabled}
                          aria-label={`${module.enabled ? 'Disable' : 'Enable'} ${module.name}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              module.enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        {saving[module.key] && (
                          <Loader2 className="absolute mt-2 ml-2 w-4 h-4 animate-spin text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stripe Payments and dependent features */}
            {stripeModule && (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Stripe Payments
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Enable Stripe payment processing and configure Stripe-dependent features like
                    gift cards and online ordering.
                  </p>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {/* Stripe toggle */}
                  <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">
                          Stripe Payments
                        </h3>
                        {stripeModule.enabled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Enabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                            <XCircle className="w-3 h-3" />
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Process online payments securely using Stripe.
                      </p>
                    </div>
                    <div className="ml-4 relative">
                      <button
                        onClick={() => toggleModule('stripe', !stripeModule.enabled)}
                        disabled={saving.stripe}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed ${
                          stripeModule.enabled
                            ? 'bg-primary dark:bg-gold'
                            : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                        role="switch"
                        aria-checked={stripeModule.enabled}
                        aria-label={`${
                          stripeModule.enabled ? 'Disable' : 'Enable'
                        } Stripe Payments`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            stripeModule.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      {saving.stripe && (
                        <Loader2 className="absolute mt-2 ml-2 w-4 h-4 animate-spin text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Stripe-dependent modules: Gift Cards & Ordering */}
                  <div className="px-6 py-4 space-y-4 bg-gray-50 dark:bg-gray-900/40">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      The following modules require Stripe Payments to be enabled.
                    </p>

                    {/* Gift Cards */}
                    {giftCardsModule && (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-base font-medium text-gray-900 dark:text-white">
                              Gift Cards
                            </h3>
                            {giftCardsModule.enabled ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                Enabled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                                <XCircle className="w-3 h-3" />
                                Disabled
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Enable gift card purchasing and management.
                          </p>
                        </div>
                        <div className="ml-4 relative">
                          <button
                            onClick={() => toggleModule('giftCards', !giftCardsModule.enabled)}
                            disabled={saving.giftCards || !stripeModule.enabled}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed ${
                              giftCardsModule.enabled && stripeModule.enabled
                                ? 'bg-primary dark:bg-gold'
                                : 'bg-gray-200 dark:bg-gray-600'
                            }`}
                            role="switch"
                            aria-checked={giftCardsModule.enabled && stripeModule.enabled}
                            aria-label={`${
                              giftCardsModule.enabled ? 'Disable' : 'Enable'
                            } Gift Cards`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                giftCardsModule.enabled && stripeModule.enabled
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              }`}
                            />
                          </button>
                          {saving.giftCards && (
                            <Loader2 className="absolute mt-2 ml-2 w-4 h-4 animate-spin text-gray-400" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Ordering System + configuration (only when Stripe enabled) */}
                    {orderingModule && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-base font-medium text-gray-900 dark:text-white">
                                Ordering System
                              </h3>
                              {orderingModule.enabled ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                  <CheckCircle className="w-3 h-3" />
                                  Enabled
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                                  <XCircle className="w-3 h-3" />
                                  Disabled
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              Enable the online ordering system (pickup, delivery, dine-in).
                            </p>
                          </div>
                          <div className="ml-4 relative">
                            <button
                              onClick={() =>
                                toggleModule('ordering', !orderingModule.enabled)
                              }
                              disabled={saving.ordering || !stripeModule.enabled}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed ${
                                orderingModule.enabled && stripeModule.enabled
                                  ? 'bg-primary dark:bg-gold'
                                  : 'bg-gray-200 dark:bg-gray-600'
                              }`}
                              role="switch"
                              aria-checked={orderingModule.enabled && stripeModule.enabled}
                              aria-label={`${
                                orderingModule.enabled ? 'Disable' : 'Enable'
                              } Ordering System`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  orderingModule.enabled && stripeModule.enabled
                                    ? 'translate-x-5'
                                    : 'translate-x-0'
                                }`}
                              />
                            </button>
                            {saving.ordering && (
                              <Loader2 className="absolute mt-2 ml-2 w-4 h-4 animate-spin text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Ordering Configuration & Details, only when ordering + Stripe enabled */}
                        {stripeModule.enabled && orderingModule.enabled && (
                          <div className="space-y-4 mt-4">
                            {/* Ordering Configuration */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                  Ordering Configuration
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Configure ordering options for pickup, delivery, and dine-in.
                                </p>
                              </div>
                              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {/* Pickup */}
                                <div className="px-4 py-3 flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                        Pickup
                                      </h4>
                                      {orderingSettings.pickup ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                          <CheckCircle className="w-3 h-3" />
                                          Enabled
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                                          <XCircle className="w-3 h-3" />
                                          Disabled
                                        </span>
                                      )}
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                      Allow customers to place orders for pickup.
                                    </p>
                                  </div>
                                  <div className="ml-4">
                                    <button
                                      onClick={() =>
                                        toggleOrderingOption('pickup', !orderingSettings.pickup)
                                      }
                                      disabled={saving['ordering_pickup']}
                                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed ${
                                        orderingSettings.pickup
                                          ? 'bg-primary dark:bg-gold'
                                          : 'bg-gray-200 dark:bg-gray-600'
                                      }`}
                                      role="switch"
                                      aria-checked={orderingSettings.pickup}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                          orderingSettings.pickup
                                            ? 'translate-x-5'
                                            : 'translate-x-0'
                                        }`}
                                      />
                                    </button>
                                  </div>
                                </div>

                                {/* Delivery */}
                                <div className="px-4 py-3 flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                        Delivery
                                      </h4>
                                      {orderingSettings.delivery ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                          <CheckCircle className="w-3 h-3" />
                                          Enabled
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                                          <XCircle className="w-3 h-3" />
                                          Disabled
                                        </span>
                                      )}
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                      Allow customers to place orders for delivery.
                                    </p>
                                  </div>
                                  <div className="ml-4">
                                    <button
                                      onClick={() =>
                                        toggleOrderingOption('delivery', !orderingSettings.delivery)
                                      }
                                      disabled={saving['ordering_delivery']}
                                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed ${
                                        orderingSettings.delivery
                                          ? 'bg-primary dark:bg-gold'
                                          : 'bg-gray-200 dark:bg-gray-600'
                                      }`}
                                      role="switch"
                                      aria-checked={orderingSettings.delivery}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                          orderingSettings.delivery
                                            ? 'translate-x-5'
                                            : 'translate-x-0'
                                        }`}
                                      />
                                    </button>
                                  </div>
                                </div>

                                {/* Dine-In */}
                                <div className="px-4 py-3 flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                        Dine-In
                                      </h4>
                                      {orderingSettings.dineIn ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                          <CheckCircle className="w-3 h-3" />
                                          Enabled
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                                          <XCircle className="w-3 h-3" />
                                          Disabled
                                        </span>
                                      )}
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                      Allow customers to place orders for dine-in.
                                    </p>
                                  </div>
                                  <div className="ml-4">
                                    <button
                                      onClick={() =>
                                        toggleOrderingOption('dineIn', !orderingSettings.dineIn)
                                      }
                                      disabled={saving['ordering_dineIn']}
                                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed ${
                                        orderingSettings.dineIn
                                          ? 'bg-primary dark:bg-gold'
                                          : 'bg-gray-200 dark:bg-gray-600'
                                      }`}
                                      role="switch"
                                      aria-checked={orderingSettings.dineIn}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                          orderingSettings.dineIn
                                            ? 'translate-x-5'
                                            : 'translate-x-0'
                                        }`}
                                      />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Ordering Details (Tax) */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                  Ordering Details
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Configure business hours and tax rate for the ordering system.
                                </p>
                              </div>

                              <div className="p-4 space-y-4">
                                {/* Tax Rate */}
                                <div>
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
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )
      })()}

      {/* Reservations Configuration */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reservations Configuration</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure reservation capacity and slot duration
          </p>
        </div>

        <div className="p-6 space-y-6">
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

      {/* Business Hours Configuration */}
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

      {/* Page Content Management */}
      <PageContentManager />
    </div>
  )
}

