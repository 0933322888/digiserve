# Multi-Tenant SaaS Platform - Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **MongoDB Database**
   - MongoDB Atlas cluster or self-hosted MongoDB instance
   - Connection string ready

2. **Environment Variables**
   - `MONGODB_URI` - MongoDB connection string
   - `AUTH_SECRET` - Secret key for JWT tokens (generate with `openssl rand -base64 32`)
   - `DEFAULT_TENANT_ID` - Default tenant for development (optional, defaults to 'bar_1')

3. **Initial Tenant Setup**
   - At least one Restaurant (tenant) record in the database
   - At least one User record with access to that tenant

## Deployment Steps

### 1. Database Setup

Create your first tenant using the signup endpoint or manually:

**Option A: Using Signup API**
```bash
curl -X POST https://your-domain.com/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantName": "My Restaurant",
    "slug": "my-restaurant",
    "adminName": "Admin User",
    "adminEmail": "admin@example.com",
    "adminPassword": "SecurePassword123",
    "modules": ["ordering", "reservations", "events", "gallery", "social"]
  }'
```

**Option B: Manual Database Insert**
```javascript
// Connect to MongoDB and insert:
db.restaurants.insertOne({
  id: "unique-id",
  barId: "bar_1",
  name: "My Restaurant",
  slug: "my-restaurant",
  domain: null,
  modules: ["ordering", "reservations", "events", "gallery", "social"],
  features: { analytics: true },
  settings: {
    currency: "USD",
    timezone: "America/New_York",
    locale: "en-US",
    theme: "default"
  },
  subscription: {
    plan: "basic",
    status: "active"
  },
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 2. Run Database Migrations

After deploying schema changes, run the Activity Log migration:

```bash
# Dry run to preview changes
npm run migrate:activity-logs:dry-run

# Apply migration
npm run migrate:activity-logs
```

### 3. Configure Domain/Subdomain Routing

**For Subdomain-based Tenants:**
- Configure DNS wildcard record: `*.yourdomain.com` → Your deployment
- Tenants will be accessible at: `tenant-slug.yourdomain.com`

**For Custom Domains:**
- Each tenant can set a custom domain in their Restaurant record
- Configure DNS CNAME: `customdomain.com` → Your deployment
- Update Restaurant record with `domain: "customdomain.com"`

### 4. Vercel Deployment

**Deploy to Vercel:**
```bash
vercel --prod
```

**Configure Environment Variables in Vercel:**
```
MONGODB_URI=mongodb+srv://...
AUTH_SECRET=your-secret-key
DEFAULT_TENANT_ID=bar_1
```

**Cron Jobs:**
The `vercel.json` file configures automatic processing of scheduled social media posts every 15 minutes.

### 5. Test Deployment

**Test Tenant Resolution:**
```bash
# Test subdomain
curl -H "Host: my-restaurant.yourdomain.com" https://yourdomain.com/api/menu/active

# Test custom domain (if configured)
curl https://customdomain.com/api/menu/active
```

**Test Admin Access:**
1. Navigate to `https://my-restaurant.yourdomain.com/admin/login`
2. Login with admin credentials
3. Verify tenant context is correct

## Post-Deployment

### Monitor Cron Jobs

Check Vercel logs to ensure scheduled posts are processing:
```bash
vercel logs --follow
```

### Add New Tenants

Use the signup endpoint or admin panel (when built) to add new tenants.

### Update Tenant Configuration

Update Restaurant records to:
- Enable/disable modules
- Configure custom domains
- Update subscription status

## Troubleshooting

### "Configuration Error: Tenant ID not found"

**Cause:** Middleware couldn't resolve tenant from host
**Solution:** 
- Verify Restaurant record exists with matching `slug` or `domain`
- Check DNS configuration
- Verify `DEFAULT_TENANT_ID` is set for localhost development

### "Invalid tenant or domain" on public routes

**Cause:** Tenant resolution failed
**Solution:**
- Check host header is being sent correctly
- Verify Restaurant record exists
- Check database connection

### Scheduled posts not publishing

**Cause:** Cron job not configured or failing
**Solution:**
- Verify `vercel.json` is deployed
- Check Vercel cron logs
- Test endpoint manually: `POST /api/admin/social-posting/process-scheduled`

## Security Checklist

- [ ] `AUTH_SECRET` is a strong random value
- [ ] MongoDB connection uses authentication
- [ ] Environment variables are not committed to git
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Admin routes require authentication
- [ ] All public routes validate tenant context

## Scaling Considerations

### Performance
- Tenant cache TTL is 5 minutes (adjust in `tenant-service.js`)
- Consider Redis for production caching
- Database indexes are configured for tenant queries

### Multi-Region
- Deploy to multiple Vercel regions
- Use MongoDB Atlas with multi-region clusters
- Configure CDN for static assets

### Monitoring
- Set up error tracking (Sentry, etc.)
- Monitor database query performance
- Track tenant-specific metrics
