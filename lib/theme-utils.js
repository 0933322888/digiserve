import { getTemplateById } from '@/config/templates'

export function getThemeVariables(theme) {
    if (!theme) return {}

    // Get template config
    const templateId = theme.templateId || 'bar'
    const template = getTemplateById(templateId)

    let variables = {}

    // 1. Try new color structure (theme.colors)
    if (theme.colors && theme.colors.light && theme.colors.light.primary) {
        variables['--primary'] = theme.colors.light.primary.bg
        variables['--secondary'] = theme.colors.light.secondary.bg
    }
    // 2. Try legacy color structure (theme.primaryColor)
    else if (theme.primaryColor) {
        variables['--primary'] = theme.primaryColor
        variables['--secondary'] = theme.secondaryColor || '#F5F5DC'
    }
    // 3. Fallback to template defaults
    else if (template && template.colors && template.colors.light) {
        variables['--primary'] = template.colors.light.primary.bg
        variables['--secondary'] = template.colors.light.secondary.bg
    }
    // 4. Fallback to hardcoded defaults (should rarely happen)
    else {
        variables['--primary'] = '#8B0000'
        variables['--secondary'] = '#F5F5DC'
    }

    if (template && template.theme) {
        // Use template-defined accent/secondary as defaults if not overridden
        // Logic: specific theme prop takes precedence, else template default
        // Start with what we resolved for secondary, or override if specific accent exists
        variables['--cream'] = variables['--secondary']
        variables['--gold'] = template.theme.accentColor || '#d4af37'

        // Add typography variables if needed
        if (template.theme.typography) {
            variables['--heading-font'] = template.theme.typography.headingFont
            variables['--body-font'] = template.theme.typography.bodyFont
        }

        // Add border radius
        if (template.theme.borderRadius) {
            variables['--radius'] = template.theme.borderRadius
        }
    } else {
        variables['--gold'] = '#d4af37'
    }

    // Handle overrides if they exist and are converted to object
    if (theme.overrides && typeof theme.overrides.forEach === 'function') {
        theme.overrides.forEach((value, key) => {
            variables[`--${key}`] = value
        })
    } else if (theme.overrides && typeof theme.overrides === 'object') {
        Object.entries(theme.overrides).forEach(([key, value]) => {
            variables[`--${key}`] = value
        })
    }

    return variables
}

export function getComponentVariants(templateId) {
    const defaults = {
        hero: 'centered',
        gallery: 'masonry',
        menu: 'grid',
    }

    if (!templateId) return defaults

    const template = getTemplateById(templateId)

    if (template && template.layout) {
        return template.layout
    }

    return defaults
}

export function getSectionStyles(templateId) {
    const defaults = {
        pageBackground: 'none',
        aboutPreview: 'bg-primary/5 dark:bg-gray-800/50',
        events: 'bg-secondary dark:bg-gray-900',
        highlights: 'bg-transparent'
    }

    if (!templateId) return defaults

    const template = getTemplateById(templateId)

    if (template && template.sectionStyles) {
        return { ...defaults, ...template.sectionStyles }
    }

    return defaults
}
