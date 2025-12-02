'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar, Clock, User, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import ShiftForm from './ShiftForm'
import toast from 'react-hot-toast'

export default function ShiftScheduler({ barId }) {
  const [shifts, setShifts] = useState([])
  const [employees, setEmployees] = useState([])
  const [timeOffRequests, setTimeOffRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingShift, setEditingShift] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState('week') // 'day', 'week', 'month'
  const [visibleLocations, setVisibleLocations] = useState({
    kitchen: true,
    bar: true,
    serving: true,
  })

  const fetchShifts = async () => {
    try {
      const startDate = new Date(selectedDate)
      const endDate = new Date(startDate)

      if (viewMode === 'week') {
        endDate.setDate(startDate.getDate() + 7)
      } else if (viewMode === 'month') {
        endDate.setMonth(startDate.getMonth() + 1)
      } else {
        endDate.setDate(startDate.getDate() + 1)
      }

      const response = await fetch(
        `/api/admin/staff/shifts?barId=${barId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )
      const data = await response.json()
      if (data.shifts) {
        setShifts(data.shifts)
      }
    } catch (error) {
      console.error('Failed to fetch shifts:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const fetchTimeOffRequests = async () => {
    try {
      const startDate = new Date(selectedDate)
      const endDate = new Date(startDate)

      if (viewMode === 'week') {
        endDate.setDate(startDate.getDate() + 7)
      } else if (viewMode === 'month') {
        endDate.setMonth(startDate.getMonth() + 1)
      } else {
        endDate.setDate(startDate.getDate() + 1)
      }

      const response = await fetch(`/api/admin/staff/requests?barId=${barId}&status=approved`)
      const data = await response.json()
      if (data.requests) {
        // Filter to ONLY approved time_off requests that overlap with the view period
        const filtered = data.requests.filter(req => {
          // Must be approved time_off request
          if (req.status !== 'approved' || req.type !== 'time_off') {
            return false
          }

          const reqStart = new Date(req.startDate)
          const reqEnd = new Date(req.endDate)

          // Check if request overlaps with view period
          return reqStart <= endDate && reqEnd >= startDate
        })
        setTimeOffRequests(filtered)
      }
    } catch (error) {
      console.error('Failed to fetch time-off requests:', error)
    }
  }

  useEffect(() => {
    if (barId) {
      fetchShifts()
      fetchEmployees()
      fetchTimeOffRequests()
    }
  }, [selectedDate, viewMode, barId])

  const handleDelete = async shiftId => {
    if (!confirm('Are you sure you want to delete this shift?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/staff/shifts/${shiftId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Shift deleted successfully')
        fetchShifts()
      } else {
        toast.error('Failed to delete: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete: ' + error.message)
    }
  }

  const formatTime = dateString => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const getShiftsForDate = date => {
    // Get date string in local timezone (YYYY-MM-DD)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    return shifts.filter(shift => {
      const shiftStart = new Date(shift.startTime)
      const shiftEnd = new Date(shift.endTime)

      // Get shift dates in local timezone
      const shiftStartYear = shiftStart.getFullYear()
      const shiftStartMonth = String(shiftStart.getMonth() + 1).padStart(2, '0')
      const shiftStartDay = String(shiftStart.getDate()).padStart(2, '0')
      const shiftStartDate = `${shiftStartYear}-${shiftStartMonth}-${shiftStartDay}`

      const shiftEndYear = shiftEnd.getFullYear()
      const shiftEndMonth = String(shiftEnd.getMonth() + 1).padStart(2, '0')
      const shiftEndDay = String(shiftEnd.getDate()).padStart(2, '0')
      const shiftEndDate = `${shiftEndYear}-${shiftEndMonth}-${shiftEndDay}`

      // Include shift if it starts on this date OR if it spans into this date
      return shiftStartDate === dateStr || (shiftEndDate === dateStr && shiftStartDate !== dateStr)
    })
  }

  const getDisplayDates = () => {
    // Parse as local time to avoid timezone issues
    const localDate = new Date(`${selectedDate}T00:00:00`)

    if (viewMode === 'day') {
      return [localDate]
    }

    const day = localDate.getDay()
    const diff = localDate.getDate() - day
    const weekStart = new Date(localDate)
    weekStart.setDate(diff)

    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const getMonthDates = dateString => {
    const localDate = new Date(`${dateString}T00:00:00`)
    const monthStart = new Date(localDate.getFullYear(), localDate.getMonth(), 1)
    const startDay = monthStart.getDay() // 0-6 (Sun-Sat)

    // Start from the Sunday before the 1st of the month
    const gridStart = new Date(monthStart)
    gridStart.setDate(monthStart.getDate() - startDay)

    const days = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(gridStart)
      date.setDate(gridStart.getDate() + i)
      days.push(date)
    }
    return days
  }

  const handleNavigate = direction => {
    // Parse as local time to avoid timezone issues
    const newDate = new Date(`${selectedDate}T00:00:00`)

    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction)
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + direction * 7)
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + direction)
    }

    // Format as YYYY-MM-DD for the input
    const year = newDate.getFullYear()
    const month = String(newDate.getMonth() + 1).padStart(2, '0')
    const day = String(newDate.getDate()).padStart(2, '0')
    setSelectedDate(`${year}-${month}-${day}`)
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading shifts...</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Shift Scheduling</h3>
        <div className="flex items-center gap-4 flex-wrap">
          {/* Location Filters */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Show:</span>
            {['kitchen', 'bar', 'serving'].map(location => {
              const labels = { kitchen: 'Kitchen', bar: 'Bar', serving: 'Serving' }
              const colors = {
                kitchen: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
                bar: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
                serving: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
              }
              return (
                <label
                  key={location}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-xs border transition-colors ${visibleLocations[location]
                    ? `${colors[location]} text-gray-900 dark:text-white`
                    : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={visibleLocations[location]}
                    onChange={e => {
                      setVisibleLocations(prev => ({
                        ...prev,
                        [location]: e.target.checked,
                      }))
                    }}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary dark:text-gold focus:ring-primary dark:focus:ring-gold w-3 h-3"
                  />
                  <span>{labels[location]}</span>
                </label>
              )
            })}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">View:</label>
            <select
              value={viewMode}
              onChange={e => setViewMode(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleNavigate(-1)}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              title="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white text-sm"
            />
            <button
              onClick={() => handleNavigate(1)}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              title="Next period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark dark:bg-gold dark:text-primary dark:hover:bg-gold-light flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Shift
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <ShiftForm
            shift={editingShift}
            employees={employees}
            onSuccess={() => {
              fetchShifts()
              setShowForm(false)
              setEditingShift(null)
            }}
            onCancel={() => {
              setShowForm(false)
              setEditingShift(null)
            }}
          />
        </div>
      )}

      {viewMode !== 'month' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
            <div className="p-3 font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
              Time
            </div>
            {getDisplayDates().map((date, idx) => (
              <div
                key={idx}
                className={`p-3 text-center font-medium border-r border-gray-200 dark:border-gray-700 ${viewMode === 'day' ? 'col-span-7' : ''
                  } ${date.toDateString() === new Date().toDateString()
                    ? 'bg-primary/10 dark:bg-gold/10'
                    : ''
                  }`}
              >
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-lg text-gray-900 dark:text-white">{date.getDate()}</div>
              </div>
            ))}
          </div>

          {/* Time-off requests row - always visible */}
          {timeOffRequests.length > 0 &&
            (() => {
              // Define 5 colors for time-off requests
              const timeOffColors = [
                {
                  bg: 'bg-purple-100 dark:bg-purple-900/40',
                  border: 'border-purple-400 dark:border-purple-600',
                  text: 'text-purple-900 dark:text-purple-100',
                  continuation: 'bg-purple-200 dark:bg-purple-800/50',
                },
                {
                  bg: 'bg-orange-100 dark:bg-orange-900/40',
                  border: 'border-orange-400 dark:border-orange-600',
                  text: 'text-orange-900 dark:text-orange-100',
                  continuation: 'bg-orange-200 dark:bg-orange-800/50',
                },
                {
                  bg: 'bg-teal-100 dark:bg-teal-900/40',
                  border: 'border-teal-400 dark:border-teal-600',
                  text: 'text-teal-900 dark:text-teal-100',
                  continuation: 'bg-teal-200 dark:bg-teal-800/50',
                },
                {
                  bg: 'bg-pink-100 dark:bg-pink-900/40',
                  border: 'border-pink-400 dark:border-pink-600',
                  text: 'text-pink-900 dark:text-pink-100',
                  continuation: 'bg-pink-200 dark:bg-pink-800/50',
                },
                {
                  bg: 'bg-indigo-100 dark:bg-indigo-900/40',
                  border: 'border-indigo-400 dark:border-indigo-600',
                  text: 'text-indigo-900 dark:text-indigo-100',
                  continuation: 'bg-indigo-200 dark:bg-indigo-800/50',
                },
              ]

              // Sort all time-off requests by start date, then by duration (longer first), then by name
              const sortedTimeOffs = [...timeOffRequests].sort((a, b) => {
                const aStart = new Date(a.startDate).getTime()
                const bStart = new Date(b.startDate).getTime()
                if (aStart !== bStart) return aStart - bStart

                // If start times are same, put longer duration first
                const aEnd = new Date(a.endDate).getTime()
                const bEnd = new Date(b.endDate).getTime()
                const aDuration = aEnd - aStart
                const bDuration = bEnd - bStart
                if (aDuration !== bDuration) return bDuration - aDuration

                return a.employeeName.localeCompare(b.employeeName)
              })

              // Lane packing algorithm
              const lanes = [] // Array of Date objects representing when each lane becomes free

              const timeOffsWithColors = sortedTimeOffs.map((req, idx) => {
                const reqStart = new Date(req.startDate)
                const reqEnd = new Date(req.endDate)

                // Find the first lane where this request fits
                let laneIndex = -1

                for (let i = 0; i < lanes.length; i++) {
                  const laneFreeDate = lanes[i]

                  // Check if request starts after the lane becomes free
                  // We need to compare dates (YYYY-MM-DD) to avoid time part issues
                  const laneFree = new Date(laneFreeDate)
                  laneFree.setDate(laneFree.getDate() + 1) // Free the day AFTER the last request ended
                  laneFree.setHours(0, 0, 0, 0)

                  const start = new Date(reqStart)
                  start.setHours(0, 0, 0, 0)

                  if (start >= laneFree) {
                    laneIndex = i
                    break
                  }
                }

                // If no lane found, add a new one
                if (laneIndex === -1) {
                  laneIndex = lanes.length
                  lanes.push(reqEnd)
                } else {
                  // Update existing lane
                  lanes[laneIndex] = reqEnd
                }

                return {
                  ...req,
                  colorIndex: idx % 5,
                  colors: timeOffColors[idx % 5],
                  slotIndex: laneIndex,
                }
              })

              const maxOverlaps = lanes.length || 1
              const rowHeight = Math.max(40, maxOverlaps * 30) // Minimum 40px, or 30px per overlapping request

              return (
                <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                  {/* Time-off header */}
                  <div className="grid grid-cols-8 border-b border-gray-300 dark:border-gray-600">
                    <div className="p-2 text-xs font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">
                      Time Off
                    </div>
                    {getDisplayDates().map((date, idx) => (
                      <div
                        key={idx}
                        className={`p-2 border-r border-gray-300 dark:border-gray-600 ${viewMode === 'day' ? 'col-span-7' : ''}`}
                      />
                    ))}
                  </div>

                  {/* Time-off blocks */}
                  <div className="grid grid-cols-8" style={{ minHeight: `${rowHeight}px` }}>
                    <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-r border-b border-gray-200 dark:border-gray-700">
                      All Day
                    </div>
                    {getDisplayDates().map((date, dateIdx) => {
                      const year = date.getFullYear()
                      const month = String(date.getMonth() + 1).padStart(2, '0')
                      const day = String(date.getDate()).padStart(2, '0')
                      const dateStr = `${year}-${month}-${day}`

                      // Find time-off requests that include this date
                      // Use the pre-sorted list with consistent row indices
                      const dayTimeOffs = timeOffsWithColors.filter(req => {
                        const reqStart = new Date(req.startDate)
                        const reqEnd = new Date(req.endDate)

                        const reqStartYear = reqStart.getFullYear()
                        const reqStartMonth = String(reqStart.getMonth() + 1).padStart(2, '0')
                        const reqStartDay = String(reqStart.getDate()).padStart(2, '0')
                        const reqStartDateStr = `${reqStartYear}-${reqStartMonth}-${reqStartDay}`

                        const reqEndYear = reqEnd.getFullYear()
                        const reqEndMonth = String(reqEnd.getMonth() + 1).padStart(2, '0')
                        const reqEndDay = String(reqEnd.getDate()).padStart(2, '0')
                        const reqEndDateStr = `${reqEndYear}-${reqEndMonth}-${reqEndDay}`

                        return dateStr >= reqStartDateStr && dateStr <= reqEndDateStr
                      })

                      // Use consistent item height based on maxOverlaps across all days
                      // This ensures all bars have the same height
                      const itemHeight = Math.max(28, (rowHeight - 4) / maxOverlaps)

                      // Sort by slotIndex to maintain horizontal alignment
                      const sortedDayTimeOffs = [...dayTimeOffs].sort(
                        (a, b) => a.slotIndex - b.slotIndex
                      )

                      return (
                        <div
                          key={dateIdx}
                          className={`p-1 border-r border-b border-gray-200 dark:border-gray-700 relative ${viewMode === 'day' ? 'col-span-7' : ''}`}
                          style={{ minHeight: `${rowHeight}px` }}
                        >
                          {sortedDayTimeOffs.map(req => {
                            const reqStart = new Date(req.startDate)
                            const reqEnd = new Date(req.endDate)

                            const reqStartYear = reqStart.getFullYear()
                            const reqStartMonth = String(reqStart.getMonth() + 1).padStart(2, '0')
                            const reqStartDay = String(reqStart.getDate()).padStart(2, '0')
                            const reqStartDateStr = `${reqStartYear}-${reqStartMonth}-${reqStartDay}`

                            const reqEndYear = reqEnd.getFullYear()
                            const reqEndMonth = String(reqEnd.getMonth() + 1).padStart(2, '0')
                            const reqEndDay = String(reqEnd.getDate()).padStart(2, '0')
                            const reqEndDateStr = `${reqEndYear}-${reqEndMonth}-${reqEndDay}`

                            const isStart = dateStr === reqStartDateStr
                            const isEnd = dateStr === reqEndDateStr

                            // Use slotIndex directly for positioning
                            // This ensures the same request stays on the same horizontal line across all days
                            // Multi-day time-off periods will maintain perfect horizontal alignment
                            const topPosition = req.slotIndex * itemHeight

                            return (
                              <div
                                key={req.id}
                                className={`absolute left-1 right-1 rounded border-2 ${req.colors.border} ${req.colors.bg} z-10 flex items-center justify-center ${isStart ? 'rounded-l-lg' : ''
                                  } ${isEnd ? 'rounded-r-lg' : ''}`}
                                style={{
                                  top: `${topPosition + 2}px`,
                                  height: `${itemHeight - 4}px`,
                                }}
                                title={`${req.employeeName} - ${req.reason || 'Time off'}`}
                              >
                                {isStart ? (
                                  <div
                                    className={`text-xs font-medium ${req.colors.text} px-1 truncate`}
                                  >
                                    {req.employeeName}
                                  </div>
                                ) : (
                                  <div
                                    className={`w-full h-full ${req.colors.continuation} rounded`}
                                  />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

          {/* Calendar rows for each location */}
          {['kitchen', 'bar', 'serving']
            .filter(location => visibleLocations[location])
            .map(location => {
              const locationLabels = {
                kitchen: 'Kitchen',
                bar: 'Bar',
                serving: 'Serving',
              }
              const locationColors = {
                kitchen: {
                  bg: 'bg-red-50 dark:bg-red-900/20',
                  shiftBg: 'bg-red-100 dark:bg-red-900/30',
                  border: 'border-red-300 dark:border-red-700',
                  continuation: 'bg-red-200 dark:bg-red-800/50',
                },
                bar: {
                  bg: 'bg-green-50 dark:bg-green-900/20',
                  shiftBg: 'bg-green-100 dark:bg-green-900/30',
                  border: 'border-green-300 dark:border-green-700',
                  continuation: 'bg-green-200 dark:bg-green-800/50',
                },
                serving: {
                  bg: 'bg-blue-50 dark:bg-blue-900/20',
                  shiftBg: 'bg-blue-100 dark:bg-blue-900/30',
                  border: 'border-blue-300 dark:border-blue-700',
                  continuation: 'bg-blue-200 dark:bg-blue-800/50',
                },
              }
              const colors = locationColors[location]

              return (
                <div
                  key={location}
                  className={`border-b border-gray-200 dark:border-gray-700 ${colors.bg}`}
                >
                  {/* Location header */}
                  <div className="grid grid-cols-8 border-b border-gray-300 dark:border-gray-600">
                    <div className="p-2 text-xs font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">
                      {locationLabels[location]}
                    </div>
                    {getDisplayDates().map((date, idx) => (
                      <div
                        key={idx}
                        className={`p-2 border-r border-gray-300 dark:border-gray-600 ${viewMode === 'day' ? 'col-span-7' : ''}`}
                      />
                    ))}
                  </div>

                  {/* Time rows for this location */}
                  <div className="grid grid-cols-8">
                    {Array.from({ length: 24 }, (_, i) => i).map(hour => {
                      const timeLabel =
                        hour === 0
                          ? '12 AM'
                          : hour < 12
                            ? `${hour} AM`
                            : hour === 12
                              ? '12 PM'
                              : `${hour - 12} PM`
                      return (
                        <div key={hour} className="contents">
                          <div className="p-1 text-xs text-gray-500 dark:text-gray-400 border-r border-b border-gray-200 dark:border-gray-700 min-h-[25px]">
                            {timeLabel}
                          </div>
                          {getDisplayDates().map((date, dateIdx) => {
                            const dateShifts = getShiftsForDate(date)

                            // Get date string in local timezone
                            const year = date.getFullYear()
                            const month = String(date.getMonth() + 1).padStart(2, '0')
                            const day = String(date.getDate()).padStart(2, '0')
                            const dateStr = `${year}-${month}-${day}`

                            // Filter shifts for this location and time
                            const cellShifts = dateShifts.filter(shift => {
                              const shiftLocation = shift.location || 'serving'
                              if (shiftLocation !== location) return false

                              const shiftStart = new Date(shift.startTime)
                              const shiftEnd = new Date(shift.endTime)

                              // Get shift dates in local timezone
                              const shiftStartYear = shiftStart.getFullYear()
                              const shiftStartMonth = String(shiftStart.getMonth() + 1).padStart(
                                2,
                                '0'
                              )
                              const shiftStartDay = String(shiftStart.getDate()).padStart(2, '0')
                              const shiftStartDateStr = `${shiftStartYear}-${shiftStartMonth}-${shiftStartDay}`

                              const shiftEndYear = shiftEnd.getFullYear()
                              const shiftEndMonth = String(shiftEnd.getMonth() + 1).padStart(2, '0')
                              const shiftEndDay = String(shiftEnd.getDate()).padStart(2, '0')
                              const shiftEndDateStr = `${shiftEndYear}-${shiftEndMonth}-${shiftEndDay}`

                              // Determine the actual start and end times for this date
                              let actualStart = shiftStart
                              let actualEnd = shiftEnd

                              // If shift spans multiple days
                              if (shiftStartDateStr !== shiftEndDateStr) {
                                if (dateStr === shiftStartDateStr) {
                                  // First day: use actual shift start, end at midnight next day
                                  actualEnd = new Date(date)
                                  actualEnd.setHours(23, 59, 59, 999)
                                } else if (dateStr === shiftEndDateStr) {
                                  // Last day: start at midnight, use actual shift end
                                  actualStart = new Date(date)
                                  actualStart.setHours(0, 0, 0, 0)
                                } else {
                                  // Middle day: full day
                                  actualStart = new Date(date)
                                  actualStart.setHours(0, 0, 0, 0)
                                  actualEnd = new Date(date)
                                  actualEnd.setHours(23, 59, 59, 999)
                                }
                              }

                              const cellStart = new Date(date)
                              cellStart.setHours(hour, 0, 0, 0)
                              const cellEnd = new Date(date)
                              cellEnd.setHours(hour + 1, 0, 0, 0)

                              // Check if shift overlaps with this hour cell
                              return actualStart < cellEnd && actualEnd > cellStart
                            })

                            return (
                              <div
                                key={dateIdx}
                                className={`p-0.5 border-r border-b border-gray-200 dark:border-gray-700 min-h-[25px] relative ${viewMode === 'day' ? 'col-span-7' : ''}`}
                              >
                                {cellShifts.map((shift, shiftIdx) => {
                                  const shiftStart = new Date(shift.startTime)
                                  const shiftEnd = new Date(shift.endTime)

                                  // Get dates in local timezone
                                  const year = date.getFullYear()
                                  const month = String(date.getMonth() + 1).padStart(2, '0')
                                  const day = String(date.getDate()).padStart(2, '0')
                                  const dateStr = `${year}-${month}-${day}`

                                  const shiftStartYear = shiftStart.getFullYear()
                                  const shiftStartMonth = String(
                                    shiftStart.getMonth() + 1
                                  ).padStart(2, '0')
                                  const shiftStartDay = String(shiftStart.getDate()).padStart(
                                    2,
                                    '0'
                                  )
                                  const shiftStartDateStr = `${shiftStartYear}-${shiftStartMonth}-${shiftStartDay}`

                                  const shiftEndYear = shiftEnd.getFullYear()
                                  const shiftEndMonth = String(shiftEnd.getMonth() + 1).padStart(
                                    2,
                                    '0'
                                  )
                                  const shiftEndDay = String(shiftEnd.getDate()).padStart(2, '0')
                                  const shiftEndDateStr = `${shiftEndYear}-${shiftEndMonth}-${shiftEndDay}`

                                  // Determine the actual start and end times for this date
                                  let displayStart = shiftStart
                                  let displayEnd = shiftEnd

                                  // If shift spans multiple days
                                  if (shiftStartDateStr !== shiftEndDateStr) {
                                    if (dateStr === shiftStartDateStr) {
                                      // First day: use actual shift start, end at midnight next day
                                      displayEnd = new Date(date)
                                      displayEnd.setHours(23, 59, 59, 999)
                                    } else if (dateStr === shiftEndDateStr) {
                                      // Last day: start at midnight, use actual shift end
                                      displayStart = new Date(date)
                                      displayStart.setHours(0, 0, 0, 0)
                                    } else {
                                      // Middle day: full day
                                      displayStart = new Date(date)
                                      displayStart.setHours(0, 0, 0, 0)
                                      displayEnd = new Date(date)
                                      displayEnd.setHours(23, 59, 59, 999)
                                    }
                                  }

                                  const cellStart = new Date(date)
                                  cellStart.setHours(hour, 0, 0, 0)
                                  const cellEnd = new Date(date)
                                  cellEnd.setHours(hour + 1, 0, 0, 0)

                                  // Calculate position and height within cell
                                  const shiftStartInCell = Math.max(
                                    displayStart.getTime(),
                                    cellStart.getTime()
                                  )
                                  const shiftEndInCell = Math.min(
                                    displayEnd.getTime(),
                                    cellEnd.getTime()
                                  )
                                  const cellDuration = cellEnd.getTime() - cellStart.getTime()
                                  const shiftDuration = shiftEndInCell - shiftStartInCell

                                  const topPercent =
                                    ((shiftStartInCell - cellStart.getTime()) / cellDuration) * 100
                                  const heightPercent = (shiftDuration / cellDuration) * 100

                                  // Check if this is the first cell of the shift (where it actually starts)
                                  const isFirstCell =
                                    shiftStart.getHours() === hour && shiftStartDateStr === dateStr

                                  return (
                                    <div
                                      key={`${shift.id}-${dateIdx}-${hour}-${shiftIdx}`}
                                      className={`absolute left-0.5 right-0.5 rounded text-xs p-0.5 border z-10 overflow-hidden ${colors.shiftBg} ${colors.border}`}
                                      style={{
                                        top: `${topPercent}%`,
                                        height: `${Math.max(heightPercent, 20)}%`,
                                        minHeight: '9px',
                                      }}
                                    >
                                      {isFirstCell ? (
                                        <>
                                          <div className="font-medium truncate text-[9px] leading-none">
                                            {shift.employeeName}
                                          </div>
                                          <div className="text-gray-600 dark:text-gray-400 text-[8px] truncate leading-none">
                                            {formatTime(shiftStart)} - {formatTime(shiftEnd)}
                                          </div>
                                        </>
                                      ) : (
                                        <div className={`h-full ${colors.continuation}`} />
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {viewMode === 'month' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Month Header */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className="p-3 text-center font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7 auto-rows-fr">
            {(() => {
              const days = getMonthDates(selectedDate)
              const localSelectedDate = new Date(`${selectedDate}T00:00:00`)

              return days.map((date, idx) => {
                const isCurrentMonth = date.getMonth() === localSelectedDate.getMonth()
                const isToday = date.toDateString() === new Date().toDateString()
                const dateShifts = getShiftsForDate(date)

                // Get date string for filtering time-off
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                const dateStr = `${year}-${month}-${day}`

                // Filter time-off requests for this date
                const dateTimeOffs = timeOffRequests.filter(req => {
                  const reqStart = new Date(req.startDate)
                  const reqEnd = new Date(req.endDate)

                  const reqStartYear = reqStart.getFullYear()
                  const reqStartMonth = String(reqStart.getMonth() + 1).padStart(2, '0')
                  const reqStartDay = String(reqStart.getDate()).padStart(2, '0')
                  const reqStartDateStr = `${reqStartYear}-${reqStartMonth}-${reqStartDay}`

                  const reqEndYear = reqEnd.getFullYear()
                  const reqEndMonth = String(reqEnd.getMonth() + 1).padStart(2, '0')
                  const reqEndDay = String(reqEnd.getDate()).padStart(2, '0')
                  const reqEndDateStr = `${reqEndYear}-${reqEndMonth}-${reqEndDay}`

                  return dateStr >= reqStartDateStr && dateStr <= reqEndDateStr
                })

                return (
                  <div
                    key={idx}
                    className={`min-h-[100px] p-2 border-b border-r border-gray-200 dark:border-gray-700 ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900/50' : ''
                      } ${isToday ? 'bg-primary/5 dark:bg-gold/5' : ''} ${(idx + 1) % 7 === 0 ? 'border-r-0' : ''
                      }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className={`text-sm font-medium ${isToday
                          ? 'text-primary dark:text-gold bg-primary/10 dark:bg-gold/10 px-1.5 rounded-full'
                          : isCurrentMonth
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-400 dark:text-gray-500'
                          }`}
                      >
                        {date.getDate()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {/* Time Off Indicators */}
                      {dateTimeOffs.map((req, i) => (
                        <div
                          key={`to-${i}`}
                          className="text-[10px] px-1 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-100 truncate border border-purple-200 dark:border-purple-800"
                          title={`${req.employeeName} - ${req.reason || 'Time off'}`}
                        >
                          {req.employeeName}
                        </div>
                      ))}

                      {/* Shift Indicators */}
                      {dateShifts.slice(0, 3).map((shift, i) => {
                        const locationColors = {
                          kitchen:
                            'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
                          bar: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
                          serving:
                            'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
                        }
                        const colorClass = locationColors[shift.location || 'serving']

                        if (!visibleLocations[shift.location || 'serving']) return null

                        return (
                          <div
                            key={`sh-${i}`}
                            className={`text-[10px] px-1 py-0.5 rounded border truncate cursor-pointer ${colorClass}`}
                            onClick={() => {
                              setEditingShift(shift)
                              setShowForm(true)
                            }}
                            title={`${shift.employeeName} (${formatTime(shift.startTime)} - ${formatTime(shift.endTime)})`}
                          >
                            <span className="font-medium">{shift.employeeName}</span>
                            <span className="opacity-75 ml-1">{formatTime(shift.startTime)}</span>
                          </div>
                        )
                      })}

                      {dateShifts.length > 3 && (
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 pl-1">
                          +{dateShifts.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      )}

      {/* List View */}
      <div className="space-y-3">
        {shifts.map(shift => (
          <div
            key={shift.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {shift.employeeName}
                  </h4>
                  <span className="text-sm px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded">
                    {shift.role}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${shift.status === 'scheduled'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                      : shift.status === 'completed'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                  >
                    {shift.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(shift.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                    </span>
                  </div>
                  {shift.breakDuration > 0 && <span>Break: {shift.breakDuration} min</span>}
                </div>
                {shift.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{shift.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingShift(shift)
                    setShowForm(true)
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="Edit shift"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(shift.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  title="Delete shift"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
