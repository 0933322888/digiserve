import { NextResponse } from 'next/server'
import { generatePostsFromCampaigns } from '@/lib/social-posting-service'

/**
 * POST /api/admin/social-posting/campaigns/generate
 * Generate posts from all active campaigns
 * This endpoint should be called periodically (e.g., via cron job)
 */
export async function POST(request) {
  try {
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const generatedPosts = generatePostsFromCampaigns(barId)

    return NextResponse.json({
      success: true,
      postsGenerated: generatedPosts.length,
      posts: generatedPosts,
    })
  } catch (error) {
    console.error('Generate posts from campaigns error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate posts from campaigns' },
      { status: 500 }
    )
  }
}
