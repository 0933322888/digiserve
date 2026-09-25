'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, X } from 'lucide-react'
import Link from 'next/link'

export default function SetupProgress({
    completion = 0,
    steps = [],
    dismissed = false
}) {
    const [isVisible, setIsVisible] = useState(!dismissed)

    if (!isVisible || completion === 100) return null

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/5 dark:bg-gold/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Getting Started</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Complete these steps to get your restaurant fully up and running.
                    </p>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 mb-6">
                <div
                    className="bg-primary dark:bg-gold h-2.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${completion}%` }}
                ></div>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className={`flex items-start p-3 rounded-lg border ${step.completed
                                ? 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/20'
                                : 'bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-700'
                            }`}
                    >
                        <div className={`mt-0.5 mr-3 flex-shrink-0 ${step.completed ? 'text-green-500' : 'text-gray-400'}`}>
                            {step.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                        </div>
                        <div>
                            <h4 className={`text-sm font-medium ${step.completed ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-white'
                                }`}>
                                {step.label}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2">
                                {step.description}
                            </p>
                            {!step.completed && step.action && (
                                <Link
                                    href={step.action.href}
                                    className="text-xs font-semibold text-primary-text  hover:underline"
                                >
                                    {step.action.label} →
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
