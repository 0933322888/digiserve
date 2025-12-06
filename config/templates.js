/**
 * Registry of available website templates
 * Used by Admin UI for selection and by Runtime for rendering
 */

export const TEMPLATES = [
    {
        id: 'bar',
        name: 'Modern Bar',
        description: 'A sleek, dark-themed template perfect for cocktail bars and speakeasies. Features high-contrast typography and focus on drink photography.',
        thumbnail: '/images/templates/bar-thumb.jpg',
        features: ['Dark Mode', 'Cocktail Menu', 'Event Spotlight'],
    },
    {
        id: 'sushi',
        name: 'Zen Sushi',
        description: 'Minimalist and clean. Uses whitespace effectively to showcase fresh food. Grid-based layout ideal for sushi menus.',
        thumbnail: '/images/templates/sushi-thumb.jpg',
        features: ['Minimalist', 'Photo Grid', 'Clean Typography'],
    },
    {
        id: 'restaurant',
        name: 'Classic Bistro',
        description: 'Warm and inviting. A versatile template suitable for family restaurants and bistros. Balanced mix of text and images.',
        thumbnail: '/images/templates/restaurant-thumb.jpg',
        features: ['Warm Colors', 'Family Friendly', 'Detailed Menu'],
    },
]

export const DEFAULT_TEMPLATE_ID = 'bar'

export function getTemplateById(id) {
    return TEMPLATES.find(t => t.id === id) || TEMPLATES.find(t => t.id === DEFAULT_TEMPLATE_ID)
}
