import mongoose from 'mongoose'
import connectDB from './db/mongodb-connection.js'
import { getAnalyticsEventModel, getRestaurantModel } from './db/models.js'

/**
 * Convert restaurantId to ObjectId
 */
function toObjectId(id) {
  if (id instanceof mongoose.Types.ObjectId) return id
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id)
  }
  return id
}

/**
 * Analytics Service
 * Provides aggregation pipeline functions for analytics queries
 */

/**
 * Get total visits (pageviews) for a restaurant within a date range
 * @param {string|ObjectId} restaurantId - Restaurant ObjectId or string
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<number>} Total pageview count
 */
export async function getTotalVisits(restaurantId, startDate, endDate) {
  await connectDB()
  const AnalyticsEvent = getAnalyticsEventModel()

  const result = await AnalyticsEvent.aggregate([
    {
      $match: {
        restaurantId: toObjectId(restaurantId),
        eventType: 'pageview',
        timestamp: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $count: 'total',
    },
  ])

  return result.length > 0 ? result[0].total : 0
}

/**
 * Get unique visitors count for a restaurant within a date range
 * @param {string|ObjectId} restaurantId - Restaurant ObjectId or string
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<number>} Unique visitors count
 */
export async function getUniqueVisitors(restaurantId, startDate, endDate) {
  await connectDB()
  const AnalyticsEvent = getAnalyticsEventModel()

  const restaurantObjectId = toObjectId(restaurantId)

  const result = await AnalyticsEvent.aggregate([
    {
      $match: {
        restaurantId: restaurantObjectId,
        eventType: 'pageview',
        timestamp: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$fingerprint',
      },
    },
    {
      $count: 'unique',
    },
  ])

  return result.length > 0 ? result[0].unique : 0
}

/**
 * Get top pages by pageview count
 * @param {string|ObjectId} restaurantId - Restaurant ObjectId or string
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {number} limit - Number of results to return (default: 10)
 * @returns {Promise<Array>} Array of { url, count } objects
 */
export async function getTopPages(restaurantId, startDate, endDate, limit = 10) {
  await connectDB()
  const AnalyticsEvent = getAnalyticsEventModel()

  const result = await AnalyticsEvent.aggregate([
    {
      $match: {
        restaurantId: toObjectId(restaurantId),
        eventType: 'pageview',
        timestamp: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$url',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: limit,
    },
    {
      $project: {
        url: '$_id',
        count: 1,
        _id: 0,
      },
    },
  ])

  return result
}

/**
 * Get top referrers
 * @param {string|ObjectId} restaurantId - Restaurant ObjectId or string
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {number} limit - Number of results to return (default: 10)
 * @returns {Promise<Array>} Array of { referrer, count } objects
 */
export async function getReferrers(restaurantId, startDate, endDate, limit = 10) {
  await connectDB()
  const AnalyticsEvent = getAnalyticsEventModel()

  const result = await AnalyticsEvent.aggregate([
    {
      $match: {
        restaurantId: toObjectId(restaurantId),
        eventType: 'pageview',
        timestamp: { $gte: startDate, $lte: endDate },
        referrer: { $exists: true, $ne: null, $ne: '' },
      },
    },
    {
      $group: {
        _id: '$referrer',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: limit,
    },
    {
      $project: {
        referrer: '$_id',
        count: 1,
        _id: 0,
      },
    },
  ])

  return result
}

/**
 * Get device statistics
 * @param {string|ObjectId} restaurantId - Restaurant ObjectId or string
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Array of { device, count } objects
 */
export async function getDeviceStats(restaurantId, startDate, endDate) {
  await connectDB()
  const AnalyticsEvent = getAnalyticsEventModel()

  const result = await AnalyticsEvent.aggregate([
    {
      $match: {
        restaurantId: toObjectId(restaurantId),
        eventType: 'pageview',
        timestamp: { $gte: startDate, $lte: endDate },
        device: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: '$device',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $project: {
        device: '$_id',
        count: 1,
        _id: 0,
      },
    },
  ])

  return result
}

/**
 * Get country statistics
 * @param {string|ObjectId} restaurantId - Restaurant ObjectId or string
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {number} limit - Number of results to return (default: 10)
 * @returns {Promise<Array>} Array of { country, count } objects
 */
export async function getCountryStats(restaurantId, startDate, endDate, limit = 10) {
  await connectDB()
  const AnalyticsEvent = getAnalyticsEventModel()

  const result = await AnalyticsEvent.aggregate([
    {
      $match: {
        restaurantId: toObjectId(restaurantId),
        eventType: 'pageview',
        timestamp: { $gte: startDate, $lte: endDate },
        country: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: '$country',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: limit,
    },
    {
      $project: {
        country: '$_id',
        count: 1,
        _id: 0,
      },
    },
  ])

  return result
}

/**
 * Get timeseries data (pageviews over time)
 * @param {string|ObjectId} restaurantId - Restaurant ObjectId or string
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} groupBy - Grouping interval: 'hour', 'day', 'week', 'month' (default: 'day')
 * @returns {Promise<Array>} Array of { date, visits, unique } objects
 */
export async function getTimeseries(restaurantId, startDate, endDate, groupBy = 'day') {
  await connectDB()
  const AnalyticsEvent = getAnalyticsEventModel()

  // Define date grouping format based on interval
  let dateFormat
  switch (groupBy) {
    case 'hour':
      dateFormat = {
        year: { $year: '$timestamp' },
        month: { $month: '$timestamp' },
        day: { $dayOfMonth: '$timestamp' },
        hour: { $hour: '$timestamp' },
      }
      break
    case 'day':
      dateFormat = {
        year: { $year: '$timestamp' },
        month: { $month: '$timestamp' },
        day: { $dayOfMonth: '$timestamp' },
      }
      break
    case 'week':
      dateFormat = {
        year: { $year: '$timestamp' },
        week: { $week: '$timestamp' },
      }
      break
    case 'month':
      dateFormat = {
        year: { $year: '$timestamp' },
        month: { $month: '$timestamp' },
      }
      break
    default:
      dateFormat = {
        year: { $year: '$timestamp' },
        month: { $month: '$timestamp' },
        day: { $dayOfMonth: '$timestamp' },
      }
  }

  const pipeline = [
    {
      $match: {
        restaurantId: toObjectId(restaurantId),
        eventType: 'pageview',
        timestamp: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: dateFormat,
        visits: { $sum: 1 },
        uniqueVisitors: { $addToSet: '$fingerprint' },
      },
    },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: { $ifNull: ['$_id.month', 1] },
            day: { $ifNull: ['$_id.day', 1] },
            hour: { $ifNull: ['$_id.hour', 0] },
          },
        },
        visits: 1,
        unique: { $size: '$uniqueVisitors' },
      },
    },
    {
      $sort: { date: 1 },
    },
  ]

  const result = await AnalyticsEvent.aggregate(pipeline)

  return result.map(item => ({
    date: item.date,
    visits: item.visits,
    unique: item.unique,
  }))
}

/**
 * Get unique visitors timeseries
 * @param {string|ObjectId} restaurantId - Restaurant ObjectId or string
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} groupBy - Grouping interval: 'hour', 'day', 'week', 'month' (default: 'day')
 * @returns {Promise<Array>} Array of { date, unique } objects
 */
export async function getUniqueVisitorsTimeseries(restaurantId, startDate, endDate, groupBy = 'day') {
  const timeseries = await getTimeseries(restaurantId, startDate, endDate, groupBy)
  return timeseries.map(item => ({
    date: item.date,
    unique: item.unique,
  }))
}

/**
 * Get UTM campaign statistics
 * @param {string|ObjectId} restaurantId - Restaurant ObjectId or string
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {number} limit - Number of results to return (default: 10)
 * @returns {Promise<Array>} Array of { campaign, count } objects
 */
export async function getUTMStats(restaurantId, startDate, endDate, limit = 10) {
  await connectDB()
  const AnalyticsEvent = getAnalyticsEventModel()

  const result = await AnalyticsEvent.aggregate([
    {
      $match: {
        restaurantId: toObjectId(restaurantId),
        eventType: 'pageview',
        timestamp: { $gte: startDate, $lte: endDate },
        'utm.campaign': { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: '$utm.campaign',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: limit,
    },
    {
      $project: {
        campaign: '$_id',
        count: 1,
        _id: 0,
      },
    },
  ])

  return result
}

/**
 * Get restaurant by ID or slug
 * @param {string} identifier - Restaurant ID, ObjectId, or slug
 * @returns {Promise<Object|null>} Restaurant document or null
 */
export async function getRestaurant(identifier) {
  await connectDB()
  const Restaurant = getRestaurantModel()

  // Try to find by ObjectId first
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    const byId = await Restaurant.findById(identifier)
    if (byId) return byId
  }

  // Try by slug
  const bySlug = await Restaurant.findOne({ slug: identifier })
  if (bySlug) return bySlug

  // Try by barId (backward compatibility)
  const byBarId = await Restaurant.findOne({ barId: identifier })
  if (byBarId) return byBarId

  return null
}

/**
 * Check if analytics is enabled for a restaurant
 * @param {string|ObjectId} restaurantId - Restaurant ObjectId or string
 * @returns {Promise<boolean>} True if analytics is enabled
 */
export async function isAnalyticsEnabled(restaurantId) {
  const restaurant = await getRestaurant(restaurantId)
  if (!restaurant) return false
  return restaurant.features?.analytics !== false // Default to true
}

