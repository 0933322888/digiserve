export function getThemeVariables(theme) {
    if (!theme) return {}

    const variables = {
        '--primary': theme.primaryColor || '#8B0000',
        '--secondary': theme.secondaryColor || '#F5F5DC',
    }

    // Derived colors based on template/theme type
    // Matches logic in ThemeProvider.js
    if (theme.templateId === 'bar' || theme.type === 'vintage') {
        variables['--cream'] = theme.secondaryColor || '#F5F5DC'
        variables['--gold'] = '#d4af37'
    } else if (theme.templateId === 'sushi' || theme.type === 'modern') {
        variables['--cream'] = theme.secondaryColor || '#F5F5DC'
        variables['--gold'] = '#3498db' // Blue accent for sushi? or keep generic
    } else if (theme.templateId === 'restaurant' || theme.type === 'minimalist') {
        variables['--cream'] = theme.secondaryColor || '#F5F5DC'
        variables['--gold'] = '#666666'
    } else {
        // Defaults
        variables['--cream'] = theme.secondaryColor || '#F5F5DC'
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

    switch (templateId) {
        case 'bar':
            return {
                hero: 'centered',
                gallery: 'masonry',
                menu: 'list',
            }
        case 'sushi':
            return {
                hero: 'minimal',
                gallery: 'grid',
                menu: 'grid',
            }
        case 'restaurant':
            return {
                hero: 'split',
                gallery: 'masonry',
                menu: 'list',
            }
        default:
            return defaults
    }
}
