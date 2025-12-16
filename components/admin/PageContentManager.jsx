'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, Trash2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PageContentManager() {
  const [activeTab, setActiveTab] = useState('home')
  const [homeContent, setHomeContent] = useState(null)
  const [aboutContent, setAboutContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPageContent()
  }, [])

  const fetchPageContent = async () => {
    try {
      const response = await fetch('/api/admin/settings/page-content')
      const data = await response.json()
      if (data.success) {
        setHomeContent(data.home)
        setAboutContent(data.about)
      }
    } catch (error) {
      console.error('Failed to fetch page content:', error)
      toast.error('Failed to load page content')
    } finally {
      setLoading(false)
    }
  }

  const savePageContent = async (page, content) => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings/page-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page,
          content,
          updatedBy: 'admin',
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`${page.charAt(0).toUpperCase() + page.slice(1)} page content saved`)
      } else {
        throw new Error(data.error || 'Failed to save page content')
      }
    } catch (error) {
      console.error('Failed to save page content:', error)
      toast.error('Failed to save page content: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const addHighlight = () => {
    setHomeContent(prev => ({
      ...prev,
      highlights: {
        ...prev.highlights,
        items: [
          ...prev.highlights.items,
          {
            title: 'New Highlight',
            description: 'Description here',
            link: '/',
            image: '',
            enabled: true,
          },
        ],
      },
    }))
  }

  const removeHighlight = index => {
    setHomeContent(prev => ({
      ...prev,
      highlights: {
        ...prev.highlights,
        items: prev.highlights.items.filter((_, i) => i !== index),
      },
    }))
  }

  const updateHighlight = (index, field, value) => {
    setHomeContent(prev => ({
      ...prev,
      highlights: {
        ...prev.highlights,
        items: prev.highlights.items.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }))
  }

  const addTimelineItem = () => {
    setAboutContent(prev => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        items: [
          ...prev.timeline.items,
          {
            year: new Date().getFullYear().toString(),
            title: 'New Milestone',
            description: 'Description here',
            enabled: true,
          },
        ],
      },
    }))
  }

  const removeTimelineItem = index => {
    setAboutContent(prev => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        items: prev.timeline.items.filter((_, i) => i !== index),
      },
    }))
  }

  const updateTimelineItem = (index, field, value) => {
    setAboutContent(prev => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        items: prev.timeline.items.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }))
  }

  const updatePrinciple = (index, field, value) => {
    setAboutContent(prev => ({
      ...prev,
      philosophy: {
        ...prev.philosophy,
        principles: prev.philosophy.principles.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary dark:text-gold" />
      </div>
    )
  }

  if (!homeContent || !aboutContent) {
    return <div className="text-center text-gray-500">Failed to load page content</div>
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Page Content</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure all text and links on the Home and About pages
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'home'
                ? 'border-b-2 border-primary dark:border-gold text-primary dark:text-gold'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
          >
            Home Page
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'about'
                ? 'border-b-2 border-primary dark:border-gold text-primary dark:text-gold'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
          >
            About Page
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Hero Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Hero Section
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hero Background Image (Optional)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Leave empty to use the default gradient or template background.
                  </p>
                  <input
                    type="text"
                    value={homeContent.heroImage || ''}
                    onChange={e =>
                      setHomeContent(prev => ({
                        ...prev,
                        heroImage: e.target.value,
                      }))
                    }
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Highlights Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Highlights Section
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={homeContent.highlights.sectionTitle}
                    onChange={e =>
                      setHomeContent(prev => ({
                        ...prev,
                        highlights: { ...prev.highlights, sectionTitle: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Section Subtitle
                  </label>
                  <input
                    type="text"
                    value={homeContent.highlights.sectionSubtitle}
                    onChange={e =>
                      setHomeContent(prev => ({
                        ...prev,
                        highlights: { ...prev.highlights, sectionSubtitle: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Highlight Items
                    </label>
                    <button
                      onClick={addHighlight}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-primary dark:text-gold hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  <div className="space-y-4">
                    {homeContent.highlights.items.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Item {index + 1}
                          </label>
                          <button
                            onClick={() => removeHighlight(index)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={e => updateHighlight(index, 'title', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Link
                            </label>
                            <input
                              type="text"
                              value={item.link}
                              onChange={e => updateHighlight(index, 'link', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Description
                          </label>
                          <textarea
                            value={item.description}
                            onChange={e => updateHighlight(index, 'description', e.target.value)}
                            rows={2}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Image URL
                          </label>
                          <input
                            type="text"
                            value={item.image}
                            onChange={e => updateHighlight(index, 'image', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={e => updateHighlight(index, 'enabled', e.target.checked)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Enabled</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* About Preview Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                About Preview Section
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={homeContent.aboutPreview.title}
                    onChange={e =>
                      setHomeContent(prev => ({
                        ...prev,
                        aboutPreview: { ...prev.aboutPreview, title: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={homeContent.aboutPreview.description}
                    onChange={e =>
                      setHomeContent(prev => ({
                        ...prev,
                        aboutPreview: { ...prev.aboutPreview, description: e.target.value },
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={homeContent.aboutPreview.buttonText}
                      onChange={e =>
                        setHomeContent(prev => ({
                          ...prev,
                          aboutPreview: { ...prev.aboutPreview, buttonText: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Button Link
                    </label>
                    <input
                      type="text"
                      value={homeContent.aboutPreview.buttonLink}
                      onChange={e =>
                        setHomeContent(prev => ({
                          ...prev,
                          aboutPreview: { ...prev.aboutPreview, buttonLink: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Events Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Events Section
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={homeContent.eventsSection.title}
                    onChange={e =>
                      setHomeContent(prev => ({
                        ...prev,
                        eventsSection: { ...prev.eventsSection, title: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={homeContent.eventsSection.subtitle}
                    onChange={e =>
                      setHomeContent(prev => ({
                        ...prev,
                        eventsSection: { ...prev.eventsSection, subtitle: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Reservation CTA Section
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={homeContent.ctaSection.title}
                    onChange={e =>
                      setHomeContent(prev => ({
                        ...prev,
                        ctaSection: { ...prev.ctaSection, title: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={homeContent.ctaSection.description}
                    onChange={e =>
                      setHomeContent(prev => ({
                        ...prev,
                        ctaSection: { ...prev.ctaSection, description: e.target.value },
                      }))
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={homeContent.ctaSection.buttonText}
                      onChange={e =>
                        setHomeContent(prev => ({
                          ...prev,
                          ctaSection: { ...prev.ctaSection, buttonText: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Button Link
                    </label>
                    <input
                      type="text"
                      value={homeContent.ctaSection.buttonLink}
                      onChange={e =>
                        setHomeContent(prev => ({
                          ...prev,
                          ctaSection: { ...prev.ctaSection, buttonLink: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => savePageContent('home', homeContent)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary dark:bg-gold text-white dark:text-primary rounded-md hover:bg-primary-dark dark:hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Home Page Content
            </button>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6">
            {/* Hero Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Hero Section
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={aboutContent.hero.title}
                  onChange={e =>
                    setAboutContent(prev => ({
                      ...prev,
                      hero: { ...prev.hero, title: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Mission Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Mission Section
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={aboutContent.mission.title}
                    onChange={e =>
                      setAboutContent(prev => ({
                        ...prev,
                        mission: { ...prev.mission, title: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description (First Paragraph)
                  </label>
                  <textarea
                    value={aboutContent.mission.description}
                    onChange={e =>
                      setAboutContent(prev => ({
                        ...prev,
                        mission: { ...prev.mission, description: e.target.value },
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description (Second Paragraph)
                  </label>
                  <textarea
                    value={aboutContent.mission.description2}
                    onChange={e =>
                      setAboutContent(prev => ({
                        ...prev,
                        mission: { ...prev.mission, description2: e.target.value },
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Timeline Section
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={aboutContent.timeline.sectionTitle}
                      onChange={e =>
                        setAboutContent(prev => ({
                          ...prev,
                          timeline: { ...prev.timeline, sectionTitle: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Section Subtitle
                    </label>
                    <input
                      type="text"
                      value={aboutContent.timeline.sectionSubtitle}
                      onChange={e =>
                        setAboutContent(prev => ({
                          ...prev,
                          timeline: { ...prev.timeline, sectionSubtitle: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Timeline Items
                    </label>
                    <button
                      onClick={addTimelineItem}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-primary dark:text-gold hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  <div className="space-y-4">
                    {aboutContent.timeline.items.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Item {index + 1}
                          </label>
                          <button
                            onClick={() => removeTimelineItem(index)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Year
                            </label>
                            <input
                              type="text"
                              value={item.year}
                              onChange={e => updateTimelineItem(index, 'year', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={e => updateTimelineItem(index, 'title', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Description
                          </label>
                          <textarea
                            value={item.description}
                            onChange={e => updateTimelineItem(index, 'description', e.target.value)}
                            rows={2}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={e => updateTimelineItem(index, 'enabled', e.target.checked)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Enabled</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Philosophy Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Philosophy Section
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={aboutContent.philosophy.title}
                    onChange={e =>
                      setAboutContent(prev => ({
                        ...prev,
                        philosophy: { ...prev.philosophy, title: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={aboutContent.philosophy.description}
                    onChange={e =>
                      setAboutContent(prev => ({
                        ...prev,
                        philosophy: { ...prev.philosophy, description: e.target.value },
                      }))
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Principles
                  </label>
                  <div className="space-y-4">
                    {aboutContent.philosophy.principles.map((principle, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3"
                      >
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={principle.title}
                            onChange={e => updatePrinciple(index, 'title', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Description
                          </label>
                          <textarea
                            value={principle.description}
                            onChange={e => updatePrinciple(index, 'description', e.target.value)}
                            rows={2}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={principle.enabled}
                            onChange={e => updatePrinciple(index, 'enabled', e.target.checked)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Enabled</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => savePageContent('about', aboutContent)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary dark:bg-gold text-white dark:text-primary rounded-md hover:bg-primary-dark dark:hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save About Page Content
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

