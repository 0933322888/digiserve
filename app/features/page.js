import MarketingLayout from '@/components/marketing/MarketingLayout'
import { Check, Globe, Smartphone, Calendar, BarChart3, LayoutTemplate, ShieldCheck, Zap } from 'lucide-react'

export const metadata = {
    title: 'Features | DigiServe',
    description: 'Explore the powerful features that make DigiServe the best operating system for modern restaurants.',
}

export default function FeaturesPage() {
    return (
        <MarketingLayout>
            <div className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Powerful features for modern restaurants</h1>
                        <p className="text-xl text-gray-400">Everything you need to manage your digital presence, operations, and growth in one place.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureDetail
                            icon={Globe}
                            title="Website Builder"
                            description="Launch a stunning, mobile-responsive website in minutes. Our AI-powered builder generates content and layouts tailored to your brand."
                            features={['SEO Optimized', 'Custom Domain', 'Fast Loading', 'Mobile Ready']}
                        />
                        <FeatureDetail
                            icon={Smartphone}
                            title="Online Ordering"
                            description="Accept pickup and delivery orders directly from your website. Eliminate third-party commissions and keep your profits."
                            features={['Commission Free', 'Real-time Updates', 'Payment Processing', 'Order Management']}
                        />
                        <FeatureDetail
                            icon={Calendar}
                            title="Reservations"
                            description="A complete table booking system. Manage capacity, special requests, and automated confirmations without extra fees."
                            features={['Table Management', 'SMS Reminders', 'Waitlist', 'Calendar View']}
                        />
                        <FeatureDetail
                            icon={BarChart3}
                            title="Analytics & Insights"
                            description="Understand your business better with detailed reports on sales, popular items, and customer behavior."
                            features={['Sales Reports', 'Customer Insights', 'Traffic Analysis', 'Export Data']}
                        />
                        <FeatureDetail
                            icon={LayoutTemplate}
                            title="Menu Management"
                            description="Update your menu once and see it reflect everywhere. Manage items, modifiers, out-of-stock status, and more."
                            features={['Photo Uploads', 'Dietary Tags', 'Modifiers', 'QR Code Menu']}
                        />
                        <FeatureDetail
                            icon={ShieldCheck}
                            title="Secure & Reliable"
                            description="Enterprise-grade security and reliability. We handle hosting, SSL certificates, and updates so you don't have to."
                            features={['SSL Included', '99.9% Uptime', 'Daily Backups', 'DDoS Protection']}
                        />
                    </div>
                </div>
            </div>
        </MarketingLayout>
    )
}

function FeatureDetail({ icon: Icon, title, description, features }) {
    return (
        <div className="bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-blue-500/30 transition-colors">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                <Icon className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">{title}</h3>
            <p className="text-gray-400 mb-8 leading-relaxed">{description}</p>
            <ul className="space-y-3">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-blue-500" /> {feature}
                    </li>
                ))}
            </ul>
        </div>
    )
}
