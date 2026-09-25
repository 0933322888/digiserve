'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Check, Loader2, Palette } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useTheme } from '@/components/ThemeProvider'

export default function TemplateSelector({ tenantId, initialTheme, onSave, saveLabel = 'Save Theme Changes' }) {
    const { refreshTheme } = useTheme()
    const [templates, setTemplates] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const [selectedTemplate, setSelectedTemplate] = useState(initialTheme?.templateId || 'bar')
    const [primary, setPrimary] = useState(initialTheme?.colors?.primary || '#1C0F0B')
    const [accent, setAccent] = useState(initialTheme?.colors?.accent || '#C88A3D')

    useEffect(() => {
        if (initialTheme) {
            setSelectedTemplate(initialTheme.templateId || 'bar')
            setPrimary(initialTheme.colors?.primary || '#1C0F0B')
            setAccent(initialTheme.colors?.accent || '#C88A3D')
        }
    }, [initialTheme])

    useEffect(() => {
        fetch('/api/templates')
            .then(res => res.json())
            .then(data => {
                if (data.templates) {
                    setTemplates(data.templates)
                }
            })
            .catch(err => console.error('Failed to load templates', err))
            .finally(() => setIsLoading(false))
    }, [])

    const handleSave = async () => {
        if (!tenantId) return
        setIsSaving(true)
        try {
            const res = await fetch(`/api/tenants/${tenantId}/theme`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    templateId: selectedTemplate,
                    colors: { primary, accent },
                }),
            })

            if (!res.ok) throw new Error('Failed to update theme')

            const data = await res.json()

            // Refresh theme globally
            await refreshTheme(tenantId)

            if (onSave) {
                onSave(data)
            } else {
                toast.success('Theme updated successfully! Refresh your site to see changes.')
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to update theme.')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
    }

    return (
        <div className="space-y-8">
            {/* Template Selection */}
            <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5" /> Select Template
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(template => (
                        <div
                            key={template.id}
                            onClick={() => {
                                setSelectedTemplate(template.id)
                                if (template.palettes?.[0]) {
                                    setPrimary(template.palettes[0].primary)
                                    setAccent(template.palettes[0].accent)
                                }
                            }}
                            className={`
                        relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg
                        ${selectedTemplate === template.id ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-primary/50'}
                    `}
                        >
                            <div className="aspect-video relative bg-gray-100">
                                {template.thumbnail ? (
                                    <Image src={template.thumbnail} alt={template.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Preview
                                    </div>
                                )}
                                {selectedTemplate === template.id && (
                                    <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-md z-10">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-white dark:bg-gray-800">
                                <h4 className="font-bold text-lg">{template.name}</h4>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{template.description}</p>
                                {template.features && (
                                    <div className="flex flex-wrap gap-1">
                                        {template.features.slice(0, 3).map((feature, idx) => (
                                            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Template palette */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4">Color Palette</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(templates.find(template => template.id === selectedTemplate)?.palettes || []).map(palette => {
                        const isSelected = primary.toUpperCase() === palette.primary && accent.toUpperCase() === palette.accent
                        return (
                            <button
                                key={palette.name}
                                type="button"
                                onClick={() => {
                                    setPrimary(palette.primary)
                                    setAccent(palette.accent)
                                }}
                                aria-pressed={isSelected}
                                className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-primary/50'}`}
                            >
                                <span className="flex shrink-0">
                                    <span className="w-7 h-7 rounded-l border border-gray-300" style={{ backgroundColor: palette.primary }} />
                                    <span className="w-7 h-7 rounded-r border-y border-r border-gray-300" style={{ backgroundColor: palette.accent }} />
                                </span>
                                <span className="text-sm font-medium">{palette.name}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : null}
                    {isSaving ? 'Saving...' : saveLabel}
                </button>
            </div>
        </div>
    )
}
