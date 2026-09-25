import React, { useState } from 'react'
import { X, Loader2, Plus, Trash2, Check } from 'lucide-react'

const AVAILABLE_MODULES = [
  { id: 'ordering', name: 'Online Ordering', description: 'Pickup, delivery, dine-in orders' },
  { id: 'reservations', name: 'Table Reservations', description: 'Table booking system' },
  { id: 'events', name: 'Events & Tickets', description: 'Special events calendar' },
  { id: 'gallery', name: 'Photo Gallery', description: 'Showcase photos & ambiance' },
  { id: 'social', name: 'Social Posting', description: 'Auto-publish to Instagram/FB' },
  { id: 'giftCards', name: 'Gift Cards', description: 'Digital gift certificates' },
  { id: 'staff', name: 'Staff Management', description: 'Shifts, clock-in, roles' },
  { id: 'analytics', name: 'Advanced Analytics', description: 'Revenue and visitor metrics' },
]

export default function TenantModal({ isOpen, onClose, tenant, onSave }) {
  const isEditing = Boolean(tenant)

  const [formData, setFormData] = useState(() => {
    if (tenant) {
      return {
        name: tenant.name || '',
        slug: tenant.slug || '',
        customDomains: tenant.customDomains || [],
        modules: tenant.modules || ['ordering', 'reservations', 'events', 'gallery', 'social'],
        subscriptionPlan: tenant.subscription?.plan || 'basic',
        subscriptionStatus: tenant.subscription?.status || 'active',
        phone: tenant.contact?.phone || '',
        email: tenant.contact?.email || '',
        templateId: tenant.theme?.templateId || 'bar',
      }
    }
    return {
      name: '',
      slug: '',
      adminName: '',
      adminEmail: '',
      adminPassword: '',
      customDomains: [],
      modules: ['ordering', 'reservations', 'events', 'gallery', 'social'],
      subscriptionPlan: 'basic',
      subscriptionStatus: 'active',
      phone: '',
      email: '',
      templateId: 'bar',
    }
  })

  const [customDomainInput, setCustomDomainInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleSlugify = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (e) => {
    const val = e.target.value
    setFormData((prev) => ({
      ...prev,
      name: val,
      ...(!isEditing && !prev.slugManuallyEdited ? { slug: handleSlugify(val) } : {}),
    }))
  }

  const toggleModule = (moduleId) => {
    setFormData((prev) => {
      const exists = prev.modules.includes(moduleId)
      const newModules = exists
        ? prev.modules.filter((m) => m !== moduleId)
        : [...prev.modules, moduleId]
      return { ...prev, modules: newModules }
    })
  }

  const handleAddCustomDomain = () => {
    if (!customDomainInput.trim()) return
    const clean = customDomainInput.trim().toLowerCase().replace(/^https?:\/\//, '')
    if (!formData.customDomains.includes(clean)) {
      setFormData((prev) => ({
        ...prev,
        customDomains: [...prev.customDomains, clean],
        domain: prev.domain || clean,
      }))
    }
    setCustomDomainInput('')
  }

  const handleRemoveCustomDomain = (dom) => {
    setFormData((prev) => {
      const updated = prev.customDomains.filter((d) => d !== dom)
      return {
        ...prev,
        customDomains: updated,
        domain: prev.domain === dom ? updated[0] || '' : prev.domain,
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      if (isEditing) {
        await onSave({
          id: tenant.barId || tenant.slug,
          data: {
            name: formData.name,
            customDomains: formData.customDomains,
            modules: formData.modules,
            subscription: {
              plan: formData.subscriptionPlan,
              status: formData.subscriptionStatus,
            },
            contact: {
              phone: formData.phone,
              email: formData.email,
            },
            theme: {
              templateId: formData.templateId,
            },
          },
        })
      } else {
        await onSave({
          data: {
            name: formData.name,
            slug: formData.slug,
            adminName: formData.adminName,
            adminEmail: formData.adminEmail,
            adminPassword: formData.adminPassword,
            customDomains: formData.customDomains,
            modules: formData.modules,
            subscriptionPlan: formData.subscriptionPlan,
            subscriptionStatus: formData.subscriptionStatus,
            phone: formData.phone,
            email: formData.email,
            templateId: formData.templateId,
          },
        })
      }
      onClose()
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? `Edit Tenant: ${tenant.name}` : 'Provision New Tenant'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isEditing
                ? `Tenant ID: ${tenant.barId}`
                : 'Create an isolated restaurant workspace and optional initial admin user.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Basic Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">
              General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Restaurant / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Trio Bistro & Lounge"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subdomain Slug *
                </label>
                <div className="flex rounded-lg shadow-sm">
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        slug: e.target.value.toLowerCase(),
                        slugManuallyEdited: true,
                      }))
                    }
                    placeholder="triobistro"
                    className="flex-1 min-w-0 px-3 py-2 text-sm rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-60 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 text-xs">
                    .digiserve.com
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Domains */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">
              Domains & Branding
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Add Custom Domain
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customDomainInput}
                    onChange={(e) => setCustomDomainInput(e.target.value)}
                    placeholder="e.g. www.triobistro.com"
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomDomain}
                    className="px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

              {formData.customDomains.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.customDomains.map((dom) => (
                    <span
                      key={dom}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-mono"
                    >
                      {dom}
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomDomain(dom)}
                        className="text-gray-400 hover:text-red-500 ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subscription & Plan */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">
              Subscription & Plan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plan Tier
                </label>
                <select
                  value={formData.subscriptionPlan}
                  onChange={(e) => setFormData((p) => ({ ...p, subscriptionPlan: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="basic">Basic (Starter)</option>
                  <option value="pro">Pro (Growth)</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subscription Status
                </label>
                <select
                  value={formData.subscriptionStatus}
                  onChange={(e) => setFormData((p) => ({ ...p, subscriptionStatus: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="trialing">Trialing</option>
                  <option value="past_due">Past Due</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enabled Modules */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">
              Tenant Modules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_MODULES.map((mod) => {
                const isSelected = formData.modules.includes(mod.id)
                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    className={`cursor-pointer p-3 rounded-lg border text-left transition flex items-start justify-between ${
                      isSelected
                        ? 'border-primary bg-primary/5 dark:border-gold dark:bg-gold/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-xs text-gray-900 dark:text-gray-100">
                        {mod.name}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {mod.description}
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ml-2 ${
                        isSelected
                          ? 'bg-primary border-primary text-white dark:bg-gold dark:border-gold dark:text-gray-900'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Admin Account Provisioning (Create mode only) */}
          {!isEditing && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">
                Primary Admin Account
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    value={formData.adminName}
                    onChange={(e) => setFormData((p) => ({ ...p, adminName: e.target.value }))}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData((p) => ({ ...p, adminEmail: e.target.value }))}
                    placeholder="admin@restaurant.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData((p) => ({ ...p, adminPassword: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark dark:bg-gold dark:text-gray-900 dark:hover:bg-gold/90 rounded-lg flex items-center gap-2 shadow-sm transition disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Tenant'}
          </button>
        </div>
      </div>
    </div>
  )
}
