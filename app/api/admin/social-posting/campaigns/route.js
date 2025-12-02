import { NextResponse } from 'next/server'
import { getCampaigns, createCampaign } from '@/lib/social-posting-service'

/**
 * GET /api/admin/social-posting/campaigns
 * Get all campaigns for a bar
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

    const campaigns = await getCampaigns(barId, filters)

    return NextResponse.json({
      success: true,
      campaigns,
    })
  } catch (error) {
    console.error('Get campaigns error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get campaigns' }, { status: 500 })
  }
}

/**
 * POST /api/admin/social-posting/campaigns
 * Create a new campaign
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
      name,
      platform,
      accountId,
      accountName,
      posts, // Array of post objects: [{ caption, mediaUrls, scheduledFor }]
    } = body

    if (!adminId || !name || !platform || !accountId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['facebook', 'instagram'].includes(platform)) {
      return NextResponse.json(
        { error: 'Platform must be "facebook" or "instagram"' },
        { status: 400 }
      )
    }

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json({ error: 'At least one post is required' }, { status: 400 })
    }

    // Validate each post
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i]
      if (!post.mediaUrls || post.mediaUrls.length === 0) {
        return NextResponse.json(
          { error: `Post ${i + 1}: At least one image is required` },
          { status: 400 }
        )
      }
      if (!post.scheduledFor) {
        return NextResponse.json(
          { error: `Post ${i + 1}: Scheduled date/time is required` },
          { status: 400 }
        )
      }
      // Validate scheduled date is in the future
      if (new Date(post.scheduledFor) <= new Date()) {
        return NextResponse.json(
          { error: `Post ${i + 1}: Scheduled date must be in the future` },
          { status: 400 }
        )
      }
    }

    const result = await createCampaign({
      barId,
      adminId,
      adminName,
      name,
      platform,
      accountId,
      accountName,
      posts,
      status: 'active',
    })

    return NextResponse.json({
      success: true,
      campaign: result.campaign,
      posts: result.posts,
    })
  } catch (error) {
    console.error('Create campaign error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
