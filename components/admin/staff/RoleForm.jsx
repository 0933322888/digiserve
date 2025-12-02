'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RoleForm({ role, availablePermissions, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
    color: '#6B7280',
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        permissions: role.permissions || [],
        color: role.color || '#6B7280',
      })
    }
  }, [role])

  const handleChange = e => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = e.target.checked
      setFormData(prev => ({
        ...prev,
        permissions: checked
          ? [...prev.permissions, value]
          : prev.permissions.filter(p => p !== value),
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const payload = {
        ...formData,
      }

      const url = role ? `/api/admin/staff/roles/${role.id}` : '/api/admin/staff/roles'

      const method = role ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (data.success || data.role) {
        toast.success(role ? 'Role updated successfully' : 'Role created successfully')
        onSuccess()
      } else {
        toast.error('Failed to save: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          {role ? 'Edit Role' : 'Add New Role'}
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Role Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Color
          </label>
          <input
            type="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Permissions
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-3 border border-gray-300 dark:border-gray-600 rounded-md">
          {availablePermissions.map(perm => (
            <label
              key={perm.id}
              className="flex items-start gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                value={perm.id}
                checked={formData.permissions.includes(perm.id)}
                onChange={handleChange}
                className="mt-1"
              />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{perm.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{perm.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark dark:bg-gold dark:text-primary dark:hover:bg-gold-light flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {role ? 'Update' : 'Create'} Role
            </>
          )}
        </button>
      </div>
    </form>
  )
}
