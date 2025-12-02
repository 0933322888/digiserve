import { NextResponse } from 'next/server'
import {
  getPost,
  getAccount,
  markPostAsPublished,
  markPostAsFailed,
} from '@/lib/social-posting-service'
import {
  postToFacebookPage,
  postToInstagram,
  postCarouselToInstagram,
} from '@/lib/social-api-client'

/**
 * POST /api/admin/social-posting/posts/[id]/publish
 * Publish a post immediately
 */
export async function POST(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { barId } = body

    if (!barId) {
      return NextResponse.json({ error: 'barId is required' }, { status: 400 })
    }

    const post = await getPost(id, barId)

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.status === 'published') {
      return NextResponse.json({ error: 'Post is already published' }, { status: 400 })
    }

    // Get account with access token
    const account = await getAccount(post.accountId, barId)

    if (!account || !account.isActive) {
      return NextResponse.json({ error: 'Account not found or inactive' }, { status: 400 })
    }

    // Convert relative URLs to absolute URLs for Facebook/Instagram
    const getAbsoluteUrl = (relativeUrl) => {
      // If already absolute, return as is
      if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
        return relativeUrl
      }
      
      // Get base URL from environment variable or construct from request
      let baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      
      if (!baseUrl) {
        if (process.env.VERCEL_URL) {
          baseUrl = `https://${process.env.VERCEL_URL}`
        } else {
          const origin = request.headers.get('origin')
          if (origin) {
            baseUrl = origin
          } else {
            const host = request.headers.get('host')
            if (host) {
              const protocol = request.headers.get('x-forwarded-proto') || 'https'
              baseUrl = `${protocol}://${host}`
            } else {
              baseUrl = 'http://localhost:3000'
            }
          }
        }
      }
      
      // Remove trailing slash from baseUrl if present
      baseUrl = baseUrl.replace(/\/$/, '')
      
      // Ensure the relative URL starts with /
      const url = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`
      
      return `${baseUrl}${url}`
    }

    // Convert all media URLs to absolute URLs (if any)
    const absoluteMediaUrls = post.mediaUrls && post.mediaUrls.length > 0
      ? post.mediaUrls.map(url => getAbsoluteUrl(url))
      : []

    // Validate Instagram requires images
    if (post.platform === 'instagram' && absoluteMediaUrls.length === 0) {
      return NextResponse.json(
        { error: 'Instagram posts require at least one image' },
        { status: 400 }
      )
    }

    let publishResult

    try {
      if (post.platform === 'facebook') {
        // Facebook Page posting (supports both text-only and image posts)
        const imageUrl = absoluteMediaUrls.length > 0 ? absoluteMediaUrls[0] : null
        
        // Warn if image URL is localhost (Facebook won't be able to access it)
        if (imageUrl && (imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1'))) {
          console.warn('Warning: Image URL uses localhost. Facebook may not be able to access it:', imageUrl)
        }
        
        publishResult = await postToFacebookPage(
          account.pageId,
          account.accessToken,
          post.caption,
          imageUrl
        )
      } else if (post.platform === 'instagram') {
        // Instagram Business Account posting (requires images)
        if (post.contentType === 'carousel' && absoluteMediaUrls.length > 1) {
          publishResult = await postCarouselToInstagram(
            account.instagramBusinessAccountId,
            account.accessToken,
            absoluteMediaUrls,
            post.caption
          )
        } else {
          publishResult = await postToInstagram(
            account.instagramBusinessAccountId,
            account.accessToken,
            absoluteMediaUrls[0],
            post.caption
          )
        }
      } else {
        throw new Error('Unsupported platform')
      }

      // Mark as published
      const updatedPost = await markPostAsPublished(
        id,
        barId,
        publishResult.postId,
        publishResult.response
      )

      return NextResponse.json({
        success: true,
        post: updatedPost,
      })
    } catch (publishError) {
      // Mark as failed
      await markPostAsFailed(id, barId, publishError.message, publishError.toString())

      return NextResponse.json(
        {
          error: 'Failed to publish post',
          details: publishError.message,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Publish post error:', error)
    return NextResponse.json({ error: error.message || 'Failed to publish post' }, { status: 500 })
  }
}
