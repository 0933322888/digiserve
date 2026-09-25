import { getTemplateById } from '@/config/templates'
import { generateThemeColorVariants } from '@/lib/color-utils'

export function getThemeVariables(theme) {
    if (!theme) return {}

    // Get template config
    const templateId = theme.templateId || 'bar'
    const template = getTemplateById(templateId)

    let variables = {}

    const defaultPalette = template?.palettes?.[0]
    const palette = theme.colors || defaultPalette
    const variants = generateThemeColorVariants(palette.primary, palette.accent)
    const selectedPalette = template?.palettes?.find(item =>
        item.primary.toUpperCase() === palette.primary.toUpperCase() &&
        item.accent.toUpperCase() === palette.accent.toUpperCase()
    )
    const primaryText = selectedPalette?.primaryText || variants.light.primary.text
    const accentText = selectedPalette?.accentText || variants.light.accent.text
    const navbarFooterText = selectedPalette?.navbarFooterText || primaryText
    variants.light.primary.text = primaryText
    variants.dark.primary.text = primaryText
    variants.light.accent.text = accentText
    variants.dark.accent.text = accentText

    variables['--primary-light-bg'] = variants.light.primary.bg
    variables['--primary-light-text'] = variants.light.primary.text
    variables['--secondary-light-bg'] = variants.light.accent.bg
    variables['--secondary-light-text'] = variants.light.accent.text
    variables['--primary-dark-bg'] = variants.dark.primary.bg
    variables['--primary-dark-text'] = variants.dark.primary.text
    variables['--secondary-dark-bg'] = variants.dark.accent.bg
    variables['--secondary-dark-text'] = variants.dark.accent.text
    variables['--primary'] = palette.primary
    variables['--secondary'] = palette.accent
    variables['--navbar-footer-text'] = navbarFooterText

    if (template && template.theme) {
        // Use template-defined accent/secondary as defaults if not overridden
        // Logic: specific theme prop takes precedence, else template default
        // Start with what we resolved for secondary, or override if specific accent exists
        variables['--cream'] = variants.light.primary.text
        variables['--gold'] = palette.accent
        variables['--gold-text'] = variants.light.accent.text
        variables['--accent'] = variables['--gold']
        variables['--accent-text'] = accentText

        // Add typography variables if needed
        if (template.theme.typography) {
            variables['--heading-font'] = template.theme.typography.headingFont
            variables['--body-font'] = template.theme.typography.bodyFont
        }

        // Add border radius
        if (template.theme.borderRadius) {
            variables['--radius'] = template.theme.borderRadius
        }
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
