import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb-connection'
import { getUserModel } from '@/lib/db/models'

/**
 * GET /api/auth/activate?token=... 
 * Exchange a short-lived activation token for a tenant-scoped session cookie.
 * The request must be made from the tenant host (so the cookie domain can be set to that host).
 */
export async function GET(request) {
  // Serve a small client-side activation page that posts to this endpoint to perform the token exchange.
  // This avoids immediate server-side redirects and gives a user-visible "Activating your account..." UI.
  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Activating your account…</title>
      <style>
        body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#0f1724; color:#e6eef8; display:flex; align-items:center; justify-content:center; height:100vh; margin:0 }
        .card { background: rgba(255,255,255,0.04); padding:24px; border-radius:12px; text-align:center; max-width:420px }
        .spinner { width:36px; height:36px; border-radius:50%; border:4px solid rgba(255,255,255,0.08); border-top-color:#ef4444; margin:12px auto }
        .error { color:#fca5a5; margin-top:12px }
        a { color:#fb7185 }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>Activating your account…</h2>
        <div class="spinner" aria-hidden="true"></div>
        <p id="msg">Please wait while we set up your account on this site.</p>
        <p id="error" class="error" role="alert" style="display:none"></p>
      </div>
      <script>
        (async function(){
          try {
            const params = new URLSearchParams(window.location.search)
            const token = params.get('token')
            if (!token) {
              document.getElementById('error').textContent = 'Missing activation token.'
              document.getElementById('error').style.display = 'block'
              return
            }

            const res = await fetch(window.location.pathname + window.location.search, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token })
            })

            const json = await res.json()
            if (!res.ok) {
              throw new Error(json.error || 'Activation failed')
            }

            // If theme was returned, apply it immediately so the tenant shows the chosen theme before redirect
            try {
              const theme = json.theme
              if (theme && typeof document !== 'undefined') {
                const root = document.documentElement
                if (theme.primaryColor) root.style.setProperty('--primary', theme.primaryColor)
                if (theme.secondaryColor) root.style.setProperty('--secondary', theme.secondaryColor)
                // cream & gold based on type (mirrors ThemeProvider.applyTheme logic)
                if (theme.type === 'vintage') {
                  if (theme.secondaryColor) root.style.setProperty('--cream', theme.secondaryColor)
                  root.style.setProperty('--gold', '#d4af37')
                } else if (theme.type === 'modern') {
                  if (theme.secondaryColor) root.style.setProperty('--cream', theme.secondaryColor)
                  root.style.setProperty('--gold', '#3498db')
                } else if (theme.type === 'minimalist') {
                  if (theme.secondaryColor) root.style.setProperty('--cream', theme.secondaryColor)
                  root.style.setProperty('--gold', '#666666')
                }
              }
            } catch (e) {
              // Non-fatal if applying theme fails
              console.warn('Failed to apply theme on activation page:', e)
            }

            // Success — redirect to admin
            window.location.href = json.redirect || '/admin'
          } catch (err) {
            console.error('Activation client error:', err)
            document.getElementById('msg').textContent = 'Activation failed.'
            const e = document.getElementById('error')
            e.textContent = err.message || 'Activation failed. Please try again.'
            e.style.display = 'block'
          }
        })()
      </script>
    </body>
  </html>`

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  })
}

export async function POST(request) {
  try {
    const body = await request.json()
    const token = body?.token

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    await connectDB()
    const User = getUserModel()

    // Find user by activation token and ensure it's not expired
    const user = await User.findOne({ activationToken: token })
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    if (user.activationTokenExpires && new Date() > new Date(user.activationTokenExpires)) {
      return NextResponse.json({ error: 'Token expired' }, { status: 400 })
    }

    // Determine tenant (barId) from user
    const tenantId = user.tenantIds?.[0]
    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant associated with token' }, { status: 400 })
    }

    // Load restaurant to get canonical subdomain for token payload
    const { getRestaurantModel } = await import('@/lib/db/models')
    const Restaurant = getRestaurantModel()
    const restaurant = await Restaurant.findOne({ barId: tenantId })

    // Create session token and set cookie using auth-service
    const { createSessionToken, setSession } = await import('@/lib/auth-service')
    const sessionToken = await createSessionToken(user, tenantId, restaurant?.subdomain || null)

    const hostname = request.headers.get('host')
    await setSession(sessionToken, hostname)

    // Clear activation token
    await User.updateOne({ id: user.id }, { $unset: { activationToken: '', activationTokenExpires: '' } })

    // Include restaurant theme in response so the activation page can apply it immediately
    const theme = (restaurant && restaurant.theme) ? restaurant.theme : {
      type: 'vintage',
      primaryColor: '#8B0000',
      secondaryColor: '#F5F5DC',
      logo: null,
    }

    // Respond with redirect target (admin) and theme payload
    return NextResponse.json({ success: true, redirect: '/admin', theme })
  } catch (err) {
    console.error('Activation error:', err)
    return NextResponse.json({ error: 'Activation failed' }, { status: 500 })
  }
}
