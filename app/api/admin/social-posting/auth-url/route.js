import { NextResponse } from 'next/server'
import { getFacebookAppCredentials } from '@/lib/app-settings-service'
import { siteConfig } from '@/config/siteConfig'

export const dynamic = 'force-dynamic' // Ensure this is not cached

/**
 * GET /api/admin/social-posting/auth-url
 * Generate the Facebook OAuth URL
 */
export async function GET(request) {
    try {
        const barId = request.headers.get('x-tenant-id')
        if (!barId) {
            return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
        }

        // Get App ID
        const { facebookAppId } = await getFacebookAppCredentials(barId)

        if (!facebookAppId) {
            return NextResponse.json(
                { error: 'Facebook App ID is not configured. Please go to Settings > Integrations.' },
                { status: 400 }
            )
        }

        // Determine redirect URI - must match what is configured in Facebook App
        // We construct it based on the host to support multiple environments (dev/prod)
        // Determine redirect URI
        let protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        let host = request.headers.get('host');

        // FIX: Facebook requires HTTPS for all domains except strictly "localhost".
        // "trio.localhost" counts as a custom domain and fails insecure checks.
        // We force "localhost:3000" in development to bypass this.
        if (process.env.NODE_ENV !== 'production' && host.includes('localhost')) {
            host = 'localhost:3000';
            protocol = 'http';
        }

        const redirectUri = `${protocol}://${host}/api/admin/social-posting/callback`;
        console.log('Generating Facebook Auth URL with Redirect URI:', redirectUri); // DEBUG LOG

        // State parameter to prevent CSRF and pass context
        // In a real app, sign this or store in DB to verify
        const state = JSON.stringify({ barId, nonce: Math.random().toString(36).substring(7) });
        const encodedState = Buffer.from(state).toString('base64');

        // Scopes
        const scopes = [
            'pages_manage_posts',
            'pages_read_engagement',
            'pages_show_list',
            'business_management',
            // 'instagram_basic',              // Enable these after adding "Instagram Graph API" product in FB App Dashboard
            // 'instagram_content_publish'     // Enable these after adding "Instagram Graph API" product in FB App Dashboard
        ].join(',');

        const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodedState}&scope=${scopes}`;

        return NextResponse.json({ url: authUrl });

    } catch (error) {
        console.error('Auth URL generation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
