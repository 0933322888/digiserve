import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-service'
import { getUserModel } from '@/lib/db/models'
import connectDB from '@/lib/db/mongodb-connection'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'

export default async function OnboardingPage() {
    // Check authentication
    const session = await getSession()

    if (!session) {
        redirect('/login?from=/onboarding')
    }

    // Get user data to check onboarding status
    await connectDB()
    const User = getUserModel()
    const user = await User.findOne({ email: session.email })

    if (!user) {
        redirect('/login')
    }

    // If onboarding is already completed, redirect to admin
    if (user.onboardingStatus === 'completed') {
        redirect('/admin')
    }

    // Get tenant ID
    const headersList = await headers()
    const tenantId = user.tenantIds?.[0] || headersList.get('x-tenant-id') || 'bar_1'

    return (
        <OnboardingWizard
            currentStep={user.onboardingStep || 1}
            onboardingStatus={user.onboardingStatus}
            tenantId={tenantId}
            userId={user.id}
        />
    )
}
