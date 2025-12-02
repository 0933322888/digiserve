'use client'

import { useState } from 'react'
import { Calendar, Clock, Image, X, Loader2, Save, Plus, Trash2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CampaignForm({ accounts, barId, adminId, adminName, onCampaignCreated }) {
    const [name, setName] = useState('')
    const [platform, setPlatform] = useState('facebook')
    const [accountId, setAccountId] = useState('')
    const [posts, setPosts] = useState([]) // Array of post objects: [{ caption, mediaUrls, scheduledFor }]
    const [isCreating, setIsCreating] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [tone, setTone] = useState('fun')
    const [generateImages, setGenerateImages] = useState(false)
    const [aiPrompt, setAiPrompt] = useState('')
    const [numberOfPosts, setNumberOfPosts] = useState(5)
    const [isAiSectionExpanded, setIsAiSectionExpanded] = useState(false)
    const [uploadingImages, setUploadingImages] = useState({}) // Track which post is uploading

    const filteredAccounts = accounts.filter(acc => acc.platform === platform)

    const addPost = () => {
        setPosts([
            ...posts,
            {
                caption: '',
                mediaUrls: [],
                scheduledFor: '',
            },
        ])
    }

    const removePost = index => {
        setPosts(posts.filter((_, i) => i !== index))
    }

    const updatePost = (index, field, value) => {
        const newPosts = [...posts]
        newPosts[index] = { ...newPosts[index], [field]: value }
        setPosts(newPosts)
    }

    const handleImageUpload = async (e, postIndex) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return

        setUploadingImages({ ...uploadingImages, [postIndex]: true })
        try {
            const formData = new FormData()
            files.forEach(file => formData.append('files', file))

            const response = await fetch('/api/admin/social-posting/upload', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (data.success) {
                const currentUrls = posts[postIndex].mediaUrls || []
                updatePost(postIndex, 'mediaUrls', [...currentUrls, ...data.urls])
            } else {
                toast.error('Failed to upload images: ' + (data.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Failed to upload images')
        } finally {
            setUploadingImages({ ...uploadingImages, [postIndex]: false })
        }
    }

    const removeImage = (postIndex, imageIndex) => {
        const newPosts = [...posts]
        newPosts[postIndex].mediaUrls = newPosts[postIndex].mediaUrls.filter((_, i) => i !== imageIndex)
        setPosts(newPosts)
    }

    const handleGenerateCampaign = async () => {
        if (!platform) {
            toast.error('Please select a platform first')
            return
        }

        setIsGenerating(true)
        try {
            const response = await fetch('/api/admin/social-posting/generate-campaign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    platform,
                    tone,
                }),
            })

            const data = await response.json()

            if (data.success) {
                // Append generated posts to existing posts
                setPosts([...posts, ...data.posts])
                toast.success(`Generated ${data.posts.length} draft posts! Please review them and add images.`)
            } else {
                toast.error('Failed to generate campaign: ' + (data.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Generate campaign error:', error)
            toast.error('Failed to generate campaign: ' + error.message)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSubmit = async e => {
        e.preventDefault()

        if (!name || !accountId) {
            toast.error('Please fill in campaign name and select an account')
            return
        }

        if (posts.length === 0) {
            toast.error('Please add at least one post to the campaign')
            return
        }

        // Validate all posts
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i]
            if (!post.mediaUrls || post.mediaUrls.length === 0) {
                toast.error(`Post ${i + 1}: Please upload at least one image`)
                return
            }
            if (!post.scheduledFor) {
                toast.error(`Post ${i + 1}: Please select a scheduled date and time`)
                return
            }
            if (new Date(post.scheduledFor) <= new Date()) {
                toast.error(`Post ${i + 1}: Scheduled date must be in the future`)
                return
            }
        }

        setIsCreating(true)
        try {
            const response = await fetch('/api/admin/social-posting/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    barId,
                    adminId,
                    adminName,
                    name,
                    platform,
                    accountId,
                    accountName: filteredAccounts.find(acc => acc.accountId === accountId)?.name || '',
                    posts: posts.map(post => ({
                        caption: post.caption || '',
                        mediaUrls: post.mediaUrls,
                        scheduledFor: post.scheduledFor,
                    })),
                }),
            })

            const data = await response.json()

            if (data.success) {
                // Reset form
                setName('')
                setAccountId('')
                setPosts([])

                if (onCampaignCreated) {
                    onCampaignCreated()
                }
                toast.success(`Campaign created successfully! ${data.posts?.length || 0} post(s) scheduled.`)
            } else {
                toast.error('Failed to create campaign: ' + (data.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Create campaign error:', error)
            toast.error('Failed to create campaign: ' + error.message)
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Create Campaign</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Campaign Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Campaign Name *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="e.g., Summer Promotion 2024"
                        required
                    />
                </div>

                {/* Platform and Account Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Platform *
                        </label>
                        <select
                            value={platform}
                            onChange={e => {
                                setPlatform(e.target.value)
                                setAccountId('')
                            }}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            <option value="facebook">Facebook</option>
                            <option value="instagram">Instagram</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Account *
                        </label>
                        <select
                            value={accountId}
                            onChange={e => setAccountId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            required
                        >
                            <option value="">Select account</option>
                            {filteredAccounts.map(acc => (
                                <option key={acc.accountId} value={acc.accountId}>
                                    {acc.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Posts List */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Campaign Posts *
                    </label>

                    {/* AI Generation Collapsible Block */}
                    <div className="mb-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg overflow-hidden">
                        {/* Header */}
                        <button
                            type="button"
                            onClick={() => setIsAiSectionExpanded(!isAiSectionExpanded)}
                            className="w-full p-4 flex items-center justify-between hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    AI Campaign Generator
                                </span>
                            </div>
                            {isAiSectionExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            )}
                        </button>

                        {/* Collapsible Content */}
                        {isAiSectionExpanded && (
                            <div className="p-4 pt-0 space-y-4">
                                {/* Prompt Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Campaign Details (Optional)
                                    </label>
                                    <textarea
                                        value={aiPrompt}
                                        onChange={e => setAiPrompt(e.target.value)}
                                        placeholder="e.g., Promote our new summer cocktail menu with tropical vibes..."
                                        rows={3}
                                        disabled={isGenerating}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm resize-none"
                                    />
                                </div>

                                {/* Options Row */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* Tone */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Tone
                                        </label>
                                        <select
                                            value={tone}
                                            onChange={e => setTone(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                                            disabled={isGenerating}
                                        >
                                            <option value="fun">Fun</option>
                                            <option value="classy">Classy</option>
                                            <option value="short">Short</option>
                                            <option value="promotional">Promotional</option>
                                        </select>
                                    </div>

                                    {/* Number of Posts */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Number of Posts
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={numberOfPosts}
                                            onChange={e => setNumberOfPosts(parseInt(e.target.value) || 1)}
                                            disabled={isGenerating}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                                        />
                                    </div>

                                    {/* Generate Images Checkbox */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Options
                                        </label>
                                        <label className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 text-sm h-[42px]">
                                            <input
                                                type="checkbox"
                                                checked={generateImages}
                                                onChange={e => setGenerateImages(e.target.checked)}
                                                disabled={isGenerating}
                                                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">Generate Images</span>
                                        </label>
                                    </div>

                                    {/* Generate Button */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            &nbsp;
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleGenerateCampaign}
                                            disabled={isGenerating}
                                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed h-[42px]"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-4 h-4 mr-2" />
                                                    Generate Campaign
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Add Post Button */}
                    <div className="mb-4">
                        <button
                            type="button"
                            onClick={addPost}
                            className="inline-flex items-center px-4 py-2 bg-primary dark:bg-gold text-white rounded-lg hover:bg-primary/90 dark:hover:bg-gold/90 transition-colors text-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Post Manually
                        </button>
                    </div>

                    {posts.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400 mb-4">No posts added yet</p>
                            <button
                                type="button"
                                onClick={addPost}
                                className="inline-flex items-center px-4 py-2 bg-primary dark:bg-gold text-white rounded-lg hover:bg-primary/90 dark:hover:bg-gold/90 transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Post
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {posts.map((post, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-medium text-gray-900 dark:text-white">Post {index + 1}</h4>
                                        <button
                                            type="button"
                                            onClick={() => removePost(index)}
                                            className="text-red-600 hover:text-red-700 p-1"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Scheduled Date/Time */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <Calendar className="w-4 h-4 inline mr-2" />
                                            Scheduled Date & Time *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={post.scheduledFor}
                                            onChange={e => updatePost(index, 'scheduledFor', e.target.value)}
                                            min={new Date().toISOString().slice(0, 16)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            required
                                        />
                                    </div>

                                    {/* Caption */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Caption
                                        </label>
                                        <textarea
                                            value={post.caption}
                                            onChange={e => updatePost(index, 'caption', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            placeholder="Enter caption for this post..."
                                        />
                                    </div>

                                    {/* Images */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Images *
                                        </label>
                                        {post.mediaUrls && post.mediaUrls.length > 0 && (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                                                {post.mediaUrls.map((url, imgIndex) => (
                                                    <div key={imgIndex} className="relative">
                                                        <img
                                                            src={url}
                                                            alt={`Post ${index + 1} - Image ${imgIndex + 1}`}
                                                            className="w-full h-24 object-cover rounded"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index, imgIndex)}
                                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <label className="block">
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={e => handleImageUpload(e, index)}
                                                className="hidden"
                                                disabled={uploadingImages[index]}
                                            />
                                            <span className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                                                <Image className="w-4 h-4 mr-2" />
                                                {uploadingImages[index] ? 'Uploading...' : 'Add Images'}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                    }

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isCreating || posts.length === 0}
                        className="w-full px-6 py-3 bg-primary dark:bg-gold text-white rounded-lg hover:bg-primary/90 dark:hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating Campaign...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Create Campaign ({posts.length} {posts.length === 1 ? 'post' : 'posts'})
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div >
    )
}
