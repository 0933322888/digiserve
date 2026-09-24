import { NextResponse } from 'next/server'
import { getSections, createSection, updateSection, deleteSection } from '@/lib/menu-service'

/**
 * GET /api/admin/menu/[menuType]/sections
 * Get all sections for a menu type
 */
export async function GET(request, context) {
  try {
    const { menuType } = await context.params

    if (!['food', 'drinks'].includes(menuType)) {
      return NextResponse.json(
        { error: 'Invalid menu type. Must be "food" or "drinks"' },
        { status: 400 }
      )
    }

    const sections = await getSections(menuType)
    return NextResponse.json({ sections })
  } catch (error) {
    console.error('Get sections error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get sections' }, { status: 500 })
  }
}

/**
 * POST /api/admin/menu/[menuType]/sections
 * Create a new section
 */
export async function POST(request, context) {
  try {
    const { menuType } = await context.params
    const body = await request.json()
    const { name, description, id } = body

    if (!['food', 'drinks'].includes(menuType)) {
      return NextResponse.json(
        { error: 'Invalid menu type. Must be "food" or "drinks"' },
        { status: 400 }
      )
    }

    if (!name) {
      return NextResponse.json({ error: 'Section name is required' }, { status: 400 })
    }

    const section = await createSection(menuType, { id, name, description })
    return NextResponse.json({ success: true, section })
  } catch (error) {
    console.error('Create section error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create section' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/menu/[menuType]/sections
 * Update a section
 */
export async function PUT(request, context) {
  try {
    const { menuType } = await context.params
    const body = await request.json()
    const { sectionId, ...updates } = body

    if (!['food', 'drinks'].includes(menuType)) {
      return NextResponse.json(
        { error: 'Invalid menu type. Must be "food" or "drinks"' },
        { status: 400 }
      )
    }

    if (!sectionId) {
      return NextResponse.json({ error: 'sectionId is required' }, { status: 400 })
    }

    const section = await updateSection(menuType, sectionId, updates)
    return NextResponse.json({ success: true, section })
  } catch (error) {
    console.error('Update section error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update section' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/menu/[menuType]/sections
 * Delete a section
 */
export async function DELETE(request, context) {
  try {
    const { menuType } = await context.params
    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get('sectionId')

    if (!['food', 'drinks'].includes(menuType)) {
      return NextResponse.json(
        { error: 'Invalid menu type. Must be "food" or "drinks"' },
        { status: 400 }
      )
    }

    if (!sectionId) {
      return NextResponse.json({ error: 'sectionId is required' }, { status: 400 })
    }

    await deleteSection(menuType, sectionId)
    return NextResponse.json({ success: true, message: 'Section deleted successfully' })
  } catch (error) {
    console.error('Delete section error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete section' },
      { status: 500 }
    )
  }
}
