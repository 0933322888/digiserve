'use client'

import { useState, useEffect } from 'react'
import {
    BarChart3,
    Users,
    Globe,
    Monitor,
    Tablet,
    Smartphone,
    TrendingUp,
    Eye,
    MousePointerClick,
    ExternalLink,
    Calendar,
    Filter,
} from 'lucide-react'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function WebAnalytics({ barId }) {
    const [analyticsData, setAnalyticsData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState('7d')
    const [customStartDate, setCustomStartDate] = useState('')
    const [customEndDate, setCustomEndDate] = useState('')
    const [deviceFilter, setDeviceFilter] = useState('')
    const [campaignFilter, setCampaignFilter] = useState('')
    const [referrerFilter, setReferrerFilter] = useState('')

    const fetchAnalyticsData = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                restaurantId: barId,
                range: dateRange,
            })

            if (customStartDate && customEndDate) {
                params.set('startDate', customStartDate)
                params.set('endDate', customEndDate)
            }

            if (deviceFilter) params.set('device', deviceFilter)
            if (campaignFilter) params.set('campaign', campaignFilter)
            if (referrerFilter) params.set('referrer', referrerFilter)

            const response = await fetch(`/api/admin/analytics/web?${params.toString()}`)
            const result = await response.json()

            if (result.success) {
                setAnalyticsData(result.data)
            } else {
                console.error('Failed to fetch analytics:', result.error)
            }
        } catch (error) {
            console.error('Error fetching analytics data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (barId) {
            fetchAnalyticsData()
        }
    }, [dateRange, customStartDate, customEndDate, deviceFilter, campaignFilter, referrerFilter, barId])

    const formatNumber = num => {
        if (!num) return '0'
        return new Intl.NumberFormat().format(num)
    }

    const formatDate = dateString => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    if (loading && !analyticsData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-gold mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading analytics data...</p>
                </div>
            </div>
        )
    }

    if (!analyticsData) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No analytics data available. Start tracking by adding the analytics script to your website.
            </div>
        )
    }

    const {
        totalVisits,
        uniqueVisitors,
        topPages,
        referrers,
        deviceStats,
        countryStats,
        timeseries,
        utmStats,
    } = analyticsData

    // Prepare timeseries data for charts
    const visitsChartData = timeseries.map(item => ({
        date: formatDate(item.date),
        visits: item.visits,
        unique: item.unique,
    }))

    const deviceChartData = deviceStats.map(item => ({
        name: item.device.charAt(0).toUpperCase() + item.device.slice(1),
        value: item.count,
    }))

    const topPagesData = topPages.slice(0, 10).map(item => ({
        page: item.url.length > 30 ? item.url.substring(0, 30) + '...' : item.url,
        visits: item.count,
    }))

    const referrersData = referrers.slice(0, 10).map(item => ({
        referrer: item.referrer.replace(/^https?:\/\//, '').replace(/^www\./, ''),
        visits: item.count,
    }))

    const countriesData = countryStats.slice(0, 5).map(item => ({
        country: item.country,
        visits: item.count,
    }))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Web Analytics</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Track pageviews, visitors, and traffic sources for your website
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-5 w-5 text-gray-500" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Filters</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Date Range
                        </label>
                        <select
                            value={dateRange}
                            onChange={e => {
                                setDateRange(e.target.value)
                                if (e.target.value !== 'custom') {
                                    setCustomStartDate('')
                                    setCustomEndDate('')
                                }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>

                    {dateRange === 'custom' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={e => setCustomStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={e => setCustomEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </>
                    )}

                    {/* Device Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Device
                        </label>
                        <select
                            value={deviceFilter}
                            onChange={e => setDeviceFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">All Devices</option>
                            <option value="desktop">Desktop</option>
                            <option value="tablet">Tablet</option>
                            <option value="mobile">Mobile</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Visits</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {formatNumber(totalVisits)}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Unique Visitors
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {formatNumber(uniqueVisitors)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                            <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bounce Rate</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {totalVisits > 0
                                    ? (((totalVisits - uniqueVisitors) / totalVisits) * 100).toFixed(1)
                                    : '0'}
                                %
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. per Visitor</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {uniqueVisitors > 0
                                    ? (totalVisits / uniqueVisitors).toFixed(2)
                                    : '0'}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pageviews Over Time */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Pageviews Over Time
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={visitsChartData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                            <XAxis dataKey="date" className="text-gray-600 dark:text-gray-400" />
                            <YAxis className="text-gray-600 dark:text-gray-400" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--bg-color, #fff)',
                                    border: '1px solid var(--border-color, #e5e7eb)',
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="visits"
                                stroke="#0088FE"
                                strokeWidth={2}
                                name="Pageviews"
                            />
                            <Line
                                type="monotone"
                                dataKey="unique"
                                stroke="#00C49F"
                                strokeWidth={2}
                                name="Unique Visitors"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Device Breakdown */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Devices
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={deviceChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {deviceChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Pages and Referrers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pages */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Pages</h3>
                    <div className="space-y-3">
                        {topPagesData.length > 0 ? (
                            topPagesData.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                                            {index + 1}
                                        </span>
                                        <span className="text-sm text-gray-900 dark:text-white truncate">
                                            {item.page || '/'}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {formatNumber(item.visits)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No page data</p>
                        )}
                    </div>
                </div>

                {/* Top Referrers */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Referrers</h3>
                    <div className="space-y-3">
                        {referrersData.length > 0 ? (
                            referrersData.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-900 dark:text-white truncate">
                                            {item.referrer}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {formatNumber(item.visits)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No referrer data</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Countries and UTM Campaigns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Countries */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Countries</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={countriesData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                            <XAxis dataKey="country" className="text-gray-600 dark:text-gray-400" />
                            <YAxis className="text-gray-600 dark:text-gray-400" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--bg-color, #fff)',
                                    border: '1px solid var(--border-color, #e5e7eb)',
                                }}
                            />
                            <Bar dataKey="visits" fill="#0088FE" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* UTM Campaigns */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">UTM Campaigns</h3>
                    <div className="space-y-3">
                        {utmStats && utmStats.length > 0 ? (
                            utmStats.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-900 dark:text-white truncate">
                                            {item.campaign}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {formatNumber(item.count)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No UTM campaign data</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
