import { NextResponse } from 'next/server'
import { getSections, createSection, updateSection, deleteSection, reorderSections } from '@/lib/menu-service'

/**
 * GET /api/admin/menus/[menuId]/sections
 * Get all sections for a menu
 */
export async function GET(request, { params }) {
  try {
    const { menuId } = params
    const sections = await getSections(menuId)
    console.log(`[API] GET /api/admin/menus/${menuId}/sections found ${sections.length} sections`)
    return NextResponse.json({ sections })
  } catch (error) {
    console.error('Get sections error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get sections' }, { status: 500 })
  }
}

/**
 * POST /api/admin/menus/[menuId]/sections
 * Create a new section
 */
export async function POST(request, { params }) {
  try {
    const { menuId } = params
    const body = await request.json()
    const { name, description, id } = body

    if (!name) {
      return NextResponse.json({ error: 'Section name is required' }, { status: 400 })
    }

    const section = await createSection(menuId, { id, name, description })
    console.log(`[API] POST /api/admin/menus/${menuId}/sections created: ${section.id}`)
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
 * PUT /api/admin/menus/[menuId]/sections
 * Update a section
 */
export async function PUT(request, { params }) {
  try {
    const { menuId } = params
    const body = await request.json()
    const { sectionId, ...updates } = body

    if (!sectionId) {
      return NextResponse.json({ error: 'sectionId is required' }, { status: 400 })
    }

    const section = await updateSection(menuId, sectionId, updates)
    console.log(`[API] PUT /api/admin/menus/${menuId}/sections updated: ${sectionId}`)
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
 * DELETE /api/admin/menus/[menuId]/sections
 * Delete a section
 */
export async function DELETE(request, { params }) {
  try {
    const { menuId } = params
    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get('sectionId')

    if (!sectionId) {
      return NextResponse.json({ error: 'sectionId is required' }, { status: 400 })
    }

    await deleteSection(menuId, sectionId)
    console.log(`[API] DELETE /api/admin/menus/${menuId}/sections deleted: ${sectionId}`)
    return NextResponse.json({ success: true, message: 'Section deleted successfully' })
  } catch (error) {
    console.error('Delete section error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete section' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/menus/[menuId]/sections
 * Reorder sections
 */
export async function PATCH(request, { params }) {
  try {
    const { menuId } = params
    const body = await request.json()
    const { sectionIds } = body

    if (!sectionIds || !Array.isArray(sectionIds)) {
      return NextResponse.json(
        { error: 'sectionIds array is required' },
        { status: 400 }
      )
    }

    const sections = await reorderSections(menuId, sectionIds)
    console.log(`[API] PATCH /api/admin/menus/${menuId}/sections reordered`)
    return NextResponse.json({ success: true, sections })
  } catch (error) {
    console.error('Reorder sections error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reorder sections' },
      { status: 500 }
    )
  }
}
