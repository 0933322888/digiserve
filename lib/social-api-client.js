/**
 * Facebook Graph API Client
 * Handles Facebook Page and Instagram Business Account posting
 */

/**
 * Refresh Facebook access token
 */
export async function refreshFacebookToken(appId, appSecret, currentToken) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${currentToken}`
    )
    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message || 'Token refresh failed')
    }

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      expiresAt: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : null,
    }
  } catch (error) {
    console.error('Facebook token refresh error:', error)
    throw error
  }
}

/**
 * Exchange OAuth code for long-lived access token
 */
export async function exchangeCodeForToken(appId, appSecret, code, redirectUri) {
  try {
    // 1. Exchange code for short-lived token
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&client_secret=${appSecret}&code=${code}`;

    const response = await fetch(tokenUrl);
    const data = await response.json();

    if (data.error) {
      console.error("Token Exchange Error Data:", data);
      throw new Error(data.error.message || 'Failed to exchange code for token');
    }

    const shortLivedToken = data.access_token;

    // 2. Exchange short-lived token for long-lived token
    // (reuse existing refresh logic as it does the same "fb_exchange_token" grant)
    const longLivedData = await refreshFacebookToken(appId, appSecret, shortLivedToken);

    return longLivedData;

  } catch (error) {
    console.error('Exchange code error:', error);
    throw error;
  }
}

/**
 * Get Facebook Page info
 */
export async function getFacebookPage(pageId, accessToken) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=id,name,access_token&access_token=${accessToken}`
    )
    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message || 'Failed to get page info')
    }

    return data
  } catch (error) {
    console.error('Facebook page fetch error:', error)
    throw error
  }
}

/**
 * Get Instagram Business Account ID from Facebook Page
 */
export async function getInstagramBusinessAccount(pageId, pageAccessToken) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
    )
    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message || 'Failed to get Instagram account')
    }

    return data.instagram_business_account?.id || null
  } catch (error) {
    console.error('Instagram account fetch error:', error)
    throw error
  }
}

/**
 * Post to Facebook Page
 * Supports both text-only posts and posts with images
 */
export async function postToFacebookPage(pageId, pageAccessToken, caption, imageUrl = null) {
  try {
    // If image URL is provided, post as photo with caption
    if (imageUrl) {
      // Validate that imageUrl is a valid, non-empty string
      if (typeof imageUrl !== 'string' || imageUrl.trim() === '') {
        throw new Error('Invalid image URL provided')
      }

      // Ensure the URL is absolute and publicly accessible
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        throw new Error(`Image URL must be an absolute URL (http:// or https://). Got: ${imageUrl}`)
      }

      // Warn if URL is localhost (Facebook can't access localhost URLs)
      if (imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1') || imageUrl.includes('0.0.0.0')) {
        throw new Error(
          `Image URL points to localhost, which Facebook cannot access. Please use a publicly accessible URL. Got: ${imageUrl}`
        )
      }

      console.log('Posting to Facebook with image URL:', imageUrl)

      const photoResponse = await fetch(`https://graph.facebook.com/v18.0/${pageId}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: imageUrl,
          caption: caption || '',
          access_token: pageAccessToken,
        }),
      })

      const photoData = await photoResponse.json()

      if (photoData.error) {
        console.error('Facebook API error:', photoData.error)
        throw new Error(photoData.error.message || 'Failed to post to Facebook')
      }

      return {
        postId: photoData.post_id || photoData.id,
        response: photoData,
      }
    } else {
      // Text-only post using feed endpoint
      const feedResponse = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: caption || '',
          access_token: pageAccessToken,
        }),
      })

      const feedData = await feedResponse.json()

      if (feedData.error) {
        throw new Error(feedData.error.message || 'Failed to post to Facebook')
      }

      return {
        postId: feedData.id,
        response: feedData,
      }
    }
  } catch (error) {
    console.error('Facebook post error:', error)
    throw error
  }
}

/**
 * Post photo to Instagram Business Account
 */
export async function postToInstagram(instagramAccountId, pageAccessToken, imageUrl, caption) {
  try {
    // Step 1: Create media container
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption,
          access_token: pageAccessToken,
        }),
      }
    )

    const containerData = await containerResponse.json()

    if (containerData.error) {
      throw new Error(containerData.error.message || 'Failed to create Instagram media container')
    }

    const creationId = containerData.id

    // Step 2: Publish the media container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: pageAccessToken,
        }),
      }
    )

    const publishData = await publishResponse.json()

    if (publishData.error) {
      throw new Error(publishData.error.message || 'Failed to publish Instagram post')
    }

    return {
      postId: publishData.id,
      response: publishData,
    }
  } catch (error) {
    console.error('Instagram post error:', error)
    throw error
  }
}

/**
 * Post carousel to Instagram Business Account
 */
export async function postCarouselToInstagram(
  instagramAccountId,
  pageAccessToken,
  imageUrls,
  caption
) {
  try {
    // Step 1: Create children containers for each image
    const children = []
    for (const imageUrl of imageUrls) {
      const childResponse = await fetch(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_url: imageUrl,
            is_carousel_item: true,
            access_token: pageAccessToken,
          }),
        }
      )

      const childData = await childResponse.json()

      if (childData.error) {
        throw new Error(childData.error.message || 'Failed to create carousel item')
      }

      children.push(childData.id)
    }

    // Step 2: Create carousel container
    const carouselResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          media_type: 'CAROUSEL',
          children: children.join(','),
          caption: caption,
          access_token: pageAccessToken,
        }),
      }
    )

    const carouselData = await carouselResponse.json()

    if (carouselData.error) {
      throw new Error(carouselData.error.message || 'Failed to create carousel container')
    }

    const creationId = carouselData.id

    // Step 3: Publish the carousel
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: pageAccessToken,
        }),
      }
    )

    const publishData = await publishResponse.json()

    if (publishData.error) {
      throw new Error(publishData.error.message || 'Failed to publish Instagram carousel')
    }

    return {
      postId: publishData.id,
      response: publishData,
    }
  } catch (error) {
    console.error('Instagram carousel post error:', error)
    throw error
  }
}

/**
 * Get insights for a single Facebook/Instagram post
 * @param {string} postId - The published post ID from Facebook/Instagram
 * @param {string} accessToken - Page access token
 * @param {string} platform - 'facebook' or 'instagram'
 * @returns {Promise<Object>} Insights data with reach, engagement, likes, comments, etc.
 */
export async function getPostInsights(postId, accessToken, platform = 'facebook') {
  try {
    if (platform === 'facebook') {
      // Facebook post insights
      // Try to fetch metrics individually to handle cases where some metrics aren't available
      const defaultInsights = {
        reach: 0,
        impressions: 0,
        engagement: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        clicks: 0,
        saves: 0,
      }

      // Fetch post object for likes, comments, shares (this is more reliable)
      try {
        const postResponse = await fetch(
          `https://graph.facebook.com/v18.0/${postId}?fields=likes.summary(true),comments.summary(true),shares&access_token=${accessToken}`
        )
        const postData = await postResponse.json()

        if (!postData.error) {
          defaultInsights.likes = postData.likes?.summary?.total_count || 0
          defaultInsights.comments = postData.comments?.summary?.total_count || 0
          defaultInsights.shares = postData.shares?.count || 0
        }
      } catch (error) {
        console.warn('Failed to fetch Facebook post data:', error.message)
      }

      // Try to fetch insights metrics (some may not be available for all post types)
      try {
        // Try common metrics that are usually available
        const metricsToTry = [
          'post_impressions',
          'post_impressions_unique',
          'post_engaged_users',
        ]

        for (const metric of metricsToTry) {
          try {
            const metricResponse = await fetch(
              `https://graph.facebook.com/v18.0/${postId}/insights?metric=${metric}&access_token=${accessToken}`
            )
            const metricData = await metricResponse.json()

            if (!metricData.error && metricData.data?.[0]) {
              const value = metricData.data[0].values?.[0]?.value || 0
              if (metric === 'post_impressions') {
                defaultInsights.impressions = value
              } else if (metric === 'post_impressions_unique') {
                defaultInsights.reach = value
              } else if (metric === 'post_engaged_users') {
                defaultInsights.engagement = value
              }
            }
          } catch (error) {
            // Skip this metric if it fails
            console.warn(`Metric ${metric} not available for post ${postId}:`, error.message)
          }
        }
      } catch (error) {
        console.warn('Failed to fetch Facebook insights:', error.message)
      }

      return defaultInsights
    } else {
      // Instagram post insights
      // Try to fetch metrics individually to handle cases where some metrics aren't available
      const defaultInsights = {
        reach: 0,
        impressions: 0,
        engagement: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        clicks: 0,
        saves: 0,
      }

      // Try common Instagram metrics
      const metricsToTry = ['impressions', 'reach', 'engagement', 'saved']

      for (const metric of metricsToTry) {
        try {
          const metricResponse = await fetch(
            `https://graph.facebook.com/v18.0/${postId}/insights?metric=${metric}&access_token=${accessToken}`
          )
          const metricData = await metricResponse.json()

          if (!metricData.error && metricData.data?.[0]) {
            const value = metricData.data[0].values?.[0]?.value || 0
            if (metric === 'impressions') {
              defaultInsights.impressions = value
            } else if (metric === 'reach') {
              defaultInsights.reach = value
            } else if (metric === 'engagement') {
              defaultInsights.engagement = value
            } else if (metric === 'saved') {
              defaultInsights.saves = value
            }
          }
        } catch (error) {
          // Skip this metric if it fails
          console.warn(`Metric ${metric} not available for Instagram post ${postId}:`, error.message)
        }
      }

      // Also fetch post object for likes and comments
      try {
        const postResponse = await fetch(
          `https://graph.facebook.com/v18.0/${postId}?fields=like_count,comments_count&access_token=${accessToken}`
        )
        const postData = await postResponse.json()

        if (!postData.error) {
          defaultInsights.likes = postData.like_count || 0
          defaultInsights.comments = postData.comments_count || 0
        }
      } catch (error) {
        console.warn('Failed to fetch Instagram post data:', error.message)
      }

      return defaultInsights
    }
  } catch (error) {
    console.error('Get post insights error:', error)
    // Return zeros instead of throwing to allow partial data
    return {
      reach: 0,
      impressions: 0,
      engagement: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      clicks: 0,
      saves: 0,
      error: error.message,
    }
  }
}

/**
 * Get insights for multiple posts in batch (more efficient)
 * @param {Array<{postId: string, platform: string}>} posts - Array of post objects
 * @param {string} accessToken - Page access token
 * @returns {Promise<Object>} Map of postId to insights data
 */
export async function getBatchPostInsights(posts, accessToken) {
  const results = {}

  // Fetch insights for each post (could be optimized with batch requests)
  for (const post of posts) {
    try {
      const insights = await getPostInsights(post.postId, accessToken, post.platform)
      results[post.postId] = insights
    } catch (error) {
      console.error(`Failed to fetch insights for post ${post.postId}:`, error)
      results[post.postId] = {
        reach: 0,
        impressions: 0,
        engagement: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        clicks: 0,
        saves: 0,
        error: error.message,
      }
    }
  }

  return results
}
