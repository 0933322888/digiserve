import { readFile } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'

/**
 * GET /analytics/tracker.js
 * Serve the analytics tracking script with proper headers
 */
export async function GET() {
  try {
    // Read the tracker script file
    const filePath = join(process.cwd(), 'analytics', 'tracker.js')
    const scriptContent = await readFile(filePath, 'utf-8')

    // Return with proper headers for JavaScript file
    return new NextResponse(scriptContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*', // Allow embedding from any domain
        'Access-Control-Allow-Methods': 'GET',
      },
    })
  } catch (error) {
    console.error('Error serving tracker script:', error)
    return new NextResponse('// Tracker script not found', {
      status: 404,
      headers: {
        'Content-Type': 'application/javascript',
      },
    })
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

