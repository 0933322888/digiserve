'use client'

import { useState, useEffect } from 'react'
import { Clock, Play, Square, Coffee, X, User, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TimeTracking({ barId }) {
  const [employees, setEmployees] = useState([])
  const [timeEntries, setTimeEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState('all')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`/api/admin/staff/employees?barId=${barId}`)
      const data = await response.json()
      if (data.employees) {
        setEmployees(data.employees.filter(e => e.status === 'active'))
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    }
  }

  const fetchTimeEntries = async () => {
    try {
      const params = new URLSearchParams({
        barId: barId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate + 'T23:59:59').toISOString(),
      })
      if (selectedEmployee !== 'all') {
        params.append('employeeId', selectedEmployee)
      }

      const response = await fetch(`/api/admin/staff/time-entries?${params}`)
      const data = await response.json()
      if (data.entries) {
        setTimeEntries(data.entries)
      }
    } catch (error) {
      console.error('Failed to fetch time entries:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (barId) {
      fetchEmployees()
    }
  }, [barId])

  useEffect(() => {
    fetchTimeEntries()
  }, [selectedEmployee, startDate, endDate])

  const handleTimeAction = async (employeeId, action) => {
    try {
      const response = await fetch('/api/admin/staff/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          employeeId,
          barId: barId,
        }),
      })

      const data = await response.json()
      if (data.success) {
        fetchTimeEntries()
      } else {
        toast.error('Failed: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Time action error:', error)
      toast.error('Failed: ' + error.message)
    }
  }

  const getActiveEntry = employeeId => {
    return timeEntries.find(e => e.employeeId === employeeId && e.status === 'active')
  }

  const formatTime = dateString => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDuration = hours => {
    if (!hours) return '0h 0m'
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Loading time tracking...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Time Tracking</h3>
        <div className="flex items-center gap-4">
          <select
            value={selectedEmployee}
            onChange={e => setSelectedEmployee(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          />
          <span className="text-gray-600 dark:text-gray-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Active Clock-ins */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Currently Clocked In</h4>
        {employees.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No active employees</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map(employee => {
              const activeEntry = getActiveEntry(employee.id)
              return (
                <div
                  key={employee.id}
                  className={`p-4 rounded-lg border ${activeEntry
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {employee.firstName} {employee.lastName}
                      </span>
                    </div>
                    {activeEntry && (
                      <span className="text-xs px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  {activeEntry ? (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Clocked in: {formatTime(activeEntry.clockIn)}
                      </div>
                      {activeEntry.breakStart && !activeEntry.breakEnd && (
                        <div className="text-sm text-yellow-600 dark:text-yellow-400">On Break</div>
                      )}
                      <div className="flex gap-2">
                        {!activeEntry.breakStart ? (
                          <button
                            onClick={() => handleTimeAction(employee.id, 'break_start')}
                            className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm flex items-center justify-center gap-2"
                          >
                            <Coffee className="w-4 h-4" />
                            Start Break
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTimeAction(employee.id, 'break_end')}
                            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center justify-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            End Break
                          </button>
                        )}
                        <button
                          onClick={() => handleTimeAction(employee.id, 'clock_out')}
                          className="flex-1 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm flex items-center justify-center gap-2"
                        >
                          <Square className="w-4 h-4" />
                          Clock Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleTimeAction(employee.id, 'clock_in')}
                      className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark dark:bg-gold dark:text-gray-900 dark:hover:bg-gold-light flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Clock In
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Time Entries History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white">Time Entries History</h4>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {timeEntries.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No time entries found for the selected period.
            </div>
          ) : (
            timeEntries.map(entry => (
              <div key={entry.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        {entry.employeeName}
                      </h5>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${entry.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}
                      >
                        {entry.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Clock In:</span>
                        <div className="font-medium">{formatTime(entry.clockIn)}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.clockIn).toLocaleDateString()}
                        </div>
                      </div>
                      {entry.clockOut && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Clock Out:</span>
                          <div className="font-medium">{formatTime(entry.clockOut)}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(entry.clockOut).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Total Hours:</span>
                        <div className="font-medium">{formatDuration(entry.totalHours)}</div>
                        {entry.overtimeHours > 0 && (
                          <div className="text-xs text-orange-600 dark:text-orange-400">
                            OT: {formatDuration(entry.overtimeHours)}
                          </div>
                        )}
                      </div>
                      {entry.breakDuration > 0 && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Break:</span>
                          <div className="font-medium">{entry.breakDuration} min</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
