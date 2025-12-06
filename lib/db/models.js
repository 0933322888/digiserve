import mongoose from 'mongoose'

// Order Schema
const OrderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    barId: { type: String, required: true },
    customerInfo: {
      name: String,
      email: String,
      phone: String,
    },
    orderType: { type: String, enum: ['pickup', 'delivery'], required: true },
    items: [
      {
        id: String,
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    totals: {
      subtotal: Number,
      tax: Number,
      delivery: Number,
      total: Number,
    },
    paymentIntentId: String,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
      default: 'pending',
    },
    pickupTime: Date,
    deliveryAddress: mongoose.Schema.Types.Mixed,
    notes: String,
    adminNotes: String,
    confirmedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancelledBy: String,
    cancelledByAdminName: String,
    cancelledReason: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

// Reservation Schema
const ReservationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    barId: { type: String, required: true, index: true }, // Added for multi-tenancy
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    partySize: { type: Number, required: true },
    specialRequests: String,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

// Gift Card Schema
const GiftCardSchema = new mongoose.Schema(
  {
    giftCardId: { type: String, required: true, unique: true },
    barId: { type: String, required: true, index: true }, // Added for multi-tenancy
    code: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['active', 'used_up', 'cancelled', 'expired'],
      default: 'active',
    },
    initialAmount: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    customerName: String,
    customerEmail: String,
    purchaserName: String,
    purchaserEmail: String,
    stripePaymentId: String,
    paymentMethod: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
    redemptionCount: { type: Number, default: 0 },
    lastRedemptionAt: Date,
    redemptions: [
      {
        redemptionId: String,
        giftCardId: String,
        amount: Number,
        currency: String,
        performedByAdminId: String,
        performedByAdminName: String,
        orderId: String,
        location: String,
        createdAt: Date,
      },
    ],
  },
  { timestamps: false }
)

// Menu Schema
const MenuSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    barId: { type: String, required: true, index: true }, // Added for multi-tenancy
    name: { type: String, required: true },
    active: { type: Boolean, default: false },
    sections: [
      {
        _id: false,
        id: String,
        name: String,
        description: String,
        items: [
          {
            _id: false,
            id: String,
            name: String,
            description: String,
            price: Number,
            image: String, // Image URL for menu item
            dietary: [String],
            serves: Number,
            size: String,
            options: [
              {
                _id: false,
                name: String,
                price: Number,
              },
            ],
            unavailable: { type: Boolean, default: false },
            archived: { type: Boolean, default: false },
          },
        ],
      },
    ],
  },
  { timestamps: false }
)

// Employee Schema
const EmployeeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    barId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    role: String,
    roles: [String],
    permissions: [String],
    hireDate: String,
    status: { type: String, default: 'active' },
    hourlyRate: { type: Number, default: 0 },
    address: mongoose.Schema.Types.Mixed,
    emergencyContact: mongoose.Schema.Types.Mixed,
    notes: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

// Role Schema
const RoleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    barId: { type: String, required: true, index: true }, // Added for multi-tenancy
    name: { type: String, required: true },
    description: String,
    permissions: [String],
    defaultHourlyRate: { type: Number, default: 0 },
    color: { type: String, default: '#6B7280' },
  },
  { timestamps: false }
)

// Shift Schema
const ShiftSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    barId: { type: String, required: true },
    employeeId: { type: String, required: true },
    employeeName: String,
    role: String,
    location: { type: String, default: 'serving' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    breakDuration: { type: Number, default: 0 },
    status: { type: String, default: 'scheduled' },
    notes: String,
    createdAt: { type: Date, default: Date.now },
    createdBy: String,
  },
  { timestamps: false }
)

// Time Entry Schema
const TimeEntrySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    barId: { type: String, required: true },
    employeeId: { type: String, required: true },
    employeeName: String,
    shiftId: String,
    clockIn: { type: Date, required: true },
    clockOut: Date,
    breakStart: Date,
    breakEnd: Date,
    breakDuration: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
    regularHours: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
    notes: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

// Shift Request Schema
const ShiftRequestSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    barId: { type: String, required: true },
    employeeId: { type: String, required: true },
    employeeName: String,
    type: { type: String, enum: ['time_off', 'shift_swap'], required: true },
    startDate: String,
    endDate: String,
    shiftId: String,
    targetEmployeeId: String,
    targetEmployeeName: String,
    reason: String,
    status: { type: String, default: 'pending' },
    requestedAt: { type: Date, default: Date.now },
    reviewedBy: String,
    reviewedAt: Date,
    notes: String,
  },
  { timestamps: false }
)

// Activity Log Schema
const ActivityLogSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    barId: { type: String, required: true, index: true }, // Added for multi-tenancy
    type: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['SUCCESS', 'FAILED'], required: true },
    metadata: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

// Social Account Schema
const SocialAccountSchema = new mongoose.Schema(
  {
    accountId: { type: String, required: true },
    barId: { type: String, required: true },
    platform: { type: String, enum: ['facebook', 'instagram'], required: true },
    name: { type: String, required: true },
    username: String,
    accessToken: { type: String, required: true },
    refreshToken: String,
    tokenExpiresAt: Date,
    pageId: String,
    instagramBusinessAccountId: String,
    connectedAt: { type: Date, default: Date.now },
    lastRefreshedAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: false }
)

// Social Post Schema
const SocialPostSchema = new mongoose.Schema(
  {
    postId: { type: String, required: true, unique: true },
    barId: { type: String, required: true },
    adminId: { type: String, required: true },
    adminName: { type: String, default: 'Admin' },
    platform: { type: String, enum: ['facebook', 'instagram'], required: true },
    accountId: { type: String, required: true },
    accountName: String,
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'failed'],
      default: 'draft',
    },
    contentType: { type: String, enum: ['photo', 'carousel', 'text'], default: 'text' },
    caption: String,
    mediaUrls: [String],
    scheduledFor: Date,
    campaignId: String,
    publishedAt: Date,
    publishedPostId: String,
    publishResponse: mongoose.Schema.Types.Mixed,
    error: String,
    errorDetails: mongoose.Schema.Types.Mixed,
    // Analytics insights data (cached from Facebook/Instagram Graph API)
    insights: {
      reach: { type: Number, default: 0 },
      impressions: { type: Number, default: 0 },
      engagement: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
    },
    insightsFetchedAt: Date, // Timestamp of when insights were last fetched
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

// Social Campaign Schema
const SocialCampaignSchema = new mongoose.Schema(
  {
    campaignId: { type: String, required: true, unique: true },
    barId: { type: String, required: true },
    adminId: { type: String, required: true },
    adminName: { type: String, default: 'Admin' },
    name: { type: String, required: true },
    platform: { type: String, enum: ['facebook', 'instagram'], required: true },
    accountId: { type: String, required: true },
    accountName: String,
    status: {
      type: String,
      enum: ['active', 'paused', 'completed'],
      default: 'active',
    },
    postCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

// App Settings Schema - for storing app-level configuration like API keys
const AppSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true }, // Removed unique: true because it should be unique per barId
    barId: { type: String, required: true, index: true }, // Added for multi-tenancy
    value: mongoose.Schema.Types.Mixed,
    description: String,
    category: { type: String, default: 'general' }, // 'social', 'payment', 'email', etc.
    encrypted: { type: Boolean, default: false }, // For sensitive data
    updatedAt: { type: Date, default: Date.now },
    updatedBy: String,
  },
  { timestamps: false }
)
// Compound index for unique keys per bar
AppSettingsSchema.index({ barId: 1, key: 1 }, { unique: true })

// Event Schema - for restaurant events
const EventSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    barId: { type: String, required: true, index: true }, // Added for multi-tenancy
    title: { type: String, required: true },
    date: { type: String, required: true }, // ISO date string
    time: { type: String, required: true },
    description: { type: String, required: true },
    image: String,
    featured: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

// Gallery Image Schema
const GalleryImageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    barId: { type: String, required: true, index: true }, // Added for multi-tenancy
    url: { type: String, required: true },
    alt: String,
    caption: String,
    category: String, // e.g., 'food', 'drinks', 'ambiance', 'events'
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 }, // For sorting
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

// Announcement Schema
const AnnouncementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    barId: { type: String, required: true, index: true }, // Added for multi-tenancy
    title: { type: String, required: true },
    message: { type: String, required: true },
    startDate: { type: String, required: true }, // ISO date string
    endDate: { type: String, required: true }, // ISO date string
    type: { type: String, enum: ['info', 'warning', 'success', 'error'], default: 'info' }, // For styling
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

// Create indexes for common queries
OrderSchema.index({ barId: 1, status: 1 })
OrderSchema.index({ createdAt: -1 })
ReservationSchema.index({ date: 1, time: 1 })
ReservationSchema.index({ status: 1 })
// GiftCardSchema.index({ code: 1 }) // Removed - duplicate index, 'unique: true' already creates an index
GiftCardSchema.index({ status: 1 })
MenuSchema.index({ active: 1 })
SocialPostSchema.index({ barId: 1, status: 1 })
SocialPostSchema.index({ scheduledFor: 1 })
SocialAccountSchema.index({ barId: 1, platform: 1 })
AppSettingsSchema.index({ category: 1 })
// AppSettingsSchema.index({ key: 1 }) // Removed - duplicate index, 'unique: true' already creates an index
EventSchema.index({ date: 1 })
EventSchema.index({ featured: 1 })
GalleryImageSchema.index({ category: 1 })
GalleryImageSchema.index({ featured: 1 })
GalleryImageSchema.index({ order: 1 })
AnnouncementSchema.index({ startDate: 1, endDate: 1 })
AnnouncementSchema.index({ active: 1 })

// Export models (using getModel to avoid recompilation issues)
export function getOrderModel() {
  return mongoose.models.Order || mongoose.model('Order', OrderSchema)
}

export function getReservationModel() {
  return mongoose.models.Reservation || mongoose.model('Reservation', ReservationSchema)
}

export function getGiftCardModel() {
  return mongoose.models.GiftCard || mongoose.model('GiftCard', GiftCardSchema)
}

export function getMenuModel() {
  return mongoose.models.Menu || mongoose.model('Menu', MenuSchema)
}

export function getEmployeeModel() {
  return mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema)
}

export function getRoleModel() {
  return mongoose.models.Role || mongoose.model('Role', RoleSchema)
}

export function getShiftModel() {
  return mongoose.models.Shift || mongoose.model('Shift', ShiftSchema)
}

export function getTimeEntryModel() {
  return mongoose.models.TimeEntry || mongoose.model('TimeEntry', TimeEntrySchema)
}

export function getShiftRequestModel() {
  return mongoose.models.ShiftRequest || mongoose.model('ShiftRequest', ShiftRequestSchema)
}

export function getActivityLogModel() {
  return mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema)
}

export function getSocialAccountModel() {
  return mongoose.models.SocialAccount || mongoose.model('SocialAccount', SocialAccountSchema)
}

export function getSocialPostModel() {
  return mongoose.models.SocialPost || mongoose.model('SocialPost', SocialPostSchema)
}

export function getSocialCampaignModel() {
  return mongoose.models.SocialCampaign || mongoose.model('SocialCampaign', SocialCampaignSchema)
}

export function getAppSettingsModel() {
  return mongoose.models.AppSettings || mongoose.model('AppSettings', AppSettingsSchema)
}

export function getEventModel() {
  return mongoose.models.Event || mongoose.model('Event', EventSchema)
}

export function getGalleryImageModel() {
  return mongoose.models.GalleryImage || mongoose.model('GalleryImage', GalleryImageSchema)
}

export function getAnnouncementModel() {
  return mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema)
}

// Restaurant (Tenant) Schema
const RestaurantSchema = new mongoose.Schema(
  {
    barId: { type: String, required: true, unique: true, index: true }, // Tenant Identifier (e.g., 'bar_1')
    name: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true }, // URL-friendly identifier
    subdomain: { type: String }, // Computed: {slug}.digiserve.com
    domain: { type: String, unique: true, sparse: true }, // Primary custom domain (deprecated - use customDomains)
    customDomains: [{ type: String }], // Array of custom domains (e.g., ['www.triobistro.com', 'triobistro.com'])
    // Temporary domain verification metadata (token-based verification)
    domainVerification: {
      token: String,
      createdAt: Date,
      verified: { type: Boolean, default: false },
      verifiedAt: Date,
    },

    // Onboarding tracking
    onboardingCompletedAt: Date,
    sampleDataLoaded: { type: Boolean, default: false },

    // Theme configuration
    theme: {
      templateId: { type: String, default: 'bar' }, // 'bar', 'sushi', 'restaurant'
      primaryColor: { type: String, default: '#8B0000' }, // Deep red
      secondaryColor: { type: String, default: '#F5F5DC' }, // Cream
      logo: String, // URL to logo image
      overrides: { type: Map, of: String }, // Key-value for specific specific overrides
    },

    // Module Configuration
    modules: {
      type: [String],
      default: ['ordering', 'reservations', 'events', 'gallery', 'social'],
    },

    // Ordering Configuration
    ordering: {
      enabled: { type: Boolean, default: true },
      pickup: { type: Boolean, default: true },
      delivery: { type: Boolean, default: true },
      dineIn: { type: Boolean, default: true },
      taxRate: { type: Number, default: 0.13 },
      deliverySettings: {
        baseFee: { type: Number, default: 5.0 },
        freeDeliveryFrom: Number,
        deliveryZones: [
          {
            postal: String,
            fee: Number,
          }
        ]
      }
    },

    // Business Hours
    businessHours: {
      type: Map,
      of: new mongoose.Schema({
        open: String,
        close: String,
        closed: Boolean
      }, { _id: false }),
      default: {}
    },

    // Social Media Links
    social: {
      facebook: String,
      instagram: String,
      twitter: String,
    },

    // Contact Information
    contact: {
      phone: String,
      email: String,
      address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        coordinates: {
          lat: Number,
          lon: Number
        }
      }
    },

    // SEO Settings
    seo: {
      title: String,
      description: String,
      image: String,
    },

    // Feature Flags & Settings
    features: {
      analytics: { type: Boolean, default: true },
      enableEmail: { type: Boolean, default: true },
      enableStripe: { type: Boolean, default: true },
    },

    // Global Settings
    settings: {
      currency: { type: String, default: 'CAD' },
      timezone: { type: String, default: 'America/Toronto' },
      locale: { type: String, default: 'en-CA' },
      theme: { type: String, default: 'default' },
      logo: String,
    },

    // Subscription Info
    subscription: {
      plan: { type: String, default: 'basic' }, // 'basic', 'pro', 'enterprise'
      status: { type: String, default: 'active' }, // 'active', 'past_due', 'canceled'
      expiresAt: Date,
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

// User Schema - for multi-tenant authentication
const UserSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager', 'staff'], default: 'manager' },

    // Multi-tenancy: User can belong to multiple restaurants
    tenantIds: [{ type: String, ref: 'Restaurant' }], // Array of barIds

    // Onboarding tracking
    onboardingStatus: {
      type: String,
      enum: ['pending', 'branding', 'completed'],
      default: 'pending'
    },
    onboardingStep: { type: Number, default: 1, min: 1, max: 2 },
    onboardingCompletedAt: Date,

    // Email verification
    emailVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpires: Date,

    // Activation token for cross-subdomain session setup
    activationToken: String,
    activationTokenExpires: Date,

    // Session/Security
    lastLogin: Date,
    resetToken: String,
    resetTokenExpires: Date,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

// Analytics Event Schema - for web analytics tracking
const AnalyticsEventSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    eventType: { type: String, required: true, default: 'pageview' },
    url: { type: String, required: true },
    referrer: String,
    utm: mongoose.Schema.Types.Mixed, // Store UTM parameters as object
    device: String, // 'desktop', 'tablet', 'mobile'
    country: String,
    fingerprint: { type: String, required: true }, // Anonymized user fingerprint (SHA-256 hash)
    timestamp: { type: Date, default: Date.now, required: true, index: true },
    userAgent: String, // Store for bot detection (not used in fingerprint)
    ipHash: String, // Anonymized IP (last octet removed + hashed)
  },
  { timestamps: false }
)

// Create indexes for analytics queries
// RestaurantSchema.index({ slug: 1 }) // Removed - duplicate index
// RestaurantSchema.index({ barId: 1 }) // Removed - duplicate index
AnalyticsEventSchema.index({ restaurantId: 1, timestamp: -1 })
AnalyticsEventSchema.index({ restaurantId: 1, url: 1 })
AnalyticsEventSchema.index({ restaurantId: 1, fingerprint: 1 })
AnalyticsEventSchema.index({ restaurantId: 1, eventType: 1, timestamp: -1 })
AnalyticsEventSchema.index({ timestamp: -1 })


export function getRestaurantModel() {
  return mongoose.models.Restaurant || mongoose.model('Restaurant', RestaurantSchema)
}

export function getUserModel() {
  return mongoose.models.User || mongoose.model('User', UserSchema)
}

export function getAnalyticsEventModel() {
  return mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', AnalyticsEventSchema)
}

// Domain Schema - for custom domain management
const DomainSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    tenantId: { type: String, required: true, ref: 'Restaurant', index: true },
    domain: { type: String, required: true, unique: true },
    verified: { type: Boolean, default: false },
    sslProvisioned: { type: Boolean, default: false },
    vercelConfigured: { type: Boolean, default: false },
    apexConfigured: { type: Boolean, default: false }, // For apex domain A record
    createdAt: { type: Date, default: Date.now },
    verifiedAt: Date,
    lastCheckedAt: Date,
  },
  { timestamps: false }
)

// Create indexes
// DomainSchema.index({ tenantId: 1 }) // Removed - duplicate index
DomainSchema.index({ verified: 1 })

export function getDomainModel() {
  return mongoose.models.Domain || mongoose.model('Domain', DomainSchema)
}
