'use client'

import { useState, useEffect } from 'react'
import { Image, X, Sparkles, Calendar, Send, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SocialPostForm({ accounts, barId, adminId, adminName, onPostCreated }) {
  const [platform, setPlatform] = useState('facebook')
  const [accountId, setAccountId] = useState('')
  const [caption, setCaption] = useState('')
  const [mediaUrls, setMediaUrls] = useState([])
  const [contentType, setContentType] = useState('photo')
  const [scheduledFor, setScheduledFor] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false)
  const [generatedCaptions, setGeneratedCaptions] = useState([])
  const [showCaptionSuggestions, setShowCaptionSuggestions] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)

  const filteredAccounts = accounts.filter(acc => acc.platform === platform)

  // Pre-select the first account when accounts are available or platform changes
  useEffect(() => {
    const accountsForPlatform = accounts.filter(acc => acc.platform === platform)
    const currentAccount = accounts.find(acc => acc.accountId === accountId)
    
    // If no account selected or current account doesn't match platform, select first available
    if (!accountId || (currentAccount && currentAccount.platform !== platform)) {
      if (accountsForPlatform.length > 0) {
        setAccountId(accountsForPlatform[0].accountId)
      } else {
        setAccountId('')
      }
    } else if (!currentAccount && accountsForPlatform.length > 0) {
      // Account not found, select first available
      setAccountId(accountsForPlatform[0].accountId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, accounts])

  const handleImageUpload = async e => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploadingImages(true)
    try {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))

      const response = await fetch('/api/admin/social-posting/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setMediaUrls([...mediaUrls, ...data.urls])
        if (data.urls.length > 1) {
          setContentType('carousel')
        }
      } else {
        toast.error('Failed to upload images: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload images')
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = index => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index))
    if (mediaUrls.length === 2) {
      setContentType('photo')
    }
  }

  const generateCaptions = async () => {
    if (!caption.trim() && mediaUrls.length === 0) {
      toast.error('Please add a caption or images first')
      return
    }

    setIsGeneratingCaptions(true)
    try {
      const prompt = caption || 'Create engaging social media captions for a restaurant/bar post'

      const response = await fetch('/api/admin/social-posting/generate-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          platform,
          barId,
        }),
      })

      const data = await response.json()

      if (data.success && data.captions) {
        setGeneratedCaptions(data.captions)
        setShowCaptionSuggestions(true)
      } else {
        toast.error('Failed to generate captions: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Generate captions error:', error)
      toast.error('Failed to generate captions')
    } finally {
      setIsGeneratingCaptions(false)
    }
  }

  const useCaption = selectedCaption => {
    setCaption(selectedCaption)
    setShowCaptionSuggestions(false)
  }

  const handlePublish = async () => {
    if (!accountId) {
      toast.error('Please select an account')
      return
    }

    if (!caption && mediaUrls.length === 0) {
      toast.error('Please add a caption or at least one image')
      return
    }

    setIsPublishing(true)
    try {
      // First create the post
      const createResponse = await fetch('/api/admin/social-posting/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barId,
          adminId,
          adminName,
          platform,
          accountId,
          accountName: accounts.find(a => a.accountId === accountId)?.name || '',
          contentType: mediaUrls.length > 1 ? 'carousel' : (mediaUrls.length === 1 ? 'photo' : 'text'),
          caption,
          mediaUrls,
        }),
      })

      const createData = await createResponse.json()

      if (!createData.success) {
        throw new Error(createData.error || 'Failed to create post')
      }

      // Then publish it
      const publishResponse = await fetch(
        `/api/admin/social-posting/posts/${createData.post.postId}/publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barId }),
        }
      )

      const publishData = await publishResponse.json()

      if (publishData.success) {
        toast.success('Post published successfully!')
        // Reset form (but keep account selected for convenience)
        setCaption('')
        setMediaUrls([])
        setScheduledFor('')
        // Don't reset accountId - keep the selected account
        if (onPostCreated) onPostCreated()
      } else {
        throw new Error(publishData.error || 'Failed to publish post')
      }
    } catch (error) {
      console.error('Publish error:', error)
      toast.error('Failed to publish: ' + error.message)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!accountId) {
      toast.error('Please select an account')
      return
    }

    if (!caption && mediaUrls.length === 0) {
      toast.error('Please add a caption or at least one image')
      return
    }

    setIsSavingDraft(true)
    try {
      const response = await fetch('/api/admin/social-posting/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barId,
          adminId,
          adminName,
          platform,
          accountId,
          accountName: accounts.find(a => a.accountId === accountId)?.name || '',
          contentType: mediaUrls.length > 1 ? 'carousel' : (mediaUrls.length === 1 ? 'photo' : 'text'),
          caption,
          mediaUrls,
          status: 'draft',
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Draft saved successfully!')
        // Reset form (but keep account selected for convenience)
        setCaption('')
        setMediaUrls([])
        setScheduledFor('')
        // Don't reset accountId - keep the selected account
        if (onPostCreated) onPostCreated()
      } else {
        throw new Error(data.error || 'Failed to save draft')
      }
    } catch (error) {
      console.error('Save draft error:', error)
      toast.error('Failed to save draft: ' + error.message)
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleSchedule = async () => {
    if (!accountId || !scheduledFor) {
      toast.error('Please select an account and set a schedule time')
      return
    }

    if (!caption && mediaUrls.length === 0) {
      toast.error('Please add a caption or at least one image')
      return
    }

    if (platform === 'instagram' && mediaUrls.length === 0) {
      toast.error('Instagram posts require at least one image')
      return
    }

    setIsPublishing(true)
    try {
      // First create the post
      const createResponse = await fetch('/api/admin/social-posting/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barId,
          adminId,
          adminName,
          platform,
          accountId,
          accountName: accounts.find(a => a.accountId === accountId)?.name || '',
          contentType: mediaUrls.length > 1 ? 'carousel' : (mediaUrls.length === 1 ? 'photo' : 'text'),
          caption,
          mediaUrls,
          scheduledFor,
        }),
      })

      const createData = await createResponse.json()

      if (createData.success) {
        toast.success('Post scheduled successfully!')
        // Reset form (but keep account selected for convenience)
        setCaption('')
        setMediaUrls([])
        setScheduledFor('')
        // Don't reset accountId - keep the selected account
        if (onPostCreated) onPostCreated()
      } else {
        throw new Error(createData.error || 'Failed to schedule post')
      }
    } catch (error) {
      console.error('Schedule error:', error)
      toast.error('Failed to schedule: ' + error.message)
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Create New Post</h3>

      {/* Platform and Account Selection */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Platform
          </label>
          <select
            value={platform}
            onChange={e => {
              setPlatform(e.target.value)
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
          >
            <option value="facebook">Facebook Page</option>
            <option value="instagram">Instagram Business</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Account
          </label>
          <select
            value={accountId}
            onChange={e => setAccountId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select an account</option>
            {filteredAccounts.map(account => (
              <option key={account.accountId} value={account.accountId}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Image Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Images {mediaUrls.length > 1 && <span className="text-primary">(Carousel)</span>}
          {platform === 'facebook' && (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(Optional)</span>
          )}
          {platform === 'instagram' && (
            <span className="text-xs text-red-600 dark:text-red-400 ml-2">(Required for Instagram)</span>
          )}
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {mediaUrls.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-24 h-24 object-cover rounded border border-gray-300 dark:border-gray-600"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
          <Image className="w-5 h-5 mr-2" />
          {uploadingImages ? 'Uploading...' : 'Upload Images'}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploadingImages}
          />
        </label>
      </div>

      {/* Caption */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Caption
          </label>
          <button
            onClick={generateCaptions}
            disabled={isGeneratingCaptions}
            className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
          >
            {isGeneratingCaptions ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AI Generate
              </>
            )}
          </button>
        </div>
        <textarea
          value={caption}
          onChange={e => setCaption(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
          placeholder="Write your caption here..."
        />
        {showCaptionSuggestions && generatedCaptions.length > 0 && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI Suggestions:
            </p>
            <div className="space-y-2">
              {generatedCaptions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => useCaption(suggestion)}
                  className="block w-full text-left text-sm p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Schedule */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Schedule (Optional)
        </label>
        <input
          type="datetime-local"
          value={scheduledFor}
          onChange={e => setScheduledFor(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleSaveDraft}
          disabled={
            isSavingDraft ||
            !accountId ||
            ((!caption?.trim()) && mediaUrls.length === 0) ||
            (platform === 'instagram' && mediaUrls.length === 0)
          }
          className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSavingDraft ? 'Saving...' : 'Save Draft'}
        </button>
        {scheduledFor ? (
          <button
            onClick={handleSchedule}
            disabled={
              isPublishing ||
              !accountId ||
              ((!caption?.trim()) && mediaUrls.length === 0) ||
              (platform === 'instagram' && mediaUrls.length === 0)
            }
            className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                Schedule
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handlePublish}
            disabled={
              isPublishing ||
              !accountId ||
              ((!caption?.trim()) && mediaUrls.length === 0) ||
              (platform === 'instagram' && mediaUrls.length === 0)
            }
            className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Publish Now
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
