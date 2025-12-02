import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * POST /api/admin/social-posting/upload
 * Upload images for social media posts
 */
export async function POST(request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files')

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'social-posts')

    // Create upload directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Get base URL for absolute URLs
    const getBaseUrl = () => {
      // Try environment variable first
      if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
      }
      // Try Vercel URL
      if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`
      }
      // Try to get from request headers
      const origin = request.headers.get('origin')
      if (origin) {
        return origin
      }
      const host = request.headers.get('host')
      if (host) {
        const protocol = request.headers.get('x-forwarded-proto') || 'https'
        return `${protocol}://${host}`
      }
      // Fallback to localhost for development
      return 'http://localhost:3000'
    }

    const baseUrl = getBaseUrl()
    const uploadedUrls = []

    for (const file of files) {
      // In Next.js server routes, FormData entries are File-like objects
      // Check if it has the necessary properties (name and arrayBuffer method)
      if (file && typeof file === 'object' && 'arrayBuffer' in file) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate unique filename
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 15)
        
        // Get file extension from name if available, otherwise default to jpg
        let extension = 'jpg'
        if (file.name && typeof file.name === 'string') {
          const nameParts = file.name.split('.')
          if (nameParts.length > 1) {
            extension = nameParts[nameParts.length - 1]
          }
        }
        
        const filename = `${timestamp}-${randomStr}.${extension}`
        const filepath = join(uploadDir, filename)
        await writeFile(filepath, buffer)

        // Return absolute URL for Facebook/Instagram compatibility
        const relativeUrl = `/uploads/social-posts/${filename}`
        const absoluteUrl = `${baseUrl}${relativeUrl}`
        uploadedUrls.push(absoluteUrl)
      }
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Failed to upload files' }, { status: 500 })
  }
}
