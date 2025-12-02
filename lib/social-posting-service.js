import crypto from 'crypto'
import { db } from './db'
import { encrypt, decrypt } from './crypto-service.js'

/**
 * ============================================
 * SOCIAL ACCOUNTS MANAGEMENT
 * ============================================
 */

/**
 * Get all connected accounts for a bar
 */
export async function getConnectedAccounts(barId) {
  const accounts = await db.collection('socialAccounts').find({ barId })

  // Decrypt tokens before returning
  return accounts.map(account => ({
    ...account,
    accessToken: decrypt(account.accessToken),
    refreshToken: account.refreshToken ? decrypt(account.refreshToken) : null
  }))
}

/**
 * Get a specific account by ID
 */
export async function getAccount(accountId, barId) {
  const account = await db.collection('socialAccounts').findOne({ accountId, barId })

  if (!account) return null

  // Decrypt tokens before returning
  return {
    ...account,
    accessToken: decrypt(account.accessToken),
    refreshToken: account.refreshToken ? decrypt(account.refreshToken) : null
  }
}

/**
 * Add or update a connected account
 */
export async function saveAccount(accountData) {
  try {
    const existing = await db.collection('socialAccounts').findOne({
      accountId: accountData.accountId,
      barId: accountData.barId,
    })

    const account = {
      accountId: accountData.accountId,
      barId: accountData.barId,
      platform: accountData.platform, // 'facebook' | 'instagram'
      name: accountData.name,
      username: accountData.username || null,
      accessToken: encrypt(accountData.accessToken),
      refreshToken: accountData.refreshToken ? encrypt(accountData.refreshToken) : null,
      tokenExpiresAt: accountData.tokenExpiresAt || null,
      pageId: accountData.pageId || null, // For Instagram, this is the Facebook Page ID
      instagramBusinessAccountId: accountData.instagramBusinessAccountId || null,
      connectedAt: accountData.connectedAt || new Date().toISOString(),
      lastRefreshedAt: accountData.lastRefreshedAt || null,
      isActive: accountData.isActive !== undefined ? accountData.isActive : true,
    }

    if (existing) {
      const result = await db.collection('socialAccounts').updateOne(
        { accountId: accountData.accountId, barId: accountData.barId },
        account
      )
      console.log('Updated account:', accountData.accountId, 'Matched:', result.matchedCount, 'Modified:', result.modifiedCount)
      // Fetch the updated document
      const updated = await db.collection('socialAccounts').findOne({
        accountId: accountData.accountId,
        barId: accountData.barId,
      })
      // Decrypt tokens before returning
      return updated ? {
        ...updated,
        accessToken: decrypt(updated.accessToken),
        refreshToken: updated.refreshToken ? decrypt(updated.refreshToken) : null
      } : { ...existing, ...account }
    } else {
      console.log('Inserting new account:', accountData.accountId, accountData.name)
      const result = await db.collection('socialAccounts').insertOne(account)
      console.log('Insert result:', result)

      // Fetch the inserted document to return it with proper formatting
      const inserted = await db.collection('socialAccounts').findOne({
        accountId: accountData.accountId,
        barId: accountData.barId,
      })

      if (!inserted) {
        console.error('Account was inserted but could not be retrieved:', accountData.accountId)
        throw new Error('Account was saved but could not be retrieved. Please try again.')
      }

      console.log('Account successfully inserted and retrieved:', inserted.accountId, inserted.name)
      // Decrypt tokens before returning
      return {
        ...inserted,
        accessToken: decrypt(inserted.accessToken),
        refreshToken: inserted.refreshToken ? decrypt(inserted.refreshToken) : null
      }
    }
  } catch (error) {
    console.error('Error saving account:', error)
    throw error
  }
}

/**
 * Update account token
 */
export async function updateAccountToken(
  accountId,
  barId,
  accessToken,
  refreshToken = null,
  expiresAt = null
) {
  const account = await db.collection('socialAccounts').findOne({ accountId, barId })

  if (!account) {
    throw new Error('Account not found')
  }

  const updates = {
    accessToken: encrypt(accessToken),
    lastRefreshedAt: new Date().toISOString(),
  }
  if (refreshToken) updates.refreshToken = encrypt(refreshToken)
  if (expiresAt) updates.tokenExpiresAt = expiresAt

  await db.collection('socialAccounts').updateOne({ accountId, barId }, updates)

  // Return with decrypted tokens
  return {
    ...account,
    ...updates,
    accessToken: decrypt(updates.accessToken),
    refreshToken: updates.refreshToken ? decrypt(updates.refreshToken) : null
  }
}

/**
 * Delete a connected account
 */
export async function deleteAccount(accountId, barId) {
  const account = await db.collection('socialAccounts').findOne({ accountId, barId })

  if (!account) {
    throw new Error('Account not found')
  }

  await db.collection('socialAccounts').deleteOne({ accountId, barId })
  return { success: true, accountId }
}

/**
 * ============================================
 * SOCIAL POSTS MANAGEMENT
 * ============================================
 */

/**
 * Create a new post
 */
export async function createPost(postData) {
  const post = {
    postId: crypto.randomUUID(),
    barId: postData.barId,
    adminId: postData.adminId,
    adminName: postData.adminName || 'Admin',
    platform: postData.platform, // 'facebook' | 'instagram'
    accountId: postData.accountId,
    accountName: postData.accountName,
    status: postData.status || 'draft', // 'draft' | 'scheduled' | 'published' | 'failed'
    contentType: postData.contentType || 'photo', // 'photo' | 'carousel'
    caption: postData.caption || '',
    mediaUrls: postData.mediaUrls || [], // Array of image URLs
    scheduledFor: postData.scheduledFor || null, // ISO timestamp
    campaignId: postData.campaignId || null, // Link to campaign if generated from campaign
    publishedAt: null,
    publishedPostId: null, // Platform post ID after publishing
    publishResponse: null, // Full API response
    error: null,
    errorDetails: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await db.collection('socialPosts').insertOne(post)
  return post
}

/**
 * Get all posts for a bar
 */
export async function getPosts(barId, filters = {}) {
  const query = { barId }
  if (filters.status) query.status = filters.status
  if (filters.platform) query.platform = filters.platform
  if (filters.accountId) query.accountId = filters.accountId

  let posts = await db.collection('socialPosts').find(query)

  // Sort by created date (newest first)
  return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

/**
 * Get a post by ID
 */
export async function getPost(postId, barId) {
  return await db.collection('socialPosts').findOne({ postId, barId })
}

/**
 * Update a post
 */
export async function updatePost(postId, barId, updates) {
  const post = await db.collection('socialPosts').findOne({ postId, barId })

  if (!post) {
    throw new Error('Post not found')
  }

  // Only include the fields that are being updated, plus updatedAt
  // Don't merge the entire post object to avoid date casting issues
  const updateData = {
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  await db.collection('socialPosts').updateOne({ postId, barId }, updateData)

  // Return the updated post by merging in memory (for response only)
  return {
    ...post,
    ...updateData,
  }
}

/**
 * Update post status after publishing
 */
export async function markPostAsPublished(postId, barId, publishedPostId, publishResponse) {
  return await updatePost(postId, barId, {
    status: 'published',
    publishedAt: new Date().toISOString(),
    publishedPostId,
    publishResponse,
    error: null,
    errorDetails: null,
  })
}

/**
 * Mark post as failed
 */
export async function markPostAsFailed(postId, barId, error, errorDetails = null) {
  return await updatePost(postId, barId, {
    status: 'failed',
    error,
    errorDetails,
  })
}

/**
 * Get scheduled posts that need to be published
 */
export async function getScheduledPostsToPublish() {
  const now = new Date()
  const posts = await db.collection('socialPosts').find({
    status: 'scheduled',
    scheduledFor: { $lte: now },
  })

  // Additional filter in case scheduledFor is stored as string
  return posts.filter(post => {
    if (!post.scheduledFor) return false
    const scheduledDate = post.scheduledFor instanceof Date
      ? post.scheduledFor
      : new Date(post.scheduledFor)
    return scheduledDate <= now
  })
}

/**
 * Delete a post
 */
export async function deletePost(postId, barId) {
  const result = await db.collection('socialPosts').deleteOne({ postId, barId })
  if (result.deletedCount === 0) {
    throw new Error('Post not found')
  }
  return true
}

/**
 * ============================================
 * SOCIAL CAMPAIGNS MANAGEMENT
 * ============================================
 */

/**
 * Create a new campaign with posts
 */
export async function createCampaign(campaignData) {
  const campaignId = crypto.randomUUID()
  const campaign = {
    campaignId,
    barId: campaignData.barId,
    adminId: campaignData.adminId,
    adminName: campaignData.adminName || 'Admin',
    name: campaignData.name,
    platform: campaignData.platform, // 'facebook' | 'instagram'
    accountId: campaignData.accountId,
    accountName: campaignData.accountName,
    status: campaignData.status || 'active', // 'active' | 'paused' | 'completed'
    postCount: campaignData.posts?.length || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await db.collection('socialCampaigns').insertOne(campaign)

  // Create all posts for this campaign
  const createdPosts = []
  if (campaignData.posts && campaignData.posts.length > 0) {
    for (const postData of campaignData.posts) {
      const post = await createPost({
        barId: campaignData.barId,
        adminId: campaignData.adminId,
        adminName: campaignData.adminName,
        platform: campaignData.platform,
        accountId: campaignData.accountId,
        accountName: campaignData.accountName,
        caption: postData.caption || '',
        mediaUrls: postData.mediaUrls || [],
        contentType: postData.mediaUrls?.length > 1 ? 'carousel' : 'photo',
        scheduledFor: postData.scheduledFor,
        status:
          postData.scheduledFor && new Date(postData.scheduledFor) > new Date()
            ? 'scheduled'
            : 'draft',
        campaignId,
      })
      createdPosts.push(post)
    }
  }

  return { campaign, posts: createdPosts }
}

/**
 * Get all campaigns for a bar
 */
export async function getCampaigns(barId, filters = {}) {
  const query = { barId }
  if (filters.status) query.status = filters.status
  if (filters.platform) query.platform = filters.platform
  if (filters.accountId) query.accountId = filters.accountId

  let campaigns = await db.collection('socialCampaigns').find(query)

  // Sort by created date (newest first)
  return campaigns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

/**
 * Get a campaign by ID
 */
export async function getCampaign(campaignId, barId) {
  return await db.collection('socialCampaigns').findOne({ campaignId, barId })
}

/**
 * Update a campaign
 */
export async function updateCampaign(campaignId, barId, updates) {
  const campaign = await db.collection('socialCampaigns').findOne({ campaignId, barId })

  if (!campaign) {
    throw new Error('Campaign not found')
  }

  // If status is being updated, also update postCount from actual posts
  if (updates.status !== undefined || !updates.postCount) {
    const posts = await getCampaignPosts(campaignId, barId)
    updates.postCount = posts.length
  }

  const updatedCampaign = {
    ...campaign,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  await db.collection('socialCampaigns').updateOne({ campaignId, barId }, updatedCampaign)
  return updatedCampaign
}

/**
 * Delete a campaign
 */
export async function deleteCampaign(campaignId, barId) {
  const result = await db.collection('socialCampaigns').deleteOne({ campaignId, barId })
  if (result.deletedCount === 0) {
    throw new Error('Campaign not found')
  }
  return true
}

/**
 * Get posts for a campaign
 */
export async function getCampaignPosts(campaignId, barId) {
  const posts = await db.collection('socialPosts').find({ campaignId, barId })
  return posts.sort((a, b) => {
    if (!a.scheduledFor && !b.scheduledFor) return 0
    if (!a.scheduledFor) return 1
    if (!b.scheduledFor) return -1
    return new Date(a.scheduledFor) - new Date(b.scheduledFor)
  })
}

/**
 * Generate dates for a campaign based on frequency
 * Only generates dates for the next 30 days to avoid creating too many posts at once
 */
function generateCampaignDates(campaign, startDate, endDate, now) {
  const dates = []
  const currentDate = new Date(Math.max(startDate.getTime(), now.getTime()))
  const end = new Date(Math.min(endDate.getTime(), now.getTime() + 30 * 24 * 60 * 60 * 1000)) // Max 30 days ahead

  switch (campaign.frequency) {
    case 'daily':
      // Generate for every day from now until end (max 30 days)
      for (
        let date = new Date(currentDate);
        date <= end && dates.length < 30;
        date.setDate(date.getDate() + 1)
      ) {
        dates.push(new Date(date))
      }
      break

    case 'weekly':
      // Generate for same day of week each week (max 4 weeks)
      const dayOfWeek = currentDate.getDay()
      for (
        let date = new Date(currentDate);
        date <= end && dates.length < 4;
        date.setDate(date.getDate() + 1)
      ) {
        if (date.getDay() === dayOfWeek) {
          dates.push(new Date(date))
        }
      }
      break

    case 'twice-weekly':
      // Generate for two days per week (max 8 posts = 4 weeks)
      const firstDay = currentDate.getDay()
      const secondDay = (firstDay + 3) % 7 // 3 days later
      for (
        let date = new Date(currentDate);
        date <= end && dates.length < 8;
        date.setDate(date.getDate() + 1)
      ) {
        if (date.getDay() === firstDay || date.getDay() === secondDay) {
          dates.push(new Date(date))
        }
      }
      break

    case 'custom':
      // Generate for specific days (max 30 days ahead)
      const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ]
      const customDayNumbers = campaign.customDays
        .map(day => dayNames.indexOf(day))
        .filter(n => n !== -1)
      for (
        let date = new Date(currentDate);
        date <= end && dates.length < 30;
        date.setDate(date.getDate() + 1)
      ) {
        if (customDayNumbers.includes(date.getDay())) {
          dates.push(new Date(date))
        }
      }
      break

    default:
      break
  }

  return dates
}
