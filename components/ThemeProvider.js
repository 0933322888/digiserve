'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
    theme: {
        type: 'vintage',
        primaryColor: '#8B0000',
        secondaryColor: '#F5F5DC',
        logo: null,
    },
    isLoading: true,
    refreshTheme: () => { },
})

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState({
        type: 'vintage',
        primaryColor: '#8B0000',
        secondaryColor: '#F5F5DC',
        logo: null,
    })
    const [isLoading, setIsLoading] = useState(true)

    // Fetch theme from API
    const fetchTheme = async (specificTenantId) => {
        try {
            console.log('🎨 Fetching theme from API...', specificTenantId ? `for tenant: ${specificTenantId}` : 'using default tenant')

            const headers = {}
            if (specificTenantId) {
                headers['x-tenant-id'] = specificTenantId
            }

            const res = await fetch('/api/theme', { headers })
            if (res.ok) {
                const data = await res.json()
                console.log('🎨 Theme received:', data)
                setTheme(data)

                // Apply CSS variables
                applyTheme(data)
                console.log('🎨 Theme applied to CSS variables')
            } else {
                console.error('🎨 Theme API returned error:', res.status)
            }
        } catch (error) {
            console.error('Failed to load theme:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Expose refresh function for manual theme reload
    const refreshTheme = async (tenantId) => {
        console.log('🎨 refreshTheme called with:', tenantId)
        await fetchTheme(tenantId)
    }

    useEffect(() => {
        fetchTheme()
    }, [])

    const applyTheme = (themeData) => {
        if (typeof document !== 'undefined') {
            const root = document.documentElement

            // Set CSS custom properties
            root.style.setProperty('--primary', themeData.primaryColor)
            root.style.setProperty('--secondary', themeData.secondaryColor)

            // Also set cream and gold based on theme type
            if (themeData.type === 'vintage') {
                root.style.setProperty('--cream', themeData.secondaryColor)
                root.style.setProperty('--gold', '#d4af37')
            } else if (themeData.type === 'modern') {
                root.style.setProperty('--cream', themeData.secondaryColor)
                root.style.setProperty('--gold', '#3498db')
            } else if (themeData.type === 'minimalist') {
                root.style.setProperty('--cream', themeData.secondaryColor)
                root.style.setProperty('--gold', '#666666')
            }
        }
    }

    return (
        <ThemeContext.Provider value={{ theme, isLoading, refreshTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider')
    }
    return context
}
