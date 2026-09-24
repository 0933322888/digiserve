'use client'

import React, { useRef, useEffect, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { ResizableBox } from 'react-resizable'
import { useFloorPlan } from './FloorPlanContext'
import { Trash2, RotateCw, Edit2 } from 'lucide-react'

// Styles for resizable handles
import 'react-resizable/css/styles.css'

export default function DraggableObject({ id, obj, isSelected }) {
    const { state, dispatch } = useFloorPlan()
    const { zoom, snapToGrid, gridSize } = state

    // DND Kit hook for dragging
    // We use obj.x/y as initial position, but DND kit manages transforms during drag
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: { ...obj, isCanvasObject: true },
    })

    // Calculate final position including drag transform
    // The transform is only present *during* drag. 
    // We update actual state onDragEnd in parent Canvas.
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    // Handle Resize
    const onResize = (e, { size }) => {
        // Prevent DND dragging during resize
        e.stopPropagation()
    }

    const onResizeStop = (e, { size, handle }) => {
        let newX = obj.x
        let newY = obj.y

        // Adjust position when resizing from west (left) or north (top) sides
        const deltaW = size.width - (obj.width * zoom)
        const deltaH = size.height - (obj.height * zoom)

        if (handle.includes('w')) {
            newX -= deltaW / zoom
        }
        if (handle.includes('n')) {
            newY -= deltaH / zoom
        }

        dispatch({
            type: 'UPDATE_OBJECT',
            payload: {
                id: id,
                updates: {
                    x: newX,
                    y: newY,
                    width: size.width / zoom,
                    height: size.height / zoom
                }
            }
        })
    }

    // Handle Rotate
    const onRotate = (e) => {
        e.stopPropagation()
        // Increment 45 deg
        const newRotation = (obj.rotation + 45) % 360
        dispatch({
            type: 'UPDATE_OBJECT',
            payload: {
                id: id,
                updates: { rotation: newRotation }
            }
        })
    }

    // Handle Delete
    const onDelete = (e) => {
        e.stopPropagation()
        dispatch({ type: 'REMOVE_OBJECTS', payload: [id] })
    }

    // Handle Edit Label
    const onEditLabel = (e) => {
        e.stopPropagation()
        const newLabel = prompt("Enter text label:", obj.label || '')
        if (newLabel !== null) {
            dispatch({
                type: 'UPDATE_OBJECT',
                payload: {
                    id: id,
                    updates: { label: newLabel }
                }
            })
        }
    }

    // Handle Select
    const onMouseDown = (e) => {
        // Prevent clearing selection from canvas background listener
        e.stopPropagation()
        dispatch({ type: 'SELECT_OBJECTS', payload: [id] })
    }

    // Visual Styles based on Type
    const getObjectStyles = () => {
        const base = "flex items-center justify-center border-2 transition-colors relative"
        let specific = ""

        switch (obj.type) {
            case 'table':
                specific = obj.shape === 'circle'
                    ? "rounded-full bg-white border-gray-800"
                    : "rounded-md bg-white border-gray-800"
                break
            case 'wall':
                specific = "bg-gray-800 border-gray-900"
                break
            case 'stool':
                specific = "rounded-full bg-gray-200 border-gray-400"
                break
            case 'text':
                specific = "bg-transparent border-transparent"
                break
            default:
                specific = "bg-blue-100 border-blue-300"
        }

        if (isSelected) specific += " ring-2 ring-primary ring-offset-2 z-10"

        return `${base} ${specific}`
    }

    // Apply rotation to the inner content, not the drag wrapper (to avoid axis confusion)
    const rotationStyle = {
        transform: `rotate(${obj.rotation}deg)`,
        width: '100%',
        height: '100%',
    }

    // Positioning helper for resize handle coordinates
    const getHandlePositionStyle = (handleAxis) => {
        const base = {
            position: 'absolute',
            width: '12px',
            height: '12px',
            backgroundColor: '#2563eb', // Vivid blue
            border: '2px solid white',
            borderRadius: '50%',
            zIndex: 100,
            cursor: `${handleAxis}-resize`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }

        switch (handleAxis) {
            case 'se': return { ...base, bottom: '-6px', right: '-6px' }
            case 'sw': return { ...base, bottom: '-6px', left: '-6px' }
            case 'ne': return { ...base, top: '-6px', right: '-6px' }
            case 'nw': return { ...base, top: '-6px', left: '-6px' }
            case 'e':  return { ...base, top: 'calc(50% - 6px)', right: '-6px' }
            case 'w':  return { ...base, top: 'calc(50% - 6px)', left: '-6px' }
            case 's':  return { ...base, bottom: '-6px', left: 'calc(50% - 6px)' }
            case 'n':  return { ...base, top: '-6px', left: 'calc(50% - 6px)' }
            default:   return base
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={{
                position: 'absolute',
                left: obj.x * zoom,
                top: obj.y * zoom,
                ...style, // Drag transform
                zIndex: isSelected || isDragging ? 50 : 1,
                touchAction: 'none' // For DND
            }}
            onMouseDown={onMouseDown}
        >
            <ResizableBox
                width={obj.width * zoom}
                height={obj.height * zoom}
                onResize={onResize}
                onResizeStop={onResizeStop}
                draggableOpts={{ grid: [gridSize * zoom, gridSize * zoom] }}
                minConstraints={obj.type === 'wall' ? [10 * zoom, 10 * zoom] : [20 * zoom, 20 * zoom]}
                maxConstraints={[1000 * zoom, 1000 * zoom]}
                resizeHandles={isSelected ? ['sw', 'se', 'nw', 'ne', 'w', 'e', 'n', 's'] : []}
                handle={(handleAxis, ref) => (
                    <span
                        ref={ref}
                        onMouseDown={(e) => e.stopPropagation()}
                        className={`react-resizable-handle react-resizable-handle-${handleAxis}`}
                        style={getHandlePositionStyle(handleAxis)}
                    />
                )}
            >
                <div
                    {...listeners}
                    {...attributes}
                    className={getObjectStyles()}
                    style={rotationStyle}
                >
                    {obj.type === 'table' && <span className="font-bold text-sm pointer-events-none select-none">{obj.label}</span>}
                    {obj.type === 'text' && (
                        <span 
                            onDoubleClick={onEditLabel}
                            className="text-xl font-bold select-none cursor-text px-1 rounded hover:bg-gray-100/50"
                            title="Double-click to edit text"
                        >
                            {obj.label || 'Text Label'}
                        </span>
                    )}

                    {/* Controls Overlay - Only show if selected */}
                    {isSelected && (
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex gap-1 bg-white shadow-md rounded p-1 z-50">
                            {(obj.type === 'text' || obj.type === 'table') && (
                                <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={onEditLabel}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-700"
                                    title="Edit Text / Label"
                                >
                                    <Edit2 size={14} />
                                </button>
                            )}
                            <button
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={onRotate}
                                className="p-1 hover:bg-gray-100 rounded text-gray-700"
                                title="Rotate"
                            >
                                <RotateCw size={14} />
                            </button>
                            <button
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={onDelete}
                                className="p-1 hover:bg-red-50 rounded text-red-600"
                                title="Delete"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </ResizableBox>
        </div>
    )
}
