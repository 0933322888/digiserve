import { MongoDatabase } from './mongodb-adapter.js'

const config = {
  menus: {},
  employees: {},
  roles: {},
  shifts: {},
  timeEntries: {},
  shiftRequests: {},
  activityLog: {},
  reservations: {},
  orders: {},
  giftCards: {},
  socialAccounts: {},
  socialPosts: {},
  socialCampaigns: {},
  appSettings: {},
  events: {},
  gallery: {},
  announcements: {},
}

// Singleton instance - using MongoDB
export const db = new MongoDatabase(config)
