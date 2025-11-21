# TRIO BISTRO AND LOUNGE - Restaurant Website Template

A fully modular, SEO-optimized, responsive Next.js 14 website template designed for restaurants and bars. This template can be easily customized for any restaurant by modifying the configuration file.

## 🚀 Features

- **Modular Architecture**: Enable/disable features via configuration
- **SEO Optimized**: Complete SEO implementation with Schema.org markup
- **Responsive Design**: Mobile-first, fully responsive layout
- **Dark Mode**: Built-in dark mode toggle
- **Modern Animations**: Smooth animations with Framer Motion
- **Production Ready**: Optimized for AWS S3 + CloudFront deployment
- **TypeScript Support**: Full TypeScript configuration (using JavaScript for flexibility)

## 📋 Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **Tailwind CSS** (styling)
- **Framer Motion** (animations)
- **next-seo** (SEO optimization)
- **Lucide React** (icons)

## 🛠️ Installation

1. **Clone or download the project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

All site configuration is managed in `/config/siteConfig.ts`. This file controls:

### Restaurant Information
- Restaurant name, tagline, description
- Address and contact information
- Operating hours

### Feature Toggles
Enable or disable features by setting them to `true` or `false`:

```typescript
features: {
  events: true,        // Events page
  gallery: true,       // Gallery page
  reservations: true,  // Reservations page
  giftCards: true,     // Gift cards page
  foodMenu: true,      // Food menu page
  drinkMenu: true,     // Drinks menu page
}
```

### SEO Configuration
- Site name and default meta tags
- OpenGraph and Twitter card settings
- Social media links

### API Configuration
- Email sending (AWS SES integration)
- Stripe payment processing (for gift cards)

## 📝 Customizing for a New Restaurant

### Step 1: Update Site Configuration

Edit `/config/siteConfig.ts`:

```typescript
restaurant: {
  name: 'YOUR RESTAURANT NAME',
  tagline: 'Your tagline here',
  description: 'Your restaurant description',
  address: {
    street: 'Your Street Address',
    city: 'Your City',
    state: 'Your State',
    zip: 'Your ZIP Code',
    country: 'Your Country',
  },
  phone: 'Your Phone Number',
  email: 'Your Email',
  hours: {
    // Update with your hours
  },
}
```

### Step 2: Update Menu Data

Replace menu items in:
- `/data/menu/food.json` - Food menu items
- `/data/menu/drinks.json` - Drinks menu items

Menu structure:
```json
{
  "sections": [
    {
      "id": "section-id",
      "name": "Section Name",
      "description": "Section description",
      "items": [
        {
          "id": "item-id",
          "name": "Item Name",
          "description": "Item description",
          "price": 25,
          "dietary": ["vegetarian", "gluten-free"] // Optional
        }
      ]
    }
  ]
}
```

### Step 3: Update Events (if enabled)

Edit `/data/events.json` with your events:

```json
{
  "events": [
    {
      "id": "event-1",
      "title": "Event Title",
      "date": "2024-03-15",
      "time": "8:00 PM",
      "description": "Event description",
      "image": "/images/events/event.jpg",
      "featured": true
    }
  ]
}
```

### Step 4: Update Images

Replace placeholder images with your own:
- Hero section images
- Gallery images
- Event images
- About page images

Place images in `/public/images/` directory.

### Step 5: Update SEO Settings

In `/config/siteConfig.ts`, update:
- `seo.defaultTitle`
- `seo.defaultDescription`
- `seo.defaultImage`
- Social media URLs

### Step 6: Update Domain

Update the base URL in:
- `/app/sitemap.js` - Change `baseUrl`
- `/app/robots.js` - Change `baseUrl`
- `/app/layout.js` - Update OpenGraph URL

## 🌐 AWS Deployment

### Prerequisites
- AWS Account
- AWS CLI configured
- S3 bucket created
- CloudFront distribution set up

### Build for Production

```bash
npm run build
```

### Deploy to S3

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Export static files**
   ```bash
   npm run build
   # Next.js will output to .next/standalone
   ```

3. **Upload to S3**
   ```bash
   aws s3 sync .next/standalone s3://your-bucket-name --delete
   ```

4. **Configure CloudFront**
   - Point CloudFront to your S3 bucket
   - Set up custom domain (optional)
   - Configure SSL certificate

### Environment Variables

Create `.env.local` for production:

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=your-email@domain.com
STRIPE_PUBLIC_KEY=your-stripe-key
```

## 📧 Email Integration (AWS SES)

To enable email sending:

1. **Set up AWS SES**
   - Verify your email domain
   - Request production access if needed

2. **Install AWS SDK**
   ```bash
   npm install @aws-sdk/client-ses
   ```

3. **Update API routes**
   - Uncomment AWS SES code in `/app/api/contact/route.js`
   - Uncomment AWS SES code in `/app/api/reservations/route.js`
   - Uncomment AWS SES code in `/app/api/gift-cards/route.js`

4. **Add AWS credentials**
   - Use IAM roles (recommended for Lambda)
   - Or set environment variables

## 💳 Stripe Integration (Gift Cards)

To enable Stripe payments:

1. **Get Stripe keys**
   - Sign up at [stripe.com](https://stripe.com)
   - Get your API keys

2. **Install Stripe SDK**
   ```bash
   npm install stripe
   ```

3. **Update configuration**
   ```typescript
   api: {
     enableStripe: true,
     stripePublicKey: 'pk_live_...',
   }
   ```

4. **Update API route**
   - Uncomment Stripe code in `/app/api/gift-cards/route.js`

## 🗺️ Google Maps Integration

To enable Google Maps on the contact page:

1. **Get Google Maps API key**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Enable Maps JavaScript API
   - Create API key

2. **Update contact page**
   - Edit `/app/contact/page.js`
   - Replace `YOUR_API_KEY` with your Google Maps API key

## 🎨 Customization

### Colors

Edit `/tailwind.config.js` to customize the color palette:

```javascript
colors: {
  primary: {
    DEFAULT: '#8B0000', // Deep red
  },
  cream: {
    DEFAULT: '#F5F5DC',
  },
  gold: {
    DEFAULT: '#D4AF37',
  },
}
```

### Fonts

Update fonts in `/tailwind.config.js`:

```javascript
fontFamily: {
  serif: ['Your Serif Font', 'serif'],
  sans: ['Your Sans Font', 'sans-serif'],
}
```

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── menu/              # Menu pages
│   ├── layout.js          # Root layout
│   ├── page.js            # Home page
│   ├── globals.css        # Global styles
│   ├── sitemap.js         # Dynamic sitemap
│   └── robots.js          # Robots.txt
├── components/            # Reusable components
│   ├── forms/            # Form components
│   ├── Navbar.jsx        # Navigation
│   ├── Footer.jsx        # Footer
│   └── ...
├── config/                # Configuration files
│   └── siteConfig.ts     # Main site configuration
├── data/                  # Data files
│   ├── menu/             # Menu JSON files
│   └── events.json       # Events data
├── lib/                   # Utility functions
│   └── utils.js          # Helper functions
└── public/               # Static assets
```

## 🧪 Development

### Run Linter
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

## 📄 License

This template is provided as-is for use in restaurant websites. Customize as needed for your project.

## 🤝 Support

For questions or issues:
1. Check the configuration file
2. Review the API route implementations
3. Check Next.js documentation

## 🎯 Next Steps

1. Customize the configuration for your restaurant
2. Replace placeholder images
3. Update menu data
4. Set up AWS services (SES, S3, CloudFront)
5. Configure domain and SSL
6. Test all forms and features
7. Deploy to production

---

**Built with ❤️ for restaurants and bars**

