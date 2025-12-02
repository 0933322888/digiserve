import { NextResponse } from 'next/server'
import { getConnectedAccounts, saveAccount, getAccount, deleteAccount } from '@/lib/social-posting-service'
import { getFacebookPage, getInstagramBusinessAccount } from '@/lib/social-api-client'
import { siteConfig } from '@/config/siteConfig'

/**
 * GET /api/admin/social-posting/accounts
 * Get all connected accounts for a bar
 */
export async function GET(request) {
  try {
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const accounts = await getConnectedAccounts(barId)

    // Remove sensitive tokens from response
    const sanitizedAccounts = accounts.map(acc => ({
      ...acc,
      accessToken: acc.accessToken ? '***' : null,
      refreshToken: acc.refreshToken ? '***' : null,
    }))

    return NextResponse.json({ accounts: sanitizedAccounts })
  } catch (error) {
    console.error('Get accounts error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get accounts' }, { status: 500 })
  }
}

/**
 * POST /api/admin/social-posting/accounts
 * Connect a new social media account
 */
export async function POST(request) {
  try {
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const {
      adminId,
      platform,
      accessToken,
      pageId, // For Facebook/Instagram
    } = body

    if (!adminId || !platform || !accessToken) {
      return NextResponse.json(
        { error: 'adminId, platform, and accessToken are required' },
        { status: 400 }
      )
    }

    if (!['facebook', 'instagram'].includes(platform)) {
      return NextResponse.json(
        { error: 'Platform must be "facebook" or "instagram"' },
        { status: 400 }
      )
    }

    // Get page info from Facebook
    const pageInfo = await getFacebookPage(pageId, accessToken)
    const pageAccessToken = pageInfo.access_token || accessToken

    let accountData = {
      accountId: pageId,
      barId,
      platform,
      name: pageInfo.name || 'Unknown',
      username: null,
      accessToken: pageAccessToken,
      refreshToken: null,
      tokenExpiresAt: null,
      pageId: pageId,
      instagramBusinessAccountId: null,
      connectedAt: new Date().toISOString(),
      isActive: true,
    }

    // If Instagram, get the Instagram Business Account ID
    if (platform === 'instagram') {
      const instagramAccountId = await getInstagramBusinessAccount(pageId, pageAccessToken)
      if (!instagramAccountId) {
        return NextResponse.json(
          { error: 'No Instagram Business Account found for this Facebook Page' },
          { status: 400 }
        )
      }
      accountData.instagramBusinessAccountId = instagramAccountId
      accountData.accountId = instagramAccountId
    }

    console.log('Saving account data:', { ...accountData, accessToken: '***' })
    const account = await saveAccount(accountData)
    console.log('Account saved successfully:', { accountId: account.accountId, name: account.name })

    // Verify the account was saved
    const verifyAccount = await getAccount(account.accountId, barId)
    if (!verifyAccount) {
      console.error('Account was not found after save:', account.accountId)
      return NextResponse.json(
        { error: 'Account was saved but could not be verified. Please refresh the page.' },
        { status: 500 }
      )
    }

    // Remove sensitive data from response
    const { accessToken: _, refreshToken: __, ...sanitizedAccount } = account

    return NextResponse.json({
      success: true,
      account: sanitizedAccount,
    })
  } catch (error) {
    console.error('Connect account error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Failed to connect account' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/social-posting/accounts
 * Delete a connected social media account
 */
export async function DELETE(request) {
  try {
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId and barId are required' },
        { status: 400 }
      )
    }

    const result = await deleteAccount(accountId, barId)

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
      accountId: result.accountId,
    })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    )
  }
}
