import { NextResponse } from 'next/server'
import { getAccount, updateAccountToken } from '@/lib/social-posting-service'
import { refreshFacebookToken } from '@/lib/social-api-client'
import { getFacebookAppCredentials } from '@/lib/app-settings-service'

/**
 * POST /api/admin/social-posting/refresh-token
 * Refresh access token for a social media account
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { accountId, barId } = body

    if (!accountId || !barId) {
      return NextResponse.json({ error: 'accountId and barId are required' }, { status: 400 })
    }

    const account = await getAccount(accountId, barId)

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const credentials = await getFacebookAppCredentials()
    const facebookAppId = credentials.facebookAppId
    const facebookAppSecret = credentials.facebookAppSecret

    if (!facebookAppId || !facebookAppSecret) {
      return NextResponse.json(
        { 
          error: 'Facebook app credentials not configured',
          message: 'Please configure Facebook App ID and App Secret in the admin settings'
        },
        { status: 500 }
      )
    }

    // Refresh the token
    const tokenData = await refreshFacebookToken(
      facebookAppId,
      facebookAppSecret,
      account.accessToken
    )

    // Update account with new token
    const updatedAccount = await updateAccountToken(
      accountId,
      barId,
      tokenData.accessToken,
      account.refreshToken,
      tokenData.expiresAt
    )

    // Remove sensitive data from response
    const { accessToken: _, refreshToken: __, ...sanitizedAccount } = updatedAccount

    return NextResponse.json({
      success: true,
      account: sanitizedAccount,
      expiresAt: tokenData.expiresAt,
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json({ error: error.message || 'Failed to refresh token' }, { status: 500 })
  }
}
