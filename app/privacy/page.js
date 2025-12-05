import MarketingLayout from '@/components/marketing/MarketingLayout'

export const metadata = {
    title: 'Privacy Policy | DigiServe',
    description: 'Our commitment to protecting your privacy.',
}

export default function PrivacyPage() {
    return (
        <MarketingLayout>
            <div className="py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                    <div className="prose prose-invert prose-lg max-w-none">
                        <p className="text-gray-400 mb-8">Last updated: December 1, 2024</p>

                        <p>
                            At DigiServe, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
                        </p>

                        <h3>Information We Collect</h3>
                        <p>
                            We collect information that you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us for support. This may include your name, email address, phone number, and payment information.
                        </p>

                        <h3>How We Use Your Information</h3>
                        <p>
                            We use the information we collect to provide, maintain, and improve our services, to process your transactions, to send you technical notices and support messages, and to communicate with you about products, services, offers, and events.
                        </p>

                        <h3>Data Security</h3>
                        <p>
                            We implement appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no method of transmission over the Internet or method of electronic storage is 100% secure.
                        </p>

                        <h3>Contact Us</h3>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at privacy@digiserve.com.
                        </p>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    )
}
