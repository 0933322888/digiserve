import MarketingLayout from '@/components/marketing/MarketingLayout'
import Image from 'next/image'

export const metadata = {
    title: 'Blog | DigiServe',
    description: 'Latest news, tips, and insights for restaurant owners.',
}

export default function BlogPage() {
    const [featured, ...archive] = posts

    return (
        <MarketingLayout variant="editorial">
            <div className="px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-16">
                <div className="mx-auto max-w-7xl">
                    <header className="mb-12 max-w-3xl sm:mb-16">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#a3432f]">Field notes</p>
                        <h1 className="font-serif text-5xl leading-tight text-[#20372d] sm:text-6xl">Ideas for the places people gather.</h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-[#20372d]/70 sm:text-lg sm:leading-8">Notes on menus, online ordering, and the digital side of hospitality.</p>
                    </header>

                    {featured && (
                        <article className="grid gap-8 border-y border-[#20372d]/25 py-7 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-12 md:py-9">
                            <div className="relative aspect-[1.35/1] overflow-hidden bg-[#e6ddca]">
                                <Image src="/images/gall1.jpg" alt="A freshly prepared restaurant dish" fill priority sizes="(max-width: 768px) 100vw, 55vw" className="object-cover" />
                            </div>
                            <div className="max-w-xl">
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#a3432f]">{featured.category}</p>
                                <time dateTime={featured.isoDate} className="mt-3 block text-sm text-[#20372d]/55">{featured.date}</time>
                                <h2 className="mt-3 font-serif text-3xl leading-tight text-[#20372d] sm:text-4xl">{featured.title}</h2>
                                <p className="mt-4 leading-7 text-[#20372d]/70">{featured.excerpt}</p>
                            </div>
                        </article>
                    )}

                    <section aria-labelledby="archive-title" className="mt-14 sm:mt-20">
                        <div className="mb-5 flex items-baseline justify-between gap-4">
                            <h2 id="archive-title" className="font-serif text-3xl text-[#20372d]">More from the journal</h2>
                            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#a3432f]">Archive</span>
                        </div>
                        <div className="border-t border-[#20372d]/25">
                            {archive.map(post => (
                                <article key={post.title} className="grid gap-3 border-b border-[#20372d]/25 py-6 sm:grid-cols-[10rem_1fr] sm:gap-8 sm:py-7">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#a3432f]">{post.category}</p>
                                        <time dateTime={post.isoDate} className="mt-2 block text-sm text-[#20372d]/55">{post.date}</time>
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-2xl text-[#20372d]">{post.title}</h3>
                                        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#20372d]/70">{post.excerpt}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </MarketingLayout>
    )
}

const posts = [
    { title: '5 Ways to Increase Online Orders', excerpt: 'Learn how to optimize your menu and website to drive more takeout and delivery sales.', date: 'Dec 1, 2024', isoDate: '2024-12-01', category: 'Growth' },
    { title: 'The Future of Restaurant Tech', excerpt: 'From AI to automation, here are the trends that will shape the industry in 2025.', date: 'Nov 28, 2024', isoDate: '2024-11-28', category: 'Technology' },
    { title: 'Mastering Menu Engineering', excerpt: 'How to design your menu to maximize profitability and influence customer choices.', date: 'Nov 20, 2024', isoDate: '2024-11-20', category: 'Operations' },
]
