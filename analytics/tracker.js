/**
 * Analytics Tracking Script
 * Lightweight, cookie-free analytics tracker for restaurant websites
 * 
 * Usage:
 * <script defer src="/analytics/tracker.js" data-restaurant-id="RESTAURANT_ID"></script>
 */

(function () {
  'use strict'

  // Get restaurant ID from script tag attribute
  const scriptTag = document.currentScript || document.querySelector('script[data-restaurant-id]')
  const restaurantId = scriptTag?.getAttribute('data-restaurant-id')

  if (!restaurantId) {
    console.warn('Analytics: Restaurant ID not found. Please add data-restaurant-id attribute to the script tag.')
    return
  }

  // Configuration
  const API_ENDPOINT = '/api/analytics/events'
  const TRACK_DELAY = 1000 // Wait 1 second before tracking to ensure page is fully loaded

  /**
   * Generate a fingerprint from user agent and screen info
   * This is a lightweight, privacy-friendly approach (no IP stored on client)
   */
  function generateFingerprint() {
    const components = [
      navigator.userAgent || '',
      navigator.language || '',
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset().toString(),
      (navigator.hardwareConcurrency || '').toString(),
    ]
    const fingerprintString = components.join('|')
    
    // Simple hash function (will be re-hashed with SHA-256 on server)
    let hash = 0
    for (let i = 0; i < fingerprintString.length; i++) {
      const char = fingerprintString.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * Detect device type from user agent
   */
  function detectDevice() {
    const ua = navigator.userAgent
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet'
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
      return 'mobile'
    }
    return 'desktop'
  }

  /**
   * Parse UTM parameters from URL
   */
  function getUTMParams() {
    const params = new URLSearchParams(window.location.search)
    const utm = {}
    
    if (params.get('utm_source')) utm.source = params.get('utm_source')
    if (params.get('utm_medium')) utm.medium = params.get('utm_medium')
    if (params.get('utm_campaign')) utm.campaign = params.get('utm_campaign')
    if (params.get('utm_term')) utm.term = params.get('utm_term')
    if (params.get('utm_content')) utm.content = params.get('utm_content')
    
    return Object.keys(utm).length > 0 ? utm : undefined
  }

  /**
   * Normalize referrer URL
   */
  function normalizeReferrer(referrer) {
    if (!referrer) return undefined
    
    try {
      const url = new URL(referrer)
      // Remove common tracking parameters
      url.searchParams.delete('utm_source')
      url.searchParams.delete('utm_medium')
      url.searchParams.delete('utm_campaign')
      url.searchParams.delete('ref')
      url.searchParams.delete('fbclid')
      url.searchParams.delete('gclid')
      
      // Return just the origin for privacy
      return url.origin
    } catch (e) {
      return referrer
    }
  }

  /**
   * Normalize current page URL
   */
  function normalizeURL() {
    const url = window.location.pathname + window.location.search
    
    // Remove common tracking parameters from URL
    try {
      const urlObj = new URL(window.location.href)
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
   * Detect country from timezone (lightweight heuristic)
   * This is not 100% accurate but provides reasonable estimates
   */
  function detectCountry() {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    
    // Simple timezone to country mapping (common ones)
    const timezoneMap = {
      'America/New_York': 'US',
      'America/Chicago': 'US',
      'America/Denver': 'US',
      'America/Los_Angeles': 'US',
      'America/Toronto': 'CA',
      'America/Vancouver': 'CA',
      'Europe/London': 'GB',
      'Europe/Paris': 'FR',
      'Europe/Berlin': 'DE',
      'Europe/Rome': 'IT',
      'Europe/Madrid': 'ES',
      'Asia/Tokyo': 'JP',
      'Asia/Shanghai': 'CN',
      'Asia/Hong_Kong': 'HK',
      'Australia/Sydney': 'AU',
      'Australia/Melbourne': 'AU',
    }
    
    return timezoneMap[timezone] || 'Unknown'
  }

  /**
   * Send tracking event to API
   */
  function trackEvent(eventData) {
    // Use sendBeacon for better reliability and non-blocking
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(eventData)], { type: 'application/json' })
      navigator.sendBeacon(API_ENDPOINT, blob)
    } else {
      // Fallback to fetch
      fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
        keepalive: true, // Keep request alive even if page unloads
      }).catch(() => {
        // Silently fail - analytics should never break the site
      })
    }
  }

  /**
   * Track pageview
   */
  function trackPageview() {
    const eventData = {
      restaurantId: restaurantId,
      event: 'pageview',
      url: normalizeURL(),
      referrer: normalizeReferrer(document.referrer),
      utm: getUTMParams(),
      device: detectDevice(),
      country: detectCountry(),
      fingerprint: generateFingerprint(),
      timestamp: Date.now(),
    }

    trackEvent(eventData)
  }

  /**
   * Track when page becomes visible (for SPA navigation)
   */
  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      // Small delay to ensure URL has updated for SPAs
      setTimeout(trackPageview, 100)
    }
  }

  /**
   * Initialize tracking
   */
  function init() {
    // Wait a bit before tracking to ensure page is fully loaded
    setTimeout(() => {
      trackPageview()
    }, TRACK_DELAY)

    // Track page visibility changes (for SPAs)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    // Track hash changes (for SPAs using hash routing)
    let lastHash = window.location.hash
    setInterval(() => {
      if (window.location.hash !== lastHash) {
        lastHash = window.location.hash
        setTimeout(trackPageview, 100)
      }
    }, 500)
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  // Track initial pageview on script load (for immediate tracking)
  // This runs immediately, then DOMContentLoaded will run again after delay
  if (document.readyState !== 'loading') {
    init()
  }
})()

