'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Calendar, User, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ShiftRequests({ barId }) {
  const [requests, setRequests] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams({ barId: barId })
      if (filterStatus !== 'all') {
        params.append('status', filterStatus)
      }

      const response = await fetch(`/api/admin/staff/requests?${params}`)
      const data = await response.json()
      if (data.requests) {
        setRequests(data.requests)
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`/api/admin/staff/employees?barId=${barId}`)
      const data = await response.json()
      if (data.employees) {
        setEmployees(data.employees)
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    }
  }

  useEffect(() => {
    if (barId) {
      fetchRequests()
      fetchEmployees()
    }
  }, [filterStatus, barId])

  const handleApprove = async requestId => {
    try {
      const response = await fetch(`/api/admin/staff/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Request approved successfully')
        fetchRequests()
      } else {
        toast.error('Failed to approve: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Approve error:', error)
      toast.error('Failed to approve: ' + error.message)
    }
  }

  const handleReject = async requestId => {
    const reason = prompt('Please provide a reason for rejection (optional):')
    try {
      const response = await fetch(`/api/admin/staff/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          notes: reason || '',
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Request rejected')
        fetchRequests()
      } else {
        toast.error('Failed to reject: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Reject error:', error)
      toast.error('Failed to reject: ' + error.message)
    }
  }

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading requests...</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Shift Requests & Time Off
        </h3>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">No requests found.</div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => (
            <div
              key={request.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {request.employeeName}
                    </h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${request.type === 'time_off'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                        }`}
                    >
                      {request.type === 'time_off' ? 'Time Off' : 'Shift Swap'}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${request.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                        : request.status === 'approved'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                        }`}
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </span>
                    </div>
                    {request.type === 'shift_swap' && request.targetEmployeeName && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Swap with: {request.targetEmployeeName}</span>
                      </div>
                    )}
                  </div>

                  {request.reason && (
                    <div className="flex items-start gap-2 mb-3">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">{request.reason}</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Requested: {formatDate(request.requestedAt)}
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
