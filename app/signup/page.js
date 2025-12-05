"use client"

import SignupForm from '@/components/onboarding/SignupForm'

export default function SignupPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Create Your Restaurant Website</h1>
                    <p className="text-gray-400">Get your site live in minutes</p>
                </div>

                {/* Signup Form */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                    <SignupForm />
                </div>

                {/* Features */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-white">3-7</div>
                        <div className="text-xs text-gray-400">Minutes Setup</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">Free</div>
                        <div className="text-xs text-gray-400">Subdomain</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">SSL</div>
                        <div className="text-xs text-gray-400">Included</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
