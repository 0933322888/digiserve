'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { generateThemeColorVariants } from '@/lib/color-utils'
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

            const template = getTemplateById(themeData.templateId || 'bar')
            root.classList.toggle('dark', template?.theme?.mode === 'dark')

            const defaultPalette = template?.palettes?.[0]
            const palette = themeData.colors || defaultPalette
            const variants = generateThemeColorVariants(palette.primary, palette.accent)
            const selectedPalette = template?.palettes?.find(item =>
                item.primary.toUpperCase() === palette.primary.toUpperCase() &&
                item.accent.toUpperCase() === palette.accent.toUpperCase()
            )
            const primaryText = selectedPalette?.primaryText || variants.light.primary.text
            const accentText = selectedPalette?.accentText || variants.light.accent.text
            const navbarFooterText = selectedPalette?.navbarFooterText || primaryText
            variants.light.primary.text = primaryText
            variants.dark.primary.text = primaryText
            variants.light.accent.text = accentText
            variants.dark.accent.text = accentText

            root.style.setProperty('--primary-light-bg', variants.light.primary.bg)
            root.style.setProperty('--primary-light-text', variants.light.primary.text)
            root.style.setProperty('--secondary-light-bg', variants.light.accent.bg)
            root.style.setProperty('--secondary-light-text', variants.light.accent.text)
            root.style.setProperty('--primary-dark-bg', variants.dark.primary.bg)
            root.style.setProperty('--primary-dark-text', variants.dark.primary.text)
            root.style.setProperty('--secondary-dark-bg', variants.dark.accent.bg)
            root.style.setProperty('--secondary-dark-text', variants.dark.accent.text)
            root.style.setProperty('--cream', variants.light.primary.text)
            root.style.setProperty('--primary', palette.primary)
            root.style.setProperty('--primary-text', variants.light.primary.text)
            root.style.setProperty('--gold', palette.accent)
            root.style.setProperty('--gold-text', variants.light.accent.text)
            root.style.setProperty('--accent', palette.accent)
            root.style.setProperty('--accent-text', accentText)
            root.style.setProperty('--navbar-footer-text', navbarFooterText)
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
