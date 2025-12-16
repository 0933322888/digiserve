'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getContrastingTextColor, validateColorObject } from '@/lib/color-utils'
import { getTemplateById } from '@/config/templates'

const ThemeContext = createContext({
    theme: {
        templateId: 'bar',
        colors: null,
        logo: null,
    },
    isLoading: true,
    refreshTheme: async (tenantId) => { },
})

export function ThemeProvider({ children, initialTheme }) {
    const [theme, setTheme] = useState(initialTheme || {
        templateId: 'bar',
        colors: null,
        logo: null,
    })
    const [isLoading, setIsLoading] = useState(!initialTheme)

    const applyTheme = (themeData) => {
        if (typeof document !== 'undefined') {
            const root = document.documentElement

            // Handle new color structure
            let colors = themeData.colors

            // Fallback to template defaults if no specific colors
            if (!colors && !themeData.primaryColor && !themeData.secondaryColor) {
                const template = getTemplateById(themeData.templateId || 'bar')
                if (template && template.colors) {
                    colors = template.colors
                }
            }

            if (colors) {
                // Light mode colors
                if (colors.light) {
                    const primaryLight = validateColorObject(colors.light.primary, '#8B0000')
                    const secondaryLight = validateColorObject(colors.light.secondary, '#F5F5DC')

                    root.style.setProperty('--primary-light-bg', primaryLight.bg)
                    root.style.setProperty('--primary-light-text', primaryLight.text)
                    root.style.setProperty('--secondary-light-bg', secondaryLight.bg)
                    root.style.setProperty('--secondary-light-text', secondaryLight.text)
                }

                // Dark mode colors
                if (colors.dark) {
                    const primaryDark = validateColorObject(colors.dark.primary, '#A00000')
                    const secondaryDark = validateColorObject(colors.dark.secondary, '#2C2C2C')

                    root.style.setProperty('--primary-dark-bg', primaryDark.bg)
                    root.style.setProperty('--primary-dark-text', primaryDark.text)
                    root.style.setProperty('--secondary-dark-bg', secondaryDark.bg)
                    root.style.setProperty('--secondary-dark-text', secondaryDark.text)
                }

                // Update legacy CSS variables for backward compatibility
                // text-cream should be the primary text color (light color for dark backgrounds)
                if (colors.light?.primary) {
                    root.style.setProperty('--cream', colors.light.primary.text)
                    root.style.setProperty('--primary', colors.light.primary.bg)
                    root.style.setProperty('--primary-text', colors.light.primary.text)
                }
            }
            // Fallback to legacy color structure
            else if (themeData.primaryColor || themeData.secondaryColor) {
                const primaryColor = themeData.primaryColor || '#8B0000'
                const secondaryColor = themeData.secondaryColor || '#F5F5DC'

                // Set light mode (use legacy colors)
                root.style.setProperty('--primary-light-bg', primaryColor)
                root.style.setProperty('--primary-light-text', getContrastingTextColor(primaryColor))
                root.style.setProperty('--secondary-light-bg', secondaryColor)
                root.style.setProperty('--secondary-light-text', getContrastingTextColor(secondaryColor))

                // Set dark mode (auto-generate variants)
                const primaryDark = lightenForDarkMode(primaryColor)
                const secondaryDark = '#2C2C2C' // Default dark secondary

                root.style.setProperty('--primary-dark-bg', primaryDark)
                root.style.setProperty('--primary-dark-text', getContrastingTextColor(primaryDark))
                root.style.setProperty('--secondary-dark-bg', secondaryDark)
                root.style.setProperty('--secondary-dark-text', getContrastingTextColor(secondaryDark))
            }

            // Legacy support - set old CSS variables for backward compatibility
            if (themeData.primaryColor) {
                root.style.setProperty('--primary', themeData.primaryColor)
                root.style.setProperty('--primary-text', getContrastingTextColor(themeData.primaryColor))
            }
            if (themeData.secondaryColor) {
                root.style.setProperty('--cream', themeData.secondaryColor)
            }
        }
    }

    // Helper function to lighten color for dark mode
    function lightenForDarkMode(hexColor) {
        // Simple lightening - increase RGB values by 20%
        const hex = hexColor.replace('#', '')
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + 50)
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + 50)
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + 50)
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
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
        } else {
            applyTheme(initialTheme)
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
