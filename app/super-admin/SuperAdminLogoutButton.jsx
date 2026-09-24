'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut } from 'lucide-react'

export default function SuperAdminLogoutButton() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/super-admin/auth/logout', {
        method: 'POST',
      })
      window.location.href = '/super-admin/login'
    } catch (error) {
      console.error('Super Admin logout error:', error)
      window.location.href = '/super-admin/login'
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 flex items-center gap-1.5 transition px-2.5 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
      title="Log out of Super Admin"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
    </button>
  )
}
