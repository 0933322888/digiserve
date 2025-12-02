import { NextResponse } from 'next/server'
import {
  getCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignPosts,
} from '@/lib/social-posting-service'

/**
 * GET /api/admin/social-posting/campaigns/[id]
 * Get a specific campaign
 */
export async function GET(request, { params }) {
  try {
    const { id } = params
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const campaign = await getCampaign(id, barId)
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const posts = await getCampaignPosts(id, barId)

    return NextResponse.json({
      success: true,
      campaign,
      posts,
    })
  } catch (error) {
    console.error('Get campaign error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get campaign' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/social-posting/campaigns/[id]
 * Update a campaign
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const body = await request.json()

    const campaign = await updateCampaign(id, barId, body)

    return NextResponse.json({
      success: true,
      campaign,
    })
  } catch (error) {
    console.error('Update campaign error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/social-posting/campaigns/[id]
 * Delete a campaign
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    await deleteCampaign(id, barId)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Delete campaign error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
