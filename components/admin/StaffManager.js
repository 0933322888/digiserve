'use client'

import { useState } from 'react'
import EmployeeList from '@/components/admin/staff/EmployeeList'
import ShiftScheduler from '@/components/admin/staff/ShiftScheduler'
import ShiftRequests from '@/components/admin/staff/ShiftRequests'
import TimeTracking from '@/components/admin/staff/TimeTracking'
import PayrollReports from '@/components/admin/staff/PayrollReports'
import RoleManagement from '@/components/admin/staff/RoleManagement'
import { Users, Calendar, Clock, DollarSign, Shield, ClipboardList } from 'lucide-react'

export default function StaffManager({ barId }) {
    const [activeTab, setActiveTab] = useState('employees')

    const tabs = [
        { id: 'employees', label: 'Employees', icon: Users, component: EmployeeList },
        { id: 'schedule', label: 'Schedule', icon: Calendar, component: ShiftScheduler },
        { id: 'requests', label: 'Requests', icon: ClipboardList, component: ShiftRequests },
        { id: 'time', label: 'Time Clock', icon: Clock, component: TimeTracking },
        { id: 'payroll', label: 'Payroll', icon: DollarSign, component: PayrollReports },
        { id: 'roles', label: 'Roles', icon: Shield, component: RoleManagement },
    ]

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  ${activeTab === tab.id
                                        ? 'border-primary text-primary-text'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }
                `}
                            >
                                <Icon className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${activeTab === tab.id ? 'text-primary-text' : 'text-gray-400 group-hover:text-gray-500'}
                `} />
                                {tab.label}
                            </button>
                        )
                    })}
                </nav>
            </div>

            <div className="mt-6">
                {tabs.map((tab) => (
                    activeTab === tab.id && (
                        <div key={tab.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <tab.component barId={barId} />
                        </div>
                    )
                ))}
            </div>
        </div>
    )
}
