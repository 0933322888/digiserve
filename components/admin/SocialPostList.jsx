'use client'

import { useState } from 'react'
import {
  Calendar,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function SocialPostList({ posts, barId, onPostUpdated, onPostDeleted }) {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPlatform, setFilterPlatform] = useState('all')

  const filteredPosts = posts.filter(post => {
    if (filterStatus !== 'all' && post.status !== filterStatus) return false
    if (filterPlatform !== 'all' && post.platform !== filterPlatform) return false
    return true
  })

  const getStatusBadge = status => {
    const badges = {
      draft: {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-200',
        icon: Edit,
      },
      scheduled: {
        bg: 'bg-blue-100 dark:bg-blue-900',
        text: 'text-blue-800 dark:text-blue-200',
        icon: Clock,
      },
      published: {
        bg: 'bg-green-100 dark:bg-green-900',
        text: 'text-green-800 dark:text-green-200',
        icon: CheckCircle,
      },
      failed: {
        bg: 'bg-red-100 dark:bg-red-900',
        text: 'text-red-800 dark:text-red-200',
        icon: XCircle,
      },
    }
    const badge = badges[status] || badges.draft
    const Icon = badge.icon
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatDate = dateString => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Post History</h3>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={filterPlatform}
              onChange={e => setFilterPlatform(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All Platforms</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredPosts.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">No posts found</div>
        ) : (
          filteredPosts.map(post => (
            <div key={post.postId} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {post.platform === 'facebook' ? '📘 Facebook' : '📷 Instagram'}
                    </span>
                    {getStatusBadge(post.status)}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {post.accountName}
                    </span>
                  </div>

                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="flex gap-2 mb-2">
                      {post.mediaUrls.slice(0, 3).map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Post media ${index + 1}`}
                          className="w-16 h-16 object-cover rounded border border-gray-300 dark:border-gray-600"
                        />
                      ))}
                      {post.mediaUrls.length > 3 && (
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{post.mediaUrls.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {post.caption && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                      {post.caption}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Created: {formatDate(post.createdAt)}</span>
                    {post.scheduledFor && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Scheduled: {formatDate(post.scheduledFor)}
                      </span>
                    )}
                    {post.publishedAt && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Published: {formatDate(post.publishedAt)}
                      </span>
                    )}
                    {post.error && (
                      <span className="text-red-600 dark:text-red-400">Error: {post.error}</span>
                    )}
                  </div>
                </div>

                {post.status !== 'published' && (
                  <div className="flex gap-2 ml-4">
                    {post.status === 'draft' && (
                      <button
                        onClick={async () => {
                          if (confirm('Publish this post now?')) {
                            try {
                              const response = await fetch(
                                `/api/admin/social-posting/posts/${post.postId}/publish`,
                                {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ barId }),
                                }
                              )
                              const data = await response.json()
                              if (data.success) {
                                toast.success('Post published!')
                                if (onPostUpdated) onPostUpdated()
                              } else {
                                toast.error('Failed: ' + (data.error || 'Unknown error'))
                              }
                            } catch (error) {
                              toast.error('Failed to publish: ' + error.message)
                            }
                          }
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                        title="Publish now"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    {post.status === 'draft' && (
                      <button
                        onClick={async () => {
                          if (confirm('Delete this draft?')) {
                            try {
                              const response = await fetch(
                                `/api/admin/social-posting/posts/${post.postId}?barId=${barId}`,
                                { method: 'DELETE' }
                              )
                              const data = await response.json()
                              if (data.success) {
                                toast.success('Post deleted successfully')
                                if (onPostDeleted) onPostDeleted()
                              } else {
                                toast.error('Failed: ' + (data.error || 'Unknown error'))
                              }
                            } catch (error) {
                              toast.error('Failed to delete: ' + error.message)
                            }
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
