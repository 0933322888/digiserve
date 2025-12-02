import { NextResponse } from 'next/server'
import { getSEOConfig, updateSEOConfig } from '@/lib/seo-config-service'

/**
 * GET /api/admin/settings/seo
 * Get SEO settings (DB-first with siteConfig fallback)
 */
export async function GET() {
  try {
    const seo = await getSEOConfig()
    return NextResponse.json({ success: true, seo })
  } catch (error) {
    console.error('Get SEO settings error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get SEO settings' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/settings/seo
 * Update SEO settings
 */
export async function PUT(request) {
  try {
    const body = await request.json()
    const {
      siteName,
      defaultTitle,
      defaultDescription,
      defaultImage,
      twitterHandle,
      facebookUrl,
      instagramUrl,
    } = body

    const updates = {}
    if (siteName !== undefined) updates.siteName = siteName
    if (defaultTitle !== undefined) updates.defaultTitle = defaultTitle
    if (defaultDescription !== undefined) updates.defaultDescription = defaultDescription
    if (defaultImage !== undefined) updates.defaultImage = defaultImage
    if (twitterHandle !== undefined) updates.twitterHandle = twitterHandle
    if (facebookUrl !== undefined) updates.facebookUrl = facebookUrl
    if (instagramUrl !== undefined) updates.instagramUrl = instagramUrl

    // Validate URLs if provided
    if (facebookUrl && !isValidUrl(facebookUrl)) {
      return NextResponse.json({ error: 'Invalid Facebook URL' }, { status: 400 })
    }
    if (instagramUrl && !isValidUrl(instagramUrl)) {
      return NextResponse.json({ error: 'Invalid Instagram URL' }, { status: 400 })
    }
    if (defaultImage && !isValidUrl(defaultImage) && !defaultImage.startsWith('/')) {
      return NextResponse.json(
        { error: 'Invalid image URL (must be absolute URL or start with /)' },
        { status: 400 }
      )
    }

    const updated = await updateSEOConfig(updates, 'admin')

    return NextResponse.json({
      success: true,
      message: 'SEO settings updated successfully',
      seo: updated,
    })
  } catch (error) {
    console.error('Update SEO settings error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update SEO settings' },
      { status: 500 }
    )
  }
}

/**
 * Validate URL format
 */
function isValidUrl(string) {
  try {
    const url = new URL(string)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch (_) {
    return false
  }
}

