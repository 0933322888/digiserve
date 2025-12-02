import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getSession } from '@/lib/auth-service'
import { getUserModel, getMenuModel } from '@/lib/db/models'
import connectDB from '@/lib/db/mongodb-connection'

/**
 * POST /api/onboarding/menu
 * Save initial menu items
 */
export async function POST(request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { tenantId, items } = body

        if (!tenantId || !items) {
            return NextResponse.json(
                { error: 'Tenant ID and items are required' },
                { status: 400 }
            )
        }

        await connectDB()
        const User = getUserModel()
        const Menu = getMenuModel()

        // Verify user has access to this tenant
        const user = await User.findOne({ email: session.email })
        if (!user || !user.tenantIds.includes(tenantId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Check if menu already exists
        let menu = await Menu.findOne({ barId: tenantId })

        const sections = []

        // Add food section if items exist
        if (items.food && items.food.length > 0) {
            sections.push({
                id: 'food-section',
                name: 'Food',
                description: 'Our delicious food offerings',
                items: items.food.map(item => ({
                    id: item.id || uuidv4(),
                    name: item.name,
                    description: item.description || '',
                    price: item.price,
                    dietary: [],
                    unavailable: false,
                    archived: false,
                })),
            })
        }

        // Add drinks section if items exist
        if (items.drinks && items.drinks.length > 0) {
            sections.push({
                id: 'drinks-section',
                name: 'Drinks',
                description: 'Refreshing beverages',
                items: items.drinks.map(item => ({
                    id: item.id || uuidv4(),
                    name: item.name,
                    description: item.description || '',
                    price: item.price,
                    dietary: [],
                    unavailable: false,
                    archived: false,
                })),
            })
        }

        if (menu) {
            // Update existing menu
            await Menu.updateOne(
                { barId: tenantId },
                {
                    $set: {
                        sections,
                        active: true,
                    },
                }
            )
        } else {
            // Create new menu
            await Menu.create({
                id: uuidv4(),
                barId: tenantId,
                name: 'Main Menu',
                active: true,
                sections,
            })
        }

        // Update user onboarding progress
        await User.updateOne(
            { id: user.id },
            {
                $set: {
                    onboardingStatus: 'completed',
                    onboardingStep: 3,
                    updatedAt: new Date(),
                },
            }
        )

        console.log(`✅ Menu saved for tenant: ${tenantId}`)

        return NextResponse.json({
            success: true,
            message: 'Menu saved successfully',
        })
    } catch (error) {
        console.error('Menu save error:', error)
        return NextResponse.json(
            { error: 'Failed to save menu' },
            { status: 500 }
        )
    }
}
