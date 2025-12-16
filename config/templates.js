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
        colors: {
            light: {
                primary: {
                    bg: '#360507', // Deep Red
                    text: '#E8E8D0'
                },
                secondary: {
                    bg: '#1A1A1A', // Dark Gray/Black
                    text: '#E8E8D0'
                }
            },
            dark: {
                primary: {
                    bg: '#1a0505', // Deep Wine Red
                    text: '#E8E8D0'
                },
                secondary: {
                    bg: '#2A2A2A', // Lighter Gray for dark mode
                    text: '#E8E8D0'
                }
            }
        },
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
            pageBackground: 'radial-gradient(circle, rgb(52, 8, 9) 0%, rgb(10, 1, 1) 100%)',
            aboutPreview: 'bg-primary/5 dark:bg-gray-800/50',
            events: 'bg-gradient-to-br from-primary/10 via-gold/5 to-primary/5 dark:from-gray-800/50 dark:via-gray-700/30 dark:to-gray-800/50',
            highlights: 'bg-transparent'
        },
        features: ['Dark Mode', 'Cocktail Menu', 'Event Spotlight'],
    },
    {
        id: 'sushi',
        name: 'Zen Sushi',
        description: 'Minimalist and clean. Uses whitespace effectively to showcase fresh food. Grid-based layout ideal for sushi menus.',
        thumbnail: '/images/templates/sushi-thumb.png',
        colors: {
            light: {
                primary: {
                    bg: '#88B04B', // Pastel Green
                    text: '#000000'
                },
                secondary: {
                    bg: '#FFFFFF', // White
                    text: '#333333'
                }
            },
            dark: {
                primary: {
                    bg: '#9BC45C', // Lighter Green for dark mode
                    text: '#000000'
                },
                secondary: {
                    bg: '#2C2C2C', // Dark Gray
                    text: '#E8E8E8'
                }
            }
        },
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
            aboutPreview: 'bg-secondary dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800',
            events: 'bg-gray-50 dark:bg-gray-800/30',
            highlights: 'bg-transparent'
        },
        features: ['Minimalist', 'Photo Grid', 'Clean Typography'],
    },
    {
        id: 'restaurant',
        name: 'Classic Bistro',
        description: 'Warm and inviting. A versatile template suitable for family restaurants and bistros. Balanced mix of text and images.',
        thumbnail: '/images/templates/restaurant-thumb.png',
        colors: {
            light: {
                primary: {
                    bg: '#D35400', // Pumpkin/Warm Orange
                    text: '#FFFFFF'
                },
                secondary: {
                    bg: '#FAF3E0', // Cream
                    text: '#2C3E50'
                }
            },
            dark: {
                primary: {
                    bg: '#E67E22', // Lighter Orange for dark mode
                    text: '#000000'
                },
                secondary: {
                    bg: '#34495E', // Navy/Dark Blue-Gray
                    text: '#ECF0F1'
                }
            }
        },
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
            aboutPreview: 'bg-orange-50/50 dark:bg-gray-800/40',
            events: 'bg-secondary dark:bg-gray-900',
            highlights: 'bg-transparent'
        },
        features: ['Warm Colors', 'Family Friendly', 'Detailed Menu'],
    },
]

export const DEFAULT_TEMPLATE_ID = 'bar'

export function getTemplateById(id) {
    return TEMPLATES.find(t => t.id === id) || TEMPLATES.find(t => t.id === DEFAULT_TEMPLATE_ID)
}
