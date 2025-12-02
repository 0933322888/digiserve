import { NextResponse } from 'next/server'
import {
  getAllSettings,
  getSetting,
  setSetting,
  getFacebookAppCredentials,
  setFacebookAppCredentials,
} from '@/lib/app-settings-service'

/**
 * GET /api/admin/social-posting/settings
 * Get all app settings or a specific setting
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const category = searchParams.get('category')

    if (key) {
      // Get specific setting
      const value = await getSetting(key)
      return NextResponse.json({ success: true, key, value })
    }

    if (category) {
      // Get settings by category
      const { getSettingsByCategory } = await import('@/lib/app-settings-service')
      const settings = await getSettingsByCategory(category)
      return NextResponse.json({ success: true, category, settings })
    }

    // Get all settings (but sanitize sensitive values)
    const allSettings = await getAllSettings()
    const sanitized = allSettings.map(setting => ({
      key: setting.key,
      value: setting.key.includes('SECRET') || setting.key.includes('KEY') || setting.encrypted
        ? '***'
        : setting.value,
      description: setting.description,
      category: setting.category,
      updatedAt: setting.updatedAt,
      updatedBy: setting.updatedBy,
    }))

    return NextResponse.json({ success: true, settings: sanitized })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get settings' }, { status: 500 })
  }
}

/**
 * POST /api/admin/social-posting/settings
 * Create or update a setting
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { key, value, description, category, updatedBy } = body

    if (!key) {
      return NextResponse.json({ error: 'key is required' }, { status: 400 })
    }

    const setting = await setSetting(key, value, description, category || 'general', updatedBy)

    // Sanitize sensitive values in response
    const sanitized = {
      ...setting,
      value: key.includes('SECRET') || key.includes('KEY') || setting.encrypted ? '***' : setting.value,
    }

    return NextResponse.json({ success: true, setting: sanitized })
  } catch (error) {
    console.error('Set setting error:', error)
    return NextResponse.json({ error: error.message || 'Failed to set setting' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/social-posting/settings
 * Update a setting (alternative to POST)
 */
export async function PUT(request) {
  try {
    const body = await request.json()
    const { key, value, description, category, updatedBy } = body

    // Special handling for Facebook credentials
    if (key === 'facebook-credentials' || body.facebookAppId) {
      const { facebookAppId, facebookAppSecret, updatedBy: updater } = body
      if (!facebookAppId || !facebookAppSecret) {
        return NextResponse.json(
          { error: 'facebookAppId and facebookAppSecret are required' },
          { status: 400 }
        )
      }
      await setFacebookAppCredentials(facebookAppId, facebookAppSecret, updater || updatedBy)
      return NextResponse.json({
        success: true,
        message: 'Facebook credentials updated successfully',
      })
    }

    if (!key) {
      return NextResponse.json({ error: 'key is required' }, { status: 400 })
    }

    const setting = await setSetting(key, value, description, category || 'general', updatedBy)

    // Sanitize sensitive values in response
    const sanitized = {
      ...setting,
      value: key.includes('SECRET') || key.includes('KEY') || setting.encrypted ? '***' : setting.value,
    }

    return NextResponse.json({ success: true, setting: sanitized })
  } catch (error) {
    console.error('Update setting error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update setting' }, { status: 500 })
  }
}

