import MarketingLayout from '@/components/marketing/MarketingLayout'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
    title: 'Blog | DigiServe',
    description: 'Latest news, tips, and insights for restaurant owners.',
}

export default function BlogPage() {
    return (
        <MarketingLayout>
            <div className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Latest from the blog</h1>
                        <p className="text-xl text-gray-400">Tips, trends, and insights to help you run a better restaurant.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <BlogCard
                            title="5 Ways to Increase Online Orders"
                            excerpt="Learn how to optimize your menu and website to drive more takeout and delivery sales."
                            date="Dec 1, 2024"
                            category="Growth"
                            image="https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=800&h=600&fit=crop"
                        />
                        <BlogCard
                            title="The Future of Restaurant Tech"
                            excerpt="From AI to automation, here are the trends that will shape the industry in 2025."
                            date="Nov 28, 2024"
                            category="Technology"
                            image="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=600&fit=crop"
                        />
                        <BlogCard
                            title="Mastering Menu Engineering"
                            excerpt="How to design your menu to maximize profitability and influence customer choices."
                            date="Nov 20, 2024"
                            category="Operations"
                            image="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop"
                        />
                    </div>
                </div>
            </div>
        </MarketingLayout>
    )
}

function BlogCard({ title, excerpt, date, category, image }) {
    return (
        <Link href="#" className="group bg-[#111] border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all hover:-translate-y-1">
            <div className="relative h-48 overflow-hidden">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {category}
                </div>
            </div>
            <div className="p-6">
                <div className="text-sm text-gray-500 mb-3">{date}</div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{excerpt}</p>
            </div>
        </Link>
    )
}
