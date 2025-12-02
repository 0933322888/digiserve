import crypto from 'crypto'
import { db } from './mock-db.js'

// ========== EMPLOYEES ==========

export async function getAllEmployees(barId) {
    const employees = await db.collection('employees').find()
    return barId ? employees.filter(emp => emp.barId === barId) : employees
}

export async function getEmployee(employeeId) {
    return await db.collection('employees').findOne({ id: employeeId })
}

export async function createEmployee(employeeData) {
    const newEmployee = {
        id: employeeData.id || `emp-${crypto.randomUUID().substring(0, 8)}`,
        barId: employeeData.barId,
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email,
        phone: employeeData.phone || '',
        role: employeeData.role,
        roles: employeeData.roles || [employeeData.role],
        permissions: employeeData.permissions || [],
        hireDate: employeeData.hireDate || new Date().toISOString().split('T')[0],
        status: employeeData.status || 'active',
        hourlyRate: parseFloat(employeeData.hourlyRate) || 0,
        address: employeeData.address || {},
        emergencyContact: employeeData.emergencyContact || {},
        notes: employeeData.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }

    await db.collection('employees').insertOne(newEmployee)
    return newEmployee
}

export async function updateEmployee(employeeId, updates) {
    const employee = await db.collection('employees').findOne({ id: employeeId })
    if (!employee) {
        throw new Error('Employee not found')
    }

    const updatedEmployee = {
        ...employee,
        ...updates,
        updatedAt: new Date().toISOString(),
    }

    await db.collection('employees').updateOne({ id: employeeId }, updatedEmployee)
    return updatedEmployee
}

export async function deleteEmployee(employeeId) {
    const result = await db.collection('employees').deleteOne({ id: employeeId })
    if (!result) {
        throw new Error('Employee not found')
    }
    return true
}

// ========== ROLES ==========

export async function getAllRoles() {
    return await db.collection('roles').find()
}

export async function getRole(roleId) {
    return await db.collection('roles').findOne({ id: roleId })
}

export async function createRole(roleData) {
    const newRole = {
        id: roleData.id || roleData.name.toLowerCase().replace(/\s+/g, '_'),
        name: roleData.name,
        description: roleData.description || '',
        permissions: roleData.permissions || [],
        defaultHourlyRate: parseFloat(roleData.defaultHourlyRate) || 0,
        color: roleData.color || '#6B7280',
    }

    await db.collection('roles').insertOne(newRole)
    return newRole
}

export async function updateRole(roleId, updates) {
    const role = await db.collection('roles').findOne({ id: roleId })
    if (!role) {
        throw new Error('Role not found')
    }

    const updatedRole = {
        ...role,
        ...updates,
    }

    await db.collection('roles').updateOne({ id: roleId }, updatedRole)
    return updatedRole
}

export async function deleteRole(roleId) {
    const result = await db.collection('roles').deleteOne({ id: roleId })
    if (!result) {
        throw new Error('Role not found')
    }
    return true
}

// ========== SHIFTS ==========

export async function getShifts(barId, startDate, endDate) {
    const query = {}

    if (barId) {
        query.barId = barId
    }

    if (startDate || endDate) {
        query.startTime = {}
        if (startDate) {
            query.startTime.$gte = new Date(startDate).toISOString()
        }
        if (endDate) {
            query.startTime.$lte = new Date(endDate).toISOString()
        }
    }

    const shifts = await db.collection('shifts').find(query)
    return shifts.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
}

export async function getShift(shiftId) {
    return await db.collection('shifts').findOne({ id: shiftId })
}

export async function createShift(shiftData) {
    const employee = await getEmployee(shiftData.employeeId)

    const newShift = {
        id: shiftData.id || `shift-${crypto.randomUUID().substring(0, 8)}`,
        barId: shiftData.barId,
        employeeId: shiftData.employeeId,
        employeeName: employee ? `${employee.firstName} ${employee.lastName}` : '',
        role: shiftData.role || employee?.role || '',
        location: shiftData.location || 'serving', // 'kitchen', 'bar', 'serving'
        startTime: shiftData.startTime,
        endTime: shiftData.endTime,
        breakDuration: parseInt(shiftData.breakDuration) || 0,
        status: shiftData.status || 'scheduled',
        notes: shiftData.notes || '',
        createdAt: new Date().toISOString(),
        createdBy: shiftData.createdBy || 'admin',
    }

    await db.collection('shifts').insertOne(newShift)
    return newShift
}

export async function updateShift(shiftId, updates) {
    const shift = await db.collection('shifts').findOne({ id: shiftId })
    if (!shift) {
        throw new Error('Shift not found')
    }

    // Update employee name if employee changed
    if (updates.employeeId && updates.employeeId !== shift.employeeId) {
        const employee = await getEmployee(updates.employeeId)
        if (employee) {
            updates.employeeName = `${employee.firstName} ${employee.lastName}`
        }
    }

    const updatedShift = {
        ...shift,
        ...updates,
    }

    await db.collection('shifts').updateOne({ id: shiftId }, updatedShift)
    return updatedShift
}

export async function deleteShift(shiftId) {
    const result = await db.collection('shifts').deleteOne({ id: shiftId })
    if (!result) {
        throw new Error('Shift not found')
    }
    return true
}

// ========== TIME ENTRIES ==========

export async function getTimeEntries(barId, employeeId, startDate, endDate) {
    const query = {}

    if (barId) {
        query.barId = barId
    }
    if (employeeId) {
        query.employeeId = employeeId
    }

    if (startDate || endDate) {
        query.clockIn = {}
        if (startDate) {
            query.clockIn.$gte = new Date(startDate).toISOString()
        }
        if (endDate) {
            query.clockIn.$lte = new Date(endDate).toISOString()
        }
    }

    const entries = await db.collection('timeEntries').find(query)
    return entries.sort((a, b) => new Date(b.clockIn) - new Date(a.clockIn))
}

export async function clockIn(employeeId, barId, shiftId = null) {
    const employee = await getEmployee(employeeId)

    // Check if already clocked in
    const activeEntry = await db.collection('timeEntries').findOne({
        employeeId,
        status: 'active'
    })

    if (activeEntry) {
        throw new Error('Employee is already clocked in')
    }

    const newEntry = {
        id: `entry-${crypto.randomUUID().substring(0, 8)}`,
        barId,
        employeeId,
        employeeName: employee ? `${employee.firstName} ${employee.lastName}` : '',
        shiftId,
        clockIn: new Date().toISOString(),
        clockOut: null,
        breakStart: null,
        breakEnd: null,
        breakDuration: 0,
        totalHours: 0,
        regularHours: 0,
        overtimeHours: 0,
        status: 'active',
        notes: '',
        createdAt: new Date().toISOString(),
    }

    await db.collection('timeEntries').insertOne(newEntry)
    return newEntry
}

export async function clockOut(employeeId) {
    const entry = await db.collection('timeEntries').findOne({
        employeeId,
        status: 'active'
    })

    if (!entry) {
        throw new Error('No active time entry found')
    }

    const clockOutTime = new Date()
    const clockInTime = new Date(entry.clockIn)
    const breakDuration = entry.breakDuration || 0

    // Calculate total hours (in minutes, then convert to hours)
    const totalMinutes = (clockOutTime - clockInTime) / (1000 * 60) - breakDuration
    const totalHours = totalMinutes / 60

    // Calculate regular and overtime (assuming 8 hours = regular, rest is overtime)
    const regularHours = Math.min(totalHours, 8)
    const overtimeHours = Math.max(0, totalHours - 8)

    const updatedEntry = {
        ...entry,
        clockOut: clockOutTime.toISOString(),
        totalHours: parseFloat(totalHours.toFixed(2)),
        regularHours: parseFloat(regularHours.toFixed(2)),
        overtimeHours: parseFloat(overtimeHours.toFixed(2)),
        status: 'completed',
    }

    await db.collection('timeEntries').updateOne({ id: entry.id }, updatedEntry)
    return updatedEntry
}

export async function startBreak(employeeId) {
    const entry = await db.collection('timeEntries').findOne({
        employeeId,
        status: 'active'
    })

    if (!entry) {
        throw new Error('No active time entry found')
    }

    if (entry.breakStart) {
        throw new Error('Break already started')
    }

    const updatedEntry = {
        ...entry,
        breakStart: new Date().toISOString(),
    }

    await db.collection('timeEntries').updateOne({ id: entry.id }, updatedEntry)
    return updatedEntry
}

export async function endBreak(employeeId) {
    const entry = await db.collection('timeEntries').findOne({
        employeeId,
        status: 'active'
    })

    if (!entry) {
        throw new Error('No active time entry found')
    }

    if (!entry.breakStart) {
        throw new Error('No break started')
    }

    const breakEndTime = new Date()
    const breakStartTime = new Date(entry.breakStart)
    const breakMinutes = (breakEndTime - breakStartTime) / (1000 * 60)
    const existingBreak = entry.breakDuration || 0

    const updatedEntry = {
        ...entry,
        breakEnd: breakEndTime.toISOString(),
        breakDuration: existingBreak + Math.round(breakMinutes),
        breakStart: null
    }

    await db.collection('timeEntries').updateOne({ id: entry.id }, updatedEntry)
    return updatedEntry
}

// ========== SHIFT REQUESTS ==========

export async function getShiftRequests(barId, status = null) {
    const query = {}

    if (barId) {
        query.barId = barId
    }
    if (status) {
        query.status = status
    }

    const requests = await db.collection('shiftRequests').find(query)
    return requests.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))
}

export async function createShiftRequest(requestData) {
    const employee = await getEmployee(requestData.employeeId)

    let targetEmployeeName = null
    if (requestData.targetEmployeeId) {
        const targetEmployee = await getEmployee(requestData.targetEmployeeId)
        if (targetEmployee) {
            targetEmployeeName = `${targetEmployee.firstName} ${targetEmployee.lastName}`
        }
    }

    const newRequest = {
        id: requestData.id || `req-${crypto.randomUUID().substring(0, 8)}`,
        barId: requestData.barId,
        employeeId: requestData.employeeId,
        employeeName: employee ? `${employee.firstName} ${employee.lastName}` : '',
        type: requestData.type, // 'time_off' or 'shift_swap'
        startDate: requestData.startDate,
        endDate: requestData.endDate,
        shiftId: requestData.shiftId || null,
        targetEmployeeId: requestData.targetEmployeeId || null,
        targetEmployeeName,
        reason: requestData.reason || '',
        status: 'pending',
        requestedAt: new Date().toISOString(),
        reviewedBy: null,
        reviewedAt: null,
        notes: '',
    }

    await db.collection('shiftRequests').insertOne(newRequest)
    return newRequest
}

export async function updateShiftRequest(requestId, updates) {
    const request = await db.collection('shiftRequests').findOne({ id: requestId })
    if (!request) {
        throw new Error('Request not found')
    }

    const updatedRequest = {
        ...request,
        ...updates,
        reviewedAt: updates.status && updates.status !== 'pending' ? new Date().toISOString() : request.reviewedAt,
    }

    await db.collection('shiftRequests').updateOne({ id: requestId }, updatedRequest)
    return updatedRequest
}

// ========== PAYROLL ==========

export async function calculatePayroll(barId, startDate, endDate) {
    const entries = await getTimeEntries(barId, null, startDate, endDate)
    const employees = await getAllEmployees(barId)

    const payroll = {}

    entries.forEach(entry => {
        if (entry.status !== 'completed') return

        const employee = employees.find(e => e.id === entry.employeeId)
        if (!employee) return

        if (!payroll[entry.employeeId]) {
            payroll[entry.employeeId] = {
                employeeId: entry.employeeId,
                employeeName: entry.employeeName,
                hourlyRate: employee.hourlyRate,
                totalHours: 0,
                regularHours: 0,
                overtimeHours: 0,
                regularPay: 0,
                overtimePay: 0,
                totalPay: 0,
                entries: [],
            }
        }

        payroll[entry.employeeId].totalHours += entry.totalHours || 0
        payroll[entry.employeeId].regularHours += entry.regularHours || 0
        payroll[entry.employeeId].overtimeHours += entry.overtimeHours || 0
        payroll[entry.employeeId].entries.push(entry)
    })

    // Calculate pay
    Object.keys(payroll).forEach(empId => {
        const emp = payroll[empId]
        emp.regularPay = emp.regularHours * emp.hourlyRate
        emp.overtimePay = emp.overtimeHours * emp.hourlyRate * 1.5 // 1.5x for overtime
        emp.totalPay = emp.regularPay + emp.overtimePay
    })

    return Object.values(payroll)
}
