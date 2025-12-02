import { NextResponse } from 'next/server'
import { redeemGiftCard } from '@/lib/gift-card-service'
import { logEvent } from '@/lib/event-service'

export async function POST(request) {
  try {
    const body = await request.json()
    const { code, amount } = body

    if (!code || !amount) {
      return NextResponse.json({ error: 'Code and amount are required' }, { status: 400 })
    }

    // Mock admin info for now
    const adminInfo = {
      adminId: 'admin_1',
      adminName: 'Admin User',
      location: 'Admin Dashboard',
    }

    const result = await redeemGiftCard(code, parseFloat(amount), adminInfo)

    await logEvent('GIFT_CARD', `Gift card redeemed: ${code}`, 'SUCCESS', {
      amount,
      remaining: result.card.remainingAmount,
    })

    return NextResponse.json({
      success: true,
      newBalance: result.card.remainingAmount,
      redemptionId: result.redemption.redemptionId,
    })
  } catch (error) {
    await logEvent('GIFT_CARD', `Gift card redemption failed: ${error.message}`, 'FAILED', {
      error: error.message,
    })
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
