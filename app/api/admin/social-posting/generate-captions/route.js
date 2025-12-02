import { NextResponse } from 'next/server'
import { getSetting } from '@/lib/app-settings-service'
import { siteConfig } from '@/config/siteConfig'

/**
 * POST /api/admin/social-posting/generate-captions
 * Generate AI captions for a post (3-5 variants)
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { prompt, platform, barId } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Check if module is enabled
    if (!siteConfig.modules?.socialPosting?.enabled) {
      return NextResponse.json({ error: 'Social posting module is not enabled' }, { status: 403 })
    }

    // Get OpenAI API key from database, fallback to env var
    let openAIApiKey = await getSetting('OPENAI_API_KEY')
    if (!openAIApiKey) {
      openAIApiKey = siteConfig.modules.socialPosting.openAIApiKey || process.env.OPENAI_API_KEY
    }

    if (!openAIApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please set it in admin settings.' },
        { status: 500 }
      )
    }

    // Generate captions using OpenAI
    const systemPrompt = `You are a social media content creator for a restaurant/bar. Generate ${platform === 'instagram' ? '3-5' : '3'} engaging, authentic captions for social media posts. Each caption should be:
- Engaging and authentic
- Appropriate for ${platform === 'instagram' ? 'Instagram' : 'Facebook'}
- Include relevant hashtags (for Instagram)
- Be concise but compelling
- Match the restaurant's brand voice

Return ONLY a JSON array of caption strings, no other text.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || 'Failed to generate captions')
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || '[]'

    // Parse the JSON array from the response
    let captions
    try {
      captions = JSON.parse(content)
    } catch (e) {
      // If parsing fails, try to extract JSON array from the text
      const jsonMatch = content.match(/\[.*\]/s)
      if (jsonMatch) {
        captions = JSON.parse(jsonMatch[0])
      } else {
        // Fallback: split by newlines and clean up
        captions = content
          .split('\n')
          .filter(line => line.trim())
          .map(line =>
            line
              .replace(/^\d+\.\s*/, '')
              .replace(/^[-*]\s*/, '')
              .trim()
          )
          .filter(line => line.length > 0)
          .slice(0, 5)
      }
    }

    if (!Array.isArray(captions) || captions.length === 0) {
      throw new Error('Failed to generate valid captions')
    }

    return NextResponse.json({
      success: true,
      captions: captions.slice(0, 5), // Ensure max 5 captions
    })
  } catch (error) {
    console.error('Generate captions error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate captions' },
      { status: 500 }
    )
  }
}
