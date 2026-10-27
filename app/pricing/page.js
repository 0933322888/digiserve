import MarketingLayout from '@/components/marketing/MarketingLayout'
import { Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
    title: 'Pricing | DigiServe',
    description: 'Pay only for what you need. Start with our free core platform.',
}

export default function PricingPage() {
    return (
        <MarketingLayout variant="editorial">
            <div className="px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-16">
                <div className="mx-auto max-w-7xl">
                    <header className="mb-12 max-w-3xl sm:mb-16">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#a3432f]">Pricing</p>
                        <h1 className="font-serif text-5xl leading-tight text-[#20372d] sm:text-6xl">A simple start, with room to add more.</h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-[#20372d]/70 sm:text-lg sm:leading-8">Start with the Core Platform, then choose optional modules that fit the way your business works.</p>
                    </header>

                    <section aria-labelledby="core-platform" className="grid gap-10 bg-[#20372d] px-6 py-8 text-[#f5f0e5] sm:px-10 sm:py-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#e2a56f]">Included for free</p>
                            <h2 id="core-platform" className="mt-3 font-serif text-4xl sm:text-5xl">Core Platform</h2>
                            <p className="mt-4 max-w-md leading-7 text-white/75">The essentials to establish your restaurant’s online presence: a website, a digital menu, and tools to keep your content current.</p>
                            <Link href="/signup" className="mt-7 inline-flex min-h-12 items-center gap-3 bg-[#c84b35] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a93b29] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f5f0e5]">
                                Get started <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                        </div>
                        <ul className="grid content-center gap-x-8 sm:grid-cols-2">
                            {['Professional website', 'Digital menu & QR codes', 'Basic analytics', 'Content management', 'SEO tools', 'Email support'].map(feature => (
                                <li key={feature} className="flex items-center gap-3 border-b border-white/20 py-4 text-sm sm:py-5">
                                    <Check className="h-4 w-4 shrink-0 text-[#e2a56f]" aria-hidden="true" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section aria-labelledby="optional-modules" className="pt-16 sm:pt-24">
                        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#20372d]/20 pb-5">
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#a3432f]">Add what you need</p>
                                <h2 id="optional-modules" className="font-serif text-3xl text-[#20372d] sm:text-4xl">Optional modules</h2>
                            </div>
                            <p className="text-sm text-[#20372d]/60">Listed per month</p>
                        </div>
                        <div className="grid gap-x-12 md:grid-cols-2">
                            {modules.map(module => <ModuleRow key={module.title} {...module} />)}
                        </div>
                    </section>
                </div>
            </div>
        </MarketingLayout>
    )
}

const modules = [
    { title: 'Ordering System', price: '$29', description: 'Branded ordering for pickup and delivery.', features: ['Pickup & delivery', 'Kitchen printing'] },
    { title: 'Reservations', price: '$19', description: 'Table management and online bookings.', features: ['Table management', 'SMS reminders', 'Guest history'] },
    { title: 'Events & Tickets', price: '$9', description: 'Promote events and manage ticket sales.', features: ['Ticket sales', 'Recurring events', 'Calendar view'] },
    { title: 'Gift Cards', price: '$14', description: 'Offer digital gift cards through your site.', features: ['Digital delivery', 'Balance lookup', 'Redemption tracking'] },
    { title: 'Social Marketing', price: '$19', description: 'Plan and publish social content.', features: ['Content generation', 'Auto-scheduling', 'Engagement stats'] },
    { title: 'Loyalty Program', price: '$24', description: 'Set up rewards for returning customers.', features: ['Points system', 'Reward tiers', 'Customer insights'] },
]

function ModuleRow({ title, price, description, features }) {
    return (
        <article className="border-b border-[#20372d]/20 py-6 sm:py-7">
            <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
                <h3 className="font-serif text-2xl text-[#20372d]">{title}</h3>
                <p className="text-sm text-[#20372d]/60"><span className="font-serif text-3xl text-[#20372d]">{price}</span> / month</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#20372d]/70">{description}</p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#20372d]/65">
                {features.map(feature => <li key={feature}>{feature}</li>)}
            </ul>
        </article>
    )
}
