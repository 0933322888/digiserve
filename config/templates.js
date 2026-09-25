/**
 * Registry of available website templates
 * Used by Admin UI for selection and by Runtime for rendering
 */

export const TEMPLATES = [
    {
        id: 'bar',
        name: 'Modern Bar',
        description: 'A sleek, dark-themed template perfect for cocktail bars and speakeasies. Features high-contrast typography and focus on drink photography.',
        thumbnail: '/images/templates/bar-thumb.png',
        palettes: [
            { name: 'Amber Noir', primary: '#1C0F0B', accent: '#C88A3D', primaryText: '#530000', navbarFooterText: '#FFFFFF' },
            { name: 'Burgundy Gold', primary: '#3B1018', accent: '#D4AF67', navbarFooterText: '#FFFFFF' },
            { name: 'Midnight Copper', primary: '#101820', accent: '#B86B3D', navbarFooterText: '#FFFFFF' },
        ],
        theme: {
            mode: 'dark',
            accentColor: '#D4AF37', // Gold
            typography: {
                headingFont: 'Playfair Display',
                bodyFont: 'Lato'
            },
            borderRadius: '0px',
        },
        layout: {
            hero: 'hero-slider',
            menu: 'cards',
            gallery: 'masonry',
            eventsSection: true
        },
        sectionStyles: {
            pageBackground: 'radial-gradient(circle, var(--primary-dark-bg) 0%, var(--secondary-dark-bg) 100%)',
            aboutPreview: 'bg-primary/5 dark:bg-[var(--secondary-dark-bg)]/50',
            events: 'bg-gradient-to-br from-primary/10 via-gold/5 to-primary/5 dark:from-[var(--secondary-dark-bg)]/50 dark:via-[var(--primary-dark-bg)]/30 dark:to-[var(--secondary-dark-bg)]/50',
            highlights: 'bg-transparent'
        },
        features: ['Dark Mode', 'Cocktail Menu', 'Event Spotlight'],
    },
    {
        id: 'sushi',
        name: 'Zen Sushi',
        description: 'Minimalist and clean. Uses whitespace effectively to showcase fresh food. Grid-based layout ideal for sushi menus.',
        thumbnail: '/images/templates/sushi-thumb.png',
        palettes: [
            { name: 'Lotus Bloom', primary: '#7e9b76', accent: '#ffffff', primaryText: '#7e9b76', accentText: '#b3398a', navbarFooterText: '#FFFFFF' },
            { name: 'Matcha Sage', primary: '#7E9B76', accent: '#E8D9B5', primaryText: '#FFFFFF', accentText: '#000000', navbarFooterText: '#FFFFFF' },
            { name: 'Deep Wasabi', primary: '#345B4A', accent: '#D8B56A', navbarFooterText: '#FFFFFF' },
            { name: 'Sakura Zen', primary: '#D8A7A7', accent: '#ffffff', primaryText: '#7d2b2b', accentText: '#000000', navbarFooterText: '#7D2B2B' },
        ],
        theme: {
            mode: 'light',
            accentColor: '#333333', // Charcoal
            typography: {
                headingFont: 'Montserrat',
                bodyFont: 'Open Sans'
            },
            borderRadius: '12px',
        },
        layout: {
            hero: 'hero-video',
            menu: 'grid',
            gallery: 'grid',
            promotionBanner: true
        },
        sectionStyles: {
            aboutPreview: 'bg-secondary dark:bg-[var(--secondary-dark-bg)] border-t border-gray-100 dark:border-[var(--primary-dark-bg)]/20',
            events: 'bg-[var(--secondary-light-bg)] dark:bg-[var(--secondary-dark-bg)]/30',
            highlights: 'bg-transparent'
        },
        features: ['Minimalist', 'Photo Grid', 'Clean Typography'],
    },
    {
        id: 'restaurant',
        name: 'Classic Bistro',
        description: 'Warm and inviting. A versatile template suitable for family restaurants and bistros. Balanced mix of text and images.',
        thumbnail: '/images/templates/restaurant-thumb.png',
        palettes: [
            { name: 'Terracotta Cream', primary: '#B5522E', accent: '#F1D6A8', navbarFooterText: '#FFFFFF' },
            { name: 'Bordeaux Beige', primary: '#702F35', accent: '#D9C3A5', navbarFooterText: '#FFFFFF' },
            { name: 'Olive Rust', primary: '#59633F', accent: '#C7663B', navbarFooterText: '#FFFFFF' },
        ],
        theme: {
            mode: 'light',
            accentColor: '#2C3E50', // Navy
            typography: {
                headingFont: 'Merriweather',
                bodyFont: 'Roboto'
            },
            borderRadius: '8px',
        },
        layout: {
            hero: 'hero-static',
            menu: 'list',
            gallery: 'carousel',
            chefSection: true
        },
        sectionStyles: {
            aboutPreview: 'bg-orange-50/50 dark:bg-[var(--secondary-dark-bg)]/40',
            events: 'bg-secondary dark:bg-[var(--secondary-dark-bg)]',
            highlights: 'bg-transparent'
        },
        features: ['Warm Colors', 'Family Friendly', 'Detailed Menu'],
    },
]

export const DEFAULT_TEMPLATE_ID = 'bar'

export function getTemplateById(id) {
    return TEMPLATES.find(t => t.id === id) || TEMPLATES.find(t => t.id === DEFAULT_TEMPLATE_ID)
}
