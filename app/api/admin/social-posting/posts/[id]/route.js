import { NextResponse } from 'next/server'
import { getPost, updatePost, deletePost } from '@/lib/social-posting-service'

/**
 * GET /api/admin/social-posting/posts/[id]
 * Get a specific post
 */
export async function GET(request, { params }) {
  try {
    const { id } = params
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const post = await getPost(id, barId)

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Get post error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get post' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/social-posting/posts/[id]
 * Update a post
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const updates = body

    // Don't allow updating published posts
    const existingPost = await getPost(id, barId)
    if (existingPost && existingPost.status === 'published') {
      return NextResponse.json({ error: 'Cannot update published posts' }, { status: 400 })
    }

    // Determine status if scheduledFor is updated
    if (updates.scheduledFor !== undefined) {
      if (updates.scheduledFor) {
        const scheduledDate = new Date(updates.scheduledFor)
        if (scheduledDate > new Date()) {
          updates.status = 'scheduled'
        } else {
          updates.status = 'draft'
        }
      } else {
        updates.status = 'draft'
      }
    }

    const post = await updatePost(id, barId, updates)

    return NextResponse.json({
      success: true,
      post,
    })
  } catch (error) {
    console.error('Update post error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update post' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/social-posting/posts/[id]
 * Delete a post
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    // Don't allow deleting published posts
    const existingPost = await getPost(id, barId)
    if (existingPost && existingPost.status === 'published') {
      return NextResponse.json({ error: 'Cannot delete published posts' }, { status: 400 })
    }

    await deletePost(id, barId)

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    })
  } catch (error) {
    console.error('Delete post error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete post' }, { status: 500 })
  }
}
