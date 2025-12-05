'use client'

import Link from 'next/link'

export default function MarketingLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-blue-600 selection:text-white flex flex-col">
            {/* Navigation */}
            <nav className="sticky top-0 w-full z-50 px-6 py-4 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-white">D</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">DigiServe</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <Link href="/features" className="hover:text-white transition-colors">Features</Link>
                        <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                        <Link href="/templates" className="hover:text-white transition-colors">Templates</Link>
                        <Link href="/about" className="hover:text-white transition-colors">About</Link>
                        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/signup"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-[#050505] text-sm mt-auto">
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
        </div>
    )
}
