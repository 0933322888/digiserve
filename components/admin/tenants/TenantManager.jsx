'use client'

import React, { useState, useEffect } from 'react'
import {
  Building2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import TenantTable from './TenantTable'
import TenantModal from './TenantModal'

export default function TenantManager({ currentTenantId }) {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTenant, setEditingTenant] = useState(null)

  const fetchTenants = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`/api/super-admin/tenants?${params.toString()}`)
      const data = await res.json()

      if (res.ok && data.success) {
        setTenants(data.tenants || [])
      } else {
        toast.error(data.error || 'Failed to fetch tenants')
      }
    } catch (err) {
      console.error('Error fetching tenants:', err)
      toast.error('Network error loading tenants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTenants()
    }, 250)
    return () => clearTimeout(timer)
  }, [search, statusFilter])

  const handleOpenCreate = () => {
    setEditingTenant(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (tenant) => {
    setEditingTenant(tenant)
    setModalOpen(true)
  }

  const handleSaveTenant = async ({ id, data }) => {
    try {
      let res
      if (id) {
        // Edit
        res = await fetch(`/api/super-admin/tenants/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } else {
        // Create
        res = await fetch('/api/super-admin/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      }

      const resData = await res.json()
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to save tenant')
      }

      toast.success(id ? 'Tenant updated successfully' : 'Tenant created successfully')
      fetchTenants()
    } catch (err) {
      throw err
    }
  }

  const handleDeactivate = async (tenant) => {
    if (!confirm(`Are you sure you want to cancel subscription for "${tenant.name}"?`)) return
    try {
      const res = await fetch(`/api/super-admin/tenants/${tenant.barId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Tenant ${tenant.name} deactivated`)
        fetchTenants()
      } else {
        toast.error(data.error || 'Failed to deactivate tenant')
      }
    } catch (err) {
      toast.error('Network error deactivating tenant')
    }
  }

  const handleDelete = async (tenant) => {
    if (!confirm(`DANGER: Are you sure you want to permanently delete "${tenant.name}" (${tenant.barId})? This action cannot be undone.`)) return
    try {
      const res = await fetch(`/api/super-admin/tenants/${tenant.barId}?permanent=true`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Tenant ${tenant.name} deleted`)
        fetchTenants()
      } else {
        toast.error(data.error || 'Failed to delete tenant')
      }
    } catch (err) {
      toast.error('Network error deleting tenant')
    }
  }

  // Calculate high-level stats
  const totalCount = tenants.length
  const activeCount = tenants.filter((t) => t.subscription?.status === 'active').length
  const trialingCount = tenants.filter((t) => t.subscription?.status === 'trialing').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Building2 className="w-7 h-7 text-primary dark:text-gold" />
              Tenant Management
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Provision, monitor, and configure multi-tenant restaurants, subdomains, custom domains, and modules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchTenants()}
            className="p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-primary hover:bg-primary-dark dark:bg-gold dark:text-gray-900 dark:hover:bg-gold/90 text-white rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Provision Tenant
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Tenants
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {totalCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary dark:bg-gold/10 dark:text-gold flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Active Subscriptions
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {activeCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              In Trial
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {trialingCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, slug, ID or domain..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
            <option value="past_due">Past Due</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <TenantTable
        tenants={tenants}
        loading={loading}
        currentTenantId={currentTenantId}
        onEdit={handleOpenEdit}
        onDeactivate={handleDeactivate}
        onDelete={handleDelete}
      />

      {/* Provision / Edit Modal */}
      <TenantModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tenant={editingTenant}
        onSave={handleSaveTenant}
      />
    </div>
  )
}
