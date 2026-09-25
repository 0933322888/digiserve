'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MenuItemForm({ item, sectionId, menuId, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    dietary: [],
    serves: '',
    size: '',
    options: [],
    unavailable: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [dietaryInput, setDietaryInput] = useState('')

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price || '',
        image: item.image || '',
        dietary: item.dietary || [],
        serves: item.serves || '',
        size: item.size || '',
        options: item.options || [],
        unavailable: item.unavailable || false,
      })
    }
  }, [item])

  const handleSubmit = async e => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        image: formData.image?.trim() || '',
        dietary: formData.dietary.filter(d => d.trim()),
        serves: formData.serves || null,
        size: formData.size || null,
        options: formData.options
          .filter(o => o.name && o.price)
          .map(o => ({
            name: o.name,
            price: parseFloat(o.price),
          })),
      }

      if (item) {
        // Update existing item
        const response = await fetch(`/api/admin/menus/${menuId}/sections/${sectionId}/items`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: item.id, ...payload }),
        })
        const data = await response.json()
        if (data.success) {
          toast.success('Menu item updated successfully')
          onSave(data.item)
        } else {
          toast.error('Failed to update: ' + (data.error || 'Unknown error'))
        }
      } else {
        // Create new item
        const response = await fetch(`/api/admin/menus/${menuId}/sections/${sectionId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await response.json()
        if (data.success) {
          toast.success('Menu item created successfully')
          onSave(data.item)
        } else {
          toast.error('Failed to create: ' + (data.error || 'Unknown error'))
        }
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const addDietary = () => {
    if (dietaryInput.trim() && !formData.dietary.includes(dietaryInput.trim())) {
      setFormData({
        ...formData,
        dietary: [...formData.dietary, dietaryInput.trim()],
      })
      setDietaryInput('')
    }
  }

  const removeDietary = diet => {
    setFormData({
      ...formData,
      dietary: formData.dietary.filter(d => d !== diet),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Image URL (optional)
        </label>
        <input
          type="text"
          value={formData.image}
          onChange={e => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://example.com/image.jpg or /images/menu-item.jpg"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Enter a full URL (https://...) or a relative path (e.g., /images/menu-item.jpg)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Price *
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={e => setFormData({ ...formData, price: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Serves (e.g., "2-3 people")
        </label>
        <input
          type="text"
          value={formData.serves}
          onChange={e => setFormData({ ...formData, serves: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Size (e.g., "glass", "bottle")
        </label>
        <input
          type="text"
          value={formData.size}
          onChange={e => setFormData({ ...formData, size: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 my-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Size Variants (Optional)
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Add different sizes with their specific prices. If added, these will override the base
          price.
        </p>

        {formData.options.map((option, index) => (
          <div key={index} className="flex gap-2 mb-2 items-start">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Size Name (e.g. Small, Bottle)"
                value={option.name}
                onChange={e => {
                  const newOptions = [...formData.options]
                  newOptions[index].name = e.target.value
                  setFormData({ ...formData, options: newOptions })
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
            <div className="w-32">
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={option.price}
                onChange={e => {
                  const newOptions = [...formData.options]
                  newOptions[index].price = e.target.value
                  setFormData({ ...formData, options: newOptions })
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const newOptions = formData.options.filter((_, i) => i !== index)
                setFormData({ ...formData, options: newOptions })
              }}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            setFormData({
              ...formData,
              options: [...formData.options, { name: '', price: '' }],
            })
          }
          className="text-sm text-primary-text  hover:underline flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Add Size Variant
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Dietary Information
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={dietaryInput}
            onChange={e => setDietaryInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addDietary())}
            placeholder="e.g., vegetarian, gluten-free"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
          />
          <button
            type="button"
            onClick={addDietary}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Add
          </button>
        </div>
        {formData.dietary.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.dietary.map(diet => (
              <span
                key={diet}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gold/20 text-primary-text  rounded text-sm"
              >
                {diet}
                <button
                  type="button"
                  onClick={() => removeDietary(diet)}
                  className="hover:text-red-600 dark:hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="unavailable"
          checked={formData.unavailable}
          onChange={e => setFormData({ ...formData, unavailable: e.target.checked })}
          className="h-4 w-4 text-primary-text focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="unavailable" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
          Temporarily Unavailable
        </label>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {item ? 'Update' : 'Create'} Item
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
