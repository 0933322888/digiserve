import crypto from 'crypto'
import { db } from './db/index.js'

/**
 * Get all menus data
 */
async function getAllMenus(barId) {
  if (!barId) return { menus: [] }
  // The JSON adapter returns the array directly if configured with dataPath
  const menus = await db.collection('menus').find({ barId })
  return { menus }
}

/**
 * Get active menu
 */
export async function getActiveMenu(barId) {
  if (!barId) return null
  const menus = await db.collection('menus').find({ active: true, barId })
  return menus.length > 0 ? menus[0] : null
}

/**
 * Get menu by ID
 */
export async function getMenu(barId, menuId) {
  if (!barId) return null
  return await db.collection('menus').findOne({ id: menuId, barId })
}

/**
 * Get all menus
 */
export async function getAllMenusList(barId) {
  if (!barId) return []
  return await db.collection('menus').find({ barId })
}

/**
 * Create a new menu
 */
export async function createMenu(barId, menuData) {
  if (!barId) throw new Error('barId is required')

  const newMenu = {
    id: menuData.id || `menu-${crypto.randomUUID()}`,
    barId,
    name: menuData.name || 'New Menu',
    active: false, // New menus are inactive by default
    sections: [],
  }

  await db.collection('menus').insertOne(newMenu)
  return newMenu
}

/**
 * Update a menu
 */
export async function updateMenu(barId, menuId, updates) {
  const result = await db.collection('menus').updateOne({ id: menuId, barId }, { $set: updates })
  if (result.matchedCount === 0) {
    throw new Error('Menu not found')
  }
  return await getMenu(barId, menuId)
}

/**
 * Activate a menu (deactivates all others)
 */
export async function activateMenu(barId, menuId) {
  const menu = await getMenu(barId, menuId)
  if (!menu) {
    throw new Error('Menu not found')
  }

  // Deactivate all menus for this tenant
  await db.collection('menus').updateMany({ barId }, { active: false })

  // Activate the specific menu
  await db.collection('menus').updateOne({ id: menuId, barId }, { active: true })

  return { ...menu, active: true }
}

/**
 * Clone a menu
 */
export async function cloneMenu(barId, menuId, newName) {
  const sourceMenu = await getMenu(barId, menuId)
  if (!sourceMenu) {
    throw new Error('Menu not found')
  }

  // Deep clone the menu sections and items
  const clonedSections = sourceMenu.sections.map(section => ({
    ...section,
    id: `section-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`,
    items: (section.items || []).map(item => ({
      ...item,
      id: `item-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`,
    })),
  }))

  const newMenu = {
    id: `menu-${crypto.randomUUID()}`,
    barId,
    name: newName || `${sourceMenu.name} (Copy)`,
    active: false, // Cloned menus are inactive by default
    sections: clonedSections,
  }

  await db.collection('menus').insertOne(newMenu)
  return newMenu
}

/**
 * Delete a menu
 */
export async function deleteMenu(barId, menuId) {
  const allMenus = await db.collection('menus').find({ barId })
  const menuToDelete = allMenus.find(m => m.id === menuId)

  if (!menuToDelete) {
    throw new Error('Menu not found')
  }

  if (allMenus.length === 1) {
    throw new Error('Cannot delete the last menu')
  }

  // If deleting the active menu, activate the first remaining menu
  if (menuToDelete.active) {
    const remaining = allMenus.filter(m => m.id !== menuId)
    if (remaining.length > 0) {
      remaining[0].active = true
    }
    // We need to write this change
    // Note: replaceMany is not standard MongoDB, using updateOne loop or bulkWrite
    // Assuming db adapter handles replaceMany or we do it manually
    // For safety, let's just update the new active one
    if (remaining.length > 0) {
      await db.collection('menus').updateOne({ id: remaining[0].id, barId }, { active: true })
    }
    await db.collection('menus').deleteOne({ id: menuId, barId })
  } else {
    await db.collection('menus').deleteOne({ id: menuId, barId })
  }

  return true
}

/**
 * Get all sections for a menu
 */
export async function getSections(barId, menuId) {
  const menu = await getMenu(barId, menuId)
  return menu ? menu.sections || [] : []
}

/**
 * Get a specific section by ID
 */
export async function getSection(barId, menuId, sectionId) {
  const sections = await getSections(barId, menuId)
  return sections.find(s => s.id === sectionId)
}

/**
 * Get a menu item by ID (searches across all sections)
 */
export async function getMenuItem(barId, menuId, itemId) {
  const sections = await getSections(barId, menuId)
  for (const section of sections) {
    const item = section.items?.find(i => i.id === itemId)
    if (item) {
      return { item, sectionId: section.id }
    }
  }
  return null
}

/**
 * Clean sections data by removing MongoDB _id fields
 */
function cleanSections(sections) {
  if (!Array.isArray(sections)) return []

  return sections.map(section => {
    const cleanedSection = {
      id: section.id,
      name: section.name,
      description: section.description || '',
      items: (section.items || []).map(item => {
        const cleanedItem = {
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          image: item.image || '',
          dietary: item.dietary || [],
          serves: item.serves || null,
          size: item.size || null,
          options: item.options || [],
          unavailable: item.unavailable || false,
          archived: item.archived || false,
        }
        return cleanedItem
      }),
    }
    return cleanedSection
  })
}

/**
 * Create a new section
 */
export async function createSection(barId, menuId, sectionData) {
  const menu = await getMenu(barId, menuId)
  if (!menu) {
    throw new Error('Menu not found')
  }

  if (!menu.sections) {
    menu.sections = []
  }

  const newSection = {
    id: sectionData.id || `section-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`,
    name: sectionData.name,
    description: sectionData.description || '',
    items: [],
  }

  menu.sections.push(newSection)

  // Clean sections before saving to remove MongoDB _id fields
  const cleanedSections = cleanSections(menu.sections)

  // Update the menu with the new section
  await db.collection('menus').updateOne({ id: menuId, barId }, { $set: { sections: cleanedSections } })

  return newSection
}

/**
 * Update a section
 */
export async function updateSection(barId, menuId, sectionId, updates) {
  const menu = await getMenu(barId, menuId)
  if (!menu) {
    throw new Error('Menu not found')
  }

  const sectionIndex = menu.sections.findIndex(s => s.id === sectionId)
  if (sectionIndex === -1) {
    throw new Error('Section not found')
  }

  menu.sections[sectionIndex] = {
    ...menu.sections[sectionIndex],
    ...updates,
  }

  // Clean sections before saving to remove MongoDB _id fields
  const cleanedSections = cleanSections(menu.sections)

  await db.collection('menus').updateOne({ id: menuId, barId }, { $set: { sections: cleanedSections } })
  return menu.sections[sectionIndex]
}

/**
 * Delete a section
 */
export async function deleteSection(barId, menuId, sectionId) {
  const menu = await getMenu(barId, menuId)
  if (!menu) {
    throw new Error('Menu not found')
  }

  const filteredSections = menu.sections.filter(s => s.id !== sectionId)
  if (filteredSections.length === menu.sections.length) {
    throw new Error('Section not found')
  }

  // Clean sections before saving to remove MongoDB _id fields
  const cleanedSections = cleanSections(filteredSections)

  await db.collection('menus').updateOne({ id: menuId, barId }, { $set: { sections: cleanedSections } })
  return true
}

/**
 * Reorder sections
 */
export async function reorderSections(barId, menuId, sectionIds) {
  const menu = await getMenu(barId, menuId)
  if (!menu) {
    throw new Error('Menu not found')
  }

  // Validate that all section IDs exist
  const existingSectionIds = menu.sections.map(s => s.id)
  const invalidIds = sectionIds.filter(id => !existingSectionIds.includes(id))
  if (invalidIds.length > 0) {
    throw new Error(`Invalid section IDs: ${invalidIds.join(', ')}`)
  }

  // Validate that all sections are included
  if (sectionIds.length !== menu.sections.length) {
    throw new Error('All sections must be included in the reorder')
  }

  // Reorder sections based on the provided order
  const reorderedSections = sectionIds.map(id => {
    const section = menu.sections.find(s => s.id === id)
    if (!section) {
      throw new Error(`Section ${id} not found`)
    }
    return section
  })

  // Clean sections before saving to remove MongoDB _id fields
  const cleanedSections = cleanSections(reorderedSections)

  await db.collection('menus').updateOne({ id: menuId, barId }, { $set: { sections: cleanedSections } })
  return cleanedSections
}

/**
 * Add a menu item to a section
 */
export async function createMenuItem(barId, menuId, sectionId, itemData) {
  const menu = await getMenu(barId, menuId)
  if (!menu) {
    throw new Error('Menu not found')
  }

  const sectionIndex = menu.sections.findIndex(s => s.id === sectionId)
  if (sectionIndex === -1) {
    throw new Error('Section not found')
  }

  if (!menu.sections[sectionIndex].items) {
    menu.sections[sectionIndex].items = []
  }

  const newItem = {
    id: itemData.id || `item-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`,
    name: itemData.name,
    description: itemData.description || '',
    price: parseFloat(itemData.price) || 0,
    image: itemData.image || '',
    dietary: itemData.dietary || [],
    serves: itemData.serves || null,
    size: itemData.size || null,
    options: itemData.options || [],
    unavailable: itemData.unavailable || false,
    archived: itemData.archived || false,
  }

  menu.sections[sectionIndex].items.push(newItem)

  // Clean sections before saving to remove MongoDB _id fields
  const cleanedSections = cleanSections(menu.sections)

  await db.collection('menus').updateOne({ id: menuId, barId }, { $set: { sections: cleanedSections } })
  return newItem
}

/**
 * Update a menu item
 */
export async function updateMenuItem(barId, menuId, sectionId, itemId, updates) {
  const menu = await getMenu(barId, menuId)
  if (!menu) {
    throw new Error('Menu not found')
  }

  const sectionIndex = menu.sections.findIndex(s => s.id === sectionId)
  if (sectionIndex === -1) {
    throw new Error('Section not found')
  }

  const itemIndex = menu.sections[sectionIndex].items.findIndex(i => i.id === itemId)
  if (itemIndex === -1) {
    throw new Error('Menu item not found')
  }

  // Handle price conversion
  if (updates.price !== undefined) {
    updates.price = parseFloat(updates.price) || 0
  }

  // Handle options price conversion
  if (updates.options) {
    updates.options = updates.options.map(opt => ({
      ...opt,
      price: parseFloat(opt.price) || 0,
    }))
  }

  // Merge updates with existing item
  menu.sections[sectionIndex].items[itemIndex] = {
    ...menu.sections[sectionIndex].items[itemIndex],
    ...updates,
  }

  // Clean sections before saving to remove MongoDB _id fields
  const cleanedSections = cleanSections(menu.sections)

  await db.collection('menus').updateOne({ id: menuId, barId }, { $set: { sections: cleanedSections } })
  return menu.sections[sectionIndex].items[itemIndex]
}

/**
 * Delete a menu item
 */
export async function deleteMenuItem(barId, menuId, sectionId, itemId) {
  const menu = await getMenu(barId, menuId)
  if (!menu) {
    throw new Error('Menu not found')
  }

  const sectionIndex = menu.sections.findIndex(s => s.id === sectionId)
  if (sectionIndex === -1) {
    throw new Error('Section not found')
  }

  const filteredItems = menu.sections[sectionIndex].items.filter(i => i.id !== itemId)
  if (filteredItems.length === menu.sections[sectionIndex].items.length) {
    throw new Error('Menu item not found')
  }

  menu.sections[sectionIndex].items = filteredItems

  // Clean sections before saving to remove MongoDB _id fields
  const cleanedSections = cleanSections(menu.sections)

  await db.collection('menus').updateOne({ id: menuId, barId }, { $set: { sections: cleanedSections } })
  return true
}

/**
 * Toggle unavailable status of a menu item
 */
export async function toggleMenuItemUnavailable(barId, menuId, sectionId, itemId) {
  const menu = await getMenu(barId, menuId)
  if (!menu) {
    throw new Error('Menu not found')
  }

  const sectionIndex = menu.sections.findIndex(s => s.id === sectionId)
  if (sectionIndex === -1) {
    throw new Error('Section not found')
  }

  const itemIndex = menu.sections[sectionIndex].items.findIndex(i => i.id === itemId)
  if (itemIndex === -1) {
    throw new Error('Menu item not found')
  }

  const currentStatus = menu.sections[sectionIndex].items[itemIndex].unavailable || false
  menu.sections[sectionIndex].items[itemIndex].unavailable = !currentStatus

  // Clean sections before saving to remove MongoDB _id fields
  const cleanedSections = cleanSections(menu.sections)

  await db.collection('menus').updateOne({ id: menuId, barId }, { $set: { sections: cleanedSections } })
  return menu.sections[sectionIndex].items[itemIndex]
}

/**
 * Move a menu item to a different section
 */
export async function moveMenuItem(barId, menuId, itemId, fromSectionId, toSectionId) {
  const menu = await getMenu(barId, menuId)
  if (!menu) {
    throw new Error('Menu not found')
  }

  const fromSectionIndex = menu.sections.findIndex(s => s.id === fromSectionId)
  const toSectionIndex = menu.sections.findIndex(s => s.id === toSectionId)

  if (fromSectionIndex === -1 || toSectionIndex === -1) {
    throw new Error('Section not found')
  }

  const itemIndex = menu.sections[fromSectionIndex].items.findIndex(i => i.id === itemId)
  if (itemIndex === -1) {
    throw new Error('Menu item not found')
  }

  const item = menu.sections[fromSectionIndex].items[itemIndex]

  // Remove from old section
  menu.sections[fromSectionIndex].items.splice(itemIndex, 1)

  // Add to new section
  if (!menu.sections[toSectionIndex].items) {
    menu.sections[toSectionIndex].items = []
  }
  menu.sections[toSectionIndex].items.push(item)

  // Clean sections before saving to remove MongoDB _id fields
  const cleanedSections = cleanSections(menu.sections)

  await db.collection('menus').updateOne({ id: menuId, barId }, { $set: { sections: cleanedSections } })
  return item
}

/**
 * Toggle archive status of a menu item
 */
export async function toggleMenuItemArchive(barId, menuId, sectionId, itemId) {
  const menu = await getMenu(barId, menuId)
  if (!menu) {
    throw new Error('Menu not found')
  }

  const sectionIndex = menu.sections.findIndex(s => s.id === sectionId)
  if (sectionIndex === -1) {
    throw new Error('Section not found')
  }

  const itemIndex = menu.sections[sectionIndex].items.findIndex(i => i.id === itemId)
  if (itemIndex === -1) {
    throw new Error('Menu item not found')
  }

  const currentStatus = menu.sections[sectionIndex].items[itemIndex].archived || false
  menu.sections[sectionIndex].items[itemIndex].archived = !currentStatus

  // Clean sections before saving to remove MongoDB _id fields
  const cleanedSections = cleanSections(menu.sections)

  await db.collection('menus').updateOne({ id: menuId, barId }, { $set: { sections: cleanedSections } })
  return menu.sections[sectionIndex].items[itemIndex]
}
