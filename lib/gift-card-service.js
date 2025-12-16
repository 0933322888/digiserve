import crypto from 'crypto'
import { db } from './db'

/**
 * Generate a unique gift card code
 * Format: REST-XXXX-XXXX (4-4 alphanumeric chars for better readability)
 */
export function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'REST-'
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  code += '-'
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Create a new gift card
 */
export async function createGiftCard(data) {
  const { barId } = data
  if (!barId) throw new Error('barId is required')

  // Check for duplicate code
  let code = generateCode()
  let existing = await db.collection('giftCards').findOne({ code }) // Codes should be globally unique or scoped? Assuming global uniqueness for safety
  while (existing) {
    code = generateCode()
    existing = await db.collection('giftCards').findOne({ code })
  }

  const newCard = {
    giftCardId: crypto.randomUUID(),
    barId,
    code,
    status: 'active', // active | used_up | cancelled | expired
    initialAmount: parseFloat(data.amount),
    remainingAmount: parseFloat(data.amount),
    currency: 'USD', // Default to USD for now

    customerName: data.recipientName,
    customerEmail: data.recipientEmail,
    purchaserName: data.senderName,
    purchaserEmail: data.senderEmail,

    stripePaymentId: data.stripeSessionId,
    paymentMethod: 'stripe_checkout',

    createdAt: new Date().toISOString(),
    expiresAt: null,

    redemptionCount: 0,
    lastRedemptionAt: null,

    // Storing redemptions embedded for now
    redemptions: [],
  }

  await db.collection('giftCards').insertOne(newCard)
  return newCard
}

/**
 * Get a gift card by code
 * @param {string} code - Gift card code
 * @param {string} barId - Tenant ID (optional for backward compatibility, but recommended)
 */
export async function getGiftCard(code, barId = null) {
  const query = { code }
  if (barId) {
    query.barId = barId
  }
  return await db.collection('giftCards').findOne(query)
}

/**
 * Get a gift card by Stripe Session ID (idempotency)
 * @param {string} sessionId - Stripe session ID
 * @param {string} barId - Tenant ID (optional for backward compatibility)
 */
export async function getGiftCardBySessionId(sessionId, barId = null) {
  const query = { stripePaymentId: sessionId }
  if (barId) {
    query.barId = barId
  }
  return await db.collection('giftCards').findOne(query)
}

/**
 * Redeem an amount from a gift card
 * @param {string} code - Gift card code
 * @param {number} amount - Amount to redeem
 * @param {string} barId - Tenant ID to ensure card belongs to correct tenant
 */
export async function redeemGiftCard(code, amount, barId = null) {
  const card = await getGiftCard(code, barId)

  if (!card) {
    throw new Error('Gift card not found')
  }

  const redeemAmount = parseFloat(amount)

  if (isNaN(redeemAmount) || redeemAmount <= 0) {
    throw new Error('Invalid redemption amount')
  }

  if (card.status !== 'active') {
    throw new Error(`Gift card is ${card.status}`)
  }

  if (card.remainingAmount < redeemAmount) {
    throw new Error('Insufficient balance')
  }

  // Create Redemption Record
  const redemption = {
    redemptionId: crypto.randomUUID(),
    giftCardId: card.giftCardId,
    amount: redeemAmount,
    currency: card.currency,
    performedByAdminId: 'admin_user', // Placeholder
    performedByAdminName: 'Admin', // Placeholder
    orderId: null,
    location: 'admin_dashboard',
    createdAt: new Date().toISOString(),
  }

  // Update Card
  const updates = {
    remainingAmount: card.remainingAmount - redeemAmount,
    redemptionCount: (card.redemptionCount || 0) + 1,
    lastRedemptionAt: redemption.createdAt,
    redemptions: [...(card.redemptions || []), redemption],
  }

  // Update status if empty
  if (updates.remainingAmount <= 0) {
    updates.remainingAmount = 0
    updates.status = 'used_up'
  }

  await db.collection('giftCards').updateOne({ code }, { ...card, ...updates })

  return { card: { ...card, ...updates }, redemption }
}

/**
 * Get all gift cards (for admin)
 */
export async function getAllGiftCards(barId) {
  if (!barId) return []
  const cards = await db.collection('giftCards').find({ barId })
  return cards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

/**
 * Get gift card statistics
 */
export async function getGiftCardStats(barId) {
  if (!barId) return null
  const dbCards = await db.collection('giftCards').find({ barId })
  const totalSold = dbCards.length
  const totalValue = dbCards.reduce((acc, card) => acc + (card.initialAmount || 0), 0)
  const totalRedeemed = dbCards.reduce(
    (acc, card) => acc + ((card.initialAmount || 0) - (card.remainingAmount || 0)),
    0
  )
  const activeCards = dbCards.filter(c => c.status === 'active').length

  return {
    totalSold,
    totalValue,
    totalRedeemed,
    activeCards,
  }
}
