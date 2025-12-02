'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ShiftForm({ shift, employees, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    employeeId: '',
    role: '',
    location: 'serving', // 'kitchen', 'bar', 'serving'
    startTime: '',
    endTime: '',
    breakDuration: 0,
    notes: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (shift) {
      const start = new Date(shift.startTime)
      const end = new Date(shift.endTime)
      setFormData({
        employeeId: shift.employeeId,
        role: shift.role,
        location: shift.location || 'serving',
        startTime: start.toISOString().slice(0, 16),
        endTime: end.toISOString().slice(0, 16),
        breakDuration: shift.breakDuration || 0,
        notes: shift.notes || '',
      })
    } else {
      // Default to today, 9 AM - 5 PM
      const today = new Date()
      today.setHours(9, 0, 0, 0)
      const endTime = new Date(today)
      endTime.setHours(17, 0, 0, 0)

      setFormData({
        employeeId: '',
        role: '',
        startTime: today.toISOString().slice(0, 16),
        endTime: endTime.toISOString().slice(0, 16),
        breakDuration: 30,
        notes: '',
      })
    }
  }, [shift])

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Auto-set role and location when employee is selected
    if (name === 'employeeId') {
      const employee = employees.find(e => e.id === value)
      if (employee) {
        // Auto-set location based on role
        let defaultLocation = 'serving'
        if (employee.role === 'chef' || employee.role === 'cook') {
          defaultLocation = 'kitchen'
        } else if (employee.role === 'bartender') {
          defaultLocation = 'bar'
        }

        setFormData(prev => ({
          ...prev,
          role: employee.role,
          location: prev.location || defaultLocation,
        }))
      }
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const payload = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        breakDuration: parseInt(formData.breakDuration) || 0,
      }

      const url = shift ? `/api/admin/staff/shifts/${shift.id}` : '/api/admin/staff/shifts'

      const method = shift ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (data.success || data.shift) {
        toast.success(shift ? 'Shift updated successfully' : 'Shift created successfully')
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
          {shift ? 'Edit Shift' : 'Add New Shift'}
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
            Employee *
          </label>
          <select
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select an employee</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName} ({emp.role})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Role
          </label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location *
          </label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value="kitchen">Kitchen</option>
            <option value="bar">Bar</option>
            <option value="serving">Serving</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Time *
          </label>
          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Time *
          </label>
          <input
            type="datetime-local"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Break Duration (minutes)
          </label>
          <input
            type="number"
            name="breakDuration"
            value={formData.breakDuration}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
        />
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
              {shift ? 'Update' : 'Create'} Shift
            </>
          )}
        </button>
      </div>
    </form>
  )
}
