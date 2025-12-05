import MarketingLayout from '@/components/marketing/MarketingLayout'
import { Check } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
    title: 'Pricing | DigiServe',
    description: 'Simple, transparent pricing for restaurants of all sizes.',
}

export default function PricingPage() {
    return (
        <MarketingLayout>
            <div className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, transparent pricing</h1>
                        <p className="text-xl text-gray-400">Start for free, upgrade as you grow. No hidden fees or commissions.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Starter Plan */}
                        <PricingCard
                            name="Starter"
                            price="$0"
                            period="/month"
                            description="Perfect for new restaurants just getting started."
                            features={[
                                'Professional Website',
                                'Digital Menu',
                                'Online Ordering (5% fee)',
                                'Basic Analytics',
                                'Email Support'
                            ]}
                            cta="Start Free"
                            ctaLink="/signup"
                        />

                        {/* Pro Plan */}
                        <PricingCard
                            name="Pro"
                            price="$49"
                            period="/month"
                            description="Everything you need to grow your business."
                            popular={true}
                            features={[
                                'Everything in Starter',
                                'Zero Commission Ordering',
                                'Table Reservations',
                                'Custom Domain',
                                'Advanced Analytics',
                                'Priority Support'
                            ]}
                            cta="Start Free Trial"
                            ctaLink="/signup?plan=pro"
                        />

                        {/* Enterprise Plan */}
                        <PricingCard
                            name="Enterprise"
                            price="Custom"
                            period=""
                            description="For restaurant groups and franchises."
                            features={[
                                'Everything in Pro',
                                'Multi-location Management',
                                'API Access',
                                'Dedicated Account Manager',
                                'Custom Integration',
                                'SLA Guarantee'
                            ]}
                            cta="Contact Sales"
                            ctaLink="/contact"
                            secondary={true}
                        />
                    </div>
                </div>
            </div>
        </MarketingLayout>
    )
}

function PricingCard({ name, price, period, description, features, cta, ctaLink, popular, secondary }) {
    return (
        <div className={`relative flex flex-col p-8 rounded-2xl border ${popular ? 'bg-[#111] border-blue-500 shadow-2xl shadow-blue-900/20' : 'bg-[#0A0A0A] border-white/10'}`}>
            {popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Most Popular
                </div>
            )}

            <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">{name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold">{price}</span>
                    <span className="text-gray-500">{period}</span>
                </div>
                <p className="text-gray-400 text-sm">{description}</p>
            </div>

            <ul className="space-y-4 mb-8 flex-grow">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                        <Check className={`w-5 h-5 flex-shrink-0 ${popular ? 'text-blue-500' : 'text-gray-500'}`} />
                        {feature}
                    </li>
                ))}
            </ul>

            <Link
                href={ctaLink}
                className={`w-full py-3 px-4 rounded-lg font-bold text-center transition-all ${popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
                        : secondary
                            ? 'bg-white/10 hover:bg-white/20 text-white'
                            : 'bg-white text-black hover:bg-gray-100'
                    }`}
            >
                {cta}
            </Link>
        </div>
    )
}
