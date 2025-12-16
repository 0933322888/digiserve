import { NextResponse } from 'next/server'
import { getFacebookAppCredentials } from '@/lib/app-settings-service'
import { exchangeCodeForToken, getFacebookPage, getInstagramBusinessAccount } from '@/lib/social-api-client'
import { saveAccount, getConnectedAccounts } from '@/lib/social-posting-service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/social-posting/callback
 * Handle Facebook OAuth callback
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (error) {
            console.error('Facebook OAuth Error:', error, searchParams.get('error_description'))
            return NextResponse.redirect(new URL('/admin/social-posting?error=' + error, request.url))
        }

        if (!code || !state) {
            return NextResponse.redirect(new URL('/admin/social-posting?error=missing_params', request.url))
        }

        // Decode state
        let barId;
        try {
            const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));
            barId = decodedState.barId;
        } catch (e) {
            console.error('Invalid state param', e);
            return NextResponse.redirect(new URL('/admin/social-posting?error=invalid_state', request.url))
        }

        // Get Credentials
        const { facebookAppId, facebookAppSecret } = await getFacebookAppCredentials(barId)
        if (!facebookAppId || !facebookAppSecret) {
            return NextResponse.redirect(new URL('/admin/social-posting?error=missing_credentials', request.url))
        }

        // Construct Redirect URI (Same as in auth-url)
        const host = request.headers.get('host')
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const redirectUri = `${protocol}://${host}/api/admin/social-posting/callback`;

        // Exchange Token
        const tokenData = await exchangeCodeForToken(facebookAppId, facebookAppSecret, code, redirectUri);
        const accessToken = tokenData.accessToken;

        // Fetch User's Pages
        // Note: The token is a User Token with page permissions. 
        // We need to get the LIST of pages this user manages.
        const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`);
        const pagesData = await pagesResponse.json();

        if (pagesData.error) {
            throw new Error(pagesData.error.message);
        }

        const pages = pagesData.data || [];
        let connectedCount = 0;

        // Connect ALL pages returned (or we could show a selection UI, but auto-connect is simpler for MVP)
        // "Manage everything on your Page" usually grants access to selected pages.
        for (const page of pages) {
            const pageId = page.id;
            const pageAccessToken = page.access_token; // Page-specific token
            const pageName = page.name;

            // Save Facebook Page Account
            let accountData = {
                accountId: pageId,
                barId,
                platform: 'facebook',
                name: pageName,
                accessToken: pageAccessToken,
                refreshToken: null, // FB Tokens auto-refresh
                tokenExpiresAt: null, // Long lived
                isActive: true,
                connectedAt: new Date().toISOString()
            };

            await saveAccount(accountData);
            connectedCount++;

            // Check for Instagram Connection
            try {
                const igId = await getInstagramBusinessAccount(pageId, pageAccessToken);
                if (igId) {
                    await saveAccount({
                        ...accountData,
                        accountId: igId, // Use IG ID as account ID
                        platform: 'instagram',
                        name: pageName + " (Instagram)",
                        instagramBusinessAccountId: igId,
                        pageId: pageId // Link back to FB Page
                    });
                    connectedCount++;
                }
            } catch (e) {
                console.log(`No IG account for page ${pageName}:`, e.message);
            }
        }

        return NextResponse.redirect(new URL(`/admin/social-posting?success=true&connected=${connectedCount}`, request.url))

    } catch (error) {
        console.error('Callback error:', error)
        return NextResponse.redirect(new URL('/admin/social-posting?error=' + encodeURIComponent(error.message), request.url))
    }
}
