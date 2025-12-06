import { headers } from 'next/headers'
import { getTenantConfig } from '@/lib/tenant-service'
import TemplateSelector from '@/components/admin/TemplateSelector'

export const metadata = {
    title: 'Theme Settings | Admin',
}

export default async function ThemeSettingsPage() {
    const headersList = await headers()
    const tenantId = headersList.get('x-tenant-id')

    // If no tenant context, we might be in super admin or error state
    if (!tenantId) {
        return <div>Error: No tenant context found.</div>
    }

    const tenant = await getTenantConfig(tenantId)

    // Serialize theme data to ensure safe passage to client component
    // specifically converting Map to plain object for overrides
    const themeParams = tenant?.theme ? {
        ...tenant.theme,
        overrides: tenant.theme.overrides instanceof Map
            ? Object.fromEntries(tenant.theme.overrides)
            : tenant.theme.overrides || {}
    } : null

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Theme & Appearance</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Customize your website's look and feel by selecting a template and adjusting colors.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
                <TemplateSelector tenantId={tenantId} initialTheme={themeParams} />
            </div>
        </div>
    )
}
