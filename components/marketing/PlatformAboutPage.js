'use client'

import MarketingLayout from '@/components/marketing/MarketingLayout'

export default function PlatformAboutPage() {
    return (
        <MarketingLayout>
            <div className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-20">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Empowering restaurants to thrive</h1>
                        <p className="text-xl text-gray-400">We're on a mission to give every restaurant the digital tools they need to succeed.</p>
                    </div>

                    <div className="prose prose-invert prose-lg max-w-none">
                        <p>
                            DigiServe was founded with a simple belief: great food deserves great technology. We saw too many restaurants struggling with fragmented systems, high commissions, and outdated websites.
                        </p>
                        <p>
                            We built DigiServe to be the all-in-one operating system for modern restaurants. From building a beautiful website to managing reservations and online orders, we provide everything you need to run your digital operations seamlessly.
                        </p>

                        <h2 className="text-3xl font-bold mt-12 mb-6">Our Values</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
                            <div className="bg-[#111] p-6 rounded-xl border border-white/10">
                                <h3 className="text-xl font-bold mb-2">Restaurant First</h3>
                                <p className="text-gray-400">We build for you, not for investors. Our success is tied directly to yours.</p>
                            </div>
                            <div className="bg-[#111] p-6 rounded-xl border border-white/10">
                                <h3 className="text-xl font-bold mb-2">Transparency</h3>
                                <p className="text-gray-400">No hidden fees, no surprise commissions. We believe in clear, fair pricing.</p>
                            </div>
                            <div className="bg-[#111] p-6 rounded-xl border border-white/10">
                                <h3 className="text-xl font-bold mb-2">Simplicity</h3>
                                <p className="text-gray-400">Technology should be a helper, not a hurdle. We obsess over ease of use.</p>
                            </div>
                            <div className="bg-[#111] p-6 rounded-xl border border-white/10">
                                <h3 className="text-xl font-bold mb-2">Innovation</h3>
                                <p className="text-gray-400">We're constantly improving our platform to keep you ahead of the curve.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    )
}
