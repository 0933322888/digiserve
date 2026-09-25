'use client'

import React, { useState } from 'react'
import { Square, Circle, LayoutTemplate, Armchair, Type, ChevronDown, ChevronRight } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useFloorPlan } from './FloorPlanContext'

// Wall options
const WALL_OPTIONS = [
    {
        type: 'wall',
        width: 120,
        height: 15,
        rotation: 0,
        name: 'Horizontal Wall'
    },
    {
        type: 'wall',
        width: 15,
        height: 120,
        rotation: 0,
        name: 'Vertical Wall'
    },
    {
        type: 'wall',
        width: 120,
        height: 15,
        rotation: 45,
        name: 'Diagonal ↘ (45°)'
    },
    {
        type: 'wall',
        width: 120,
        height: 15,
        rotation: 135,
        name: 'Diagonal ↙ (135°)'
    }
]

// Draggable templates
const TEMPLATES = [
    {
        type: 'table',
        shape: 'rect',
        width: 80,
        height: 80,
        label: 'T1',
        icon: Square,
        name: 'Square Table'
    },
    {
        type: 'table',
        shape: 'circle',
        width: 80,
        height: 80,
        label: 'T2',
        icon: Circle,
        name: 'Round Table'
    },
    {
        type: 'stool',
        width: 40,
        height: 40,
        icon: Armchair,
        name: 'Stool'
    },
    {
        type: 'text',
        width: 100,
        height: 40,
        label: 'Bar Area',
        icon: Type,
        name: 'Text Label'
    }
]

export default function Toolbox() {
    const { dispatch, state } = useFloorPlan()
    const [isWallsExpanded, setIsWallsExpanded] = useState(false)

    const handleAddObject = (template) => {
        // Calculate center of visible canvas (approximately)
        // Ideally we use the pan offset to center it
        const centerX = Math.abs(state.pan.x) + 400
        const centerY = Math.abs(state.pan.y) + 300

        let computedLabel = template.label || ''

        if (template.type === 'table') {
            // Find highest table index among existing tables
            let maxTableIndex = 0
            state.objects.forEach(obj => {
                if (obj.type === 'table' && obj.label) {
                    // Extract numeric part from labels like "T1", "T2", "Table 3", "5"
                    const match = obj.label.match(/\d+/)
                    if (match) {
                        const num = parseInt(match[0], 10)
                        if (!isNaN(num) && num > maxTableIndex) {
                            maxTableIndex = num
                        }
                    }
                }
            })

            computedLabel = `T${maxTableIndex + 1}`
        }

        const newObj = {
            id: uuidv4(),
            type: template.type,
            shape: template.shape || 'rect',
            x: 0, // Default top-left
            y: 0,
            width: template.width,
            height: template.height,
            rotation: template.rotation !== undefined ? template.rotation : 0,
            label: computedLabel,
            capacity: 4,
            status: 'available'
        }

        dispatch({ type: 'ADD_OBJECT', payload: newObj })
    }

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col z-20 shadow-sm">
            <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Toolbox</h2>
                <p className="text-xs text-gray-500 mt-1">Click to add items</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Tables, Stools, Labels */}
                {TEMPLATES.slice(0, 2).map((template, i) => (
                    <button
                        key={i}
                        onClick={() => handleAddObject(template)}
                        className="flex items-center w-full p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors group text-left"
                    >
                        <div className="p-2 bg-white rounded border border-gray-200 text-gray-600 group-hover:text-primary-text transition-colors">
                            <template.icon size={20} />
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-700">{template.name}</span>
                    </button>
                ))}

                {/* Expandable Walls Section */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <button
                        onClick={() => setIsWallsExpanded(!isWallsExpanded)}
                        className="flex items-center justify-between w-full p-3 hover:bg-gray-100 transition-colors text-left"
                    >
                        <div className="flex items-center">
                            <div className="p-2 bg-white rounded border border-gray-200 text-gray-600">
                                <LayoutTemplate size={20} />
                            </div>
                            <span className="ml-3 text-sm font-medium text-gray-700">Walls</span>
                        </div>
                        {isWallsExpanded ? (
                            <ChevronDown size={18} className="text-gray-500" />
                        ) : (
                            <ChevronRight size={18} className="text-gray-500" />
                        )}
                    </button>

                    {isWallsExpanded && (
                        <div className="p-2 space-y-1.5 border-t border-gray-200 bg-white">
                            {WALL_OPTIONS.map((wall, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleAddObject(wall)}
                                    className="flex items-center w-full p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 text-xs font-medium text-gray-700 transition-colors text-left"
                                >
                                    <span className="w-2 h-2 rounded-full bg-gray-600 mr-2.5"></span>
                                    {wall.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Remaining items (Stool, Text Label) */}
                {TEMPLATES.slice(2).map((template, i) => (
                    <button
                        key={i}
                        onClick={() => handleAddObject(template)}
                        className="flex items-center w-full p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors group text-left"
                    >
                        <div className="p-2 bg-white rounded border border-gray-200 text-gray-600 group-hover:text-primary-text transition-colors">
                            <template.icon size={20} />
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-700">{template.name}</span>
                    </button>
                ))}
            </div>

            <div className="p-4 border-t border-gray-200 text-xs text-gray-400">
                <p>Tip: Selected items can be rotated or deleted.</p>
            </div>
        </div>
    )
}
