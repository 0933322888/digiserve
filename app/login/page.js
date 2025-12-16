import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-edge'
import { getTenantConfig } from '@/lib/tenant-service'
import LoginForm from '@/components/auth/LoginForm'

export default async function LoginPage() {
    // Check if already authenticated
    const session = await getSession()
    const headersList = await headers()
    const tenantId = headersList.get('x-tenant-id')

    if (session && session.authenticated) {
        // Validate session matches tenant
        if (session.tenantId === tenantId) {
            redirect('/admin')
        }
        // Session mismatch - will be cleared by middleware
    }

    // No tenant resolved - show 404
    if (!tenantId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Access Denied</h1>
                    <p className="text-gray-400 mb-6">
                        Login is only available on tenant domains. Please access your restaurant&apos;s specific domain or subdomain.
                    </p>
                    <p className="text-sm text-gray-500">
                        Example: <code className="bg-gray-800 px-2 py-1 rounded">yourrestaurant.digiserve.com</code>
                    </p>
                </div>
            </div>
        )
    }

    // Load tenant configuration for branding
    const tenant = await getTenantConfig(tenantId)

    if (!tenant) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Tenant Not Found</h1>
                    <p className="text-gray-400">
                        The tenant configuration could not be loaded. Please contact support.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-12"
            style={{
                background: tenant.theme?.primaryColor
                    ? `linear-gradient(135deg, ${tenant.theme.primaryColor}15 0%, ${tenant.theme.primaryColor}05 100%)`
                    : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            }}
        >
            <div className="max-w-md w-full">
                {/* Tenant Branding */}
                <div className="text-center mb-8">
                    {tenant.theme?.logo ? (
                        <img
                            src={tenant.theme.logo}
                            alt={tenant.name}
                            className="h-16 mx-auto mb-4"
                        />
                    ) : (
                        <div
                            className="h-16 w-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                            style={{
                                backgroundColor: tenant.theme?.primaryColor
                            }}
                        >
                            {tenant.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <h1 className="text-4xl font-bold text-white mb-2">
                        {tenant.name}
                    </h1>
                    <p className="text-gray-400">
                        Sign in to your dashboard
                    </p>
                </div>

                {/* Login Form */}
                <LoginForm primaryColor={tenant.theme?.primaryColor} />
            </div>
        </div>
    )
}
