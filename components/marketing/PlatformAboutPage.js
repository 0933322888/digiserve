'use client'

import MarketingLayout from '@/components/marketing/MarketingLayout'
import Image from 'next/image'
import Link from 'next/link'

const principles = [
    { title: 'Made for hospitality', description: 'Start with a template shaped for the way your bar, bistro, or restaurant welcomes guests.' },
    { title: 'The essentials together', description: 'Keep your website, menu, online ordering, and reservations close at hand.' },
    { title: 'Room to make it yours', description: 'Choose a visual direction and adjust your colors to suit your business.' },
]

export default function PlatformAboutPage() {
    return (
        <MarketingLayout variant="editorial">
            <div className="px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-16">
                <div className="mx-auto max-w-7xl">
                    <section className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
                        <div className="max-w-xl">
                            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#a3432f]">About DigiServe</p>
                            <h1 className="font-serif text-5xl leading-tight text-[#20372d] sm:text-6xl">Good hospitality deserves thoughtful software.</h1>
                            <p className="mt-6 text-base leading-7 text-[#20372d]/75 sm:text-lg sm:leading-8">A clear online home for the independent places people gather: restaurants, bars, bistros, and more.</p>
                        </div>
                        <figure>
                            <div className="relative aspect-[5/4] overflow-hidden bg-[#e6ddca] sm:aspect-[1.35/1]">
                                <Image src="/images/interior.jpg" alt="A welcoming restaurant dining room" fill priority sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover" />
                            </div>
                            <figcaption className="mt-3 border-b border-[#20372d]/25 pb-3 text-sm text-[#20372d]/65">Built around the details guests need before they arrive.</figcaption>
                        </figure>
                    </section>

                    <section className="mt-16 border-t border-[#20372d]/20 pt-10 sm:mt-24 sm:pt-14">
                        <div className="grid gap-8 md:grid-cols-[0.65fr_1.35fr] md:gap-16">
                            <div>
                                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#a3432f]">The idea</p>
                                <h2 className="font-serif text-3xl leading-tight text-[#20372d] sm:text-4xl">The digital side should feel as considered as the room.</h2>
                            </div>
                            <div className="max-w-2xl space-y-5 text-base leading-7 text-[#20372d]/75">
                                <p>Independent hospitality businesses need a straightforward way to share their menus, hours, location, and the experience they offer.</p>
                                <p>DigiServe brings a restaurant website, digital menu, online ordering, reservations, and analytics together, with templates for different kinds of places.</p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-16 border-t border-[#20372d]/20 pt-10 sm:mt-24 sm:pt-14">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#a3432f]">What guides the product</p>
                        <h2 className="mb-8 font-serif text-3xl text-[#20372d] sm:text-4xl">Made for the work of welcoming people.</h2>
                        <div className="grid gap-x-10 md:grid-cols-3">
                            {principles.map((principle, index) => (
                                <article key={principle.title} className="border-t border-[#20372d]/25 py-5 sm:py-6">
                                    <p className="mb-4 font-serif text-sm text-[#a3432f]">0{index + 1}</p>
                                    <h3 className="font-serif text-2xl text-[#20372d]">{principle.title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-[#20372d]/70">{principle.description}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <div className="mt-10 border-t border-[#20372d]/20 pt-6">
                        <Link href="/signup" className="inline-flex min-h-12 items-center gap-3 bg-[#c84b35] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a93b29] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#20372d]">Create your site <span aria-hidden="true">&rarr;</span></Link>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    )
}
