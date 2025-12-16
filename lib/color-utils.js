/**
 * Color utility functions for theme management
 */

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.0 formula
 */
function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map((c) => {
        const sRGB = c / 255
        return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function getContrastRatio(color1, color2) {
    const rgb1 = hexToRgb(color1)
    const rgb2 = hexToRgb(color2)

    if (!rgb1 || !rgb2) return 1

    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

    const lighter = Math.max(lum1, lum2)
    const darker = Math.min(lum1, lum2)

    return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Determine if a color is light or dark
 * Returns true if the color is light (should use dark text)
 */
export function isLightColor(hexColor) {
    const rgb = hexToRgb(hexColor)
    if (!rgb) return false

    const luminance = getLuminance(rgb.r, rgb.g, rgb.b)
    return luminance > 0.5
}

/**
 * Get the best contrasting text color (white or black) for a background
 * Ensures WCAG AA compliance (contrast ratio >= 4.5:1)
 */
export function getContrastingTextColor(backgroundColor) {
    const whiteContrast = getContrastRatio(backgroundColor, '#FFFFFF')
    const blackContrast = getContrastRatio(backgroundColor, '#000000')

    // Return white if it has better contrast, otherwise black
    return whiteContrast > blackContrast ? '#FFFFFF' : '#000000'
}

/**
 * Lighten a color by a percentage
 */
export function lightenColor(hexColor, percent) {
    const rgb = hexToRgb(hexColor)
    if (!rgb) return hexColor

    const amount = Math.round(2.55 * percent)
    const r = Math.min(255, rgb.r + amount)
    const g = Math.min(255, rgb.g + amount)
    const b = Math.min(255, rgb.b + amount)

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
}

/**
 * Darken a color by a percentage
 */
export function darkenColor(hexColor, percent) {
    const rgb = hexToRgb(hexColor)
    if (!rgb) return hexColor

    const amount = Math.round(2.55 * percent)
    const r = Math.max(0, rgb.r - amount)
    const g = Math.max(0, rgb.g - amount)
    const b = Math.max(0, rgb.b - amount)

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
}

/**
 * Generate a lighter variant suitable for dark mode backgrounds
 * Increases brightness while maintaining hue
 */
export function generateDarkModeVariant(hexColor, amount = 15) {
    return lightenColor(hexColor, amount)
}

/**
 * Generate a darker variant suitable for light mode backgrounds
 * Can be used to create hover states or variants
 */
export function generateLightModeVariant(hexColor, amount = 10) {
    return darkenColor(hexColor, amount)
}

/**
 * Generate complete theme colors from base primary and secondary colors
 * Auto-calculates all variants and text colors
 */
export function generateCompleteThemeColors(primaryLightBg, secondaryLightBg) {
    // Generate dark mode background variants
    const primaryDarkBg = generateDarkModeVariant(primaryLightBg, 15)
    const secondaryDarkBg = isLightColor(secondaryLightBg)
        ? '#2C2C2C' // If secondary is light, use dark gray for dark mode
        : generateDarkModeVariant(secondaryLightBg, 20)

    // Auto-calculate text colors for all variants
    return {
        light: {
            primary: {
                bg: primaryLightBg,
                text: getContrastingTextColor(primaryLightBg)
            },
            secondary: {
                bg: secondaryLightBg,
                text: getContrastingTextColor(secondaryLightBg)
            }
        },
        dark: {
            primary: {
                bg: primaryDarkBg,
                text: getContrastingTextColor(primaryDarkBg)
            },
            secondary: {
                bg: secondaryDarkBg,
                text: getContrastingTextColor(secondaryDarkBg)
            }
        }
    }
}

/**
 * Validate and normalize a color object with bg and text properties
 */
export function validateColorObject(colorObj, fallbackBg = '#000000') {
    if (!colorObj || typeof colorObj !== 'object') {
        return {
            bg: fallbackBg,
            text: getContrastingTextColor(fallbackBg)
        }
    }

    const bg = colorObj.bg || fallbackBg
    const text = colorObj.text || getContrastingTextColor(bg)

    return { bg, text }
}
