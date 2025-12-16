'use client'

import { useState, useEffect } from 'react'
import { Palette, RefreshCw, Save, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { generateCompleteThemeColors } from '@/lib/color-utils'
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
                const defaultColors = {
                    light: {
                        primary: { bg: '#8B0000', text: '#FFFFFF' },
                        secondary: { bg: '#F5F5DC', text: '#2C3E50' }
                    },
                    dark: {
                        primary: { bg: '#1a0505', text: '#FFFFFF' },
                        secondary: { bg: '#2C2C2C', text: '#E8E8E8' }
                    }
                }
                setColors(defaultColors)
                setOriginalColors(JSON.parse(JSON.stringify(defaultColors)))
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
        if (template && template.colors) {
            setColors(JSON.parse(JSON.stringify(template.colors)))
            toast.success(`Applied ${template.name} template colors`)
        }
    }

    const handleColorChange = (mode, type, property, value) => {
        setColors(prev => ({
            ...prev,
            [mode]: {
                ...prev[mode],
                [type]: {
                    ...prev[mode][type],
                    [property]: value
                }
            }
        }))
    }

    const handleAutoCalculate = () => {
        if (!colors?.light?.primary?.bg || !colors?.light?.secondary?.bg) {
            toast.error('Please set light mode primary and secondary background colors first')
            return
        }

        const calculated = generateCompleteThemeColors(
            colors.light.primary.bg,
            colors.light.secondary.bg
        )

        setColors(calculated)
        toast.success('Colors auto-calculated!')
    }

    const handleReset = () => {
        setColors(JSON.parse(JSON.stringify(originalColors)))
        toast.success('Colors reset to saved values')
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

    const ColorPicker = ({ label, value, onChange, showAuto = false, onAuto }) => (
        <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">
                {label}
            </label>
            <div className="flex items-center gap-2 flex-1">
                <input
                    type="color"
                    value={value || '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                />
                {showAuto && (
                    <button
                        onClick={onAuto}
                        className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                        title="Auto-calculate contrasting color"
                    >
                        Auto
                    </button>
                )}
            </div>
        </div>
    )

    const ColorSection = ({ title, mode, type }) => (
        <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white capitalize">{type}</h4>
            <div className="space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                <ColorPicker
                    label="Background"
                    value={colors[mode][type].bg}
                    onChange={(value) => handleColorChange(mode, type, 'bg', value)}
                />
                <ColorPicker
                    label="Text"
                    value={colors[mode][type].text}
                    onChange={(value) => handleColorChange(mode, type, 'text', value)}
                    showAuto
                    onAuto={() => {
                        const { getContrastingTextColor } = require('@/lib/color-utils')
                        const textColor = getContrastingTextColor(colors[mode][type].bg)
                        handleColorChange(mode, type, 'text', textColor)
                    }}
                />
            </div>
        </div>
    )

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
                                Choose a template and customize colors for light and dark modes
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleAutoCalculate}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        style={{ backgroundColor: colors?.light?.primary?.bg, color: colors?.light?.primary?.text }}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Auto-Calculate All
                    </button>
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
                                    }`}
                            >
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

                                    {/* Color Swatches */}
                                    <div className="flex gap-2">
                                        <div
                                            className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                                            style={{ backgroundColor: template.colors.light.primary.bg }}
                                            title="Primary"
                                        />
                                        <div
                                            className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                                            style={{ backgroundColor: template.colors.light.secondary.bg }}
                                            title="Secondary"
                                        />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Color Customization */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Light Mode */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                            Light Mode
                        </h3>
                        <ColorSection title="Primary" mode="light" type="primary" />
                        <ColorSection title="Secondary" mode="light" type="secondary" />
                    </div>

                    {/* Dark Mode */}
                    <div className="bg-gray-900 dark:bg-gray-950 rounded-lg border border-gray-700 p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-indigo-400"></span>
                            Dark Mode
                        </h3>
                        <ColorSection title="Primary" mode="dark" type="primary" />
                        <ColorSection title="Secondary" mode="dark" type="secondary" />
                    </div>
                </div>

                {/* Preview Section */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Preview
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Light Mode Preview */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Light Mode</p>
                            <div
                                className="p-4 rounded-lg"
                                style={{
                                    backgroundColor: colors.light.secondary.bg,
                                    color: colors.light.secondary.text
                                }}
                            >
                                <p className="mb-2">Secondary Background</p>
                                <button
                                    className="px-4 py-2 rounded-md font-medium"
                                    style={{
                                        backgroundColor: colors.light.primary.bg,
                                        color: colors.light.primary.text
                                    }}
                                >
                                    Primary Button
                                </button>
                            </div>
                        </div>

                        {/* Dark Mode Preview */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</p>
                            <div
                                className="p-4 rounded-lg"
                                style={{
                                    backgroundColor: colors.dark.secondary.bg,
                                    color: colors.dark.secondary.text
                                }}
                            >
                                <p className="mb-2">Secondary Background</p>
                                <button
                                    className="px-4 py-2 rounded-md font-medium"
                                    style={{
                                        backgroundColor: colors.dark.primary.bg,
                                        color: colors.dark.primary.text
                                    }}
                                >
                                    Primary Button
                                </button>
                            </div>
                        </div>
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
