'use client'

import { useState, useEffect } from 'react'
import { Palette, Save, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { TEMPLATES } from '@/config/templates'

export default function ColorSettings() {
    const [colors, setColors] = useState(null)
    const [originalColors, setOriginalColors] = useState(null)
    const [selectedTemplate, setSelectedTemplate] = useState('bar')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchColors()
    }, [])

    const fetchColors = async () => {
        try {
            const response = await fetch('/api/admin/settings/colors')
            const data = await response.json()

            if (data.success && data.colors) {
                setColors(data.colors)
                setOriginalColors(JSON.parse(JSON.stringify(data.colors)))
                if (data.templateId) {
                    setSelectedTemplate(data.templateId)
                }
            } else {
                const defaultPalette = TEMPLATES.find(template => template.id === (data.templateId || 'bar'))?.palettes?.[0]
                const defaultColors = defaultPalette
                    ? { primary: defaultPalette.primary, accent: defaultPalette.accent }
                    : null
                setColors(defaultColors)
                setOriginalColors(JSON.parse(JSON.stringify(defaultColors)))
                if (data.templateId) {
                    setSelectedTemplate(data.templateId)
                }
            }
        } catch (error) {
            console.error('Failed to fetch colors:', error)
            toast.error('Failed to load colors')
        } finally {
            setLoading(false)
        }
    }

    const handleTemplateChange = (templateId) => {
        setSelectedTemplate(templateId)
        const template = TEMPLATES.find(t => t.id === templateId)
        if (template?.palettes?.[0]) {
            setColors(template.palettes[0])
        }
    }

    const handlePaletteChange = (palette) => {
        setColors({ primary: palette.primary, accent: palette.accent })
    }

    const handleReset = () => {
        setColors(JSON.parse(JSON.stringify(originalColors)))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const response = await fetch('/api/admin/settings/colors', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ colors, templateId: selectedTemplate })
            })

            const data = await response.json()

            if (data.success) {
                setOriginalColors(JSON.parse(JSON.stringify(data.colors)))
                toast.success('Colors saved successfully!')
                setTimeout(() => window.location.reload(), 1000)
            } else {
                toast.error(data.error || 'Failed to save colors')
            }
        } catch (error) {
            console.error('Failed to save colors:', error)
            toast.error('Failed to save colors')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
        )
    }

    if (!colors) {
        return (
            <div className="p-8 text-center text-gray-500">
                Failed to load colors. Please refresh the page.
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Palette className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Theme & Color Settings
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Choose a template and its color palette
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Template Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Template
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {TEMPLATES.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => handleTemplateChange(template.id)}
                                className={`rounded-lg border-2 transition-all text-left overflow-hidden ${selectedTemplate === template.id
                                    ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-2'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}                            >
                                {/* Template Thumbnail */}
                                <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                                    <img
                                        src={template.thumbnail}
                                        alt={template.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {selectedTemplate === template.id && (
                                        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                                            Selected
                                        </div>
                                    )}
                                </div>

                                {/* Template Info */}
                                <div className="p-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                        {template.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                                        {template.description}
                                    </p>

                                    {/* Default palette preview */}
                                    <div className="flex gap-2">
                                        <div
                                            className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                                            style={{ backgroundColor: template.palettes[0].primary }}
                                            title="Primary"
                                        />
                                        <div
                                            className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                                            style={{ backgroundColor: template.palettes[0].accent }}
                                            title="Accent"
                                        />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Predefined palettes for the selected template */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Color Palette
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {(TEMPLATES.find(template => template.id === selectedTemplate)?.palettes || []).map((palette) => {
                            const isSelected = colors.primary?.toUpperCase() === palette.primary.toUpperCase() &&
                                colors.accent?.toUpperCase() === palette.accent.toUpperCase()

                            return (
                                <button
                                    key={palette.name}
                                    type="button"
                                    onClick={() => handlePaletteChange(palette)}
                                    aria-pressed={isSelected}
                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${isSelected
                                        ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-1'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                                        }`}
                                >
                                    <span className="flex shrink-0">
                                        <span className="w-7 h-7 rounded-l border border-gray-300 dark:border-gray-600" style={{ backgroundColor: palette.primary }} />
                                        <span className="w-7 h-7 rounded-r border-y border-r border-gray-300 dark:border-gray-600" style={{ backgroundColor: palette.accent }} />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-sm font-medium text-gray-900 dark:text-white truncate">{palette.name}</span>
                                        {isSelected && <span className="block text-xs text-blue-600 dark:text-blue-400">Selected</span>}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    )
}