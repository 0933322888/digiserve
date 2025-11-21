# Deployment Guide

This guide covers deploying the TRIO BISTRO website to AWS using S3 and CloudFront.

## Prerequisites

- AWS Account
- AWS CLI installed and configured
- Node.js 18+ installed
- Domain name (optional but recommended)

## Step 1: Build the Project

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

## Step 2: Create S3 Bucket

1. **Create S3 bucket**
   ```bash
   aws s3 mb s3://your-restaurant-website
   ```

2. **Enable static website hosting** (optional, if not using CloudFront)
   ```bash
   aws s3 website s3://your-restaurant-website --index-document index.html
   ```

3. **Set bucket policy for public read** (if using S3 website hosting)
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-restaurant-website/*"
       }
     ]
   }
   ```

## Step 3: Configure CloudFront (Recommended)

1. **Create CloudFront distribution**
   - Origin: Your S3 bucket
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Default Root Object: index.html
   - Price Class: Select based on your needs

2. **Configure custom domain** (optional)
   - Add your domain to CloudFront
   - Request SSL certificate in AWS Certificate Manager
   - Update CloudFront distribution with certificate

3. **Configure caching**
   - Default TTL: 86400 (1 day)
   - Maximum TTL: 31536000 (1 year)
   - Minimum TTL: 0

## Step 4: Deploy to S3

### Option A: Using AWS CLI

```bash
# Build the project
npm run build

# Upload to S3
aws s3 sync .next/static s3://your-restaurant-website/_next/static --delete
aws s3 sync public s3://your-restaurant-website --delete

# For Next.js export (if using static export)
npm run build
aws s3 sync out s3://your-restaurant-website --delete
```

### Option B: Using GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Deploy to S3
        run: aws s3 sync out s3://your-restaurant-website --delete
      - name: Invalidate CloudFront
        run: aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Step 5: Configure Environment Variables

For production, set environment variables:

1. **In AWS Lambda** (if using serverless functions):
   - Set environment variables in Lambda function configuration

2. **In CloudFront**:
   - Use CloudFront Functions or Lambda@Edge for environment-specific configs

3. **In Next.js** (build time):
   - Set `NEXT_PUBLIC_*` variables before build
   - These are embedded in the build output

## Step 6: Set Up AWS SES (Email)

1. **Verify your domain** in AWS SES
2. **Request production access** (if in sandbox)
3. **Create IAM user** with SES permissions
4. **Update API routes** with AWS SDK code (uncomment in route files)

## Step 7: Set Up Stripe (Optional)

1. **Create Stripe account**
2. **Get API keys**
3. **Update configuration** in `config/siteConfig.ts`
4. **Uncomment Stripe code** in `/app/api/gift-cards/route.js`

## Step 8: Configure Google Maps

1. **Get Google Maps API key**
2. **Update** `/app/contact/page.js` with your API key
3. **Restrict API key** to your domain in Google Cloud Console

## Step 9: Update Domain Settings

1. **Update sitemap.js**:
   ```javascript
   const baseUrl = 'https://yourdomain.com'
   ```

2. **Update robots.js**:
   ```javascript
   const baseUrl = 'https://yourdomain.com'
   ```

3. **Update layout.js**:
   ```javascript
   url: 'https://yourdomain.com',
   ```

## Step 10: Test Deployment

1. **Visit your CloudFront URL** or custom domain
2. **Test all pages**:
   - Home page
   - Menu pages
   - Forms (contact, reservations, gift cards)
   - Gallery
   - Events
   - About
   - Contact

3. **Check SEO**:
   - View page source for meta tags
   - Test sitemap.xml
   - Test robots.txt
   - Verify Schema.org markup

## Troubleshooting

### Images not loading
- Check S3 bucket permissions
- Verify image paths in code
- Check CloudFront cache settings

### Forms not working
- Verify API routes are accessible
- Check AWS SES configuration
- Review CloudFront function/Lambda@Edge setup

### 404 errors on refresh
- Configure CloudFront error pages
- Set up S3 redirect rules
- Use Next.js rewrites if needed

## Cost Optimization

- **S3**: Very low cost for static hosting
- **CloudFront**: Pay per request, first 1TB free per month
- **SES**: $0.10 per 1,000 emails
- **Lambda**: Pay per request (if using serverless functions)

## Security Best Practices

1. **Enable S3 bucket versioning**
2. **Use IAM roles** instead of access keys when possible
3. **Enable CloudFront access logs**
4. **Use AWS WAF** for DDoS protection
5. **Enable HTTPS only**
6. **Restrict S3 bucket access** to CloudFront only

## Monitoring

1. **Set up CloudWatch alarms** for errors
2. **Monitor CloudFront metrics**
3. **Track form submissions** (set up logging)
4. **Monitor SES bounce/complaint rates**

## Backup Strategy

1. **Version control** all code in Git
2. **Backup S3 bucket** regularly
3. **Export menu data** periodically
4. **Keep configuration files** in version control

---

For more information, refer to:
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)

