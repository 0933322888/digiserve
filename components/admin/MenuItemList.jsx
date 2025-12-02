'use client'

import { useState } from 'react'
import { Edit, Trash2, XCircle, CheckCircle, Archive, ArchiveRestore } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function MenuItemList({ items, sectionId, menuId, onRefresh, onEdit }) {
  const handleDelete = async itemId => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return
    }

    try {
      const response = await fetch(
        `/api/admin/menus/${menuId}/sections/${sectionId}/items?itemId=${itemId}`,
        { method: 'DELETE' }
      )

      const data = await response.json()
      if (data.success) {
        toast.success('Menu item deleted successfully')
        onRefresh()
      } else {
        toast.error('Failed to delete: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete: ' + error.message)
    }
  }

  const handleToggleUnavailable = async itemId => {
    try {
      const response = await fetch(`/api/admin/menus/${menuId}/sections/${sectionId}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })

      const data = await response.json()
      if (data.success) {
        onRefresh()
      } else {
        toast.error('Failed to update: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Toggle unavailable error:', error)
      toast.error('Failed to update: ' + error.message)
    }
  }

  const handleToggleArchive = async itemId => {
    try {
      const response = await fetch(
        `/api/admin/menus/${menuId}/sections/${sectionId}/items/${itemId}/archive`,
        {
          method: 'POST',
        }
      )

      const data = await response.json()
      if (data.success) {
        onRefresh()
      } else {
        toast.error('Failed to archive: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Toggle archive error:', error)
      toast.error('Failed to archive: ' + error.message)
    }
  }

  if (items.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        No items in this section. Click "Add Item" to create one.
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {items.map(item => (
        <div
          key={item.id}
          className={`p-4 border-l-4 transition-all ${
            item.archived
              ? 'bg-gray-50 dark:bg-gray-800/30 border-gray-400 dark:border-gray-600 opacity-75'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-transparent'
          } ${item.unavailable && !item.archived ? 'opacity-60' : ''}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h5
                  className={`font-medium ${
                    item.archived
                      ? 'text-gray-500 dark:text-gray-400 line-through italic'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {item.name}
                </h5>
                {item.unavailable && !item.archived && (
                  <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded font-medium">
                    Unavailable
                  </span>
                )}
                {item.archived && (
                  <span className="px-2 py-0.5 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded font-semibold uppercase tracking-wide">
                    Archived
                  </span>
                )}
              </div>
              {item.description && (
                <p
                  className={`text-sm mt-1 ${
                    item.archived
                      ? 'text-gray-400 dark:text-gray-500 line-through'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {item.description}
                </p>
              )}
              {item.image && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="relative w-16 h-16 rounded border border-gray-300 dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Image: </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 break-all">{item.image}</span>
                  </div>
                </div>
              )}
              <div className={`flex items-center gap-4 mt-2 ${item.archived ? 'opacity-50' : ''}`}>
                <span
                  className={`text-lg font-bold ${
                    item.archived
                      ? 'text-gray-400 dark:text-gray-500 line-through'
                      : 'text-primary dark:text-gold'
                  }`}
                >
                  {formatPrice(item.price)}
                </span>
                {item.serves && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Serves {item.serves}
                  </span>
                )}
                {item.size && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.size}</span>
                )}
                {item.dietary && item.dietary.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.dietary.map(diet => (
                      <span
                        key={diet}
                        className="text-xs px-2 py-0.5 bg-gold/20 text-primary dark:text-gold rounded"
                      >
                        {diet}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => handleToggleArchive(item.id)}
                className={`p-2 rounded ${
                  item.archived
                    ? 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={item.archived ? 'Unarchive item' : 'Archive item'}
              >
                {item.archived ? (
                  <ArchiveRestore className="w-4 h-4" />
                ) : (
                  <Archive className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => handleToggleUnavailable(item.id)}
                className={`p-2 rounded ${
                  item.unavailable
                    ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    : 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                }`}
                title={item.unavailable ? 'Mark as available' : 'Mark as unavailable'}
              >
                {item.unavailable ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
              </button>
              {!item.archived && (
                <>
                  <button
                    onClick={() => onEdit(item)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    title="Edit item"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
