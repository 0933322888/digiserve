# Vercel Deployment Guide

This project is designed to run as a Next.js app on Vercel, with multi-tenant routing, background cron jobs, and tenant-aware APIs. This guide covers the exact steps to deploy it successfully.

## 1. Prerequisites

Before deploying, make sure you have:

- A Vercel account
- A GitHub/GitLab/Bitbucket repository connected to Vercel
- A MongoDB database
- A custom domain or wildcard DNS support for tenant subdomains
- Stripe account and webhook keys if you plan to enable billing/payment features
- SMTP/email credentials if email notifications are enabled

## 2. Project Requirements

This app expects a Next.js App Router deployment and uses:

- `next build` as the production build command
- `vercel.json` for cron jobs
- environment variables for tenant identity, auth, MongoDB, and integrations

The repository already includes a Vercel cron config in [vercel.json](../vercel.json), which runs a scheduled processing endpoint.

## 3. Recommended Vercel Project Settings

When creating a new Vercel project:

- Framework: Next.js
- Root directory: repository root
- Build command: `npm run build`
- Install command: `npm install`
- Output directory: default Next.js output

Do not change to a static export configuration. This app relies on server-side routes and middleware.

## 4. Required Environment Variables

Set these in Vercel Project Settings > Environment Variables.

### Core app settings

```bash
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<db-name>
AUTH_SECRET=your-long-random-secret
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_DOMAIN=yourdomain.com
```

### Auth / cookies

```bash
AUTH_SECRET=replace-with-random-32-plus-char-string
```

The app uses `AUTH_SECRET` for cookie/session signing and social auth flows.

### Email settings

```bash
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@example.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=Your Restaurant <noreply@yourdomain.com>
```

### Stripe settings

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...

STRIPE_PRICE_ORDERING=price_...
STRIPE_PRICE_RESERVATIONS=price_...
STRIPE_PRICE_EVENTS=price_...
STRIPE_PRICE_GALLERY=price_...
STRIPE_PRICE_GIFT_CARDS=price_...
STRIPE_PRICE_SOCIAL_POSTING=price_...
```

### Optional AI/social posting settings

```bash
OPENAI_API_KEY=sk-...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
```

### Optional Vercel automation settings

```bash
VERCEL_API_TOKEN=
VERCEL_PROJECT_ID=
VERCEL_TEAM_ID=
```

## 5. Production Domain Setup

This app is built for multi-tenant behavior using host-based tenant resolution.

The main idea is:

- root domain hosts the marketing / platform shell
- tenant subdomains resolve to restaurant tenants
- custom domains can also be mapped to restaurants

For example:

- `https://yourdomain.com` → main app / admin host
- `https://tenant1.yourdomain.com` → tenant dashboard/public site
- `https://restaurant.example.com` → custom domain mapping

### Recommended DNS config

For a wildcard multi-tenant setup:

- Add a wildcard record like `*.yourdomain.com` → Vercel
- Or add a custom domain in Vercel and map each tenant as needed

Set:

```bash
NEXT_PUBLIC_BASE_DOMAIN=yourdomain.com
```

This value is used by the tenant resolver and social auth flows, so it must match your production domain.

## 6. Deployment Procedure

### Option A: Git-based deploy

1. Push the repository to GitHub.
2. Open Vercel and click Import Project.
3. Select the repository.
4. Confirm the framework is Next.js.
5. Add the required environment variables.
6. Click Deploy.

### Option B: Vercel CLI

```bash
npm install
vercel login
vercel
```

For production:

```bash
vercel --prod
```

## 7. Cron Jobs and Background Tasks

The app includes scheduled work through the Vercel cron configuration in [vercel.json](../vercel.json):

```json
{
  "crons": [
    {
      "path": "/api/admin/social-posting/process-scheduled",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

This means Vercel will call the scheduled endpoint every 15 minutes. Make sure the route is enabled and the project is deployed to production, not just preview.

## 8. Post-Deployment Checks

After the first deployment, validate all of these:

### Core app checks

- homepage loads
- admin pages load
- tenant resolution works with subdomain routing
- no 500 errors from middleware or tenant lookup

### Tenant checks

- create a test tenant via onboarding flow
- confirm tenant login works
- confirm tenant pages resolve to the correct host
- confirm public API endpoints respect tenant isolation

### Payments and email

- Stripe checkout works
- webhooks are reachable and configured
- email sends successfully when enabled

### Social posting

- OAuth redirect works for social accounts
- callback URL matches the production Vercel domain
- scheduled jobs run without errors

## 9. Common Production Issues

### 1. Tenant routes fail

Check:

- `NEXT_PUBLIC_BASE_DOMAIN` is correct
- wildcard DNS is configured in Vercel
- the tenant slug exists in the database

### 2. Auth cookies do not persist

Verify:

- `AUTH_SECRET` is set in production
- `NEXT_PUBLIC_APP_URL` matches the live domain
- your cookies are not blocked by same-site rules

### 3. MongoDB connection fails

Make sure:

- `MONGODB_URI` is valid for production
- the MongoDB IP access list includes Vercel IP ranges or is set to allow all traffic
- Atlas network access is configured correctly

### 4. Stripe webhooks fail

Check:

- `STRIPE_WEBHOOK_SECRET` is set correctly
- webhook endpoint uses the production domain
- the webhook URL matches the deployed app route

## 10. Recommended Final Setup

For a production deployment, the ideal setup is:

- production branch: `main`
- custom domain: `yourdomain.com`
- wildcard subdomain routing enabled
- MongoDB Atlas or another managed MongoDB instance
- Stripe live keys configured
- cron jobs enabled in Vercel
- environment variables stored in Vercel project settings

## 11. Useful References

- [DEPLOYMENT_MULTITENANT.md](./DEPLOYMENT_MULTITENANT.md)
- [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)
- [QUICKSTART.md](./QUICKSTART.md)
- [README.md](../README.md)

## 12. Quick Summary

If you want the minimum working Vercel production setup, configure these first:

```bash
MONGODB_URI=
AUTH_SECRET=
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_DOMAIN=yourdomain.com
```

Then connect the repo to Vercel, add the environment variables, deploy, and verify tenant and cron functionality.
