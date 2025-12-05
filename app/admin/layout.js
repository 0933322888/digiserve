'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/LogoutButton'
import {
  LayoutDashboard,
  Gift,
  Calendar,
  UtensilsCrossed,
  Menu,
  Share2,
  ShoppingCart,
  BarChart3,
  Users,
  Package,
  Star,
  Tag,
  LogOut,
  Settings,
  Lock,
  Image,
  CalendarDays,
  AlertCircle,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Toaster } from 'react-hot-toast'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [pendingReservations, setPendingReservations] = useState(0)
  const [confirmedReservations, setConfirmedReservations] = useState(0)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [socialPostingEnabled, setSocialPostingEnabled] = useState(false)
  const [moduleStatus, setModuleStatus] = useState({
    reservations: true,
    orders: true,
    giftCards: true,
    events: true,
    gallery: true,
  })
  const [username, setUsername] = useState(null)
  const [tenantId, setTenantId] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(null) // null = checking, true = authenticated, false = not authenticated

  // Check if we're on the login page - if so, don't render the sidebar
  const isLoginPage = pathname === '/admin/login'

  // Check authentication status first (skip for login page)
  useEffect(() => {
    console.log(`[AdminLayout] Auth useEffect running. Path: ${pathname}, isLoginPage: ${isLoginPage}`);
    // Don't check authentication on login page
    if (isLoginPage) {
      // On the login page, the user is not authenticated.
      setIsAuthenticated(false)
      return
    }

    const checkAuthentication = async () => {
      console.log('[AdminLayout] checkAuthentication() called.');
      try {
        const res = await fetch('/api/admin/auth/session')
        console.log(`[AdminLayout] /api/admin/auth/session response status: ${res.status}`);
        if (res.ok) {
          const data = await res.json()
          console.log('[AdminLayout] Session data:', data);
          if (data.authenticated) {
            console.log('[AdminLayout] User is authenticated. Setting state.');
            setIsAuthenticated(true)
            setUsername(data.username)
            // Use first tenant ID if available
            if (data.tenantIds && data.tenantIds.length > 0) {
              setTenantId(data.tenantIds[0])
            }
            // Stats will be fetched in the second useEffect after authentication is confirmed
          } else {
            console.log('[AdminLayout] User is NOT authenticated. Redirecting to login.');
            setIsAuthenticated(false)
            // Redirect to login if not authenticated
            router.push('/admin/login?from=' + encodeURIComponent(pathname))
          }
        } else {
          console.log('[AdminLayout] Session check failed (res not ok). Redirecting to login.');
          setIsAuthenticated(false)
          router.push('/admin/login?from=' + encodeURIComponent(pathname))
        }
      } catch (error) {
        console.error('Failed to fetch session', error)
        console.log('[AdminLayout] Session check failed (catch block). Redirecting to login.');
        setIsAuthenticated(false)
        router.push('/admin/login?from=' + encodeURIComponent(pathname))
      }
    }

    checkAuthentication()
  }, [router, pathname, isLoginPage])

  const fetchStats = async (tid) => {
    try {
      const headers = {}
      if (tid) headers['x-tenant-id'] = tid

      const res = await fetch('/api/admin/stats', { headers })
      if (res.ok) {
        const data = await res.json()
        setPendingReservations(data.reservations?.pending || 0)
        setConfirmedReservations(data.reservations?.confirmed || 0)
        setPendingOrders(data.orders?.pending || 0)
      }
    } catch (error) {
      console.error('Failed to fetch admin stats', error)
    }
  }

  const fetchModuleStatus = async (tid) => {
    try {
      const headers = {}
      if (tid) headers['x-tenant-id'] = tid

      const res = await fetch('/api/modules/status', { headers })
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.modules) {
          setModuleStatus({
            reservations: data.modules.reservations,
            orders: data.modules.ordering,
            giftCards: data.modules.giftCards,
            events: data.modules.events,
            gallery: data.modules.gallery,
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch module status', error)
    }
  }

  // Fetch stats and module status periodically after authentication
  useEffect(() => {
    console.log(`[AdminLayout] Stats useEffect running. isAuthenticated: ${isAuthenticated}, tenantId: ${tenantId}`);
    if (!isAuthenticated || !tenantId) return
    console.log('[AdminLayout] Auth confirmed. Fetching stats and module status.');

    fetchStats(tenantId)
    fetchModuleStatus(tenantId)
    const interval = setInterval(() => {
      fetchStats(tenantId)
      fetchModuleStatus(tenantId)
    }, 30000)

    // Check if social posting is enabled
    const checkSocialPosting = async () => {
      try {
        // We'll check by trying to access the config or API
        // For now, we'll include it and let the page handle the disabled state
        setSocialPostingEnabled(true)
      } catch (error) {
        setSocialPostingEnabled(false)
      }
    }

    checkSocialPosting()

    // Listen for updates from child components
    const handleStatsUpdate = () => fetchStats(tenantId)
    const handleModuleUpdate = () => fetchModuleStatus(tenantId)

    window.addEventListener('reservation-updated', handleStatsUpdate)
    window.addEventListener('order-updated', handleStatsUpdate)
    window.addEventListener('module-settings-updated', handleModuleUpdate)

    return () => {
      clearInterval(interval)
      window.removeEventListener('reservation-updated', handleStatsUpdate)
      window.removeEventListener('order-updated', handleStatsUpdate)
      window.removeEventListener('module-settings-updated', handleModuleUpdate)
    }
  }, [isAuthenticated, tenantId])

  // Calculate if navigation items should be disabled
  // For reservations, only count pending as "open" - confirmed reservations are already handled
  const hasOpenReservations = pendingReservations > 0
  const disableReservations = !moduleStatus.reservations && !hasOpenReservations
  const disableOrders = !moduleStatus.orders && pendingOrders === 0
  const disableGiftCards = !moduleStatus.giftCards
  const disableEvents = !moduleStatus.events
  const disableGallery = !moduleStatus.gallery


  // Build navigation array with disabled flags
  const navigationItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    {
      name: 'Gift Cards',
      href: '/admin/gift-cards',
      icon: Gift,
      disabled: disableGiftCards,
    },
    {
      name: 'Reservations',
      href: '/admin/reservations',
      icon: Calendar,
      badge: pendingReservations,
      disabled: disableReservations,
    },
    {
      name: 'Online Orders',
      href: '/admin/orders',
      icon: ShoppingCart,
      badge: pendingOrders,
      disabled: disableOrders,
    },
    { name: 'Menu Management', href: '/admin/menu', icon: UtensilsCrossed },
    { name: 'Social Media', href: '/admin/social-posting', icon: Share2 },
    {
      name: 'Events',
      href: '/admin/events',
      icon: CalendarDays,
      disabled: disableEvents,
    },
    { name: 'Announcements', href: '/admin/announcements', icon: AlertCircle },
    {
      name: 'Gallery',
      href: '/admin/gallery',
      icon: Image,
      disabled: disableGallery,
    },
    { name: 'Staff Management', href: '/admin/staff', icon: Users },
    { divider: true },
    { name: 'Analytics', disabled: false, href: '/admin/analytics', icon: BarChart3 },
    { name: 'Inventory', disabled: true, href: '/admin/inventory', icon: Package },
    { name: 'Loyalty Program', disabled: true, href: '/admin/loyalty', icon: Star },
    { name: 'Happy Hour & Promo', disabled: true, href: '/admin/promotions', icon: Tag },
  ]

  // Filter out disabled items and preserve dividers
  const navigation = []

  for (const item of navigationItems) {
    if (item.divider) {
      // Only add divider if there are items before it
      if (navigation.length > 0 && navigation[navigation.length - 1]?.divider !== true) {
        navigation.push(item)
      }
    } else if (!item.disabled) {
      // Only add items that are not disabled
      navigation.push(item)
    }
  }

  // Remove trailing divider if present
  if (navigation.length > 0 && navigation[navigation.length - 1]?.divider === true) {
    navigation.pop()
  }

  // Show loading state while checking authentication (but not on login page)
  if (!isLoginPage && isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-gold mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render sidebar/content if not authenticated (redirect will happen)
  if (!isLoginPage && isAuthenticated === false) {
    return null
  }

  // On login page, don't show sidebar - just render children
  if (isLoginPage) {
    return <>{children}</>
  }

  // Only render sidebar and content when authenticated (and not on login page)
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-0`}
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h1 className="text-xl font-bold text-primary dark:text-gold">TRIO Admin</h1>
        </div>
        <nav className="mt-5 px-2 space-y-1 flex-1 overflow-y-auto">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href
            const isDivider = item.divider

            if (isDivider) {
              return (
                <div
                  key={`divider-${index}`}
                  className="my-2 border-t border-gray-200 dark:border-gray-700"
                ></div>
              )
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between px-2 py-2 text-base font-medium rounded-md transition-colors ${isActive
                  ? 'bg-primary text-white dark:bg-gold dark:text-primary'
                  : item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
                onClick={e => item.disabled && e.preventDefault()}
              >
                <div className="flex items-center">
                  <item.icon
                    className={`mr-4 h-6 w-6 ${isActive
                      ? 'text-white dark:text-primary'
                      : item.disabled
                        ? 'text-gray-400'
                        : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                      }`}
                  />
                  {item.name}
                  {item.disabled && (
                    <Lock className="ml-2 h-4 w-4 text-yellow-400" title="Module disabled" />
                  )}
                </div>
                {item.badge > 0 && (
                  <span
                    className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full ${isActive ? 'bg-red-500 text-white' : ''}`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Settings Section - at bottom before logout */}
        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <Link
            href="/admin/settings"
            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${pathname === '/admin/settings'
              ? 'bg-primary text-white dark:bg-gold dark:text-primary'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
          >
            <Settings
              className={`mr-4 h-6 w-6 ${pathname === '/admin/settings'
                ? 'text-white dark:text-primary'
                : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                }`}
            />
            Settings
          </Link>
        </div>

        {/* Logout Section */}
        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          {username && (
            <div className="mb-2 px-2 text-sm text-gray-500 dark:text-gray-400 truncate">
              {username}
            </div>
          )}
          <LogoutButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {pathname === '/admin' ? 'Dashboard Overview' : pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Admin'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {username && (
              <span className="text-sm text-gray-600 dark:text-gray-400">{username}</span>
            )}
            <LogoutButton />
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
          <h1 className="text-lg font-bold text-primary dark:text-gold">TRIO Admin</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg, #fff)',
            color: 'var(--toast-color, #333)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}
