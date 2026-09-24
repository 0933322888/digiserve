import { getTenantFromRequest } from '@/lib/tenant-service'
import { getFloorPlanModel } from '@/lib/db/models'
import connectDB from '@/lib/db/mongodb-connection'
import FloorPlanEditor from '@/components/admin/floor-plan/FloorPlanEditor'
import { headers } from 'next/headers'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

async function getFloors(barId) {
    try {
        await connectDB()
        const FloorPlan = getFloorPlanModel()
        let floors = await FloorPlan.find({ barId }).sort({ order: 1 }).lean()

        // If tenant has no floors created yet, auto-create default 'Main' floor
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

        return floors.map(floor => ({
            ...floor,
            id: floor.id || floor._id.toString(),
            _id: undefined,
            objects: floor.objects || []
        }))
    } catch (error) {
        console.error('Error fetching floors:', error)
        return []
    }
}

export default async function FloorPlanPage() {
    const headersList = await headers()
    const barId = headersList.get('x-tenant-id') // Middleware injection

    if (!barId) {
        return <div className="p-8">Error: Tenant context missing. Please contact support.</div>
    }

    const floors = await getFloors(barId)

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden">
            {/* Use full height minus header */}
            <FloorPlanEditor initialFloors={floors} />
        </div>
    )
}
