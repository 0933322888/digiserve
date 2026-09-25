'use client'

import { useState } from 'react'
import { Palette, Upload } from 'lucide-react'
import { useTheme } from '../ThemeProvider'
import { TEMPLATES } from '@/config/templates'

const themes = TEMPLATES.map(template => ({
    id: template.id,
    name: template.name,
    palettes: template.palettes,
}))

export default function BrandingStep({ tenantId, onNext }) {
    const { refreshTheme } = useTheme()
    const [selectedTheme, setSelectedTheme] = useState('bar')
    const [selectedPalette, setSelectedPalette] = useState(themes[0].palettes[0])
    const [logo, setLogo] = useState(null)
    const [logoPreview, setLogoPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleThemeChange = (themeId) => {
        const theme = themes.find(t => t.id === themeId)
        setSelectedTheme(themeId)
        setSelectedPalette(theme.palettes[0])
    }

    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('Logo file must be less than 2MB')
                return
            }
            setLogo(file)
            setLogoPreview(URL.createObjectURL(file))
            setError('')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // For MVP, we'll store colors directly
            // In production, you'd upload logo to S3/Vercel Blob
            const logoUrl = logoPreview // Placeholder - in production, upload first

            const res = await fetch('/api/onboarding/branding', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId,
                    theme: {
                        templateId: selectedTheme,
                        colors: {
                            primary: selectedPalette.primary,
                            accent: selectedPalette.accent,
                        },
                        logo: logoUrl,
                    },
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to save branding')
                setLoading(false)
                return
            }

            console.log('✅ Branding saved successfully, refreshing theme...')
            // Refresh theme to apply changes immediately
            await refreshTheme(tenantId)
            console.log('✅ Theme refresh complete')

            // Move to next step
            onNext()
        } catch (error) {
            console.error('Branding error:', error)
            setError('An error occurred. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Customize Your Brand</h2>
                <p className="text-gray-400">Choose your theme and colors to match your restaurant&apos;s style</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Logo Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-3">
                        Restaurant Logo (Optional)
                    </label>
                    <div className="flex items-center gap-4">
                        {logoPreview && (
                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                            </div>
                        )}
                        <label className="flex-1 cursor-pointer">
                            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-red-500 transition-colors">
                                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm text-gray-400">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Theme Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-3">
                        <Palette className="inline w-4 h-4 mr-2" />
                        Choose a Theme
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                        {themes.map((theme) => (
                            <button
                                key={theme.id}
                                type="button"
                                onClick={() => handleThemeChange(theme.id)}
                                className={`p-4 rounded-lg border-2 transition-all ${selectedTheme === theme.id
                                    ? 'border-red-500 bg-red-500/10'
                                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                                    }`}
                            >
                                <div className="flex gap-2 mb-2">
                                    <div className="w-8 h-8 rounded" style={{ backgroundColor: theme.palettes[0].primary }} />
                                    <div className="w-8 h-8 rounded" style={{ backgroundColor: theme.palettes[0].accent }} />
                                </div>
                                <div className="text-sm font-medium text-white">{theme.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 rounded-lg border border-gray-600 bg-gray-800/30 text-sm text-gray-300">
                    Selected palette: <span className="font-semibold text-white">{selectedPalette.name}</span>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? 'Saving...' : 'Next: Go Live'}
                    </button>
                </div>
            </form>
        </div>
    )
}
