# Quick Start Guide

Get your restaurant website up and running in minutes!

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Your Restaurant

Edit `/config/siteConfig.ts` and update:
- Restaurant name, address, phone, email
- Operating hours
- Feature toggles (enable/disable pages)
- SEO settings

### 3. Update Menu Data

Edit the JSON files in `/data/menu/`:
- `food.json` - Your food menu
- `drinks.json` - Your drinks menu

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📝 Essential Customizations

### Change Restaurant Name

1. Open `/config/siteConfig.ts`
2. Update `restaurant.name`
3. Update `seo.siteName` and `seo.defaultTitle`

### Enable/Disable Features

In `/config/siteConfig.ts`, set features to `true` or `false`:

```typescript
features: {
  events: true,        // Show/hide events page
  gallery: true,       // Show/hide gallery page
  reservations: true,  // Show/hide reservations page
  giftCards: true,     // Show/hide gift cards page
  foodMenu: true,      // Show/hide food menu
  drinkMenu: true,     // Show/hide drinks menu
}
```

### Update Menu Items

Edit `/data/menu/food.json`:

```json
{
  "sections": [
    {
      "id": "appetizers",
      "name": "Appetizers",
      "items": [
        {
          "id": "app-1",
          "name": "Your Dish Name",
          "description": "Description here",
          "price": 15
        }
      ]
    }
  ]
}
```

### Change Colors

Edit `/tailwind.config.js`:

```javascript
colors: {
  primary: {
    DEFAULT: '#YOUR_COLOR', // Main brand color
  },
  cream: {
    DEFAULT: '#YOUR_COLOR', // Background color
  },
  gold: {
    DEFAULT: '#YOUR_COLOR', // Accent color
  },
}
```

## 🎨 Add Your Images

1. Place images in `/public/images/`
2. Update image paths in:
   - Hero sections
   - Gallery
   - Events
   - About page

## 📧 Set Up Email (Optional)

1. Configure AWS SES
2. Uncomment email code in `/app/api/*/route.js` files
3. Add AWS credentials

## 💳 Set Up Payments (Optional)

1. Get Stripe API keys
2. Update `config/siteConfig.ts`:
   ```typescript
   api: {
     enableStripe: true,
     stripePublicKey: 'pk_live_...',
   }
   ```
3. Uncomment Stripe code in `/app/api/gift-cards/route.js`

## 🌐 Deploy

See `DEPLOYMENT.md` for detailed AWS deployment instructions.

## ✅ Checklist

- [ ] Updated restaurant information in `siteConfig.ts`
- [ ] Updated menu data in `/data/menu/`
- [ ] Updated events in `/data/events.json` (if enabled)
- [ ] Added your images to `/public/images/`
- [ ] Updated SEO settings
- [ ] Tested all forms
- [ ] Configured email (optional)
- [ ] Set up payments (optional)
- [ ] Updated domain URLs in sitemap/robots
- [ ] Deployed to production

## 🆘 Need Help?

1. Check `README.md` for detailed documentation
2. Review `DEPLOYMENT.md` for AWS setup
3. Check Next.js documentation: https://nextjs.org/docs

---

**You're all set!** 🎉

