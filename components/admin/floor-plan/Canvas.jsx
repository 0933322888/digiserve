'use client'

import React from 'react'
import { DndContext, useSensor, useSensors, PointerSensor, DragOverlay } from '@dnd-kit/core'
import { snapCenterToGrid } from '@dnd-kit/modifiers'
import { useFloorPlan } from './FloorPlanContext'
import DraggableObject from './DraggableObject'

export default function Canvas() {
    const { state, dispatch } = useFloorPlan()
    const { objects, zoom, pan, gridSize, snapToGrid } = state

    // Configure sensors to require movement to start drag (prevents accidental drags on click)
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    )

    const handleDragEnd = (event) => {
        const { active, delta } = event

        // We update the real position by applying the delta
        // Note: delta is in screen pixels, but our objects are scaled by zoom? 
        // Wait, useDraggable transform is already screen pixels.
        // We need to divide delta by zoom to get "canvas units" if the scaling is on the container?
        // Actually, DraggableObject applies zoom to position: left: obj.x * zoom
        // So the Delta is in zoomed pixels. We need to convert back to base units.

        // Simpler approach:
        // Update object.x += delta.x / zoom

        const obj = objects.find(o => o.id === active.id)
        if (!obj) return

        let newX = obj.x + (delta.x / zoom)
        let newY = obj.y + (delta.y / zoom)

        // Manual Snap Logic if modifier doesn't handle scaled snap perfectly
        if (snapToGrid) {
            newX = Math.round(newX / gridSize) * gridSize
            newY = Math.round(newY / gridSize) * gridSize
        }

        dispatch({
            type: 'UPDATE_OBJECT',
            payload: {
                id: active.id,
                updates: { x: newX, y: newY }
            }
        })
    }

    // Grid background style
    const gridStyle = {
        backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
        backgroundImage: `
          linear-gradient(to right, #ddd 1px, transparent 1px),
          linear-gradient(to bottom, #ddd 1px, transparent 1px)
      `,
        transform: `translate(${pan.x}px, ${pan.y}px)`, // Pan support
        width: '3000px', // Large canvas
        height: '2000px',
    }

    return (
        <div className="flex-1 bg-gray-50 overflow-hidden relative touch-none cursor-grab active:cursor-grabbing border border-gray-200">
            <DndContext
                sensors={sensors}
                onDragEnd={handleDragEnd}
            // modifiers={snapToGrid ? [snapCenterToGrid] : []} // Built-in snap might fight with zoom scaling
            >
                <div
                    className="absolute top-0 left-0 bg-white shadow-sm transition-transform origin-top-left"
                    style={gridStyle}
                    onMouseDown={() => dispatch({ type: 'SELECT_OBJECTS', payload: [] })} // Deselect on bg click
                >
                    {objects.map(obj => (
                        <DraggableObject
                            key={obj.id}
                            id={obj.id}
                            obj={obj}
                            isSelected={state.selectedIds.includes(obj.id)}
                        />
                    ))}
                </div>
                {/* DragOverlay could go here for smoother dragging visuals if needed */}
            </DndContext>

            {/* Zoom Indicator */}
            <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow text-xs">
                {Math.round(zoom * 100)}%
            </div>
        </div>
    )
}
