'use client'

import React, { useEffect, useState } from 'react'
import { FloorPlanProvider, useFloorPlan } from './FloorPlanContext'
import Canvas from './Canvas'
import Toolbox from './Toolbox'
import { Save, Undo, Redo, ZoomIn, ZoomOut, Grid, Plus, Trash } from 'lucide-react'
import toast from 'react-hot-toast'

function TopBar({ floors, onCreateFloor, onDeleteFloor, onUpdateFloor }) {
    const { state, dispatch } = useFloorPlan()

    // Save Logic
    const handleSave = async () => {
        if (!state.currentFloorId) return

        const toastId = toast.loading('Saving...')
        try {
            const res = await fetch(`/api/admin/floor-plans/${state.currentFloorId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    objects: state.objects,
                    dimensions: { width: 800, height: 600 } // Should be dynamic
                })
            })

            if (!res.ok) throw new Error('Failed to save')

            // Sync updated objects back to parent floors array state
            onUpdateFloor({
                ...floors.find(f => f.id === state.currentFloorId),
                id: state.currentFloorId,
                objects: state.objects
            })

            dispatch({ type: 'SAVE_SUCCESS' })
            toast.success('Saved floor plan', { id: toastId })
        } catch (error) {
            toast.error('Failed to save', { id: toastId })
        }
    }

    return (
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30">
            <div className="flex items-center space-x-4">
                <h1 className="text-lg font-bold text-gray-800">Floor Plan</h1>

                {/* Floor Selector */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                    {floors.map(floor => (
                        <button
                            key={floor.id}
                            onClick={() => dispatch({ type: 'SELECT_FLOOR', payload: floor.id })}
                            className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${state.currentFloorId === floor.id
                                ? 'bg-white shadow text-gray-900'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {floor.name}
                        </button>
                    ))}
                    <button
                        onClick={onCreateFloor}
                        className="px-2 py-1 ml-1 text-gray-500 hover:text-primary-text transition-colors hover:bg-white rounded-md"
                        title="Add Floor"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="flex items-center bg-gray-50 rounded-lg p-1 mr-4 border border-gray-100">
                    <button
                        onClick={() => dispatch({ type: 'UNDO' })}
                        disabled={state.history.length === 0}
                        className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 transition-colors"
                    >
                        <Undo size={18} />
                    </button>
                    <button
                        onClick={() => dispatch({ type: 'REDO' })}
                        disabled={state.future.length === 0}
                        className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 transition-colors"
                    >
                        <Redo size={18} />
                    </button>
                </div>

                <div className="flex items-center bg-gray-50 rounded-lg p-1 mr-4 border border-gray-100">
                    <button
                        onClick={() => dispatch({ type: 'SET_ZOOM', payload: Math.max(0.2, state.zoom - 0.1) })}
                        className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 transition-colors"
                    >
                        <ZoomOut size={18} />
                    </button>
                    <span className="text-xs text-mono w-12 text-center text-gray-500">{Math.round(state.zoom * 100)}%</span>
                    <button
                        onClick={() => dispatch({ type: 'SET_ZOOM', payload: Math.min(2, state.zoom + 0.1) })}
                        className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 transition-colors"
                    >
                        <ZoomIn size={18} />
                    </button>
                </div>

                <button
                    onClick={() => dispatch({ type: 'TOGGLE_SNAP' })}
                    className={`p-2 rounded-lg border transition-colors ${state.snapToGrid
                        ? 'bg-blue-50 border-blue-200 text-blue-600'
                        : 'bg-white border-gray-200 text-gray-400'
                        }`}
                    title="Snap to Grid"
                >
                    <Grid size={18} />
                </button>

                {state.currentFloorId && (
                    <button
                        onClick={onDeleteFloor}
                        className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors ml-2"
                        title="Delete Floor"
                    >
                        <Trash size={18} />
                    </button>
                )}

                <div className="h-6 w-px bg-gray-200 mx-2"></div>

                <button
                    onClick={handleSave}
                    disabled={!state.isDirty}
                    className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                >
                    <Save size={18} className="mr-2" />
                    Save Changes
                </button>
            </div>
        </div>
    )
}

function EditorContent({ initialFloors }) {
    const { state, dispatch } = useFloorPlan()
    const [floors, setFloors] = useState(initialFloors)

    // Initial Load
    useEffect(() => {
        dispatch({ type: 'SET_FLOORS', payload: floors })
        if (floors.length > 0 && !state.currentFloorId) {
            dispatch({ type: 'SELECT_FLOOR', payload: floors[0].id })
            // Also set objects for the first floor
            dispatch({ type: 'SET_OBJECTS', payload: floors[0].objects || [] })
        }
    }, [dispatch, floors])

    // Fetch Objects when switching floors
    useEffect(() => {
        if (!state.currentFloorId) return

        const floor = floors.find(f => f.id === state.currentFloorId)
        if (floor) {
            // Keep local state in sync when switching floors
            dispatch({ type: 'SET_OBJECTS', payload: floor.objects || [] })
        }
    }, [state.currentFloorId])

    const handleCreateFloor = async () => {
        const name = prompt("Enter floor name (e.g., 'Patio'):")
        if (!name) return

        try {
            // First update current floor objects in local state before creating new one
            const updatedFloors = floors.map(f =>
                f.id === state.currentFloorId ? { ...f, objects: state.objects } : f
            )

            const res = await fetch('/api/admin/floor-plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            })
            if (res.ok) {
                const data = await res.json()
                const newFloors = [...updatedFloors, data.floor]
                setFloors(newFloors)
                dispatch({ type: 'SET_FLOORS', payload: newFloors })
                dispatch({ type: 'SELECT_FLOOR', payload: data.floor.id })
                dispatch({ type: 'SET_OBJECTS', payload: [] })
                toast.success('Floor created')
            }
        } catch (e) {
            toast.error('Failed to create floor')
        }
    }

    const handleDeleteFloor = async () => {
        if (!confirm('Are you sure you want to delete this floor?')) return
        try {
            const res = await fetch(`/api/admin/floor-plans/${state.currentFloorId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                const newFloors = floors.filter(f => f.id !== state.currentFloorId)
                setFloors(newFloors)
                if (newFloors.length > 0) {
                    dispatch({ type: 'SELECT_FLOOR', payload: newFloors[0].id })
                } else {
                    dispatch({ type: 'SELECT_FLOOR', payload: null })
                    dispatch({ type: 'SET_OBJECTS', payload: [] })
                }
                toast.success('Floor deleted')
            }
        } catch (e) {
            toast.error('Failed to delete floor')
        }
    }

    const handleUpdateFloor = (updatedFloor) => {
        setFloors(prevFloors =>
            prevFloors.map(f => f.id === updatedFloor.id ? updatedFloor : f)
        )
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <TopBar
                floors={floors}
                onCreateFloor={handleCreateFloor}
                onDeleteFloor={handleDeleteFloor}
                onUpdateFloor={handleUpdateFloor}
            />
            <div className="flex flex-1 overflow-hidden">
                <Toolbox />
                <div className="flex-1 flex flex-col relative overflow-hidden">
                    <Canvas />
                </div>
                {/* Optional: Right Sidebar / Properties Panel could go here */}
            </div>
        </div>
    )
}

export default function FloorPlanEditor({ initialFloors = [] }) {
    return (
        <FloorPlanProvider>
            <EditorContent initialFloors={initialFloors} />
        </FloorPlanProvider>
    )
}
