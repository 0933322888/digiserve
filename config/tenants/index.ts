import { siteConfig as trioConfig } from '../trio'
import { SiteConfig } from '../siteConfig'

export const tenants: Record<string, SiteConfig> = {
    'triobistro': trioConfig,
    'bar_1': trioConfig, // Alias for development/default tenant
    // Add other tenants here
}
