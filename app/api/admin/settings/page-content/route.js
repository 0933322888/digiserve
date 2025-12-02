import { NextResponse } from 'next/server'
import { getSetting, setSetting } from '@/lib/app-settings-service'
import { siteConfig } from '@/config/siteConfig'

/**
 * GET /api/admin/settings/page-content
 * Get page content configuration
 */
export async function GET() {
  try {
    const homeContent = await getSetting('PAGE_CONTENT_HOME')
    const aboutContent = await getSetting('PAGE_CONTENT_ABOUT')

    // Return with defaults if not set
    const defaultHomeContent = {
      highlights: {
        sectionTitle: 'Experience TRIO',
        sectionSubtitle: 'Discover what makes us special',
        items: [
          {
            title: 'Exquisite Cuisine',
            description: 'Our chef-curated menu features the finest ingredients and innovative flavors.',
            link: '/menu',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
            enabled: true,
          },
        ],
      },
      aboutPreview: {
        title: siteConfig.restaurant.tagline,
        description: siteConfig.restaurant.description,
        buttonText: 'Learn More About Us',
        buttonLink: '/about',
        image: '/images/interior.jpg',
      },
      eventsSection: {
        title: 'Upcoming Events',
        subtitle: "Don't miss out on these special experiences",
      },
      ctaSection: {
        title: 'Reserve Your Table',
        description: 'Experience the perfect blend of vintage elegance and modern flavor. Book your table today.',
        buttonText: 'Make a Reservation',
        buttonLink: '/reservations',
      },
    }

    const defaultAboutContent = {
      hero: {
        title: 'Our Story',
      },
      mission: {
        title: 'Our Mission',
        description: `At ${siteConfig.restaurant.name}, we believe that dining is an experience that should engage all the senses. Our mission is to create memorable moments through exceptional cuisine, impeccable service, and an atmosphere that blends vintage elegance with contemporary comfort.`,
        description2: 'We source the finest ingredients, craft each dish with care, and curate a beverage selection that complements our culinary offerings. Every detail, from the ambiance to the presentation, is designed to make your visit unforgettable.',
      },
      timeline: {
        sectionTitle: 'Our Journey',
        sectionSubtitle: 'Milestones that shaped who we are today',
        items: [
          {
            year: '2015',
            title: 'The Beginning',
            description: 'TRIO BISTRO AND LOUNGE opened its doors with a vision to blend vintage elegance with modern culinary innovation.',
            enabled: true,
          },
          {
            year: '2017',
            title: 'Award Recognition',
            description: 'Received "Best New Restaurant" award from the local dining association.',
            enabled: true,
          },
          {
            year: '2020',
            title: 'Expansion',
            description: 'Expanded our menu and renovated our space to create an even more memorable dining experience.',
            enabled: true,
          },
          {
            year: '2024',
            title: 'Today',
            description: 'Continuing to serve exceptional cuisine and create unforgettable moments for our guests.',
            enabled: true,
          },
        ],
      },
      philosophy: {
        title: 'Our Philosophy',
        description: 'We believe that great food brings people together. Our philosophy centers on three core principles:',
        principles: [
          {
            title: 'Quality',
            description: 'We use only the finest ingredients, sourced locally when possible, to ensure every dish meets our high standards.',
            enabled: true,
          },
          {
            title: 'Craftsmanship',
            description: 'Every dish is prepared with attention to detail and a passion for culinary excellence.',
            enabled: true,
          },
          {
            title: 'Hospitality',
            description: 'We strive to make every guest feel welcomed and valued, creating an atmosphere of warmth and elegance.',
            enabled: true,
          },
        ],
      },
    }

    return NextResponse.json({
      success: true,
      home: homeContent ? JSON.parse(homeContent) : defaultHomeContent,
      about: aboutContent ? JSON.parse(aboutContent) : defaultAboutContent,
    })
  } catch (error) {
    console.error('Get page content error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get page content' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/settings/page-content
 * Update page content configuration
 */
export async function PUT(request) {
  try {
    const body = await request.json()
    const { page, content, updatedBy } = body

    if (!page || !content) {
      return NextResponse.json(
        { error: 'page and content are required' },
        { status: 400 }
      )
    }

    if (page !== 'home' && page !== 'about') {
      return NextResponse.json(
        { error: 'page must be "home" or "about"' },
        { status: 400 }
      )
    }

    const key = `PAGE_CONTENT_${page.toUpperCase()}`
    const value = JSON.stringify(content)

    await setSetting(
      key,
      value,
      `${page.charAt(0).toUpperCase() + page.slice(1)} page content configuration`,
      'page-content',
      updatedBy || 'admin'
    )

    return NextResponse.json({
      success: true,
      message: `${page} page content updated successfully`,
    })
  } catch (error) {
    console.error('Update page content error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update page content' },
      { status: 500 }
    )
  }
}

