'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Search,
    X,
    LayoutDashboard,
    ShoppingCart,
    Calendar,
    Gift,
    UtensilsCrossed,
    Share2,
    CalendarDays,
    Image,
    Users,
    BarChart3,
    Settings,
    PlusCircle,
    LogOut
} from 'lucide-react'

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const router = useRouter()

    // Toggle with Ctrl+K or Cmd+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsOpen(prev => !prev)
            }

            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    // Reset selection when query changes
    useEffect(() => {
        setSelectedIndex(0)
    }, [query])

    const commands = [
        // Navigation
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, group: 'Navigation' },
        { name: 'Online Orders', href: '/admin/orders', icon: ShoppingCart, group: 'Navigation' },
        { name: 'Reservations', href: '/admin/reservations', icon: Calendar, group: 'Navigation' },
        { name: 'Gift Cards', href: '/admin/gift-cards', icon: Gift, group: 'Navigation' },
        { name: 'Menu Management', href: '/admin/menu', icon: UtensilsCrossed, group: 'Navigation' },
        { name: 'Social Media', href: '/admin/social-posting', icon: Share2, group: 'Navigation' },
        { name: 'Events', href: '/admin/events', icon: CalendarDays, group: 'Navigation' },
        { name: 'Gallery', href: '/admin/gallery', icon: Image, group: 'Navigation' },
        { name: 'Staff', href: '/admin/staff', icon: Users, group: 'Navigation' },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, group: 'Navigation' },
        { name: 'Settings', href: '/admin/settings', icon: Settings, group: 'Navigation' },

        // Quick Actions
        { name: 'Create New Post', href: '/admin/social-posting?action=new', icon: PlusCircle, group: 'Actions' },
        { name: 'New Reservation', href: '/admin/reservations/new', icon: PlusCircle, group: 'Actions' },
        { name: 'Review Pending Orders', href: '/admin/orders?status=pending', icon: ShoppingCart, group: 'Actions' },

        // System
        { name: 'Logout', action: () => document.getElementById('logout-btn')?.click(), icon: LogOut, group: 'System' },
    ]

    const filteredCommands = commands.filter(cmd =>
        cmd.name.toLowerCase().includes(query.toLowerCase())
    )

    const handleSelect = (cmd) => {
        if (cmd.href) {
            router.push(cmd.href)
        } else if (cmd.action) {
            cmd.action()
        }
        setIsOpen(false)
        setQuery('')
    }

    // Keyboard navigation within the list
    useEffect(() => {
        if (!isOpen) return

        const handleListNav = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex(prev => (prev + 1) % filteredCommands.length)
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length)
            } else if (e.key === 'Enter') {
                e.preventDefault()
                if (filteredCommands[selectedIndex]) {
                    handleSelect(filteredCommands[selectedIndex])
                }
            }
        }

        window.addEventListener('keydown', handleListNav)
        return () => window.removeEventListener('keydown', handleListNav)
    }, [isOpen, filteredCommands, selectedIndex])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto p-4 sm:p-6 md:p-20">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-500/25 dark:bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setIsOpen(false)}
            />

            {/* Palette Modal */}
            <div className="mx-auto max-w-xl transform divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-black/5 transition-all">
                <div className="relative">
                    <Search className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                        placeholder="Search commands... (Navigation, Actions)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>

                {filteredCommands.length > 0 ? (
                    <div className="max-h-96 scroll-py-3 overflow-y-auto p-3">
                        {['Navigation', 'Actions', 'System'].map(group => {
                            const groupCommands = filteredCommands.filter(cmd => cmd.group === group)
                            if (groupCommands.length === 0) return null

                            return (
                                <div key={group}>
                                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        {group}
                                    </div>
                                    <ul className="text-sm text-gray-700 dark:text-gray-300">
                                        {groupCommands.map((cmd) => {
                                            const isActive = filteredCommands.indexOf(cmd) === selectedIndex
                                            return (
                                                <li
                                                    key={cmd.name}
                                                    className={`group flex cursor-default select-none items-center rounded-md px-3 py-2 ${isActive
                                                            ? 'bg-primary/10 text-primary dark:bg-gold/10 dark:text-gold'
                                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                    onClick={() => handleSelect(cmd)}
                                                    onMouseEnter={() => setSelectedIndex(filteredCommands.indexOf(cmd))}
                                                >
                                                    <cmd.icon
                                                        className={`h-5 w-5 flex-none mr-3 ${isActive ? 'text-primary dark:text-gold' : 'text-gray-400'
                                                            }`}
                                                    />
                                                    <span className="flex-auto truncate">{cmd.name}</span>
                                                    {isActive && (
                                                        <span className="ml-3 flex-none text-xs text-gray-400">
                                                            Jump to
                                                        </span>
                                                    )}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="px-6 py-14 text-center text-sm sm:px-14">
                        <p className="mt-4 font-semibold text-gray-900 dark:text-white">No results found</p>
                        <p className="mt-2 text-gray-500">
                            No components or actions found for &quot;{query}&quot;. Please try again.
                        </p>
                    </div>
                )}

                <div className="flex flex-wrap items-center bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-xs text-gray-700 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
                    Viewing {filteredCommands.length} results
                    <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
                    Use <kbd className="mx-1 font-sans font-semibold border rounded px-1 min-w-[20px] inline-flex justify-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">↑</kbd>
                    <kbd className="mx-1 font-sans font-semibold border rounded px-1 min-w-[20px] inline-flex justify-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">↓</kbd>
                    to navigate, <kbd className="mx-1 font-sans font-semibold border rounded px-1 min-w-[30px] inline-flex justify-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">Enter</kbd>
                    to select, <kbd className="mx-1 font-sans font-semibold border rounded px-1 min-w-[30px] inline-flex justify-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">Esc</kbd>
                    to close
                </div>
            </div>
        </div>
    )
}
