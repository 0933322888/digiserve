import MarketingLayout from '@/components/marketing/MarketingLayout'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
    title: 'Templates | DigiServe',
    description: 'Beautiful, professionally designed templates for your restaurant website.',
}

export default function TemplatesPage() {
    return (
        <MarketingLayout>
            <div className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Stunning templates</h1>
                        <p className="text-xl text-gray-400">Choose from our collection of professionally designed templates. Fully customizable to match your brand.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <TemplateCard
                            name="Vintage"
                            description="Classic elegance with warm tones. Perfect for steakhouses and fine dining."
                            image="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop"
                            tags={['Fine Dining', 'Classic', 'Elegant']}
                        />
                        <TemplateCard
                            name="Modern"
                            description="Clean lines and bold typography. Ideal for bistros and contemporary eateries."
                            image="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop"
                            tags={['Bistro', 'Modern', 'Clean']}
                        />
                        <TemplateCard
                            name="Minimalist"
                            description="Simple and sophisticated. Let your food photography take center stage."
                            image="https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?w=800&h=600&fit=crop"
                            tags={['Cafe', 'Minimal', 'Photography']}
                        />
                        <TemplateCard
                            name="Rustic"
                            description="Warm and inviting. Great for farm-to-table and family restaurants."
                            image="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop"
                            tags={['Family', 'Rustic', 'Cozy']}
                        />
                        <TemplateCard
                            name="Urban"
                            description="Edgy and energetic. Perfect for bars, pubs, and nightlife venues."
                            image="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop"
                            tags={['Bar', 'Nightlife', 'Dark']}
                        />
                        <TemplateCard
                            name="Fresh"
                            description="Bright and airy. Excellent for cafes, bakeries, and brunch spots."
                            image="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop"
                            tags={['Bakery', 'Brunch', 'Light']}
                        />
                    </div>
                </div>
            </div>
        </MarketingLayout>
    )
}

function TemplateCard({ name, description, image, tags }) {
    return (
        <div className="group bg-[#111] border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all hover:-translate-y-1">
            <div className="relative h-64 overflow-hidden">
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
                    <div className="flex gap-2">
                        {tags.map((tag, i) => (
                            <span key={i} className="text-xs font-medium text-gray-300 bg-white/10 px-2 py-1 rounded">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="p-6">
                <p className="text-gray-400 text-sm mb-6">{description}</p>
                <Link
                    href="/signup"
                    className="block w-full py-2 px-4 bg-white/5 hover:bg-white/10 text-white text-center rounded-lg font-medium transition-colors border border-white/5"
                >
                    Use This Template
                </Link>
            </div>
        </div>
    )
}
