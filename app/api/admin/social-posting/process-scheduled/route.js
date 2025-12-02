import { NextResponse } from 'next/server'
import {
  getScheduledPostsToPublish,
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
 * POST /api/admin/social-posting/process-scheduled
 * Process scheduled posts that are due to be published
 * This endpoint should be called periodically (e.g., via cron job)
 */
export async function POST(request) {
  try {
    const scheduledPosts = await getScheduledPostsToPublish()

    if (scheduledPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No scheduled posts to process',
        processed: 0,
      })
    }

    const results = {
      processed: 0,
      published: 0,
      failed: 0,
      errors: [],
    }

    for (const post of scheduledPosts) {
      try {
        // Get account with access token
        const account = await getAccount(post.accountId, post.barId)

        if (!account || !account.isActive) {
          await markPostAsFailed(post.postId, post.barId, 'Account not found or inactive')
          results.failed++
          results.errors.push({
            postId: post.postId,
            error: 'Account not found or inactive',
          })
          continue
        }

        // Convert relative URLs to absolute URLs if needed
        const getAbsoluteUrl = (relativeUrl) => {
          if (!relativeUrl) return null
          if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
            return relativeUrl
          }
          // For scheduled posts, we might not have request context
          // Use environment variable or return as-is if it's already stored as absolute
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                         process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                         'http://localhost:3000'
          const url = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`
          return `${baseUrl.replace(/\/$/, '')}${url}`
        }

        const absoluteMediaUrls = post.mediaUrls && post.mediaUrls.length > 0
          ? post.mediaUrls.map(url => getAbsoluteUrl(url))
          : []

        // Validate Instagram requires images
        if (post.platform === 'instagram' && absoluteMediaUrls.length === 0) {
          await markPostAsFailed(post.postId, post.barId, 'Instagram posts require at least one image')
          results.failed++
          results.errors.push({
            postId: post.postId,
            error: 'Instagram posts require at least one image',
          })
          continue
        }

        let publishResult

        if (post.platform === 'facebook') {
          // Facebook Page posting (supports both text-only and image posts)
          const imageUrl = absoluteMediaUrls.length > 0 ? absoluteMediaUrls[0] : null
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
        await markPostAsPublished(post.postId, post.barId, publishResult.postId, publishResult.response)

        results.published++
      } catch (error) {
        // Mark as failed
        await markPostAsFailed(post.postId, post.barId, error.message, error.toString())
        results.failed++
        results.errors.push({
          postId: post.postId,
          error: error.message,
        })
      }

      results.processed++
    }

    return NextResponse.json({
      success: true,
      ...results,
    })
  } catch (error) {
    console.error('Process scheduled posts error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process scheduled posts' },
      { status: 500 }
    )
  }
}
