import crypto from 'crypto'
import { db } from './db'

export async function logEvent(barId, type, description, status, metadata = {}) {
  if (!barId) {
    console.warn('logEvent called without barId', { type, description })
    // For now, allow it but log warning, or default to 'system'
  }

  const newEvent = {
    id: crypto.randomUUID(),
    barId,
    type, // 'GIFT_CARD', 'RESERVATION', 'SYSTEM'
    description,
    status, // 'SUCCESS', 'FAILED'
    metadata,
    timestamp: new Date().toISOString(),
  }

  // We want to prepend, but our simple adapter appends.
  // For a log, appending is actually more standard for DBs.
  // We can sort by timestamp desc when querying.
  await db.collection('activityLog').insertOne(newEvent)

  // Pruning old logs would typically be a background job or separate DB command.
  // For now, we'll skip the "keep only 1000" logic to keep it simple,
  // or we could implement a cleanup.
  // Let's keep it simple for now as MongoDB handles large datasets well.

  return newEvent
}

export async function getRecentEvents(barId, limit = 20) {
  if (!barId) return []
  const events = await db.collection('activityLog').find({ barId })
  // Sort desc by timestamp
  events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  return events.slice(0, limit)
}
