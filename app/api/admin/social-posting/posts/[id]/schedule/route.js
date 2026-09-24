import { NextResponse } from 'next/server'
import { getPost, updatePost } from '@/lib/social-posting-service'

/**
 * POST /api/admin/social-posting/posts/[id]/schedule
 * Schedule a post for future publishing
 */
export async function POST(request, context) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { barId, scheduledFor } = body

    if (!barId || !scheduledFor) {
      return NextResponse.json({ error: 'barId and scheduledFor are required' }, { status: 400 })
    }

    const post = await getPost(id, barId)

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.status === 'published') {
      return NextResponse.json(
        { error: 'Cannot schedule an already published post' },
        { status: 400 }
      )
    }

    const scheduledDate = new Date(scheduledFor)

    if (scheduledDate <= new Date()) {
      return NextResponse.json({ error: 'Scheduled time must be in the future' }, { status: 400 })
    }

    const updatedPost = await updatePost(id, barId, {
      scheduledFor: scheduledFor,
      status: 'scheduled',
    })

    return NextResponse.json({
      success: true,
      post: updatedPost,
    })
  } catch (error) {
    console.error('Schedule post error:', error)
    return NextResponse.json({ error: error.message || 'Failed to schedule post' }, { status: 500 })
  }
}
