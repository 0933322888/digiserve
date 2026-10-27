'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import SignupForm from '@/components/onboarding/SignupForm'
import { TEMPLATES } from '@/config/templates'

const templateOrder = ['restaurant', 'sushi', 'bar']
const templates = templateOrder
    .map(id => TEMPLATES.find(template => template.id === id))
    .filter(Boolean)

const capabilities = [
    { number: '01', title: 'A website that feels like your place', description: 'Give guests the essentials: your story, location, hours, and a clear path to your menu.' },
    { number: '02', title: 'A menu you can keep current', description: 'Organize sections and items, update prices, and add the details guests look for.' },
    { number: '03', title: 'Online ordering', description: 'Let guests place orders through your restaurant website.' },
    { number: '04', title: 'Reservations in one place', description: 'Accept table requests and keep reservation details together.' },
    { number: '05', title: 'Useful analytics', description: 'Review sales, popular menu items, and activity across your site.' },
    { number: '06', title: 'Themes with room to make them yours', description: 'Start with a restaurant-specific template, then choose colors that suit your brand.' },
]
const modules = [
    { name: 'Online ordering', description: 'Let guests order directly from your website.' },
    { name: 'Reservations', description: 'Accept table requests and manage bookings.' },
    { name: 'Events', description: 'Promote upcoming events at your business.' },
    { name: 'Photo gallery', description: 'Showcase your space, dishes, and team.' },
    { name: 'Gift cards', description: 'Offer digital gift cards to your guests.' },
    { name: 'Social media posting', description: 'Create and manage posts for Facebook and Instagram.' },
]
const audienceWords = ['restaurant', 'bar', 'bistro', 'sushi bar', 'bakery', 'coffee shop', 'café', 'tavern', 'pub']

export default function PlatformLandingPage() {
    const [showWizard, setShowWizard] = useState(false)
    const [initialTemplate, setInitialTemplate] = useState(TEMPLATES[0]?.id || 'bar')
    const [audienceIndex, setAudienceIndex] = useState(0)
    const [visibleCharacters, setVisibleCharacters] = useState(audienceWords[0].length)
    const [isErasing, setIsErasing] = useState(false)
    const focusReturnRef = useRef(null)
    const [featuredTemplate, ...otherTemplates] = templates
    const closeWizard = useCallback(() => setShowWizard(false), [])

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

        const word = audienceWords[audienceIndex]
        const delay = isErasing ? 55 : visibleCharacters === word.length ? 1500 : 95
        const timeout = window.setTimeout(() => {
            if (isErasing) {
                if (visibleCharacters === 0) {
                    setAudienceIndex(index => (index + 1) % audienceWords.length)
                    setIsErasing(false)
                } else {
                    setVisibleCharacters(count => count - 1)
                }
            } else if (visibleCharacters === word.length) {
                setIsErasing(true)
            } else {
                setVisibleCharacters(count => count + 1)
            }
        }, delay)

        return () => window.clearTimeout(timeout)
    }, [audienceIndex, isErasing, visibleCharacters])

    const openWizard = (event, templateId = TEMPLATES[0]?.id || 'bar') => {
        focusReturnRef.current = event.currentTarget
        setInitialTemplate(templateId)
        setShowWizard(true)
    }

    return (
        <div className="min-h-screen bg-[#f5f0e5] font-sans text-[#20372d] selection:bg-[#c84b35] selection:text-white">
            <header className="sticky top-0 z-40 border-b border-[#20372d]/15 bg-[#f5f0e5]/95 backdrop-blur-sm">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 px-5 py-4 sm:px-8">
                    <Link href="/" aria-label="DigiServe home" className="font-serif text-2xl text-[#20372d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c84b35]">
                        DigiServe<span className="text-[#c84b35]">.</span>
                    </Link>
                    <nav aria-label="Main navigation" className="order-3 w-full overflow-x-auto md:order-0 md:w-auto">
                        <ul className="flex min-w-max items-center gap-5 py-1 text-sm text-[#20372d]/75 md:gap-7">
                            <li><a className="transition-colors hover:text-[#c84b35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c84b35]" href="#features">Features</a></li>
                            <li><Link className="transition-colors hover:text-[#c84b35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c84b35]" href="/pricing">Pricing</Link></li>
                            <li><a className="transition-colors hover:text-[#c84b35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c84b35]" href="#templates">Templates</a></li>
                            <li><Link className="transition-colors hover:text-[#c84b35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c84b35]" href="/about">About</Link></li>
                            <li><Link className="transition-colors hover:text-[#c84b35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c84b35]" href="/blog">Blog</Link></li>
                        </ul>
                    </nav>
                    <button type="button" onClick={openWizard} className="inline-flex min-h-11 items-center justify-center bg-[#c84b35] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#a93b29] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#20372d]">
                        Get started
                    </button>
                </div>
            </header>

            <main>
                <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-16 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16 lg:pb-28 lg:pt-20">
                    <div className="max-w-xl">
                        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#a3432f]">For independent hospitality businesses</p>
                        <h1 className="font-serif text-5xl leading-[1.04] text-[#20372d] sm:text-6xl lg:text-7xl">
                            A better way to bring your{' '}
                            <span aria-hidden="true" className="inline-block min-w-[10ch] text-[#a3432f]">
                                {audienceWords[audienceIndex].slice(0, visibleCharacters)}<span className="ml-px inline-block h-[0.8em] border-l-2 border-current align-[-0.06em]" />
                            </span>
                            <span className="sr-only" aria-live="polite" aria-atomic="true">{audienceWords[audienceIndex]}</span>{' '}
                            online.
                        </h1>
                        <p className="mt-6 max-w-lg text-base leading-7 text-[#20372d]/75 sm:text-lg sm:leading-8">Build your website, keep your menu current, take orders, and manage reservations from one place.</p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <button type="button" onClick={openWizard} className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#c84b35] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a93b29] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#20372d]">
                                Create your site <span aria-hidden="true">&rarr;</span>
                            </button>
                            <a href="#templates" className="inline-flex min-h-12 items-center justify-center border border-[#20372d]/30 px-6 py-3 text-sm font-semibold text-[#20372d] transition-colors hover:border-[#20372d] hover:bg-[#20372d]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c84b35]">
                                View the templates
                            </a>
                        </div>
                        <p className="mt-8 border-l-2 border-[#d99a51] pl-4 text-sm leading-6 text-[#20372d]/70">Your restaurant’s website, menu, ordering, and reservations, brought together.</p>
                    </div>

                    {featuredTemplate && (
                        <figure className="relative min-w-0">
                            <div className="relative aspect-[1.08/1] overflow-hidden border border-[#20372d]/15 bg-[#e6ddca] sm:aspect-[1.2/1]">
                                <Image src={featuredTemplate.thumbnail} alt={`${featuredTemplate.name} restaurant website template preview`} fill priority sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover" />
                            </div>
                            <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[#20372d]/25 py-3 text-sm">
                                <span className="font-semibold">A restaurant website, ready to make your own</span>
                                <span className="text-[#20372d]/65">{featuredTemplate.name} template</span>
                            </figcaption>
                            <span aria-hidden="true" className="absolute -bottom-5 -left-3 -z-10 h-24 w-24 bg-[#d99a51] sm:-bottom-7 sm:-left-5 sm:h-32 sm:w-32" />
                        </figure>
                    )}
                </section>

                <section id="templates" className="scroll-mt-24 border-y border-[#20372d]/15 bg-[#ebe5d8] px-5 py-16 sm:px-8 sm:py-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-10 grid gap-5 md:mb-14 md:grid-cols-[1fr_0.7fr] md:items-end md:gap-12">
                            <div>
                                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#a3432f]">A starting point, not a mold</p>
                                <h2 className="max-w-2xl font-serif text-4xl leading-tight text-[#20372d] sm:text-5xl">A site should feel like your kind of restaurant.</h2>
                            </div>
                            <p className="max-w-lg leading-7 text-[#20372d]/70">Choose a look made for the way you welcome people. Each preview comes from a template already in DigiServe.</p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-[1.12fr_0.88fr] md:gap-10">
                            {featuredTemplate && <TemplatePreview template={featuredTemplate} featured onSelect={openWizard} />}
                            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-1 md:gap-7">
                                {otherTemplates.map(template => <TemplatePreview key={template.id} template={template} onSelect={openWizard} />)}
                            </div>
                        </div>
                        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#20372d]/20 pt-5">
                            <p className="text-sm text-[#20372d]/65">Modern Bar · Zen Sushi · Classic Bistro</p>
                            <p className="text-sm text-[#20372d]/65">Choose a look to start your site.</p>
                        </div>
                    </div>
                </section>

                <section id="features" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
                        <div>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#a3432f]">The useful parts, together</p>
                            <h2 className="font-serif text-4xl leading-tight text-[#20372d] sm:text-5xl">Everything guests need before they walk in.</h2>
                            <p className="mt-5 max-w-md leading-7 text-[#20372d]/70">Give people a clear way to find you, see what’s on the menu, place an order, or book a table.</p>
                            <figure className="mt-9">
                                <div className="relative aspect-[4/3] overflow-hidden bg-[#e6ddca]">
                                    <Image src="/images/gall1.jpg" alt="A freshly prepared restaurant dish served on a white plate" fill sizes="(max-width: 1024px) 100vw, 36vw" className="object-cover" />
                                </div>
                                <figcaption className="mt-2 text-xs text-[#20372d]/60">A menu is more than a list of dishes.</figcaption>
                            </figure>
                        </div>

                        <ol className="border-t border-[#20372d]/25">
                            {capabilities.map(item => (
                                <li key={item.number} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-[#20372d]/25 py-5 sm:grid-cols-[3.5rem_1fr] sm:gap-5 sm:py-6">
                                    <span className="pt-1 font-serif text-sm text-[#a3432f]">{item.number}</span>
                                    <div>
                                        <h3 className="font-serif text-2xl leading-tight text-[#20372d]">{item.title}</h3>
                                        <p className="mt-2 max-w-xl text-sm leading-6 text-[#20372d]/70">{item.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section className="border-y border-[#20372d]/15 bg-[#eee7d8] px-5 py-16 sm:px-8 sm:py-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-2xl">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#a3432f]">Choose what works for you</p>
                            <h2 className="font-serif text-4xl leading-tight text-[#20372d] sm:text-5xl">The modules your business needs. Nothing you don’t.</h2>
                            <p className="mt-5 max-w-xl leading-7 text-[#20372d]/70">Choose from online ordering, reservations, events, photo galleries, gift cards, and social media posting. Enable only the modules you need, then easily turn them on or off at any time as your business changes.</p>
                        </div>
                        <ul className="mt-10 grid gap-px border border-[#20372d]/15 bg-[#20372d]/15 sm:grid-cols-2 lg:grid-cols-3">
                            {modules.map(module => (
                                <li key={module.name} className="bg-[#f5f0e5] p-6 sm:p-7">
                                    <h3 className="font-serif text-2xl text-[#20372d]">{module.name}</h3>
                                    <p className="mt-2 text-sm leading-6 text-[#20372d]/70">{module.description}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="bg-[#20372d] px-5 py-16 text-[#f5f0e5] sm:px-8 sm:py-24">
                    <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-2xl">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#e2a56f]">A more considered online home</p>
                            <h2 className="font-serif text-4xl leading-tight sm:text-5xl">Make it easier for the right guests to find you.</h2>
                            <p className="mt-5 max-w-xl leading-7 text-white/75">Start with a restaurant website that brings your essentials into one clear place.</p>
                        </div>
                        <button type="button" onClick={openWizard} className="inline-flex min-h-12 w-full items-center justify-center gap-3 bg-[#c84b35] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a93b29] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f5f0e5] sm:w-auto">Get started <span aria-hidden="true">&rarr;</span></button>
                    </div>
                </section>
            </main>

            <footer className="border-t border-[#20372d]/15 bg-[#f5f0e5] px-5 py-8 text-sm sm:px-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <Link href="/" className="w-fit font-serif text-xl text-[#20372d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c84b35]">DigiServe<span className="text-[#c84b35]">.</span></Link>
                    <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3 text-[#20372d]/70">
                        <Link className="hover:text-[#a3432f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c84b35]" href="/features">Features</Link>
                        <Link className="hover:text-[#a3432f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c84b35]" href="/pricing">Pricing</Link>
                        <Link className="hover:text-[#a3432f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c84b35]" href="/templates">Templates</Link>
                        <Link className="hover:text-[#a3432f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c84b35]" href="/privacy">Privacy</Link>
                        <Link className="hover:text-[#a3432f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c84b35]" href="/terms">Terms</Link>
                        <Link className="hover:text-[#a3432f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c84b35]" href="/contact">Contact</Link>
                    </nav>
                    <p className="text-xs text-[#20372d]/55">&copy; {new Date().getFullYear()} DigiServe Inc.</p>
                </div>
            </footer>
            {showWizard && <SignupWizard initialTemplate={initialTemplate} onClose={closeWizard} returnFocusRef={focusReturnRef} />}
        </div>
    )
}

function TemplatePreview({ template, featured = false, onSelect }) {
    return (
        <article className="min-w-0">
            <div className="group block">
                <div className={`relative overflow-hidden bg-[#ddd4c2] ${featured ? 'aspect-[1.08/1] sm:aspect-[1.12/1]' : 'aspect-[1.45/1] sm:aspect-[1.65/1] md:aspect-[1.8/1]'}`}>
                    <Image src={template.thumbnail} alt={`${template.name} website template preview`} fill sizes={featured ? '(max-width: 768px) 100vw, 55vw' : '(max-width: 768px) 50vw, 38vw'} className="object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:transform-none" />
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[#20372d]/25 py-3">
                    <h3 className="font-serif text-2xl text-[#20372d]">{template.name}</h3>
                    <button type="button" onClick={event => onSelect(event, template.id)} className="min-h-11 text-left text-xs font-semibold uppercase tracking-[0.1em] text-[#a3432f] underline decoration-[#a3432f]/40 underline-offset-4 hover:decoration-[#a3432f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#20372d]">Start with this look <span aria-hidden="true">&rarr;</span></button>
                </div>
                <p className="mt-2 max-w-lg text-sm leading-6 text-[#20372d]/70">{template.description}</p>
            </div>
        </article>
    )
}

function SignupWizard({ initialTemplate, onClose, returnFocusRef }) {
    const previewBaseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'digiserve.com'
    const [step, setStep] = useState(1)
    const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const signupRef = useRef(null)
    const dialogRef = useRef(null)

    useEffect(() => {
        const previousOverflow = document.body.style.overflow
        const previousFocus = returnFocusRef.current
        const handleKeyDown = event => {
            if (event.key === 'Escape') onClose()
            if (event.key === 'Tab') {
                const focusable = dialogRef.current?.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href]')
                if (!focusable?.length) return
                const first = focusable[0]
                const last = focusable[focusable.length - 1]
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault()
                    last.focus()
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault()
                    first.focus()
                }
            }
        }

        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            document.body.style.overflow = previousOverflow
            window.removeEventListener('keydown', handleKeyDown)
            previousFocus?.focus?.()
        }
    }, [onClose, returnFocusRef])

    const selected = TEMPLATES.find(template => template.id === selectedTemplate) || TEMPLATES[0]

    async function createAccount() {
        try {
            setError('')
            setLoading(true)
            const values = signupRef.current?.getValues?.() || {}
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: values.email,
                    password: values.password,
                    businessName: values.businessName,
                    phone: values.phone,
                    subdomain: values.subdomain || undefined,
                    domain: values.customDomain || undefined,
                    template: selectedTemplate,
                    theme: {
                        type: selectedTemplate,
                        colors: {
                            primary: selected?.palettes?.[0]?.primary,
                            accent: selected?.palettes?.[0]?.accent,
                        },
                    },
                }),
            })
            const data = await response.json()
            if (!response.ok) {
                setError(data.error || 'Registration failed')
                setLoading(false)
                return
            }

            const activation = data.data?.activationToken
            const subdomain = data.data?.subdomain || data.data?.slug || values.subdomain
            const protocol = window.location.protocol
            const port = window.location.port ? `:${window.location.port}` : ''
            const activateUrl = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost'
                ? `${protocol}//${subdomain}.localhost${port}/api/auth/activate?token=${activation}`
                : `${protocol}//${subdomain}.${previewBaseDomain}/api/auth/activate?token=${activation}`
            window.location.href = activateUrl
        } catch (registrationError) {
            console.error(registrationError)
            setError('An error occurred. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <button type="button" aria-label="Close signup" onClick={onClose} className="absolute inset-0 bg-[#101a15]/80" />
            <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="signup-dialog-title" className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-[#d99a51]/40 bg-[#20372d] p-5 text-[#f5f0e5] shadow-2xl sm:p-7">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#e2a56f]">Step {step} of 2</p>
                        <h2 id="signup-dialog-title" className="mt-1 font-serif text-2xl sm:text-3xl">{step === 1 ? 'Create your account' : 'Choose your starting point'}</h2>
                    </div>
                    <button type="button" onClick={onClose} autoFocus className="min-h-11 px-3 text-sm underline underline-offset-4 hover:text-[#e2a56f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f0e5]">Close</button>
                </div>

                <div className="mb-6 h-1 bg-white/15" aria-hidden="true">
                    <div className={`h-full bg-[#d66a4e] transition-[width] motion-reduce:transition-none ${step === 1 ? 'w-1/2' : 'w-full'}`} />
                </div>

                <div className={step === 1 ? 'block' : 'hidden'}>
                    <SignupForm ref={signupRef} onNext={() => setStep(2)} />
                    <div className="mt-5 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="min-h-11 px-4 text-sm text-white/75 underline underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f0e5]">Cancel</button>
                        <button type="button" onClick={() => signupRef.current?.validate?.() && setStep(2)} className="min-h-11 bg-[#c84b35] px-5 text-sm font-semibold text-white hover:bg-[#a93b29] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f0e5]">Choose a template</button>
                    </div>
                </div>

                {step === 2 && (
                    <div>
                        <p className="mb-4 text-sm leading-6 text-white/75">Choose the look you want to begin with. You can update its colors later.</p>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {TEMPLATES.map(template => (
                                <button key={template.id} type="button" aria-pressed={selectedTemplate === template.id} onClick={() => setSelectedTemplate(template.id)} className={`overflow-hidden border text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f0e5] ${selectedTemplate === template.id ? 'border-[#e2a56f]' : 'border-white/20 hover:border-white/50'}`}>
                                    <div className="relative aspect-[4/3] bg-[#14231c]">
                                        <Image src={template.thumbnail} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                                    </div>
                                    <span className="block p-3 font-serif text-lg">{template.name}</span>
                                </button>
                            ))}
                        </div>
                        {error && <p role="alert" className="mt-4 text-sm text-[#ffb4a1]">{error}</p>}
                        <div className="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
                            <button type="button" onClick={() => setStep(1)} className="min-h-11 self-start px-2 text-sm text-white/75 underline underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f0e5]">Back to account</button>
                            <button type="button" onClick={createAccount} disabled={loading} className="min-h-12 bg-[#c84b35] px-6 text-sm font-semibold text-white hover:bg-[#a93b29] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f0e5]">{loading ? 'Creating account…' : 'Create account & continue'}</button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}