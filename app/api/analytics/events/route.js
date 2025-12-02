import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import connectDB from '@/lib/db/mongodb-connection.js'
import { getAnalyticsEventModel } from '@/lib/db/models.js'
import { getRestaurant, isAnalyticsEnabled } from '@/lib/analytics.js'

/**
 * Bot detection patterns
 */
const BOT_PATTERNS = [
  /bot|crawler|spider|crawling/i,
  /Googlebot|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|Exabot|facebot|ia_archiver/i,
  /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|SkypeUriPreview/i,
  /Mediapartners-Google|AdsBot-Google|Googlebot-Image|Googlebot-Video/i,
  /curl|wget|python|java|ruby|perl|php|scrapy|mechanize/i,
  /SemrushBot|AhrefsBot|MJ12bot|DotBot|MegaIndex|CCBot/i,
]

/**
 * Check if user agent is a bot
 */
function isBot(userAgent) {
  if (!userAgent) return true
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent))
}

/**
 * Anonymize IP address (remove last octet for IPv4, last 64 bits for IPv6)
 */
function anonymizeIP(ip) {
  if (!ip) return null

  // IPv4: Remove last octet (e.g., 192.168.1.123 -> 192.168.1.0)
  if (ip.includes('.')) {
    const parts = ip.split('.')
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`
    }
    return ip
  }

  // IPv6: Remove last 64 bits (simplified - just truncate after first 4 groups)
  if (ip.includes(':')) {
    const parts = ip.split(':')
    if (parts.length > 4) {
      return parts.slice(0, 4).join(':') + '::'
    }
    return ip
  }

  return ip
}

/**
 * Hash a string using SHA-256
 */
function sha256(text) {
  return createHash('sha256').update(text).digest('hex')
}

/**
 * Generate fingerprint hash from client fingerprint and anonymized IP
 */
function generateFingerprintHash(clientFingerprint, userAgent, anonymizedIP) {
  const components = [clientFingerprint || '', userAgent || '', anonymizedIP || '']
  const fingerprintString = components.join('|')
  return sha256(fingerprintString)
}

/**
 * Get client IP from request headers
 */
function getClientIP(request) {
  // Check various headers for IP (in order of preference)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  return null
}

/**
 * Normalize URL (remove common tracking parameters)
 */
function normalizeURL(url) {
  if (!url) return '/'

  try {
    const urlObj = new URL(url, 'http://localhost') // Use base URL for relative paths
    urlObj.searchParams.delete('utm_source')
    urlObj.searchParams.delete('utm_medium')
    urlObj.searchParams.delete('utm_campaign')
    urlObj.searchParams.delete('ref')
    urlObj.searchParams.delete('fbclid')
    urlObj.searchParams.delete('gclid')
    return urlObj.pathname + urlObj.search
  } catch (e) {
    return url
  }
}

/**
 * Normalize referrer
 */
function normalizeReferrer(referrer) {
  if (!referrer) return undefined

  try {
    const url = new URL(referrer)
    // Return just the origin for privacy
    return url.origin
  } catch (e) {
    return referrer
  }
}

/**
 * POST /api/analytics/events
 * Track analytics events (pageviews, etc.)
 */
export async function POST(request) {
  try {
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { restaurantId, event, url, referrer, utm, device, country, fingerprint, timestamp } = body

    // Validate required fields
    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurantId is required' }, { status: 400 })
    }

    if (!event || event !== 'pageview') {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 })
    }

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Check if analytics is enabled for this restaurant
    const analyticsEnabled = await isAnalyticsEnabled(restaurantId)
    if (!analyticsEnabled) {
      return NextResponse.json({ error: 'Analytics not enabled for this restaurant' }, { status: 403 })
    }

    // Get user agent and IP
    const userAgent = request.headers.get('user-agent') || ''
    const clientIP = getClientIP(request)

    // Bot detection - silently reject bots (don't error, just don't track)
    if (isBot(userAgent)) {
      return NextResponse.json({ success: true, bot: true }, { status: 200 })
    }

    // Anonymize IP
    const anonymizedIP = anonymizeIP(clientIP)
    const ipHash = anonymizedIP ? sha256(anonymizedIP) : null

    // Generate secure fingerprint hash
    const fingerprintHash = generateFingerprintHash(fingerprint, userAgent, anonymizedIP)

    // Normalize URL and referrer
    const normalizedURL = normalizeURL(url)
    const normalizedReferrer = normalizeReferrer(referrer)

    // Connect to database
    await connectDB()
    const AnalyticsEvent = getAnalyticsEventModel()

    // Get restaurant (already imported getRestaurant function)
    const restaurant = await getRestaurant(restaurantId)
    
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    // Create analytics event
    const eventData = {
      restaurantId: restaurant._id,
      eventType: 'pageview',
      url: normalizedURL,
      referrer: normalizedReferrer || undefined,
      utm: utm && Object.keys(utm).length > 0 ? utm : undefined,
      device: device || undefined,
      country: country || undefined,
      fingerprint: fingerprintHash,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      userAgent: userAgent.substring(0, 500), // Limit length
      ipHash: ipHash || undefined,
    }

    // Save event (use insertOne for better performance)
    await AnalyticsEvent.create(eventData)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Analytics event tracking error:', error)
    // Don't expose internal errors to clients
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

