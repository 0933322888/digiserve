import React from 'react'
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Edit2,
  Trash2,
  ShieldCheck,
  Globe,
} from 'lucide-react'

export default function TenantTable({
  tenants,
  loading,
  currentTenantId,
  onEdit,
  onDeactivate,
  onDelete,
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Active
          </span>
        )
      case 'trialing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
            Trialing
          </span>
        )
      case 'past_due':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            <AlertTriangle className="w-3 h-3 mr-1" /> Past Due
          </span>
        )
      case 'canceled':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
            <XCircle className="w-3 h-3 mr-1" /> Canceled
          </span>
        )
    }
  }

  const getPlanBadge = (plan) => {
    const p = (plan || 'basic').toLowerCase()
    const colors = {
      enterprise: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      pro: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      basic: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border uppercase tracking-wider ${colors[p] || colors.basic}`}>
        {p}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-gold mb-3" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading tenants...</p>
      </div>
    )
  }

  if (!tenants || tenants.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">No tenants found</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Get started by adding a new restaurant tenant or adjusting your search filters.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tenant / Restaurant
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Domain & Subdomain
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Plan & Status
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Enabled Modules
              </th>
              <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tenants.map((tenant) => {
              const isCurrent = currentTenantId === tenant.barId || currentTenantId === tenant.slug
              const modulesList = tenant.modules || []
              const primaryDomain = tenant.domain || (tenant.customDomains && tenant.customDomains[0])

              return (
                <tr
                  key={tenant.barId || tenant._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-gold/10 text-primary dark:text-gold flex items-center justify-center font-bold text-sm uppercase mr-3 shrink-0">
                        {tenant.name ? tenant.name.substring(0, 2) : 'TR'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {tenant.name}
                          </span>
                          {isCurrent && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary dark:bg-gold/20 dark:text-gold">
                              Current Session
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                          ID: {tenant.barId}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 font-mono">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        {tenant.subdomain || `${tenant.slug}.digiserve.com`}
                      </div>
                      {primaryDomain ? (
                        <div className="flex items-center gap-1.5 text-xs text-primary dark:text-gold font-mono">
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{primaryDomain}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-400">No custom domain</span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1.5 items-start">
                      {getStatusBadge(tenant.subscription?.status)}
                      {getPlanBadge(tenant.subscription?.plan)}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {modulesList.map((m) => (
                        <span
                          key={m}
                          className="inline-block px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded"
                        >
                          {m}
                        </span>
                      ))}
                      {modulesList.length === 0 && (
                        <span className="text-xs text-gray-400">None enabled</span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(tenant)}
                        className="p-1.5 text-gray-500 hover:text-primary dark:hover:text-gold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        title="Edit tenant"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {tenant.subscription?.status === 'active' ? (
                        <button
                          onClick={() => onDeactivate(tenant)}
                          className="p-1.5 text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition"
                          title="Deactivate subscription"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onDelete(tenant)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                          title="Delete tenant permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
