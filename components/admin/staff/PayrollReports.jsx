'use client'

import { useState } from 'react'
import { Calendar, DollarSign, Download, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function PayrollReports({ barId }) {
  const [payroll, setPayroll] = useState([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(1) // First day of current month
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    const date = new Date()
    return date.toISOString().split('T')[0]
  })

  const fetchPayroll = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/admin/staff/payroll?barId=${barId}&startDate=${startDate}&endDate=${endDate}`
      )
      const data = await response.json()
      if (data.payroll) {
        setPayroll(data.payroll)
      }
    } catch (error) {
      console.error('Failed to fetch payroll:', error)
      toast.error('Failed to fetch payroll: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = () => {
    fetchPayroll()
  }

  const totalPayroll = payroll.reduce((sum, emp) => sum + emp.totalPay, 0)
  const totalHours = payroll.reduce((sum, emp) => sum + emp.totalHours, 0)
  const totalOvertime = payroll.reduce((sum, emp) => sum + emp.overtimeHours, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Payroll Reports</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
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
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark dark:bg-gold dark:text-gray-900 dark:hover:bg-gold-light flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {payroll.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md p-3 bg-blue-500">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Payroll
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {formatPrice(totalPayroll)}
                  </dd>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md p-3 bg-green-500">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Hours
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {totalHours.toFixed(2)}h
                  </dd>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md p-3 bg-orange-500">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Overtime Hours
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {totalOvertime.toFixed(2)}h
                  </dd>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md p-3 bg-purple-500">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Employees
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {payroll.length}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Payroll Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Regular Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Overtime Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Regular Pay
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Overtime Pay
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Pay
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {payroll.map(emp => (
                    <tr key={emp.employeeId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {emp.employeeName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {emp.regularHours.toFixed(2)}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {emp.overtimeHours.toFixed(2)}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatPrice(emp.regularPay)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 dark:text-orange-400">
                        {formatPrice(emp.overtimePay)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        {formatPrice(emp.totalPay)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white"
                    >
                      Total:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      {formatPrice(totalPayroll)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {payroll.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Select a date range and click "Generate Report" to view payroll data.
        </div>
      )}
    </div>
  )
}
