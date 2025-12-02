import { NextResponse } from 'next/server'
import { getSetting, setSetting } from '@/lib/app-settings-service'
import { siteConfig } from '@/config/siteConfig'

/**
 * GET /api/admin/settings/ordering-config
 * Get ordering configuration (business hours, tax rate, etc.)
 */
export async function GET() {
  try {
    // Get settings from database with fallback to siteConfig
    const getSettingValue = async (key, defaultValue) => {
      const dbValue = await getSetting(key)
      return dbValue !== null ? dbValue : defaultValue
    }

    const businessHours = await getSettingValue(
      'ORDERING_BUSINESS_HOURS',
      siteConfig.businessHours || {}
    )

    const taxRate = await getSettingValue(
      'ORDERING_TAX_RATE',
      siteConfig.ordering?.taxRate ?? 0.13
    )

    return NextResponse.json({
      success: true,
      businessHours,
      taxRate,
    })
  } catch (error) {
    console.error('Get ordering config error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get ordering configuration' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/settings/ordering-config
 * Update ordering configuration
 */
export async function PUT(request) {
  try {
    const body = await request.json()
    const { businessHours, taxRate } = body

    // Update business hours
    if (businessHours !== undefined) {
      await setSetting(
        'ORDERING_BUSINESS_HOURS',
        businessHours,
        'Business hours for ordering',
        'ordering',
        'admin'
      )
    }

    // Update tax rate
    if (taxRate !== undefined) {
      const taxRateNum = typeof taxRate === 'string' ? parseFloat(taxRate) : taxRate
      if (isNaN(taxRateNum) || taxRateNum < 0 || taxRateNum > 1) {
        return NextResponse.json(
          { error: 'Tax rate must be a number between 0 and 1' },
          { status: 400 }
        )
      }
      await setSetting(
        'ORDERING_TAX_RATE',
        taxRateNum,
        'Tax rate for orders (0-1, e.g., 0.13 for 13%)',
        'ordering',
        'admin'
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Ordering configuration updated successfully',
    })
  } catch (error) {
    console.error('Update ordering config error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update ordering configuration' },
      { status: 500 }
    )
  }
}

