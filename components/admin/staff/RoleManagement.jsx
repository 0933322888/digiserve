'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Shield, CheckSquare } from 'lucide-react'
import RoleForm from './RoleForm'
import toast from 'react-hot-toast'

const AVAILABLE_PERMISSIONS = [
  { id: 'manage_staff', name: 'Manage Staff', description: 'Add, edit, delete employees' },
  { id: 'manage_menu', name: 'Manage Menu', description: 'Edit menu items and sections' },
  { id: 'view_reports', name: 'View Reports', description: 'Access analytics and reports' },
  { id: 'manage_orders', name: 'Manage Orders', description: 'View and update orders' },
  { id: 'manage_inventory', name: 'Manage Inventory', description: 'Track and update inventory' },
  { id: 'manage_schedule', name: 'Manage Schedule', description: 'Create and edit shifts' },
  {
    id: 'manage_payroll',
    name: 'Manage Payroll',
    description: 'View and generate payroll reports',
  },
  { id: 'manage_bar', name: 'Manage Bar', description: 'Bar operations and inventory' },
  { id: 'manage_kitchen', name: 'Manage Kitchen', description: 'Kitchen operations and orders' },
  { id: 'manage_tables', name: 'Manage Tables', description: 'Table assignments and reservations' },
]

export default function RoleManagement({ barId }) {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRole, setEditingRole] = useState(null)

  const fetchRoles = async () => {
    try {
      const response = await fetch(`/api/admin/staff/roles?barId=${barId}`)
      const data = await response.json()
      if (data.roles) {
        setRoles(data.roles)
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (barId) {
      fetchRoles()
    }
  }, [barId])

  const handleDelete = async roleId => {
    if (
      !confirm(
        'Are you sure you want to delete this role? Employees with this role will need to be reassigned.'
      )
    ) {
      return
    }

    try {
      const response = await fetch(`/api/admin/staff/roles/${roleId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Role deleted successfully')
        fetchRoles()
      } else {
        toast.error('Failed to delete: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete: ' + error.message)
    }
  }

  const handleEdit = role => {
    setEditingRole(role)
    setShowForm(true)
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading roles...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Roles & Permissions</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark dark:bg-gold dark:text-gray-900 dark:hover:bg-gold-light flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Role
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <RoleForm
            role={editingRole}
            availablePermissions={AVAILABLE_PERMISSIONS}
            onSuccess={() => {
              fetchRoles()
              setShowForm(false)
              setEditingRole(null)
            }}
            onCancel={() => {
              setShowForm(false)
              setEditingRole(null)
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map(role => (
          <div
            key={role.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: role.color }}
                >
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{role.name}</h4>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(role)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="Edit role"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(role.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  title="Delete role"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {role.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{role.description}</p>
            )}

            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Permissions:
              </h5>
              <div className="space-y-1">
                {role.permissions.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No permissions assigned
                  </p>
                ) : (
                  role.permissions.map(permId => {
                    const perm = AVAILABLE_PERMISSIONS.find(p => p.id === permId)
                    return perm ? (
                      <div key={permId} className="flex items-center gap-2 text-xs">
                        <CheckSquare className="w-3 h-3 text-green-600 dark:text-green-400" />
                        <span className="text-gray-600 dark:text-gray-400">{perm.name}</span>
                      </div>
                    ) : null
                  })
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
