import { NextResponse } from 'next/server'
import { getTenantFromRequest } from '@/lib/tenant-service'
import { getFloorPlanModel } from '@/lib/db/models'
import connectDB from '@/lib/db/mongodb-connection'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function PUT(request, context) {
    try {
        const barId = await getTenantFromRequest(request)
        if (!barId) {
            return NextResponse.json({ error: 'Tenant context required' }, { status: 400 })
        }

        const { id } = await context.params
        const body = await request.json()
        const { name, objects, dimensions } = body

        console.log(`[API] Updating Floor Plan: ${id}`, {
            barId,
            objectCount: objects?.length,
            firstObject: objects?.[0],
            dimensions
        })

        await connectDB()
        const FloorPlan = getFloorPlanModel()

        const updateData = {}
        if (name) updateData.name = name
        // Ensure objects is an array before setting
        if (Array.isArray(objects)) {
            updateData.objects = objects
        }
        if (dimensions) updateData.dimensions = dimensions
        updateData.updatedAt = new Date()

        // Find by 'id' (UUID string)
        const updatedFloor = await FloorPlan.findOneAndUpdate(
            { barId, id: id },
            { $set: updateData },
            { new: true }
        ).lean()

        console.log('[API] Update query result:', updatedFloor ? 'FOUND' : 'NOT FOUND')
        if (updatedFloor) {
            console.log('[API] Saved objects count:', updatedFloor.objects?.length)
        }

        if (!updatedFloor) {
            return NextResponse.json({ error: 'Floor plan not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            floor: {
                ...updatedFloor,
                id: updatedFloor.id || updatedFloor._id.toString(),
                _id: undefined
            }
        })

    } catch (error) {
        console.error('Error updating floor plan:', error)
        return NextResponse.json({ error: 'Failed to update floor plan' }, { status: 500 })
    }
}

export async function DELETE(request, context) {
    try {
        const barId = await getTenantFromRequest(request)
        if (!barId) {
            return NextResponse.json({ error: 'Tenant context required' }, { status: 400 })
        }

        const { id } = await context.params

        await connectDB()
        const FloorPlan = getFloorPlanModel()

        const result = await FloorPlan.deleteOne({
            barId,
            id: id
        })

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Floor plan not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error deleting floor plan:', error)
        return NextResponse.json({ error: 'Failed to delete floor plan' }, { status: 500 })
    }
}
