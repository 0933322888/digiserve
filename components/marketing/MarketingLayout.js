'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/templates', label: 'Templates' },
    { href: '/about', label: 'About' },
    { href: '/blog', label: 'Blog' },
]

export default function MarketingLayout({ children, variant = 'dark' }) {
    const pathname = usePathname()
    const editorial = variant === 'editorial'

    return (
        <div className={`flex min-h-screen flex-col font-sans selection:bg-[#c84b35] selection:text-white ${editorial ? 'bg-[#f5f0e5] text-[#20372d]' : 'bg-[#0A0A0A] text-white'}`}>
            <header className={`sticky top-0 z-40 border-b backdrop-blur-sm ${editorial ? 'border-[#20372d]/15 bg-[#f5f0e5]/95' : 'border-white/5 bg-[#0A0A0A]/90'}`}>
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 px-5 py-4 sm:px-8">
                    <Link href="/" aria-label="DigiServe home" className={`font-serif text-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${editorial ? 'text-[#20372d] focus-visible:outline-[#c84b35]' : 'text-white focus-visible:outline-white'}`}>
                        DigiServe<span className="text-[#c84b35]">.</span>
                    </Link>

                    <nav aria-label="Main navigation" className="order-3 w-full overflow-x-auto md:order-0 md:w-auto">
                        <ul className={`flex min-w-max items-center gap-5 py-1 text-sm md:gap-7 ${editorial ? 'text-[#20372d]/75' : 'text-gray-400'}`}>
                            {navigation.map(item => {
                                const active = pathname === item.href
                                return (
                                    <li key={item.href}>
                                        <Link href={item.href} aria-current={active ? 'page' : undefined} className={`transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${editorial ? 'focus-visible:outline-[#c84b35]' : 'focus-visible:outline-white'} ${active ? editorial ? 'font-semibold text-[#a3432f]' : 'font-semibold text-white' : editorial ? 'hover:text-[#c84b35]' : 'hover:text-white'}`}>
                                            {item.label}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>

                    <Link href="/signup" className={`inline-flex min-h-11 items-center justify-center px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${editorial ? 'bg-[#c84b35] text-white hover:bg-[#a93b29] focus-visible:outline-[#20372d]' : 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-white'}`}>
                        Get started
                    </Link>
                </div>
            </header>

            <main className="flex-grow">
                {children}
            </main>

            {editorial ? (
                <footer className="border-t border-[#20372d]/15 bg-[#f5f0e5] px-5 py-8 text-sm sm:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <Link href="/" className="w-fit font-serif text-xl text-[#20372d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c84b35]">
                            DigiServe<span className="text-[#c84b35]">.</span>
                        </Link>
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
            ) : (
                <footer className="mt-auto border-t border-white/5 bg-[#050505] py-12 text-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div>
                            <h4 className="font-bold text-white mb-4">Product</h4>
                            <ul className="space-y-2 text-gray-500">
                                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                                <li><Link href="/templates" className="hover:text-white transition-colors">Templates</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-500">
                                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4">Legal</h4>
                            <ul className="space-y-2 text-gray-500">
                                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4">Connect</h4>
                            <ul className="space-y-2 text-gray-500">
                                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                                <span className="font-bold text-white text-xs">D</span>
                            </div>
                            <span className="font-bold text-gray-300">DigiServe</span>
                        </div>
                        <p className="text-gray-600">&copy; {new Date().getFullYear()} DigiServe Inc. All rights reserved.</p>
                    </div>
                </div>
                </footer>
            )}
        </div>
    )
}
