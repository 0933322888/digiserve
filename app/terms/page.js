import MarketingLayout from '@/components/marketing/MarketingLayout'

export const metadata = {
    title: 'Terms of Use | DigiServe',
    description: 'Terms and conditions for using DigiServe.',
}

export default function TermsPage() {
    return (
        <MarketingLayout>
            <div className="py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8">Terms of Use</h1>
                    <div className="prose prose-invert prose-lg max-w-none">
                        <p className="text-gray-400 mb-8">Last updated: December 1, 2024</p>

                        <p>
                            Please read these Terms of Use carefully before using the DigiServe platform. By accessing or using our services, you agree to be bound by these terms.
                        </p>

                        <h3>1. Acceptance of Terms</h3>
                        <p>
                            By accessing or using our services, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>

                        <h3>2. Use License</h3>
                        <p>
                            Permission is granted to temporarily download one copy of the materials (information or software) on DigiServe&apos;s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                        </p>

                        <h3>3. Disclaimer</h3>
                        <p>
                            The materials on DigiServe&apos;s website are provided on an &apos;as is&apos; basis. DigiServe makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>

                        <h3>4. Limitations</h3>
                        <p>
                            In no event shall DigiServe or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on DigiServe&apos;s website.
                        </p>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    )
}
