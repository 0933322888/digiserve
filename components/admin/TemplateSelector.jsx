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
    const [primaryColor, setPrimaryColor] = useState(initialTheme?.primaryColor || '#8B0000')
    const [secondaryColor, setSecondaryColor] = useState(initialTheme?.secondaryColor || '#F5F5DC')

    useEffect(() => {
        if (initialTheme) {
            setSelectedTemplate(initialTheme.templateId || 'bar')
            setPrimaryColor(initialTheme.primaryColor || '#8B0000')
            setSecondaryColor(initialTheme.secondaryColor || '#F5F5DC')
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
                    primaryColor,
                    secondaryColor,
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
                            onClick={() => setSelectedTemplate(template.id)}
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
                                <p className="text-sm text-gray-500 line-clamp-2">{template.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Color Overrides */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4">Theme Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-medium mb-2">Primary Color</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                            />
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{primaryColor}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Used for buttons, links, and accents.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Secondary / Background Color</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={secondaryColor}
                                onChange={(e) => setSecondaryColor(e.target.value)}
                                className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                            />
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{secondaryColor}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Used for backgrounds and secondary elements.</p>
                    </div>
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
