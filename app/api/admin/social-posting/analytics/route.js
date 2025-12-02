import { NextResponse } from 'next/server'
import { getPosts } from '@/lib/social-posting-service'
import { getAccount } from '@/lib/social-posting-service'
import { getPostInsights } from '@/lib/social-api-client'
import { db } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const barId = searchParams.get('barId')
    const platform = searchParams.get('platform') || 'all'
    const period = searchParams.get('period') || '30d'
    const forceRefresh = searchParams.get('refresh') === 'true'

    if (!barId) {
      return NextResponse.json({ error: 'barId is required' }, { status: 400 })
    }

    // Calculate date range
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get published posts from database
    const filters = {
      status: 'published',
    }
    if (platform !== 'all') {
      filters.platform = platform
    }

    const allPosts = await getPosts(barId, filters)

    // Filter posts by date range
    const postsInRange = allPosts.filter(post => {
      if (!post.publishedAt) return false
      const publishedDate = post.publishedAt instanceof Date
        ? post.publishedAt
        : new Date(post.publishedAt)
      return publishedDate >= startDate
    })

    // Fetch real insights for posts that need updating
    const now = new Date()
    const CACHE_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours

    for (const post of postsInRange) {
      // Skip if no published post ID
      if (!post.publishedPostId) continue

      // Check if insights need refreshing
      const needsRefresh = forceRefresh ||
        !post.insightsFetchedAt ||
        (now - new Date(post.insightsFetchedAt)) > CACHE_DURATION_MS

      if (needsRefresh) {
        try {
          // Get account to fetch access token
          const account = await getAccount(post.accountId, barId)
          if (!account || !account.accessToken) {
            console.warn(`No access token for account ${post.accountId}`)
            continue
          }

          // Fetch insights from Facebook/Instagram API
          const insights = await getPostInsights(
            post.publishedPostId,
            account.accessToken,
            post.platform
          )

          // Update post with insights
          await db.collection('socialPosts').updateOne(
            { postId: post.postId },
            {
              insights: {
                reach: insights.reach || 0,
                impressions: insights.impressions || 0,
                engagement: insights.engagement || 0,
                likes: insights.likes || 0,
                comments: insights.comments || 0,
                shares: insights.shares || 0,
                clicks: insights.clicks || 0,
                saves: insights.saves || 0,
              },
              insightsFetchedAt: new Date().toISOString(),
            }
          )

          // Update local post object
          post.insights = insights
          post.insightsFetchedAt = new Date()
        } catch (error) {
          console.error(`Failed to fetch insights for post ${post.postId}:`, error)
          // Continue with cached or zero data
        }
      }
    }

    // Group posts by date
    const postsByDate = {}
    postsInRange.forEach(post => {
      const publishedDate = post.publishedAt instanceof Date
        ? post.publishedAt
        : new Date(post.publishedAt)
      const dateKey = publishedDate.toISOString().split('T')[0]

      if (!postsByDate[dateKey]) {
        postsByDate[dateKey] = []
      }
      postsByDate[dateKey].push(post)
    })

    // Generate trend data for all days in period
    const trendData = []
    const nowDate = new Date()
    for (let i = days; i >= 0; i--) {
      const date = new Date(nowDate)
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      const dayPosts = postsByDate[dateKey] || []

      // Calculate metrics for this day from real insights
      const reach = dayPosts.reduce((sum, p) => sum + (p.insights?.reach || 0), 0)
      const engagement = dayPosts.reduce((sum, p) => sum + (p.insights?.engagement || 0), 0)
      const likes = dayPosts.reduce((sum, p) => sum + (p.insights?.likes || 0), 0)
      const comments = dayPosts.reduce((sum, p) => sum + (p.insights?.comments || 0), 0)

      trendData.push({
        date: dateKey,
        reach,
        engagement,
        likes,
        comments,
        posts: dayPosts.length,
      })
    }

    // Calculate summary totals
    const summary = {
      totalReach: trendData.reduce((sum, item) => sum + item.reach, 0),
      totalEngagement: trendData.reduce((sum, item) => sum + item.engagement, 0),
      totalLikes: trendData.reduce((sum, item) => sum + item.likes, 0),
      totalComments: trendData.reduce((sum, item) => sum + item.comments, 0),
      totalPosts: postsInRange.length,
    }

    // Get top posts (by engagement, most recent first)
    const topPosts = postsInRange
      .sort((a, b) => {
        const engagementA = a.insights?.engagement || 0
        const engagementB = b.insights?.engagement || 0
        if (engagementB !== engagementA) {
          return engagementB - engagementA
        }
        // If engagement is equal, sort by date
        const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt)
        const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt)
        return dateB - dateA
      })
      .slice(0, 10)
      .map(post => ({
        id: post.postId,
        platform: post.platform,
        content: post.caption || 'No caption',
        image: post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls[0] : null,
        reach: post.insights?.reach || 0,
        engagement: post.insights?.engagement || 0,
        date: post.publishedAt instanceof Date
          ? post.publishedAt.toISOString()
          : (typeof post.publishedAt === 'string' ? post.publishedAt : new Date().toISOString()),
        publishedPostId: post.publishedPostId,
      }))

    return NextResponse.json({
      success: true,
      summary,
      trends: trendData,
      topPosts,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    )
  }
}
