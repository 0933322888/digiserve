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
  ChevronLeft,
  Monitor,
  Grid,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import CommandPalette from '@/components/admin/CommandPalette'

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


  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Build navigation groups with disabled flags
  const navigationGroups = [
    {
      title: 'Operations',
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        {
          name: 'Orders',
          href: '/admin/orders',
          icon: ShoppingCart,
          badge: pendingOrders,
          disabled: disableOrders,
        },
        {
          name: 'Reservations',
          href: '/admin/reservations',
          icon: Calendar,
          badge: pendingReservations,
          disabled: disableReservations,
        },
        {
          name: 'Gift Cards',
          href: '/admin/gift-cards',
          icon: Gift,
          disabled: disableGiftCards,
        },
        {
          name: 'Kitchen View',
          href: '/admin/kitchen',
          icon: Monitor,
          disabled: false,
        },
        {
          name: 'Floor Plan',
          href: '/admin/floor-plan',
          icon: Grid,
          disabled: false,
        },
      ]
    },
    {
      title: 'Management',
      items: [
        { name: 'Menu', href: '/admin/menu', icon: UtensilsCrossed },
        { name: 'Staff', href: '/admin/staff', icon: Users },
        { name: 'Customers', href: '/admin/customers', icon: Users, disabled: true }, // Placeholder
        { name: 'Inventory', disabled: true, href: '/admin/inventory', icon: Package },
      ]
    },
    {
      title: 'Content & Marketing',
      items: [
        { name: 'Social Media', href: '/admin/social-posting', icon: Share2 },
        {
          name: 'Events',
          href: '/admin/events',
          icon: CalendarDays,
          disabled: disableEvents,
        },
        {
          name: 'Gallery',
          href: '/admin/gallery',
          icon: Image,
          disabled: disableGallery,
        },
        { name: 'Announcements', href: '/admin/announcements', icon: AlertCircle },
        { name: 'Loyalty Program', disabled: true, href: '/admin/loyalty', icon: Star },
        { name: 'Promotions', disabled: true, href: '/admin/promotions', icon: Tag },
      ]
    },
    {
      title: 'Analytics',
      items: [
        { name: 'Reports', disabled: false, href: '/admin/analytics', icon: BarChart3 },
      ]
    }
  ]

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
      <CommandPalette />
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 md:sticky md:top-0 md:h-screen md:z-30 ${isSidebarCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        <div className="flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 px-4">
          {!isSidebarCollapsed && (
            <h1 className="text-xl font-bold text-primary dark:text-gold truncate">Admin</h1>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hidden md:block"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        <nav className="mt-5 px-2 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
          {navigationGroups.map((group, groupIndex) => (
            <div key={group.title || groupIndex}>
              {!isSidebarCollapsed && group.title && (
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href

                  if (item.disabled) return null;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${isActive
                        ? 'bg-primary text-white dark:bg-gold dark:text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                        } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                      title={isSidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={`h-6 w-6 flex-shrink-0 ${isActive
                          ? 'text-white dark:text-gray-900'
                          : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                          } ${!isSidebarCollapsed ? 'mr-3' : ''}`}
                      />
                      {!isSidebarCollapsed && (
                        <span className="flex-1 truncate">{item.name}</span>
                      )}

                      {!isSidebarCollapsed && item.badge > 0 && (
                        <span
                          className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full ${isActive ? 'bg-red-500 text-white' : ''
                            }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {isSidebarCollapsed && item.badge > 0 && (
                        <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-red-600 transform translate-x-1/2 -translate-y-1/2" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Settings Section - at bottom before logout */}
        <div className="mt-auto p-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <Link
            href="/admin/settings"
            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${pathname === '/admin/settings'
              ? 'bg-primary text-white dark:bg-gold dark:text-gray-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              } ${isSidebarCollapsed ? 'justify-center' : ''}`}
            title="Settings"
          >
            <Settings
              className={`h-6 w-6 flex-shrink-0 ${pathname === '/admin/settings'
                ? 'text-white dark:text-gray-900'
                : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                } ${!isSidebarCollapsed ? 'mr-3' : ''}`}
            />
            {!isSidebarCollapsed && <span>Settings</span>}
          </Link>
        </div>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          {!isSidebarCollapsed && username && (
            <div className="mb-2 px-2 text-sm text-gray-500 dark:text-gray-400 truncate">
              {username}
            </div>
          )}
          <LogoutButton collapsed={isSidebarCollapsed} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-40 shadow-sm">
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
          <h1 className="text-lg font-bold text-primary dark:text-gold">Restaurant Admin</h1>
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
