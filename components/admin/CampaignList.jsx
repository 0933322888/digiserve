'use client'

import { useState } from 'react'
import { Trash2, Play, Pause, Edit } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function CampaignList({ campaigns, barId, onCampaignUpdated, onCampaignDeleted }) {
  const [expandedCampaign, setExpandedCampaign] = useState(null)

  const getStatusBadge = status => {
    const badges = {
      active: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      paused: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      completed: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    }
    return (
      <span
        className={`text-xs px-2 py-1 rounded-full font-medium ${badges[status] || badges.active}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const handleToggleStatus = async (campaignId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    try {
      const response = await fetch(`/api/admin/social-posting/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barId,
          status: newStatus,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Campaign status updated successfully')
        if (onCampaignUpdated) onCampaignUpdated()
      } else {
        toast.error('Failed to update campaign: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Status update error:', error)
      toast.error('Failed to update campaign: ' + error.message)
    }
  }

  const handleDelete = async campaignId => {
    if (!confirm('Are you sure you want to delete this campaign?')) {
      return
    }

    try {
      const response = await fetch(
        `/api/admin/social-posting/campaigns/${campaignId}?barId=${barId}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()
      if (data.success) {
        toast.success('Campaign deleted successfully')
        if (onCampaignDeleted) onCampaignDeleted()
      } else {
        toast.error('Failed to delete campaign: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete campaign: ' + error.message)
    }
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No campaigns found. Create your first campaign above.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {campaigns.map(campaign => (
        <div
          key={campaign.campaignId}
          className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{campaign.name}</h3>
                  {getStatusBadge(campaign.status)}
                  <span className="text-sm px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {campaign.platform.charAt(0).toUpperCase() + campaign.platform.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Account:</span> {campaign.accountName}
                  </div>
                  <div>
                    <span className="font-medium">Posts:</span> {campaign.postCount || 0}
                  </div>
                </div>

                {expandedCampaign === campaign.campaignId && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Created:
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                          {formatDate(campaign.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleToggleStatus(campaign.campaignId, campaign.status)}
                  className={`p-2 rounded transition-colors ${
                    campaign.status === 'active'
                      ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                      : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                  title={campaign.status === 'active' ? 'Pause Campaign' : 'Activate Campaign'}
                >
                  {campaign.status === 'active' ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(campaign.campaignId)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="Delete Campaign"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setExpandedCampaign(
                      expandedCampaign === campaign.campaignId ? null : campaign.campaignId
                    )
                  }
                  className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
