import { NextResponse } from 'next/server'
import { createPost, getPosts } from '@/lib/social-posting-service'
import { siteConfig } from '@/config/siteConfig'

/**
 * GET /api/admin/social-posting/posts
 * Get all posts for a bar
 */
export async function GET(request) {
  try {
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const platform = searchParams.get('platform')
    const accountId = searchParams.get('accountId')

    const filters = {}
    if (status) filters.status = status
    if (platform) filters.platform = platform
    if (accountId) filters.accountId = accountId

    const posts = await getPosts(barId, filters)

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get posts' }, { status: 500 })
  }
}

/**
 * POST /api/admin/social-posting/posts
 * Create a new post (draft or scheduled)
 */
export async function POST(request) {
  try {
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const {
      adminId,
      adminName,
      platform,
      accountId,
      accountName,
      contentType,
      caption,
      mediaUrls,
      scheduledFor,
    } = body

    if (!adminId || !platform || !accountId) {
      return NextResponse.json(
        { error: 'adminId, platform, and accountId are required' },
        { status: 400 }
      )
    }

    if (!['facebook', 'instagram'].includes(platform)) {
      return NextResponse.json(
        { error: 'Platform must be "facebook" or "instagram"' },
        { status: 400 }
      )
    }

    // Validate that we have either caption or mediaUrls
    if ((!caption || caption.trim() === '') && (!mediaUrls || mediaUrls.length === 0)) {
      return NextResponse.json(
        { error: 'Either a caption or at least one media URL is required' },
        { status: 400 }
      )
    }

    // Note: Instagram requires at least one image
    if (platform === 'instagram' && (!mediaUrls || mediaUrls.length === 0)) {
      return NextResponse.json(
        { error: 'Instagram posts require at least one image' },
        { status: 400 }
      )
    }

    // Determine status
    let status = 'draft'
    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor)
      if (scheduledDate > new Date()) {
        status = 'scheduled'
      }
    }

    // Determine content type
    let finalContentType = contentType
    if (!finalContentType) {
      if (mediaUrls && mediaUrls.length > 1) {
        finalContentType = 'carousel'
      } else if (mediaUrls && mediaUrls.length === 1) {
        finalContentType = 'photo'
      } else {
        finalContentType = 'text' // Text-only post
      }
    }

    const post = await createPost({
      barId,
      adminId,
      adminName,
      platform,
      accountId,
      accountName,
      contentType: finalContentType,
      caption: caption || '',
      mediaUrls: mediaUrls || [],
      scheduledFor: scheduledFor || null,
      status,
    })

    return NextResponse.json({
      success: true,
      post,
    })
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create post' }, { status: 500 })
  }
}
