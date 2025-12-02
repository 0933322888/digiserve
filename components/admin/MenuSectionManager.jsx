'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, GripVertical, ChevronsDown, ChevronsUp } from 'lucide-react'
import MenuItemForm from './MenuItemForm'
import MenuItemList from './MenuItemList'
import toast from 'react-hot-toast'

export default function MenuSectionManager({ sections, menuId, onRefresh }) {
  const [expandedSections, setExpandedSections] = useState(new Set(sections.map(s => s.id)))
  const [editingSection, setEditingSection] = useState(null)
  const [showSectionForm, setShowSectionForm] = useState(false)
  const [showItemForm, setShowItemForm] = useState(null) // { sectionId, item: null or item object }
  const [newSectionName, setNewSectionName] = useState('')
  const [newSectionDescription, setNewSectionDescription] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [draggedSectionId, setDraggedSectionId] = useState(null)
  const [dragOverSectionId, setDragOverSectionId] = useState(null)

  const toggleSection = sectionId => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const expandAllSections = () => {
    const allSectionIds = new Set(sections.map(s => s.id))
    setExpandedSections(allSectionIds)
  }

  const collapseAllSections = () => {
    setExpandedSections(new Set())
  }

  const handleCreateSection = async () => {
    if (!newSectionName.trim()) {
      toast.error('Section name is required')
      return
    }

    try {
      const response = await fetch(`/api/admin/menus/${menuId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSectionName,
          description: newSectionDescription,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Section created successfully')
        setNewSectionName('')
        setNewSectionDescription('')
        setShowSectionForm(false)
        onRefresh()
      } else {
        toast.error('Failed to create section: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Create section error:', error)
      toast.error('Failed to create section: ' + error.message)
    }
  }

  const handleUpdateSection = async (sectionId, updates) => {
    try {
      const response = await fetch(`/api/admin/menus/${menuId}/sections`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, ...updates }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Section updated successfully')
        setEditingSection(null)
        onRefresh()
      } else {
        toast.error('Failed to update section: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Update section error:', error)
      toast.error('Failed to update section: ' + error.message)
    }
  }

  const handleDeleteSection = async sectionId => {
    if (
      !confirm('Are you sure you want to delete this section? All items in it will be deleted.')
    ) {
      return
    }

    try {
      const response = await fetch(`/api/admin/menus/${menuId}/sections?sectionId=${sectionId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Section deleted successfully')
        onRefresh()
      } else {
        toast.error('Failed to delete section: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Delete section error:', error)
      toast.error('Failed to delete section: ' + error.message)
    }
  }

  // Filter items based on archive status
  const filterItems = items => {
    if (!items) return []
    if (showArchived) {
      return items // Show all items including archived
    }
    return items.filter(item => !item.archived) // Hide archived items
  }

  const handleDragStart = (e, sectionId) => {
    // Don't start drag if clicking directly on buttons (except the drag handle area)
    const target = e.target
    const isButton = target.closest('button')
    const isGripIcon = target.closest('.cursor-grab') || target.closest('[class*="GripVertical"]')
    
    // Allow drag from grip icon or section card, but not from buttons
    if (isButton && !isGripIcon) {
      e.preventDefault()
      return false
    }
    
    setDraggedSectionId(sectionId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', sectionId)
    // Find the section card element and set opacity
    const sectionCard = e.currentTarget
    if (sectionCard) {
      setTimeout(() => {
        sectionCard.style.opacity = '0.5'
      }, 0)
    }
  }

  const handleDragEnd = e => {
    const sectionCard = e.currentTarget
    if (sectionCard) {
      sectionCard.style.opacity = '1'
    }
    setDraggedSectionId(null)
    setDragOverSectionId(null)
  }

  const handleDragOver = (e, sectionId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (sectionId !== draggedSectionId) {
      setDragOverSectionId(sectionId)
    }
  }

  const handleDragLeave = () => {
    setDragOverSectionId(null)
  }

  const handleDrop = async (e, targetSectionId) => {
    e.preventDefault()
    setDragOverSectionId(null)

    if (!draggedSectionId || draggedSectionId === targetSectionId) {
      return
    }

    const draggedIndex = sections.findIndex(s => s.id === draggedSectionId)
    const targetIndex = sections.findIndex(s => s.id === targetSectionId)

    if (draggedIndex === -1 || targetIndex === -1) {
      return
    }

    // Create new ordered array
    const newSections = [...sections]
    const [removed] = newSections.splice(draggedIndex, 1)
    newSections.splice(targetIndex, 0, removed)

    const newSectionIds = newSections.map(s => s.id)

    try {
      const response = await fetch(`/api/admin/menus/${menuId}/sections`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionIds: newSectionIds }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Sections reordered successfully')
        onRefresh()
      } else {
        toast.error('Failed to reorder sections: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Reorder sections error:', error)
      toast.error('Failed to reorder sections: ' + error.message)
    }

    setDraggedSectionId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Menu Sections</h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={e => setShowArchived(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-primary dark:text-gold focus:ring-primary dark:focus:ring-gold"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show archived items</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={expandAllSections}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-1.5"
              title="Expand all sections"
            >
              <ChevronsDown className="w-4 h-4" />
              Expand All
            </button>
            <button
              onClick={collapseAllSections}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-1.5"
              title="Collapse all sections"
            >
              <ChevronsUp className="w-4 h-4" />
              Collapse All
            </button>
          </div>
          {!showSectionForm && (
            <button
              onClick={() => setShowSectionForm(true)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </button>
          )}
        </div>
      </div>

      {showSectionForm && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">New Section</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Section name"
              value={newSectionName}
              onChange={e => setNewSectionName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
            <textarea
              placeholder="Section description (optional)"
              value={newSectionDescription}
              onChange={e => setNewSectionDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateSection}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowSectionForm(false)
                  setNewSectionName('')
                  setNewSectionDescription('')
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {sections.map(section => (
        <div
          key={section.id}
          draggable
          onDragStart={e => handleDragStart(e, section.id)}
          onDragEnd={handleDragEnd}
          onDragOver={e => handleDragOver(e, section.id)}
          onDragLeave={handleDragLeave}
          onDrop={e => handleDrop(e, section.id)}
          className={`bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden transition-all ${
            draggedSectionId === section.id
              ? 'opacity-50 cursor-grabbing'
              : dragOverSectionId === section.id
              ? 'border-primary dark:border-gold border-2 shadow-lg transform scale-[1.02]'
              : 'cursor-grab'
          }`}
        >
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 select-none"
                style={{ userSelect: 'none' }}
              >
                <GripVertical className="w-5 h-5" />
              </div>
              <button
                onClick={e => {
                  e.stopPropagation()
                  toggleSection(section.id)
                }}
                className="flex items-center gap-2 flex-1 text-left"
                draggable={false}
              >
                {expandedSections.has(section.id) ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{section.name}</h4>
                  {section.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{section.description}</p>
                  )}
                </div>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {showArchived
                  ? `${section.items?.length || 0} items`
                  : `${filterItems(section.items).length} active, ${(section.items || []).filter(i => i.archived).length} archived`}
              </span>
              <button
                onClick={() => setEditingSection(editingSection === section.id ? null : section.id)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Edit section"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteSection(section.id)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                title="Delete section"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  // Ensure section is expanded
                  if (!expandedSections.has(section.id)) {
                    const newExpanded = new Set(expandedSections)
                    newExpanded.add(section.id)
                    setExpandedSections(newExpanded)
                  }
                  setShowItemForm({ sectionId: section.id, item: null })
                }}
                className="px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </div>

          {editingSection === section.id && (
            <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="space-y-3">
                <input
                  type="text"
                  defaultValue={section.name}
                  onBlur={e => {
                    if (e.target.value !== section.name) {
                      handleUpdateSection(section.id, { name: e.target.value })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
                <textarea
                  defaultValue={section.description}
                  onBlur={e => {
                    if (e.target.value !== (section.description || '')) {
                      handleUpdateSection(section.id, { description: e.target.value })
                    }
                  }}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}

          {expandedSections.has(section.id) && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              {showItemForm?.sectionId === section.id ? (
                <div className="p-4">
                  <MenuItemForm
                    item={showItemForm.item}
                    sectionId={section.id}
                    menuId={menuId}
                    onSave={item => {
                      setShowItemForm(null)
                      onRefresh()
                    }}
                    onCancel={() => setShowItemForm(null)}
                  />
                </div>
              ) : (
                <MenuItemList
                  items={filterItems(section.items)}
                  sectionId={section.id}
                  menuId={menuId}
                  onRefresh={onRefresh}
                  onEdit={item => setShowItemForm({ sectionId: section.id, item })}
                />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
