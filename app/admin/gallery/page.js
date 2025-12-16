'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Image as ImageIcon, Star, Loader2, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminGalleryPage() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingImage, setEditingImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    url: '',
    alt: '',
    caption: '',
    category: '',
    featured: false,
    order: 0,
  })

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/admin/gallery')
      const data = await response.json()
      if (data.success) {
        setImages(data.images || [])
      }
    } catch (error) {
      console.error('Failed to fetch images:', error)
      toast.error('Failed to load gallery images')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async e => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/gallery/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setFormData(prev => ({ ...prev, url: data.url }))
        toast.success('Image uploaded successfully')
      } else {
        toast.error(data.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!formData.url) {
      toast.error('Please upload an image first')
      return
    }

    try {
      const url = editingImage ? `/api/admin/gallery/${editingImage.id}` : '/api/admin/gallery'
      const method = editingImage ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(editingImage ? 'Image updated successfully' : 'Image added successfully')
        setShowForm(false)
        setEditingImage(null)
        resetForm()
        fetchImages()
      } else {
        toast.error(data.error || 'Failed to save image')
      }
    } catch (error) {
      console.error('Save image error:', error)
      toast.error('Failed to save image')
    }
  }

  const handleEdit = image => {
    setEditingImage(image)
    setFormData({
      url: image.url || '',
      alt: image.alt || '',
      caption: image.caption || '',
      category: image.category || '',
      featured: image.featured || false,
      order: image.order || 0,
    })
    setShowForm(true)
  }

  const handleDelete = async imageId => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const response = await fetch(`/api/admin/gallery/${imageId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Image deleted successfully')
        fetchImages()
      } else {
        toast.error(data.error || 'Failed to delete image')
      }
    } catch (error) {
      console.error('Delete image error:', error)
      toast.error('Failed to delete image')
    }
  }

  const resetForm = () => {
    setFormData({
      url: '',
      alt: '',
      caption: '',
      category: '',
      featured: false,
      order: 0,
    })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingImage(null)
    resetForm()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary dark:text-gold" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gallery Management</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage gallery images for your restaurant
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Image
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {editingImage ? 'Edit Image' : 'Add New Image'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Image {!editingImage && <span className="text-red-600">*</span>}
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <Upload className="w-5 h-5 mr-2" />
                  {uploading ? 'Uploading...' : 'Choose File'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                    required={!editingImage}
                  />
                </label>
                {formData.url && (
                  <img src={formData.url} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
                )}
              </div>
              {!formData.url && !editingImage && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">Image is required</p>
              )}
            </div>

            {!formData.url && (
              <p className="text-sm text-red-600 dark:text-red-400">Please upload an image first</p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alt Text
              </label>
              <input
                type="text"
                value={formData.alt}
                onChange={e => setFormData({ ...formData, alt: e.target.value })}
                placeholder="Description for accessibility"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Caption
              </label>
              <input
                type="text"
                value={formData.caption}
                onChange={e => setFormData({ ...formData, caption: e.target.value })}
                placeholder="Image caption"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select category</option>
                  <option value="food">Food</option>
                  <option value="drinks">Drinks</option>
                  <option value="ambiance">Ambiance</option>
                  <option value="events">Events</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary dark:focus:ring-gold"
              />
              <label htmlFor="featured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Featured Image
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                {editingImage ? 'Update Image' : 'Add Image'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Gallery Images</h3>
        </div>
        {images.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No images found. Add your first image to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {images.map(image => (
              <div
                key={image.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden group"
              >
                <div className="relative h-48">
                  <img
                    src={image.url}
                    alt={image.alt || image.caption || 'Gallery image'}
                    className="w-full h-full object-cover"
                  />
                  {image.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1 rounded-full shadow-md">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(image)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 text-gray-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="p-2 bg-red-500 rounded-full hover:bg-red-600 text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  {image.caption && (
                    <p className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                      {image.caption}
                    </p>
                  )}
                  {image.category && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {image.category.charAt(0).toUpperCase() + image.category.slice(1)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

