"use client"

import { forwardRef, useState, useEffect, useImperativeHandle } from 'react'
import { Copy, Check, Building2, Mail, Lock, Phone } from 'lucide-react'

function SignupFormInner({ onNext, initialValues = {}, submitLabel = 'Create Account' }, ref) {
    const previewBaseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'digiserve.com'
    const [formData, setFormData] = useState({
        email: initialValues.email || '',
        password: initialValues.password || '',
        confirmPassword: initialValues.confirmPassword || '',
        businessName: initialValues.businessName || '',
        phone: initialValues.phone || '',
        subdomain: initialValues.subdomain || '',
        customDomain: initialValues.customDomain || '',
    })
    const [subdomainTouched, setSubdomainTouched] = useState(false)
    const [subdomainStatus, setSubdomainStatus] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)

    const slugify = (str) => {
        if (!str) return ''
        return str
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-{2,}/g, '-')
            .slice(0, 63)
    }

    useEffect(() => {
        if (!subdomainTouched) {
            const generated = slugify(formData.businessName)
            if (generated && generated !== formData.subdomain) {
                setFormData(prev => ({ ...prev, subdomain: generated }))
            }
        }
    }, [formData.businessName, subdomainTouched])

    useEffect(() => {
        let mounted = true
        if (!formData.subdomain) { setSubdomainStatus(null); return }
        if (!/^[a-z0-9-]{2,63}$/.test(formData.subdomain)) { setSubdomainStatus('invalid'); return }
        setSubdomainStatus('checking')
        const t = setTimeout(async () => {
            try {
                const res = await fetch('/api/subdomain/check', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subdomain: formData.subdomain })
                })
                const data = await res.json()
                if (!mounted) return
                setSubdomainStatus(data.available ? 'available' : 'taken')
            } catch (err) {
                if (mounted) setSubdomainStatus(null)
            }
        }, 500)
        return () => { mounted = false; clearTimeout(t) }
    }, [formData.subdomain])

    // Expose current values to parent via ref
    useImperativeHandle(ref, () => ({
        getValues: () => formData,
        validate: () => validate(),
    }))

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCopy = async () => {
        try {
            const full = formData.subdomain ? `${formData.subdomain}.${previewBaseDomain}` : previewBaseDomain
            if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(full)
            else { const ta = document.createElement('textarea'); ta.value = full; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta) }
            setCopied(true); setTimeout(() => setCopied(false), 1500)
        } catch (err) { /* ignore */ }
    }

    const validate = () => {
        if (!formData.email || !formData.password || !formData.businessName) {
            setError('Please fill in required fields')
            return false
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return false
        }
        if (formData.password.length < 5) {
            setError('Password must be at least 5 characters long')
            return false
        }
        if (formData.subdomain) {
            if (!/^[a-z0-9-]{2,63}$/.test(formData.subdomain)) {
                setError('Subdomain must be 2-63 characters and contain only lowercase letters, numbers, and hyphens')
                return false
            }
            const reserved = ['www','app','api','admin']
            if (reserved.includes(formData.subdomain)) {
                setError('That subdomain is reserved. Please choose another.')
                return false
            }
            if (subdomainStatus === 'taken') {
                setError('That subdomain is already taken. Please choose another.')
                return false
            }
            if (subdomainStatus === 'invalid') {
                setError('Please enter a valid subdomain.')
                return false
            }
        }
        if (formData.customDomain) {
            if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(formData.customDomain)) {
                setError('Please enter a valid custom domain (example: abcrestaurant.com)')
                return false
            }
        }
        setError('')
        return true
    }

    // If onNext is provided, the form will call it with values instead of posting to server
    const handleNext = async (e) => {
        e?.preventDefault()
        if (!validate()) return
        if (onNext) {
            onNext(formData)
            return
        }

        // default behavior: register and redirect to activation
        setLoading(true)
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    businessName: formData.businessName,
                    phone: formData.phone,
                    subdomain: formData.subdomain || undefined,
                    domain: formData.customDomain || undefined,
                })
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return }

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
            console.error('Registration error:', err)
            setError('An error occurred. Please try again.')
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleNext} className="space-y-6">

            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Business Name *</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input name="businessName" value={formData.businessName} onChange={handleChange} required placeholder="Business Name" className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Email Address *</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Phone Number (Optional)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="(555) 123-4567" className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400" />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Preferred subdomain</label>
                <div className="flex items-center">
                    <div className="relative flex-1">
                        <input name="subdomain" value={formData.subdomain} onChange={(e)=>{ setSubdomainTouched(true); const raw=(e.target.value||'').trim().toLowerCase(); const left=raw.split('.')[0]; const cleaned=slugify(left); setFormData(prev=>({...prev, subdomain: cleaned})); }} placeholder="abc-bar" className="block w-full pr-28 pl-3 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400" />
                        <div className="absolute right-28 top-1/2 -translate-y-1/2 text-xs" aria-live="polite">
                            {subdomainStatus === 'checking' && <span className="text-yellow-300">Checking…</span>}
                            {subdomainStatus === 'available' && <span className="text-green-300">Available</span>}
                            {subdomainStatus === 'taken' && <span className="text-red-300">Taken</span>}
                            {subdomainStatus === 'invalid' && <span className="text-red-300">Invalid</span>}
                        </div>

                        {/* Non-editable suffix shown inside the input for localhost dev environment */}
                        {previewBaseDomain && previewBaseDomain.includes('localhost') && (
                            <div className="absolute right-10 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">.localhost</div>
                        )}
                    </div>

                    <button type="button" onClick={handleCopy} aria-label="Copy full domain" className="inline-flex items-center justify-center px-3 py-2 border-l border-gray-600 bg-red-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded ml-2">
                        {copied ? <Check className="h-4 w-4 text-green-300" /> : <Copy className="h-4 w-4 text-gray-200" />}
                    </button>
                </div>

                <div className="mt-2 text-sm text-gray-300 font-mono">{formData.subdomain ? `${formData.subdomain}.${previewBaseDomain}` : previewBaseDomain}</div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Custom domain (optional)</label>
                <input name="customDomain" value={formData.customDomain} onChange={handleChange} placeholder="yourdomain.com" className="block w-full pl-3 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Password *</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="Minimum 8 characters" className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Confirm Password *</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required placeholder="Re-enter password" className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400" />
                    </div>
                </div>
            </div>

            {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">{error}</div>}

            <div className="flex items-center justify-between">
                <div />
                <button type="submit" disabled={loading} className={`${onNext ? 'hidden' : 'w-full ml-4'} bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}>{loading ? 'Creating Account...' : (onNext ? 'Next' : submitLabel)}</button>
            </div>
        </form>
    )
}

export default forwardRef(SignupFormInner)
