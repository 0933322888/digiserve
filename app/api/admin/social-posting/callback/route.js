import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { getTenantFromHost } from '@/lib/tenant-service'
import { getFacebookAppCredentials } from '@/lib/app-settings-service'
import { exchangeCodeForToken, getFacebookPage, getInstagramBusinessAccount } from '@/lib/social-api-client'
import { saveAccount, getConnectedAccounts } from '@/lib/social-posting-service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/social-posting/callback
 * Handle Facebook OAuth callback
 */
export async function GET(request) {
    let stateCookieName = null
    let stateCookieDomain = null
    let redirectOrigin = new URL(request.url).origin
    const redirectToAdmin = (query = {}) => {
        const url = new URL('/admin/social-posting', redirectOrigin)
        for (const [key, value] of Object.entries(query)) {
            url.searchParams.set(key, value)
        }
        const response = NextResponse.redirect(url)
        if (stateCookieName) {
            response.cookies.set(stateCookieName, '', {
                path: '/',
                maxAge: 0,
                ...(stateCookieDomain ? { domain: stateCookieDomain } : {}),
            })
        }
        return response
    }

    try {
        const { searchParams } = new URL(request.url)
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (!state || !process.env.AUTH_SECRET) {
            return redirectToAdmin({ error: 'invalid_state' })
        }

        let statePayload
        try {
            const verifiedState = await jwtVerify(
                state,
                new TextEncoder().encode(process.env.AUTH_SECRET),
                { algorithms: ['HS256'] }
            )
            statePayload = verifiedState.payload
        } catch (e) {
            console.error('Invalid OAuth state', e)
        }
        const { barId, nonce, tenantHost } = statePayload || {}
        if (typeof barId !== 'string' || typeof nonce !== 'string' || typeof tenantHost !== 'string') {
            return redirectToAdmin({ error: 'invalid_state' })
        }
        if (await getTenantFromHost(tenantHost) !== barId) {
            return redirectToAdmin({ error: 'invalid_state' })
        }
        stateCookieName = `social_oauth_state_${nonce}`
        const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'digiserve.com'
        const cleanTenantHost = tenantHost.split(':')[0].toLowerCase()
        if (cleanTenantHost === baseDomain || cleanTenantHost.endsWith(`.${baseDomain}`)) {
            stateCookieDomain = `.${baseDomain}`
        }
        const tenantProtocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
        redirectOrigin = `${tenantProtocol}://${tenantHost}`
        const stateCookie = request.cookies.get(stateCookieName)?.value
        if ((process.env.NODE_ENV === 'production' && stateCookie !== nonce) ||
            (stateCookie && stateCookie !== nonce)) {
            return redirectToAdmin({ error: 'invalid_state' })
        }

        if (error) {
            console.error('Facebook OAuth Error:', error, searchParams.get('error_description'))
            return redirectToAdmin({ error })
        }

        if (!code) {
            return redirectToAdmin({ error: 'missing_params' })
        }

        // Get Credentials
        const { facebookAppId, facebookAppSecret } = await getFacebookAppCredentials(barId)
        if (!facebookAppId || !facebookAppSecret) {
            return redirectToAdmin({ error: 'missing_credentials' })
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

        return redirectToAdmin({ success: 'true', connected: String(connectedCount) })

    } catch (error) {
        console.error('Callback error:', error)
        return redirectToAdmin({ error: error.message || 'callback_failed' })
    }
}
