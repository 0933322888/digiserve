import crypto from 'crypto'
import { db } from './mock-db.js'

/**
 * Get all menus data
 */
async function getAllMenus() {
    // The JSON adapter returns the array directly if configured with dataPath
    const menus = await db.collection('menus').find()
    return { menus }
}

/**
 * Get active menu
 */
export async function getActiveMenu() {
    const menus = await db.collection('menus').find({ active: true })
    return menus.length > 0 ? menus[0] : null
}

/**
 * Get menu by ID
 */
export async function getMenu(menuId) {
    return await db.collection('menus').findOne({ id: menuId })
}

/**
 * Get all menus
 */
export async function getAllMenusList() {
    return await db.collection('menus').find()
}

/**
 * Create a new menu
 */
export async function createMenu(menuData) {
    const newMenu = {
        id: menuData.id || `menu-${crypto.randomUUID()}`,
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
export async function updateMenu(menuId, updates) {
    const result = await db.collection('menus').updateOne({ id: menuId }, { $set: updates })
    if (result.matchedCount === 0) {
        throw new Error('Menu not found')
    }
    return await getMenu(menuId)
}

/**
 * Activate a menu (deactivates all others)
 */
export async function activateMenu(menuId) {
    const menu = await getMenu(menuId)
    if (!menu) {
        throw new Error('Menu not found')
    }

    // Deactivate all menus
    await db.collection('menus').updateMany({}, { active: false })

    // Activate the specific menu
    await db.collection('menus').updateOne({ id: menuId }, { active: true })

    return { ...menu, active: true }
}

/**
 * Clone a menu
 */
export async function cloneMenu(menuId, newName) {
    const sourceMenu = await getMenu(menuId)
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
export async function deleteMenu(menuId) {
    const allMenus = await db.collection('menus').find()
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
        await db.collection('menus').replaceMany(remaining)
    } else {
        await db.collection('menus').deleteOne({ id: menuId })
    }

    return true
}

/**
 * Get all sections for a menu
 */
export async function getSections(menuId) {
    const menu = await getMenu(menuId)
    return menu ? menu.sections || [] : []
}

/**
 * Get a specific section by ID
 */
export async function getSection(menuId, sectionId) {
    const sections = await getSections(menuId)
    return sections.find(s => s.id === sectionId)
}

/**
 * Get a menu item by ID (searches across all sections)
 */
export async function getMenuItem(menuId, itemId) {
    const sections = await getSections(menuId)
    for (const section of sections) {
        const item = section.items?.find(i => i.id === itemId)
        if (item) {
            return { item, sectionId: section.id }
        }
    }
    return null
}

/**
 * Create a new section
 */
export async function createSection(menuId, sectionData) {
    const menu = await getMenu(menuId)
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

    // Update the menu with the new section
    await db.collection('menus').updateOne({ id: menuId }, { sections: menu.sections })

    return newSection
}

/**
 * Update a section
 */
export async function updateSection(menuId, sectionId, updates) {
    const menu = await getMenu(menuId)
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

    await db.collection('menus').updateOne({ id: menuId }, { sections: menu.sections })
    return menu.sections[sectionIndex]
}

/**
 * Delete a section
 */
export async function deleteSection(menuId, sectionId) {
    const menu = await getMenu(menuId)
    if (!menu) {
        throw new Error('Menu not found')
    }

    const filteredSections = menu.sections.filter(s => s.id !== sectionId)
    if (filteredSections.length === menu.sections.length) {
        throw new Error('Section not found')
    }

    await db.collection('menus').updateOne({ id: menuId }, { sections: filteredSections })
    return true
}

/**
 * Add a menu item to a section
 */
export async function createMenuItem(menuId, sectionId, itemData) {
    const menu = await getMenu(menuId)
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
        dietary: itemData.dietary || [],
        serves: itemData.serves || null,
        size: itemData.size || null,
        options: itemData.options || [],
        unavailable: itemData.unavailable || false,
        archived: itemData.archived || false,
    }

    menu.sections[sectionIndex].items.push(newItem)

    await db.collection('menus').updateOne({ id: menuId }, { sections: menu.sections })
    return newItem
}

/**
 * Update a menu item
 */
export async function updateMenuItem(menuId, sectionId, itemId, updates) {
    const menu = await getMenu(menuId)
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

    menu.sections[sectionIndex].items[itemIndex] = {
        ...menu.sections[sectionIndex].items[itemIndex],
        ...updates,
    }

    await db.collection('menus').updateOne({ id: menuId }, { sections: menu.sections })
    return menu.sections[sectionIndex].items[itemIndex]
}

/**
 * Delete a menu item
 */
export async function deleteMenuItem(menuId, sectionId, itemId) {
    const menu = await getMenu(menuId)
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

    await db.collection('menus').updateOne({ id: menuId }, { sections: menu.sections })
    return true
}

/**
 * Toggle unavailable status of a menu item
 */
export async function toggleMenuItemUnavailable(menuId, sectionId, itemId) {
    const menu = await getMenu(menuId)
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

    await db.collection('menus').updateOne({ id: menuId }, { sections: menu.sections })
    return menu.sections[sectionIndex].items[itemIndex]
}

/**
 * Move a menu item to a different section
 */
export async function moveMenuItem(menuId, itemId, fromSectionId, toSectionId) {
    const menu = await getMenu(menuId)
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

    await db.collection('menus').updateOne({ id: menuId }, { sections: menu.sections })
    return item
}

/**
 * Toggle archive status of a menu item
 */
export async function toggleMenuItemArchive(menuId, sectionId, itemId) {
    const menu = await getMenu(menuId)
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

    await db.collection('menus').updateOne({ id: menuId }, { sections: menu.sections })
    return menu.sections[sectionIndex].items[itemIndex]
}
