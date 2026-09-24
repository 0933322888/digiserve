'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Shield, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react'

export default function SuperAdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if already authenticated as super-admin
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/super-admin/auth/session')
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated && data.role === 'super-admin') {
            setIsAuthenticated(true)
            const redirectTo = searchParams.get('from') || '/super-admin'
            router.push(redirectTo)
          }
        }
      } catch (err) {
        console.error('Super Admin session check error:', err)
      }
    }
    checkSession()
  }, [router, searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/super-admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Authentication failed')
        setLoading(false)
        return
      }

      const redirectTo = searchParams.get('from') || '/super-admin'
      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      console.error('Super Admin login error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-300">
        Redirecting to Super Admin Console...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-xl shadow-purple-900/20">
            <Shield className="w-8 h-8" />
          </div>
        </div>

        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Super Admin Console
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Platform-level authentication & management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-800/60 rounded-xl flex items-start gap-3 text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                Super Admin Email
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="superadmin@trio.app"
                  disabled={loading}
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-950/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={loading}
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-950/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Authenticating...' : 'Sign in to Platform Console'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Platform Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
