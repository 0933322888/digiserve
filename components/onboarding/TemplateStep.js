'use client'

import { motion } from 'framer-motion'
import TemplateSelector from '@/components/admin/TemplateSelector'
import { ArrowLeft } from 'lucide-react'

export default function TemplateStep({ tenantId, onNext, onBack }) {

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto"
        >
            <div className="mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </button>
                <h2 className="text-3xl font-bold font-serif text-white mb-2">
                    Choose Your Style
                </h2>
                <p className="text-gray-400">
                    Select a template that fits your brand. You can always change this later in settings.
                </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <TemplateSelector
                    tenantId={tenantId}
                    onSave={onNext}
                    saveLabel="Next: Go Live"
                    initialTheme={{ templateId: 'bar', colors: { primary: '#1C0F0B', accent: '#C88A3D' } }}
                />
            </div>
        </motion.div>
    )
}
