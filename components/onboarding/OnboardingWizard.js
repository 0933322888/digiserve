'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BrandingStep from './BrandingStep'
import GoLiveStep from './GoLiveStep'
import { Check } from 'lucide-react'
import { useTheme } from '../ThemeProvider'

export default function OnboardingWizard({ currentStep, onboardingStatus, tenantId, userId }) {
    const router = useRouter()
    const { refreshTheme } = useTheme()
    const [step, setStep] = useState(currentStep)
    const [loading, setLoading] = useState(false)

    // Load tenant theme on mount
    useEffect(() => {
        if (tenantId) {
            refreshTheme(tenantId)
        }
    }, [tenantId])

    const steps = [
        { number: 1, name: 'Branding', status: 'branding' },
        { number: 2, name: 'Go Live', status: 'completed' },
    ]

    const handleNext = () => {
        if (step < 2) {
            setStep(step + 1)
        }
    }

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1)
        }
    }

    const handleComplete = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/onboarding/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })

            if (res.ok) {
                router.push('/admin')
            } else {
                console.error('Failed to complete onboarding')
                setLoading(false)
            }
        } catch (error) {
            console.error('Error completing onboarding:', error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Progress Bar */}
            <div className="bg-gray-800/50 border-b border-gray-700">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        {steps.map((s, index) => (
                            <div key={s.number} className="flex items-center flex-1">
                                {/* Step Circle */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step > s.number
                                            ? 'bg-green-600 text-white'
                                            : step === s.number
                                                ? 'bg-red-600 text-white ring-4 ring-red-600/30'
                                                : 'bg-gray-700 text-gray-400'
                                            }`}
                                    >
                                        {step > s.number ? <Check className="w-5 h-5" /> : s.number}
                                    </div>
                                    <div
                                        className={`mt-2 text-sm font-medium ${step >= s.number ? 'text-white' : 'text-gray-500'
                                            }`}
                                    >
                                        {s.name}
                                    </div>
                                </div>

                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div className="flex-1 h-1 mx-4 mb-6">
                                        <div
                                            className={`h-full rounded transition-all ${step > s.number ? 'bg-green-600' : 'bg-gray-700'
                                                }`}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Step Content */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                {step === 1 && (
                    <BrandingStep
                        tenantId={tenantId}
                        onNext={handleNext}
                    />
                )}
                {step === 2 && (
                    <GoLiveStep
                        tenantId={tenantId}
                        onBack={handleBack}
                        onComplete={handleComplete}
                        loading={loading}
                    />
                )}
            </div>
        </div>
    )
}
