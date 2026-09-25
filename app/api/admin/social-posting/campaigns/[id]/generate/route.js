import { NextResponse } from 'next/server'
import { getCampaign, generatePostsFromCampaigns } from '@/lib/social-posting-service'

/**
 * POST /api/admin/social-posting/campaigns/[id]/generate
 * Manually generate posts for a specific campaign
 */
export async function POST(request, context) {
  try {
    const { id } = await context.params
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const campaign = await getCampaign(id, barId)
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.status !== 'active') {
      return NextResponse.json(
        { error: 'Campaign must be active to generate posts' },
        { status: 400 }
      )
    }

    // Generate posts for this specific campaign
    const generatedPosts = (await generatePostsFromCampaigns(barId)).filter(
      post => post.campaignId === id
    )

    return NextResponse.json({
      success: true,
      postsGenerated: generatedPosts.length,
      posts: generatedPosts,
    })
  } catch (error) {
    console.error('Generate posts error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate posts' },
      { status: 500 }
    )
  }
}
