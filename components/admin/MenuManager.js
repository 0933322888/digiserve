'use client'
import { useState, useEffect } from 'react'
import MenuSectionManager from '@/components/admin/MenuSectionManager'
import { Plus, CheckCircle, Copy, MoreVertical, Edit, Trash2, Power, Printer } from 'lucide-react'

export default function MenuManager({ barId }) {
  const [menus, setMenus] = useState([])
  const [activeMenuId, setActiveMenuId] = useState(null)
  const [currentMenu, setCurrentMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showNewMenuForm, setShowNewMenuForm] = useState(false)
  const [newMenuName, setNewMenuName] = useState('')
  const [openMenuDropdown, setOpenMenuDropdown] = useState(null)
  const [editingMenuId, setEditingMenuId] = useState(null)
  const [editingMenuName, setEditingMenuName] = useState('')
  const [menuDropdownPosition, setMenuDropdownPosition] = useState({ x: 0, y: 0 })

  const fetchMenus = async () => {
    try {
      const response = await fetch('/api/admin/menus', {
        headers: { 'x-tenant-id': barId }
      })
      const data = await response.json()
      if (data.menus) {
        setMenus(data.menus)
        const activeMenu = data.menus.find(m => m.active)
        if (activeMenu) {
          setActiveMenuId(activeMenu.id)
          setCurrentMenu(activeMenu)
        } else if (data.menus.length > 0) {
          // If no active menu, use the first one
          setActiveMenuId(data.menus[0].id)
          setCurrentMenu(data.menus[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch menus:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (barId) {
      fetchMenus()
    }
  }, [barId])

  const handleMenuSelect = async menuId => {
    try {
      const response = await fetch(`/api/admin/menus/${menuId}`, {
        headers: { 'x-tenant-id': barId }
      })
      const data = await response.json()
      if (data.menu) {
        setActiveMenuId(menuId)
        setCurrentMenu(data.menu)
      }
    } catch (error) {
      console.error('Failed to fetch menu:', error)
    }
  }

  const handleActivateMenu = async menuId => {
    try {
      const response = await fetch(`/api/admin/menus/${menuId}/activate`, {
        method: 'POST',
        headers: { 'x-tenant-id': barId }
      })
      const data = await response.json()
      if (data.success) {
        await fetchMenus() // Refresh to get updated active status
      } else {
        alert('Failed to activate menu: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to activate menu:', error)
      alert('Failed to activate menu: ' + error.message)
    }
  }

  const handleCreateMenu = async () => {
    if (!newMenuName.trim()) {
      alert('Menu name is required')
      return
    }

    try {
      const response = await fetch('/api/admin/menus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': barId
        },
        body: JSON.stringify({ name: newMenuName.trim() }),
      })

      const data = await response.json()
      if (data.success) {
        setNewMenuName('')
        setShowNewMenuForm(false)
        await fetchMenus()
      } else {
        alert('Failed to create menu: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to create menu:', error)
      alert('Failed to create menu: ' + error.message)
    }
  }

  const handleRefresh = async () => {
    if (activeMenuId) {
      await handleMenuSelect(activeMenuId)
    }
  }

  const handleCloneMenu = async (menuId, menuName) => {
    const newName = prompt(`Enter a name for the cloned menu:`, `${menuName} (Copy)`)
    if (!newName || !newName.trim()) {
      return
    }

    try {
      const response = await fetch(`/api/admin/menus/${menuId}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': barId
        },
        body: JSON.stringify({ name: newName.trim() }),
      })

      const data = await response.json()
      if (data.success) {
        setOpenMenuDropdown(null)
        await fetchMenus()
        // Optionally switch to the cloned menu
        if (data.menu) {
          await handleMenuSelect(data.menu.id)
        }
      } else {
        alert('Failed to clone menu: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to clone menu:', error)
      alert('Failed to clone menu: ' + error.message)
    }
  }

  const handleDeleteMenu = async (menuId, menuName) => {
    if (!confirm(`Are you sure you want to delete "${menuName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/menus/${menuId}`, {
        method: 'DELETE',
        headers: { 'x-tenant-id': barId }
      })

      const data = await response.json()
      if (data.success) {
        setOpenMenuDropdown(null)
        await fetchMenus()
      } else {
        alert('Failed to delete menu: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to delete menu:', error)
      alert('Failed to delete menu: ' + error.message)
    }
  }

  const handleStartEditMenu = (menuId, menuName) => {
    setEditingMenuId(menuId)
    setEditingMenuName(menuName)
    setOpenMenuDropdown(null)
  }

  const handleSaveEditMenu = async menuId => {
    if (!editingMenuName.trim()) {
      alert('Menu name cannot be empty')
      return
    }

    try {
      const response = await fetch(`/api/admin/menus/${menuId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': barId
        },
        body: JSON.stringify({ name: editingMenuName.trim() }),
      })

      const data = await response.json()
      if (data.success) {
        setEditingMenuId(null)
        setEditingMenuName('')
        await fetchMenus()
      } else {
        alert('Failed to update menu: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to update menu:', error)
      alert('Failed to update menu: ' + error.message)
    }
  }

  const handleCancelEditMenu = () => {
    setEditingMenuId(null)
    setEditingMenuName('')
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Menu Management</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your menus. Each menu contains food and drinks sections. Only one menu can be
          active at a time.
        </p>
      </div>

      {/* Menu Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <nav className="-mb-px flex space-x-4 flex-wrap items-center">
            {menus.map(menu => (
              <div key={menu.id} className="relative flex items-center gap-2 group">
                {editingMenuId === menu.id ? (
                  <div className="flex items-center gap-2 py-4">
                    <input
                      type="text"
                      value={editingMenuName}
                      onChange={e => setEditingMenuName(e.target.value)}
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          handleSaveEditMenu(menu.id)
                        } else if (e.key === 'Escape') {
                          handleCancelEditMenu()
                        }
                      }}
                      className="px-2 py-1 border border-primary dark:border-gold rounded-md text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-gold"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEditMenu(menu.id)}
                      className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      title="Save"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEditMenu}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Cancel"
                    >
                      <Plus className="w-4 h-4 rotate-45" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleMenuSelect(menu.id)}
                      className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center gap-2 rounded-t-md transition-colors ${activeMenuId === menu.id
                        ? 'border-primary text-primary-text dark:border-gold  bg-primary/5 dark:bg-gold/10'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                      {menu.name}
                      {menu.active && (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      )}
                    </button>
                    <div className="relative">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          const rect = e.currentTarget.getBoundingClientRect()
                          setMenuDropdownPosition({ x: rect.right, y: rect.bottom })
                          setOpenMenuDropdown(openMenuDropdown === menu.id ? null : menu.id)
                        }}
                        className={`p-1.5 rounded-md transition-colors ${openMenuDropdown === menu.id
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:text-gray-300 dark:hover:bg-gray-800'
                          }`}
                        title="Menu options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuDropdown === menu.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenMenuDropdown(null)}
                          />
                          <div
                            className="fixed w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-[60]"
                            style={{
                              left: `${menuDropdownPosition.x - 192}px`, // 192px = w-48 width
                              top: `${menuDropdownPosition.y + 4}px`,
                            }}
                          >
                            <div className="py-1">
                              {!menu.active && (
                                <button
                                  onClick={() => {
                                    handleActivateMenu(menu.id)
                                    setOpenMenuDropdown(null)
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Power className="w-4 h-4" />
                                  Activate Menu
                                </button>
                              )}
                              <button
                                onClick={() => handleStartEditMenu(menu.id, menu.name)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Rename
                              </button>
                              <button
                                onClick={() => handleCloneMenu(menu.id, menu.name)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <Copy className="w-4 h-4" />
                                Clone Menu
                              </button>
                              <button
                                onClick={async () => {
                                  setOpenMenuDropdown(null)
                                  try {
                                    const response = await fetch(`/api/admin/menus/${menu.id}`, {
                                      headers: { 'x-tenant-id': barId }
                                    })
                                    const data = await response.json()
                                    if (data.menu && data.menu.sections) {
                                      // Use the same print logic as PrintMenuButton
                                      const printWindow = window.open('', '_blank')
                                      if (!printWindow) {
                                        alert('Please allow popups to print the menu')
                                        return
                                      }

                                      // Import siteConfig dynamically
                                      const { siteConfig } = await import('@/config/siteConfig')
                                      const restaurantName = siteConfig.restaurant.name
                                      const restaurantAddress = `${siteConfig.restaurant.address.street}, ${siteConfig.restaurant.address.city}, ${siteConfig.restaurant.address.state} ${siteConfig.restaurant.address.zip}`
                                      const restaurantPhone = siteConfig.restaurant.phone

                                      // Helper function to categorize sections as food or drinks
                                      const isDrinkSection = (sectionName) => {
                                        const drinkKeywords = ['scotch', 'cocktail', 'wine', 'beer', 'drink', 'beverage', 'spirit', 'liquor', 'sake', 'champagne', 'sparkling', 'coffee', 'tea', 'juice', 'soda', 'water']
                                        const sectionLower = sectionName.toLowerCase()
                                        return drinkKeywords.some(keyword => sectionLower.includes(keyword))
                                      }

                                      // Separate sections into food and drinks
                                      const foodSections = []
                                      const drinkSections = []

                                      data.menu.sections.forEach(section => {
                                        const items = section.items.filter(item => !item.archived)
                                        if (items.length === 0) return

                                        if (isDrinkSection(section.name)) {
                                          drinkSections.push({ ...section, items })
                                        } else {
                                          foodSections.push({ ...section, items })
                                        }
                                      })

                                      // Build HTML content (same as PrintMenuButton)
                                      let htmlContent = `
                                        <!DOCTYPE html>
                                        <html>
                                          <head>
                                            <title>${restaurantName} - Menu</title>
                                            <style>
                                              @media print {
                                                @page {
                                                  size: letter;
                                                  margin: 2in 1in 1in 1in;
                                                }
                                                body {
                                                  margin: 0;
                                                  padding: 0;
                                                }
                                                .page-break {
                                                  page-break-before: always;
                                                }
                                              }
                                              * {
                                                margin: 0;
                                                padding: 0;
                                                box-sizing: border-box;
                                              }
                                              body {
                                                font-family: 'Georgia', 'Times New Roman', serif;
                                                color: #333;
                                                line-height: 1.6;
                                                padding: 40px 30px 30px 30px;
                                                max-width: 8.5in;
                                                margin: 0 auto;
                                              }
                                              .header {
                                                text-align: center;
                                                padding-bottom: 20px;
                                                margin-bottom: 30px;
                                              }
                                              .restaurant-name {
                                                font-size: 36px;
                                                font-weight: bold;
                                                color: #8B4513;
                                                margin-bottom: 10px;
                                              }
                                              .restaurant-info {
                                                font-size: 14px;
                                                color: #666;
                                                margin-top: 10px;
                                              }
                                              .menu-title {
                                                font-size: 28px;
                                                text-align: center;
                                                margin: 30px 0;
                                                color: #8B4513;
                                              }
                                              .section {
                                                margin-bottom: 30px;
                                                page-break-inside: auto;
                                                page-break-after: avoid;
                                              }
                                              .charcuterie-section {
                                                border: 1px solid #8B4513;
                                                padding: 20px;
                                                border-radius: 8px;
                                                margin-bottom: 15px;
                                                page-break-inside: auto;
                                                page-break-after: avoid;
                                              }
                                              .section-name {
                                                font-size: 22px;
                                                font-weight: bold;
                                                color: #8B4513;
                                                border-bottom: 2px solid #8B4513;
                                                padding-bottom: 6px;
                                                margin-bottom: 15px;
                                              }
                                              .section-name.text-center {
                                                text-align: center;
                                              }
                                              .section-description {
                                                font-style: italic;
                                                color: #666;
                                                margin-bottom: 12px;
                                                font-size: 13px;
                                              }
                                              .menu-items {
                                                display: grid;
                                                grid-template-columns: 1fr 1fr;
                                                gap: 15px 20px;
                                                column-gap: 20px;
                                              }
                                              .menu-item {
                                                display: flex;
                                                flex-direction: column;
                                              }
                                              .item-header {
                                                display: flex;
                                                justify-content: space-between;
                                                align-items: flex-start;
                                                margin-bottom: 4px;
                                              }
                                              .item-info {
                                                flex: 1;
                                              }
                                              .item-name {
                                                font-size: 16px;
                                                font-weight: bold;
                                                color: #333;
                                                margin-bottom: 3px;
                                              }
                                              .item-description {
                                                font-size: 12px;
                                                line-height: 1.4;
                                              }
                                              .item-price {
                                                font-size: 16px;
                                                font-weight: bold;
                                                color: #8B4513;
                                                white-space: nowrap;
                                                text-align: right;
                                                margin-left: 10px;
                                              }
                                              .item-details {
                                                font-size: 11px;
                                                color: #888;
                                                margin-top: 3px;
                                              }
                                              .footer {
                                                text-align: center;
                                                margin-top: 40px;
                                                padding-top: 20px;
                                                border-top: 2px solid #8B4513;
                                                font-size: 12px;
                                                color: #666;
                                              }
                                            </style>
                                          </head>
                                          <body>
                                      `

                                      // Add Food sections
                                      if (foodSections.length > 0) {
                                        htmlContent += `
                                          <div class="header">
                                            <div class="restaurant-name">${restaurantName}</div>
                                          </div>
                                        `

                                        foodSections.forEach(section => {
                                          const isCharcuterie = section.name.toLowerCase().includes('charcuterie')
                                          htmlContent += `
                                            <div class="section ${isCharcuterie ? 'charcuterie-section' : ''}">
                                              <div class="section-name text-center">${section.name}</div>
                                          `
                                          htmlContent += `<div class="menu-items">`

                                          section.items.forEach(item => {
                                            const hasOptions = item.options && item.options.length > 0
                                            const price = typeof item.price === 'number'
                                              ? `$${item.price.toFixed(2)}`
                                              : item.price

                                            // Build dietary symbols
                                            const dietarySymbols = []
                                            if (item.dietary && item.dietary.length > 0) {
                                              item.dietary.forEach(diet => {
                                                const dietLower = diet.toLowerCase()
                                                if (dietLower.includes('vegetarian') || dietLower.includes('veggie')) {
                                                  dietarySymbols.push('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-left: 2px;"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>') // Vegetarian icon
                                                } else if (dietLower.includes('vegan')) {
                                                  dietarySymbols.push('VG')
                                                } else if (dietLower.includes('gluten') && dietLower.includes('free') && dietLower.includes('option')) {
                                                  dietarySymbols.push('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-left: 2px;"><path d="m2 22 10-10"/><path d="m16 8-1.17 1.17"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="m8 8-.53.53a3.5 3.5 0 0 0 0 4.94L9 15l1.53-1.53c.55-.55.88-1.25.98-1.97"/><path d="M10.91 5.26c.15-.26.34-.51.56-.73L13 3l1.53 1.53a3.5 3.5 0 0 1 .28 4.62"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="m16 16-.53.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.49 3.49 0 0 1 1.97-.98"/><path d="M18.74 13.09c.26-.15.51-.34.73-.56L21 11l-1.53-1.53a3.5 3.5 0 0 0-4.62-.28"/><line x1="2" x2="22" y1="2" y2="22"/></svg>*') // Gluten-Free Option
                                                } else if (dietLower.includes('gluten') && dietLower.includes('free')) {
                                                  dietarySymbols.push('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-left: 2px;"><path d="m2 22 10-10"/><path d="m16 8-1.17 1.17"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="m8 8-.53.53a3.5 3.5 0 0 0 0 4.94L9 15l1.53-1.53c.55-.55.88-1.25.98-1.97"/><path d="M10.91 5.26c.15-.26.34-.51.56-.73L13 3l1.53 1.53a3.5 3.5 0 0 1 .28 4.62"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="m16 16-.53.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.49 3.49 0 0 1 1.97-.98"/><path d="M18.74 13.09c.26-.15.51-.34.73-.56L21 11l-1.53-1.53a3.5 3.5 0 0 0-4.62-.28"/><line x1="2" x2="22" y1="2" y2="22"/></svg>') // Gluten-Free
                                                } else if (dietLower.includes('dairy') && dietLower.includes('free')) {
                                                  dietarySymbols.push('DF')
                                                } else if (dietLower.includes('nut') && dietLower.includes('free')) {
                                                  dietarySymbols.push('NF')
                                                }
                                              })
                                            }

                                            const symbolsText = dietarySymbols.length > 0 ? ` ${dietarySymbols.join(' ')}` : ''

                                            htmlContent += `
                                              <div class="menu-item">
                                                <div class="item-header">
                                                  <div class="item-info">
                                                    <div class="item-name">${item.name}${symbolsText}</div>
                                                  </div>
                                                  ${!hasOptions ? `<div class="item-price">${price}</div>` : ''}
                                                </div>
                                                ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
                                                ${hasOptions ? `
                                                  <div class="item-details" style="margin-top: 6px;">
                                                    ${item.options.map(option => {
                                              const optionPrice = typeof option.price === 'number'
                                                ? `$${option.price.toFixed(2)}`
                                                : option.price
                                              return `<div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 3px;">
                                                        <span>${option.name}</span>
                                                        <span style="font-weight: bold; color: #8B4513;">${optionPrice}</span>
                                                      </div>`
                                            }).join('')}
                                                  </div>
                                                ` : ''}
                                                ${item.serves ? `<div class="item-details">Serves ${item.serves}</div>` : ''}
                                                ${item.size ? `<div class="item-details">${item.size}</div>` : ''}
                                              </div>
                                            `
                                          })

                                          htmlContent += `
                                              </div>
                                            </div>
                                          `
                                        })
                                      }

                                      // Add Drinks sections on a new page
                                      if (drinkSections.length > 0) {
                                        htmlContent += `
                                          <div class="page-break">
                                        `

                                        drinkSections.forEach(section => {
                                          htmlContent += `
                                            <div class="section">
                                              <div class="section-name text-center">${section.name}</div>
                                          `

                                          htmlContent += `<div class="menu-items">`

                                          section.items.forEach(item => {
                                            const hasOptions = item.options && item.options.length > 0
                                            const price = typeof item.price === 'number'
                                              ? `$${item.price.toFixed(2)}`
                                              : item.price

                                            // Build dietary symbols
                                            const dietarySymbols = []
                                            if (item.dietary && item.dietary.length > 0) {
                                              item.dietary.forEach(diet => {
                                                const dietLower = diet.toLowerCase()
                                                if (dietLower.includes('vegetarian') || dietLower.includes('veggie')) {
                                                  dietarySymbols.push('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-left: 2px;"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>') // Vegetarian icon
                                                } else if (dietLower.includes('vegan')) {
                                                  dietarySymbols.push('VG')
                                                } else if (dietLower.includes('gluten') && dietLower.includes('free') && dietLower.includes('option')) {
                                                  dietarySymbols.push('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-left: 2px;"><path d="m2 22 10-10"/><path d="m16 8-1.17 1.17"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="m8 8-.53.53a3.5 3.5 0 0 0 0 4.94L9 15l1.53-1.53c.55-.55.88-1.25.98-1.97"/><path d="M10.91 5.26c.15-.26.34-.51.56-.73L13 3l1.53 1.53a3.5 3.5 0 0 1 .28 4.62"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="m16 16-.53.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.49 3.49 0 0 1 1.97-.98"/><path d="M18.74 13.09c.26-.15.51-.34.73-.56L21 11l-1.53-1.53a3.5 3.5 0 0 0-4.62-.28"/><line x1="2" x2="22" y1="2" y2="22"/></svg>*') // Gluten-Free Option
                                                } else if (dietLower.includes('gluten') && dietLower.includes('free')) {
                                                  dietarySymbols.push('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-left: 2px;"><path d="m2 22 10-10"/><path d="m16 8-1.17 1.17"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="m8 8-.53.53a3.5 3.5 0 0 0 0 4.94L9 15l1.53-1.53c.55-.55.88-1.25.98-1.97"/><path d="M10.91 5.26c.15-.26.34-.51.56-.73L13 3l1.53 1.53a3.5 3.5 0 0 1 .28 4.62"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="m16 16-.53.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.49 3.49 0 0 1 1.97-.98"/><path d="M18.74 13.09c.26-.15.51-.34.73-.56L21 11l-1.53-1.53a3.5 3.5 0 0 0-4.62-.28"/><line x1="2" x2="22" y1="2" y2="22"/></svg>') // Gluten-Free
                                                } else if (dietLower.includes('dairy') && dietLower.includes('free')) {
                                                  dietarySymbols.push('DF')
                                                } else if (dietLower.includes('nut') && dietLower.includes('free')) {
                                                  dietarySymbols.push('NF')
                                                }
                                              })
                                            }
                                            const symbolsText = dietarySymbols.length > 0 ? ` ${dietarySymbols.join(' ')}` : ''

                                            htmlContent += `
                                              <div class="menu-item">
                                                <div class="item-header">
                                                  <div class="item-info">
                                                    <div class="item-name">${item.name}${symbolsText}</div>
                                                  </div>
                                                  ${!hasOptions ? `<div class="item-price">${price}</div>` : ''}
                                                </div>
                                                ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
                                                ${hasOptions ? `
                                                  <div class="item-details" style="margin-top: 6px;">
                                                    ${item.options.map(option => {
                                              const optionPrice = typeof option.price === 'number'
                                                ? `$${option.price.toFixed(2)}`
                                                : option.price
                                              return `<div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 3px;">
                                                        <span>${option.name}</span>
                                                        <span style="font-weight: bold; color: #8B4513;">${optionPrice}</span>
                                                      </div>`
                                            }).join('')}
                                                  </div>
                                                ` : ''}
                                                ${item.serves ? `<div class="item-details">Serves ${item.serves}</div>` : ''}
                                                ${item.size ? `<div class="item-details">${item.size}</div>` : ''}
                                              </div>
                                            `
                                          })

                                          htmlContent += `
                                              </div>
                                            </div>
                                          `
                                        })

                                        htmlContent += `
                                          <div class="footer">
                                            <div class="dietary-legend" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 11px; color: #666;">
                                              <p><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg> = Vegetarian | <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;"><path d="m2 22 10-10"/><path d="m16 8-1.17 1.17"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="m8 8-.53.53a3.5 3.5 0 0 0 0 4.94L9 15l1.53-1.53c.55-.55.88-1.25.98-1.97"/><path d="M10.91 5.26c.15-.26.34-.51.56-.73L13 3l1.53 1.53a3.5 3.5 0 0 1 .28 4.62"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="m16 16-.53.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.49 3.49 0 0 1 1.97-.98"/><path d="M18.74 13.09c.26-.15.51-.34.73-.56L21 11l-1.53-1.53a3.5 3.5 0 0 0-4.62-.28"/><line x1="2" x2="22" y1="2" y2="22"/></svg> = Gluten-Free | <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;"><path d="m2 22 10-10"/><path d="m16 8-1.17 1.17"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="m8 8-.53.53a3.5 3.5 0 0 0 0 4.94L9 15l1.53-1.53c.55-.55.88-1.25.98-1.97"/><path d="M10.91 5.26c.15-.26.34-.51.56-.73L13 3l1.53 1.53a3.5 3.5 0 0 1 .28 4.62"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="m16 16-.53.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.49 3.49 0 0 1 1.97-.98"/><path d="M18.74 13.09c.26-.15.51-.34.73-.56L21 11l-1.53-1.53a3.5 3.5 0 0 0-4.62-.28"/><line x1="2" x2="22" y1="2" y2="22"/></svg>* = Gluten-Free Option | DF = Dairy-Free | NF = Nut-Free</p>
                                            </div>
                                          </div>
                                        </div>
                                        `
                                      }

                                      htmlContent += `
                                          </body>
                                        </html>
                                      `

                                      printWindow.document.write(htmlContent)
                                      printWindow.document.close()

                                      setTimeout(() => {
                                        printWindow.focus()
                                        printWindow.print()
                                      }, 250)
                                    } else {
                                      alert('Menu data not available for printing')
                                    }
                                  } catch (error) {
                                    console.error('Failed to fetch menu for printing:', error)
                                    alert('Failed to load menu for printing')
                                  }
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <Printer className="w-4 h-4" />
                                Print Menu
                              </button>
                              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                              <button
                                onClick={() => handleDeleteMenu(menu.id, menu.name)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Menu
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </nav>
          {!showNewMenuForm && (
            <button
              onClick={() => setShowNewMenuForm(true)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark dark:bg-gold dark:text-gray-900 dark:hover:bg-gold-light flex items-center gap-2 text-sm font-medium shadow-sm transition-all hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              New Menu
            </button>
          )}
        </div>
      </div>

      {/* New Menu Form */}
      {showNewMenuForm && (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Create New Menu</h4>
            <button
              onClick={() => {
                setShowNewMenuForm(false)
                setNewMenuName('')
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Plus className="w-5 h-5 rotate-45" />
            </button>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Menu name (e.g., Menu 2, Summer Menu)"
              value={newMenuName}
              onChange={e => setNewMenuName(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  handleCreateMenu()
                } else if (e.key === 'Escape') {
                  setShowNewMenuForm(false)
                  setNewMenuName('')
                }
              }}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent"
              autoFocus
            />
            <button
              onClick={handleCreateMenu}
              className="px-6 py-2.5 bg-primary text-white rounded-md hover:bg-primary-dark dark:bg-gold dark:text-gray-900 dark:hover:bg-gold-light font-medium transition-colors shadow-sm hover:shadow-md"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Menu Content */}
      {loading ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading menu...</div>
      ) : currentMenu ? (
        <MenuSectionManager
          sections={currentMenu.sections || []}
          menuId={currentMenu.id}
          onRefresh={handleRefresh}
        />
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No menus found. Create your first menu above
        </div>
      )}
    </div>
  )
}