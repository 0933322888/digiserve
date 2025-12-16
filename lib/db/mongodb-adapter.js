import connectDB from './mongodb-connection.js'
import {
  getOrderModel,
  getReservationModel,
  getGiftCardModel,
  getMenuModel,
  getEmployeeModel,
  getRoleModel,
  getShiftModel,
  getTimeEntryModel,
  getShiftRequestModel,
  getActivityLogModel,
  getSocialAccountModel,
  getSocialPostModel,
  getSocialCampaignModel,
  getAppSettingsModel,
  getEventModel,
  getGalleryImageModel,
  getAnnouncementModel,
  getUserModel,
  getRestaurantModel,
  getFloorPlanModel,
} from './models.js'

// Map collection names to model getters
const modelMap = {
  orders: getOrderModel,
  reservations: getReservationModel,
  giftCards: getGiftCardModel,
  menus: getMenuModel,
  employees: getEmployeeModel,
  roles: getRoleModel,
  shifts: getShiftModel,
  timeEntries: getTimeEntryModel,
  shiftRequests: getShiftRequestModel,
  activityLog: getActivityLogModel,
  socialAccounts: getSocialAccountModel,
  socialPosts: getSocialPostModel,
  socialCampaigns: getSocialCampaignModel,
  appSettings: getAppSettingsModel,
  events: getEventModel,
  gallery: getGalleryImageModel,
  announcements: getAnnouncementModel,
  users: getUserModel,
  restaurants: getRestaurantModel,
  floorPlans: getFloorPlanModel,
}

/**
 * MongoDB collection adapter that mimics the JSON adapter API
 */
class MongoCollection {
  constructor(modelGetter) {
    this.modelGetter = modelGetter
  }

  async _getModel() {
    await connectDB()
    return this.modelGetter()
  }

  async find(query = {}) {
    const Model = await this._getModel()
    const results = await Model.find(query).lean()
    // Convert MongoDB _id to string and ensure id field exists
    return results.map(doc => {
      const { _id, ...rest } = doc
      return { ...rest, _id: _id?.toString() }
    })
  }

  async findOne(query = {}) {
    const Model = await this._getModel()
    const doc = await Model.findOne(query).lean()
    if (!doc) return null
    const { _id, ...rest } = doc
    return { ...rest, _id: _id?.toString() }
  }

  async insertOne(doc) {
    const Model = await this._getModel()
    // Convert date strings to Date objects if needed
    const processedDoc = this._processDates(doc)
    const result = await Model.create(processedDoc)
    return { insertedId: result.id || result._id?.toString(), acknowledged: true }
  }

  async updateOne(query, update) {
    const Model = await this._getModel()

    // Handle $set operator if present, otherwise assume direct update
    const updates = update.$set || update

    // Process dates in updates
    const processedUpdates = this._processDates(updates)

    // For direct updates, only update the fields provided (don't merge entire document)
    // This prevents issues with date fields and schema validations
    if (!update.$set) {
      // Check if document exists
      const existing = await Model.findOne(query).lean()
      if (!existing) {
        return { matchedCount: 0, modifiedCount: 0 }
      }

      // Only update the fields that are in processedUpdates
      // Remove any undefined or null values that might cause issues
      const cleanUpdates = {}
      for (const [key, value] of Object.entries(processedUpdates)) {
        // Skip _id and only include fields that are actually being updated
        if (key !== '_id' && value !== undefined) {
          cleanUpdates[key] = value
        }
      }

      const result = await Model.updateOne(query, { $set: cleanUpdates })
      return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount }
    } else {
      // Clean $set updates as well
      const cleanUpdates = {}
      for (const [key, value] of Object.entries(processedUpdates)) {
        if (key !== '_id' && value !== undefined) {
          cleanUpdates[key] = value
        }
      }
      const result = await Model.updateOne(query, { $set: cleanUpdates })
      return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount }
    }
  }

  async deleteOne(query) {
    const Model = await this._getModel()
    const result = await Model.deleteOne(query)
    return { deletedCount: result.deletedCount }
  }

  async updateMany(query, update) {
    const Model = await this._getModel()

    // Handle $set operator if present, otherwise assume direct update
    const updates = update.$set || update

    // Process dates in updates
    const processedUpdates = this._processDates(updates)

    // Clean updates
    const cleanUpdates = {}
    for (const [key, value] of Object.entries(processedUpdates)) {
      if (key !== '_id' && value !== undefined) {
        cleanUpdates[key] = value
      }
    }

    const result = await Model.updateMany(query, { $set: cleanUpdates })
    return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount }
  }

  async replaceMany(filter, items) {
    const Model = await this._getModel()

    // Safety check: Ensure filter is provided and not empty
    if (!filter || Object.keys(filter).length === 0) {
      throw new Error('replaceMany requires a non-empty filter to prevent accidental data loss')
    }

    // Clear collection matching the filter and insert all items
    await Model.deleteMany(filter)
    if (items.length > 0) {
      const processedItems = items.map(item => this._processDates(item))
      await Model.insertMany(processedItems)
    }
  }

  /**
   * Convert date strings to Date objects for fields that should be dates
   */
  _processDates(obj) {
    if (!obj || typeof obj !== 'object') return obj

    const dateFields = [
      'createdAt',
      'updatedAt',
      'pickupTime',
      'dineInTime',
      'confirmedAt',
      'completedAt',
      'cancelledAt',
      'startTime',
      'endTime',
      'clockIn',
      'clockOut',
      'breakStart',
      'breakEnd',
      'requestedAt',
      'reviewedAt',
      'timestamp',
      'scheduledFor',
      'publishedAt',
      'connectedAt',
      'lastRefreshedAt',
      'tokenExpiresAt',
      'expiresAt',
      'lastRedemptionAt',
      'hireDate',
    ]

    const processed = Array.isArray(obj) ? [...obj] : { ...obj }

    for (const key in processed) {
      if (dateFields.includes(key) && typeof processed[key] === 'string') {
        processed[key] = new Date(processed[key])
      } else if (typeof processed[key] === 'object' && processed[key] !== null) {
        if (Array.isArray(processed[key])) {
          processed[key] = processed[key].map(item =>
            typeof item === 'object' && item !== null ? this._processDates(item) : item
          )
        } else {
          processed[key] = this._processDates(processed[key])
        }
      }
    }

    return processed
  }
}

export class MongoDatabase {
  constructor(config) {
    this.config = config
    this.collections = {}
  }

  collection(name) {
    if (!this.collections[name]) {
      const modelGetter = modelMap[name]
      if (!modelGetter) {
        throw new Error(`Collection ${name} not found in model map`)
      }
      this.collections[name] = new MongoCollection(modelGetter)
    }
    return this.collections[name]
  }
}

