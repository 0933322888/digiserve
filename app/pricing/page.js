import MarketingLayout from '@/components/marketing/MarketingLayout'
import { Check, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
    title: 'Pricing | DigiServe',
    description: 'Pay only for what you need. Start with our free core platform.',
}

export default function PricingPage() {
    return (
        <MarketingLayout>
            <div className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Flexible Pricing</h1>
                        <p className="text-xl text-gray-400">
                            Start for free with our Core Platform. Add powerful modules as you grow.
                            <br />
                            <span className="text-white font-medium">Pay only for what you use.</span>
                        </p>
                    </div>

                    {/* Core Platform Section */}
                    <div className="mb-16">
                        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-gradient-to-bl from-blue-900/20 to-transparent w-96 h-96 blur-3xl rounded-full pointer-events-none" />

                            <div className="flex flex-col md:flex-row gap-12 relative z-10">
                                <div className="flex-1">
                                    <div className="bg-blue-600/10 text-blue-400 border border-blue-600/20 px-4 py-1.5 rounded-full text-sm font-semibold inline-block mb-6">
                                        Included for Free
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Platform</h2>
                                    <p className="text-gray-400 text-lg mb-8 max-w-xl">
                                        Everything you need to establish your online presence. No credit card required.
                                        Launch your professional website in minutes.
                                    </p>
                                    <Link
                                        href="/signup"
                                        className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                                    >
                                        Get Started Free <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>

                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FeatureItem text="Professional Website" />
                                    <FeatureItem text="Digital Menu & QR Codes" />
                                    <FeatureItem text="Basic Analytics" />
                                    <FeatureItem text="Content Management" />
                                    <FeatureItem text="SEO Tools" />
                                    <FeatureItem text="Email Support" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add-ons Grid */}
                    <div className="mb-12">
                        <h3 className="text-2xl font-bold mb-8 text-center">Add-on Modules</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <AddOnCard
                                title="Ordering System"
                                price="$29"
                                description="Commission-free branded ordering for pickup and delivery."
                                icon="🛍️"
                                features={['Zero commissions', 'Pickup & Delivery', 'Kitchen printing']}
                            />
                            <AddOnCard
                                title="Reservations"
                                price="$19"
                                description="Smart table management and booking system."
                                icon="📅"
                                features={['Table management', 'SMS reminders', 'Guest history']}
                            />
                            <AddOnCard
                                title="Events & Tickets"
                                price="$9"
                                description="Promote events and sell tickets directly from your site."
                                icon="🎟️"
                                features={['Ticket sales', 'Recurring events', 'Calendar view']}
                            />
                            <AddOnCard
                                title="Gift Cards"
                                price="$14"
                                description="Sell digital gift cards and boost upfront revenue."
                                icon="🎁"
                                features={['Digital delivery', 'Balance lookup', 'Redemption tracking']}
                            />
                            <AddOnCard
                                title="Social Marketing"
                                price="$19"
                                description="Auto-post content to Instagram and Facebook."
                                icon="📱"
                                features={['AI content generation', 'Auto-scheduling', 'Engagement stats']}
                            />
                            <AddOnCard
                                title="Loyalty Program"
                                price="$24"
                                description="Reward regular customers and increase retention."
                                icon="💎"
                                features={['Points system', 'Reward tiers', 'Customer insights']}
                            />
                        </div>
                    </div>

                    <div className="text-center text-gray-500 text-sm">
                        All modules come with a <span className="text-white">5-day free trial</span>. No seamless cancellation.
                    </div>
                </div>
            </div>
        </MarketingLayout>
    )
}

function FeatureItem({ text }) {
    return (
        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
            <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span className="font-medium">{text}</span>
        </div>
    )
}

function AddOnCard({ title, price, description, icon, features }) {
    return (
        <div className="group bg-[#0A0A0A] border border-white/10 hover:border-blue-500/50 p-8 rounded-2xl transition-all duration-300 flex flex-col hover:shadow-2xl hover:shadow-blue-900/10">
            <div className="mb-6">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-blue-600/20 transition-colors">
                    {icon}
                </div>
                <h4 className="text-xl font-bold mb-2">{title}</h4>
                <p className="text-gray-400 text-sm h-10">{description}</p>
            </div>

            <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold">{price}</span>
                <span className="text-gray-500">/mo</span>
            </div>

            <div className="space-y-3 mb-8 flex-grow">
                {features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <Plus className="w-4 h-4 text-gray-600 mt-0.5" />
                        {f}
                    </div>
                ))}
            </div>

            <Link
                href="/signup"
                className="block w-full py-3 px-4 rounded-lg font-bold text-center bg-white/10 hover:bg-white text-white hover:text-black transition-all"
            >
                Start 5-Day Free Trial
            </Link>
        </div>
    )
}
