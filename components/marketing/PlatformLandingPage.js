"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
    ArrowRight,
    Check,
    ChefHat,
    Globe,
    Smartphone,
    Zap,
    BarChart3,
    Calendar,
    UtensilsCrossed,
    CreditCard,
    LayoutTemplate,
    ShieldCheck
} from 'lucide-react'
import { motion } from 'framer-motion'
import SignupForm from '@/components/onboarding/SignupForm'
import { TEMPLATES } from '@/config/templates'

export default function PlatformLandingPage() {
    const [showWizard, setShowWizard] = useState(false)
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-blue-600 selection:text-white">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 px-6 py-4 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-white">D</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">DigiServe</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <Link href="/features" className="hover:text-white transition-colors">Features</Link>
                        <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                        <Link href="/templates" className="hover:text-white transition-colors">Templates</Link>
                        <Link href="/about" className="hover:text-white transition-colors">About</Link>
                        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowWizard(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full opacity-30 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 text-center lg:text-left">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-800 text-blue-400 text-xs font-medium mb-6"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                New: AI-Powered Menu Builder
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
                            >
                                The operating system for <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                    modern restaurants.
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-xl text-gray-400 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
                            >
                                Launch a stunning website, take commission-free orders, manage reservations, and grow your brand—all from one powerful dashboard.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                            >
                                <button
                                    onClick={() => setShowWizard(true)}
                                    className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-black hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all"
                                >
                                    Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                                </button>
                                <Link
                                    href="#demo"
                                    className="w-full sm:w-auto inline-flex items-center justify-center bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all border border-white/10"
                                >
                                    View Demo
                                </Link>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500"
                            >
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-blue-500" /> No credit card required
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-blue-500" /> 14-day free trial
                                </div>
                            </motion.div>
                        </div>

                        <div className="flex-1 w-full max-w-[600px] lg:max-w-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                className="relative"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30" />
                                <div className="relative bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                                    {/* Mock Browser Header */}
                                    <div className="h-10 bg-[#1A1A1A] border-b border-white/5 flex items-center px-4 gap-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/20" />
                                        </div>
                                        <div className="flex-1 text-center text-xs text-gray-600 font-mono">dashboard.digiserve.com</div>
                                    </div>
                                    {/* Dashboard Preview Image */}
                                    <div className="aspect-[16/10] bg-[#0A0A0A] relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
                                        {/* Abstract UI representation */}
                                        <div className="p-6 grid grid-cols-3 gap-4 h-full">
                                            <div className="col-span-1 bg-white/5 rounded-lg border border-white/5 p-4 flex flex-col gap-3">
                                                <div className="w-8 h-8 rounded bg-blue-500/20" />
                                                <div className="h-2 w-16 bg-white/10 rounded" />
                                                <div className="h-2 w-24 bg-white/5 rounded" />
                                                <div className="mt-auto h-20 bg-gradient-to-t from-blue-500/10 to-transparent rounded" />
                                            </div>
                                            <div className="col-span-2 grid grid-rows-2 gap-4">
                                                <div className="bg-white/5 rounded-lg border border-white/5 p-4 flex items-center justify-between">
                                                    <div className="space-y-2">
                                                        <div className="h-2 w-24 bg-white/10 rounded" />
                                                        <div className="h-6 w-32 bg-white/20 rounded" />
                                                    </div>
                                                    <div className="h-10 w-10 rounded-full bg-green-500/20" />
                                                </div>
                                                <div className="bg-white/5 rounded-lg border border-white/5 p-4 grid grid-cols-2 gap-4">
                                                    <div className="bg-white/5 rounded h-full" />
                                                    <div className="bg-white/5 rounded h-full" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-[#0F0F0F] border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to run your restaurant</h2>
                        <p className="text-gray-400 text-lg">Replace your fragmented tech stack with one cohesive platform.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Globe}
                            color="blue"
                            title="Website Builder"
                            description="Create a professional, SEO-optimized website in minutes. No coding required. Changes update instantly."
                        />
                        <FeatureCard
                            icon={UtensilsCrossed}
                            color="orange"
                            title="Digital Menu"
                            description="Manage your menu in one place. Update prices, add photos, and mark items out of stock in real-time."
                        />
                        <FeatureCard
                            icon={Smartphone}
                            color="green"
                            title="Online Ordering"
                            description="Commission-free ordering system built directly into your site. Keep 100% of your profits."
                        />
                        <FeatureCard
                            icon={Calendar}
                            color="purple"
                            title="Reservations"
                            description="Accept table bookings 24/7. Manage capacity, special requests, and automated confirmations."
                        />
                        <FeatureCard
                            icon={BarChart3}
                            color="pink"
                            title="Analytics"
                            description="Track sales, popular items, and customer behavior with beautiful, easy-to-understand dashboards."
                        />
                        <FeatureCard
                            icon={LayoutTemplate}
                            color="indigo"
                            title="Theme Engine"
                            description="Switch between stunning themes with one click. Customize colors and fonts to match your brand."
                        />
                    </div>
                </div>
            </section>

            {/* Value Prop Section */}
            <section id="benefits" className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why choose DigiServe?</h2>
                            <div className="space-y-8">
                                <BenefitItem
                                    title="Zero Commissions"
                                    description="Stop paying 30% to delivery apps. Keep your hard-earned revenue."
                                />
                                <BenefitItem
                                    title="Own Your Customer Data"
                                    description="Build your email list and market directly to your diners. Don't rent your customers."
                                />
                                <BenefitItem
                                    title="Instant Setup"
                                    description="Go live in under 10 minutes. Our AI-powered onboarding builds your site for you."
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-20" />
                            <div className="relative bg-[#111] border border-white/10 rounded-2xl p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <div className="text-sm text-gray-400">Monthly Savings</div>
                                        <div className="text-3xl font-bold text-white">$2,450</div>
                                    </div>
                                    <div className="text-green-400 text-sm font-medium flex items-center gap-1">
                                        <ArrowRight className="w-4 h-4 -rotate-45" /> +15% vs last month
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full w-[75%] bg-blue-500 rounded-full" />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Commission Saved</span>
                                        <span>Goal: $3,000</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] to-blue-900/20" />
                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to transform your restaurant?</h2>
                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                        Join thousands of restaurateurs who are taking control of their digital presence with DigiServe.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => setShowWizard(true)}
                            className="w-full sm:w-auto inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-xl font-bold text-xl transition-all shadow-2xl hover:scale-105"
                        >
                            Get Started Free
                        </button>
                    </div>
                    <p className="mt-6 text-sm text-gray-500">No credit card required • Cancel anytime</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-[#050505] text-sm">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                            <span className="font-bold text-white text-xs">D</span>
                        </div>
                        <span className="font-bold text-gray-300">DigiServe</span>
                    </div>
                    <div className="flex gap-8 text-gray-500">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                    </div>
                    <p className="text-gray-600">&copy; {new Date().getFullYear()} DigiServe Inc.</p>
                </div>
            </footer>
            {/* Wizard Modal */}
            {showWizard && <WizardModal onClose={() => setShowWizard(false)} />}
        </div>
    )
}

function FeatureCard({ icon: Icon, color, title, description }) {
    const colorMap = {
        blue: 'text-blue-400 bg-blue-400/10 group-hover:bg-blue-400/20',
        orange: 'text-orange-400 bg-orange-400/10 group-hover:bg-orange-400/20',
        green: 'text-green-400 bg-green-400/10 group-hover:bg-green-400/20',
        purple: 'text-purple-400 bg-purple-400/10 group-hover:bg-purple-400/20',
        pink: 'text-pink-400 bg-pink-400/10 group-hover:bg-pink-400/20',
        indigo: 'text-indigo-400 bg-indigo-400/10 group-hover:bg-indigo-400/20',
    }

    return (
        <div className="p-8 rounded-2xl bg-[#111] border border-white/5 hover:border-white/10 transition-all group hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors ${colorMap[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-100">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{description}</p>
        </div>
    )
}

function BenefitItem({ title, description }) {
    return (
        <div className="flex gap-4">
            <div className="mt-1 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                <p className="text-gray-400">{description}</p>
            </div>
        </div>
    )
}

function WizardModal({ onClose }) {
    const previewBaseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'digiserve.com'
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)

    // SignupForm will own all form state; we keep a ref to read values when finishing
    const signupRef = useRef(null)

    // Website templates from registry (matches /admin/settings template view)
    const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]?.id || 'bar')

    // Theme options (colors + small stylistic differences)
    const themes = [
        { id: 'vintage', name: 'Vintage', primary: '#8B0000', secondary: '#F5F5DC' },
        { id: 'modern', name: 'Modern', primary: '#2C3E50', secondary: '#ECF0F1' },
        { id: 'minimalist', name: 'Minimalist', primary: '#000000', secondary: '#FFFFFF' },
    ]
    const [selectedTheme, setSelectedTheme] = useState(themes[0].id)
    const [primaryColor, setPrimaryColor] = useState(themes[0].primary)
    const [secondaryColor, setSecondaryColor] = useState(themes[0].secondary)

    // When a template is selected, sync default colors if available
    const handleTemplateSelect = (templateId) => {
        setSelectedTemplate(templateId)
        const t = TEMPLATES.find(x => x.id === templateId)
        if (t?.palettes?.[0]) {
            setPrimaryColor(t.palettes[0].primary)
            setSecondaryColor(t.palettes[0].accent)
        }
    }

    // When a theme is selected, reset the color pickers to its defaults (but allow manual tweak afterwards)
    useEffect(() => {
        const t = themes.find(x => x.id === selectedTheme)
        if (t) {
            setPrimaryColor(t.primary)
            setSecondaryColor(t.secondary)
        }
    }, [selectedTheme])

    // No local form state here — SignupForm handles it. We still expose a simple copy helper for other bits.

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/90" onClick={onClose} />
            <div className="relative w-full max-w-3xl mx-4 bg-[#0B0B0B] border border-white/10 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Get started — {step === 1 ? 'Create account' : 'Pick a template'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">Close</button>
                </div>

                <div className="mb-4">
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                        <div className={`h-full ${step === 1 ? 'w-1/2 bg-blue-500' : 'w-full bg-blue-500'}`} />
                    </div>
                </div>

                {/* Keep SignupForm mounted so it fully owns its state; show it for step 1 */}
                <div className={step === 1 ? 'block' : 'hidden'}>
                    <div className="p-6 bg-[#071018] border border-white/5 rounded-2xl">
                        <h4 className="text-lg font-semibold text-white mb-4">Create your account</h4>

                        {/* Single-column signup form for clearer UX */}
                        <SignupForm ref={signupRef} onNext={() => setStep(2)} />

                        {/* Footer action row: Cancel (left) + Next (right) — Next validates using the form ref */}
                        <div className="mt-4 flex items-center justify-between">
                            <button onClick={onClose} className="px-4 py-2 rounded bg-transparent border border-white/5 text-gray-300">Cancel</button>
                            <button onClick={() => {
                                try {
                                    const ok = signupRef.current?.validate ? signupRef.current.validate() : true
                                    if (ok) setStep(2)
                                } catch (e) { /* form shows its errors */ }
                            }} className="px-4 py-2 rounded bg-blue-600 text-white font-semibold">Next</button>
                        </div>

                        <div className="mt-4 text-sm text-gray-400">
                            <div className="font-mono text-xs text-gray-300">Preview URL: {(signupRef.current && signupRef.current.getValues) ? `${signupRef.current.getValues().subdomain || 'your-name'}.${previewBaseDomain}` : `your-name.${previewBaseDomain}`}</div>
                            <p className="mt-2">No credit card required • You can change templates and themes later in your admin.</p>
                        </div>
                    </div>
                </div>

                {step === 2 && (
                    <div className="space-y-4">
                        <div>
                            <div className="mb-2 text-sm text-gray-300">Website templates</div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                {TEMPLATES.map((template) => (
                                    <button
                                        key={template.id}
                                        type="button"
                                        onClick={() => handleTemplateSelect(template.id)}
                                        className={`rounded-xl border transition-all text-left overflow-hidden ${selectedTemplate === template.id
                                            ? 'border-blue-500 ring-2 ring-blue-500/50 bg-blue-500/10'
                                            : 'border-white/10 bg-[#121212] hover:border-white/20'
                                            }`}
                                    >
                                        {/* Template Thumbnail */}
                                        <div className="aspect-video bg-gray-900 relative overflow-hidden">
                                            <img
                                                src={template.thumbnail}
                                                alt={template.name}
                                                className="w-full h-full object-cover"
                                            />
                                            {selectedTemplate === template.id && (
                                                <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 shadow">
                                                    <Check className="w-3 h-3" />
                                                    Selected
                                                </div>
                                            )}
                                        </div>

                                        {/* Template Info */}
                                        <div className="p-3.5">
                                            <div className="font-semibold text-white mb-1">
                                                {template.name}
                                            </div>
                                            <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                                                {template.description}
                                            </p>

                                            {/* Color Swatches */}
                                            {template.palettes?.[0] && (
                                                <div className="flex items-center gap-1.5">
                                                    <div
                                                        className="w-5 h-5 rounded border border-white/20"
                                                        style={{ backgroundColor: template.palettes[0].primary }}
                                                        title="Primary color"
                                                    />
                                                    <div
                                                        className="w-5 h-5 rounded border border-white/20"
                                                        style={{ backgroundColor: template.palettes[0].accent }}
                                                        title="Secondary color"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="rounded-lg bg-white/5 border border-white/10 px-4 py-3 flex items-center gap-2.5 text-xs text-gray-400">
                                <span>You can customize colors, switch templates, or edit your template later at any time in your dashboard settings.</span>
                            </div>

                        </div>

                        {error && <div className="text-sm text-red-400">{error}</div>}

                        <div className="flex items-center justify-between">
                            <button onClick={() => setStep(1)} className="px-4 py-2 rounded bg-transparent border border-white/5 text-gray-300">Back</button>
                            <div className="flex gap-2">
                                <button onClick={onClose} className="px-4 py-2 rounded bg-transparent border border-white/5 text-gray-300">Cancel</button>
                                <button onClick={async () => {
                                    // Read current values from the mounted SignupForm
                                    try {
                                        setError('')
                                        setLoading(true)
                                        const values = signupRef.current?.getValues ? signupRef.current.getValues() : {}

                                        const res = await fetch('/api/auth/register', {
                                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                email: values.email,
                                                password: values.password,
                                                businessName: values.businessName,
                                                phone: values.phone,
                                                subdomain: values.subdomain || undefined,
                                                domain: values.customDomain || undefined,
                                                template: selectedTemplate,
                                                theme: {
                                                    type: selectedTheme,
                                                    colors: {
                                                        primary: primaryColor,
                                                        accent: secondaryColor,
                                                    },
                                                },
                                            })
                                        })
                                        const data = await res.json()
                                        if (!res.ok) {
                                            setError(data.error || 'Registration failed')
                                            setLoading(false)
                                            return
                                        }

                                        const activation = data.data?.activationToken
                                        const subdomain = data.data?.subdomain
                                        const protocol = window.location.protocol
                                        const port = window.location.port ? `:${window.location.port}` : ''
                                        let activateUrl
                                        if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
                                            activateUrl = `${protocol}//${subdomain}.localhost${port}/api/auth/activate?token=${activation}`
                                        } else {
                                            activateUrl = `${protocol}//${subdomain}.${previewBaseDomain}/api/auth/activate?token=${activation}`
                                        }
                                        window.location.href = activateUrl
                                    } catch (err) {
                                        console.error(err)
                                        setError('An error occurred. Please try again.')
                                        setLoading(false)
                                    }
                                }} disabled={loading} className="px-4 py-2 rounded bg-green-600 text-white">{loading ? 'Creating...' : 'Create account & Continue'}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

