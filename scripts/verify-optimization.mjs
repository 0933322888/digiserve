import { getShifts, getTimeEntries, getShiftRequests, clockIn, clockOut } from './temp-staff-service.js'
import { activateMenu, getActiveMenu } from './temp-menu-service.js'
import { db } from './mock-db.js'

async function verifyOptimization() {
    console.log('Starting optimization verification...')

    try {
        // 1. Verify Menu Optimization
        console.log('\n--- Verifying Menu Optimization ---')
        const activeMenuBefore = await getActiveMenu()
        console.log('Active menu before:', activeMenuBefore?.name || 'None')

        // Create a dummy menu if none exists
        let menuId = activeMenuBefore?.id
        if (!menuId) {
            console.log('Creating dummy menu for testing...')
            const newMenu = {
                id: 'test-menu-' + Date.now(),
                name: 'Test Menu',
                active: false,
                sections: []
            }
            await db.collection('menus').insertOne(newMenu)
            menuId = newMenu.id
        }

        console.log(`Activating menu ${menuId}...`)
        await activateMenu(menuId)

        const activeMenuAfter = await getActiveMenu()
        console.log('Active menu after:', activeMenuAfter?.name)

        if (activeMenuAfter?.id === menuId) {
            console.log('✅ Menu activation successful')
        } else {
            console.error('❌ Menu activation failed')
        }

        // 2. Verify Staff Service Optimization
        console.log('\n--- Verifying Staff Service Optimization ---')

        // Create dummy data
        const barId = 'test-bar'
        const employeeId = 'test-emp-' + Date.now()

        // Create employee
        await db.collection('employees').insertOne({
            id: employeeId,
            barId,
            firstName: 'Test',
            lastName: 'User',
            role: 'server'
        })

        // Create shift
        const shiftId = 'test-shift-' + Date.now()
        await db.collection('shifts').insertOne({
            id: shiftId,
            barId,
            employeeId,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 8 * 3600000).toISOString(),
            status: 'scheduled'
        })

        // Test getShifts
        console.log('Testing getShifts...')
        const shifts = await getShifts(barId)
        console.log(`Found ${shifts.length} shifts for bar ${barId}`)
        if (shifts.some(s => s.id === shiftId)) {
            console.log('✅ getShifts returned created shift')
        } else {
            console.error('❌ getShifts failed to return created shift')
        }

        // Test clockIn
        console.log('Testing clockIn...')
        try {
            await clockIn(employeeId, barId, shiftId)
            console.log('✅ clockIn successful')
        } catch (e) {
            console.error('❌ clockIn failed:', e.message)
        }

        // Test getTimeEntries
        console.log('Testing getTimeEntries...')
        const entries = await getTimeEntries(barId, employeeId)
        console.log(`Found ${entries.length} entries for employee`)
        if (entries.some(e => e.status === 'active')) {
            console.log('✅ getTimeEntries returned active entry')
        } else {
            console.error('❌ getTimeEntries failed to return active entry')
        }

        // Test clockOut
        console.log('Testing clockOut...')
        try {
            await clockOut(employeeId)
            console.log('✅ clockOut successful')
        } catch (e) {
            console.error('❌ clockOut failed:', e.message)
        }

        // Test getShiftRequests
        console.log('Testing getShiftRequests...')
        const requestId = 'test-req-' + Date.now()
        await db.collection('shiftRequests').insertOne({
            id: requestId,
            barId,
            employeeId,
            status: 'pending',
            requestedAt: new Date().toISOString()
        })

        const requests = await getShiftRequests(barId, 'pending')
        console.log(`Found ${requests.length} pending requests`)
        if (requests.some(r => r.id === requestId)) {
            console.log('✅ getShiftRequests returned created request')
        } else {
            console.error('❌ getShiftRequests failed to return created request')
        }

        console.log('\nVerification complete!')

        // Cleanup (optional, but good for repeated runs)
        // await db.collection('menus').deleteOne({ id: menuId })
        // await db.collection('employees').deleteOne({ id: employeeId })
        // await db.collection('shifts').deleteOne({ id: shiftId })
        // await db.collection('timeEntries').deleteMany({ employeeId })
        // await db.collection('shiftRequests').deleteOne({ id: requestId })

    } catch (error) {
        console.error('Verification failed:', error)
    }
}

verifyOptimization()
