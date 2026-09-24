import { NextResponse } from 'next/server'
import { getTenantFromRequest } from '@/lib/tenant-service'
import { getFloorPlanModel } from '@/lib/db/models'
import connectDB from '@/lib/db/mongodb-connection'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request) {
    try {
        const barId = await getTenantFromRequest(request)
        if (!barId) {
            return NextResponse.json({ error: 'Tenant context required' }, { status: 400 })
        }

        await connectDB()
        const FloorPlan = getFloorPlanModel()

        // Fetch all floors for this tenant, sorted by order
        let floors = await FloorPlan.find({ barId }).sort({ order: 1 }).lean()

        // Auto-create default 'Main' floor if none exist
        if (floors.length === 0) {
            const defaultFloor = await FloorPlan.create({
                id: crypto.randomUUID(),
                barId,
                name: 'Main',
                order: 1,
                dimensions: { width: 800, height: 600 },
                objects: []
            })
            floors = [defaultFloor.toObject()]
        }

        // Transform _id to id string for frontend
        const serializedFloors = floors.map(floor => ({
            ...floor,
            id: floor.id || floor._id.toString(),
            _id: undefined
        }))

        return NextResponse.json({ floors: serializedFloors })
    } catch (error) {
        console.error('Error fetching floor plans:', error)
        return NextResponse.json({ error: 'Failed to fetch floor plans' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const barId = await getTenantFromRequest(request)
        if (!barId) {
            return NextResponse.json({ error: 'Tenant context required' }, { status: 400 })
        }

        const body = await request.json()
        const { name, dimensions } = body

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        await connectDB()
        const FloorPlan = getFloorPlanModel()

        // Get highest order to append new floor at end
        const lastFloor = await FloorPlan.findOne({ barId }).sort({ order: -1 })
        const newOrder = (lastFloor?.order || 0) + 1

        const newFloor = await FloorPlan.create({
            id: crypto.randomUUID(), // Explicit ID generator
            barId,
            name,
            order: newOrder,
            dimensions: dimensions || { width: 800, height: 600 },
            objects: []
        })

        return NextResponse.json({
            success: true,
            floor: {
                ...newFloor.toObject(),
                id: newFloor.id,
                _id: undefined
            }
        })
    } catch (error) {
        console.error('Error creating floor plan:', error)
        return NextResponse.json({ error: 'Failed to create floor plan' }, { status: 500 })
    }
}
