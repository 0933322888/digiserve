/**
 * Sample Data Service
 * 
 * Provides sample/template data for new tenants during onboarding
 */

/**
 * Get sample menu items for quick setup
 * @returns {Object} Sample menu with food and drink items
 */
export function getSampleMenuItems() {
    return {
        food: [
            {
                id: 'sample-food-1',
                name: 'Classic Burger',
                description: 'Angus beef patty with lettuce, tomato, onion, and our special sauce',
                price: 14.99,
                dietary: [],
                unavailable: false,
                archived: false,
            },
            {
                id: 'sample-food-2',
                name: 'Caesar Salad',
                description: 'Crisp romaine lettuce, parmesan cheese, croutons, and Caesar dressing',
                price: 11.99,
                dietary: ['vegetarian'],
                unavailable: false,
                archived: false,
            },
            {
                id: 'sample-food-3',
                name: 'Grilled Salmon',
                description: 'Fresh Atlantic salmon with seasonal vegetables and lemon butter sauce',
                price: 22.99,
                dietary: ['gluten-free'],
                unavailable: false,
                archived: false,
            },
        ],
        drinks: [
            {
                id: 'sample-drink-1',
                name: 'House Red Wine',
                description: 'Smooth and full-bodied red wine',
                price: 8.99,
                size: 'Glass',
                dietary: [],
                unavailable: false,
                archived: false,
            },
            {
                id: 'sample-drink-2',
                name: 'Craft Beer',
                description: 'Rotating selection of local craft beers',
                price: 7.50,
                dietary: [],
                unavailable: false,
                archived: false,
            },
            {
                id: 'sample-drink-3',
                name: 'Fresh Lemonade',
                description: 'House-made lemonade with fresh lemons',
                price: 4.99,
                dietary: ['vegan', 'gluten-free'],
                unavailable: false,
                archived: false,
            },
        ],
    }
}

/**
 * Get sample events for new tenants
 * @returns {Array} Sample events
 */
export function getSampleEvents() {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    return [
        {
            id: 'sample-event-1',
            title: 'Live Music Night',
            date: nextWeek.toISOString().split('T')[0],
            time: '19:00',
            description: 'Join us for an evening of live music featuring local artists. Great food, drinks, and atmosphere!',
            image: '/images/sample-event-music.jpg',
            featured: true,
        },
        {
            id: 'sample-event-2',
            title: 'Wine Tasting Event',
            date: nextMonth.toISOString().split('T')[0],
            time: '18:00',
            description: 'Explore a curated selection of wines from around the world. Limited seating available.',
            image: '/images/sample-event-wine.jpg',
            featured: false,
        },
    ]
}

/**
 * Get sample gallery images
 * @returns {Array} Sample gallery images
 */
export function getSampleGalleryImages() {
    return [
        {
            id: 'sample-gallery-1',
            url: '/images/sample-interior-1.jpg',
            alt: 'Restaurant interior',
            caption: 'Our cozy dining area',
            category: 'ambiance',
            featured: true,
            order: 1,
        },
        {
            id: 'sample-gallery-2',
            url: '/images/sample-food-1.jpg',
            alt: 'Signature dish',
            caption: 'Our signature burger',
            category: 'food',
            featured: true,
            order: 2,
        },
        {
            id: 'sample-gallery-3',
            url: '/images/sample-drinks-1.jpg',
            alt: 'Craft cocktails',
            caption: 'Handcrafted cocktails',
            category: 'drinks',
            featured: false,
            order: 3,
        },
    ]
}

/**
 * Get default business hours
 * @returns {Object} Default business hours for a restaurant
 */
export function getDefaultBusinessHours() {
    return {
        Monday: { open: '11:00', close: '22:00', closed: false },
        Tuesday: { open: '11:00', close: '22:00', closed: false },
        Wednesday: { open: '11:00', close: '22:00', closed: false },
        Thursday: { open: '11:00', close: '23:00', closed: false },
        Friday: { open: '11:00', close: '00:00', closed: false },
        Saturday: { open: '11:00', close: '00:00', closed: false },
        Sunday: { open: '11:00', close: '22:00', closed: false },
    }
}

/**
 * Get default theme configuration
 * @param {string} themeType - 'vintage', 'modern', or 'minimalist'
 * @returns {Object} Theme configuration
 */
export function getDefaultTheme(themeType = 'vintage') {
    const themes = {
        vintage: {
            type: 'vintage',
            primaryColor: '#8B0000', // Deep red
            secondaryColor: '#F5F5DC', // Cream
            logo: null,
        },
        modern: {
            type: 'modern',
            primaryColor: '#2C3E50', // Dark blue-gray
            secondaryColor: '#ECF0F1', // Light gray
            logo: null,
        },
        minimalist: {
            type: 'minimalist',
            primaryColor: '#000000', // Black
            secondaryColor: '#FFFFFF', // White
            logo: null,
        },
    }

    return themes[themeType] || themes.vintage
}

/**
 * Get default ordering configuration
 * @returns {Object} Default ordering settings
 */
export function getDefaultOrderingConfig() {
    return {
        enabled: true,
        pickup: true,
        delivery: true,
        dineIn: true,
        taxRate: 0.13, // 13% (Ontario HST)
        deliverySettings: {
            baseFee: 5.0,
            freeDeliveryFrom: 50.0,
            deliveryZones: [],
        },
    }
}

/**
 * Get default contact information template
 * @param {string} businessName - Business name
 * @returns {Object} Contact information template
 */
export function getDefaultContactInfo(businessName) {
    return {
        phone: '',
        email: '',
        address: {
            street: '',
            city: '',
            state: 'ON',
            zip: '',
            country: 'Canada',
            coordinates: {
                lat: 0,
                lon: 0,
            },
        },
    }
}

/**
 * Get default SEO settings
 * @param {string} businessName - Business name
 * @returns {Object} SEO settings
 */
export function getDefaultSEO(businessName) {
    return {
        title: `${businessName} | Restaurant & Bar`,
        description: `Welcome to ${businessName}. Experience great food, drinks, and atmosphere.`,
        image: '/images/default-og-image.jpg',
    }
}
