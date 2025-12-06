'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
    theme: {
        templateId: 'bar',
        primaryColor: '#8B0000',
        secondaryColor: '#F5F5DC',
        logo: null,
    },
    isLoading: true,
    refreshTheme: async (tenantId) => { },
})

export function ThemeProvider({ children, initialTheme }) {
    const [theme, setTheme] = useState(initialTheme || {
        templateId: 'bar',
        primaryColor: '#8B0000',
        secondaryColor: '#F5F5DC',
        logo: null,
    })
    const [isLoading, setIsLoading] = useState(!initialTheme)

    const applyTheme = (themeData) => {
        if (typeof document !== 'undefined') {
            const root = document.documentElement

            // Set CSS custom properties
            if (themeData.primaryColor) {
                root.style.setProperty('--primary', themeData.primaryColor)
            }
            if (themeData.secondaryColor) {
                root.style.setProperty('--secondary', themeData.secondaryColor)
                // For now, map secondary to cream as defaults
                root.style.setProperty('--cream', themeData.secondaryColor)
            }

            // Set distinct gold/accent based on template or primary
            root.style.setProperty('--gold', themeData.primaryColor) // Use primary as gold/accent fallback
        }
    }

    // Expose refresh function for manual theme reload
    const refreshTheme = async (tenantId) => {
        if (!tenantId) return

        setIsLoading(true)
        try {
            const res = await fetch(`/api/tenants/${tenantId}/theme`)
            if (res.ok) {
                const data = await res.json()
                // The API returns { success: true, theme: {...} }
                if (data.theme) {
                    setTheme(data.theme)
                    applyTheme(data.theme)
                    console.log('Theme refreshed', data.theme)
                }
            }
        } catch (error) {
            console.error('Failed to refresh theme:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!initialTheme) {
            // Logic for client-side theme fetch could go here
        }
    }, [initialTheme])

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
