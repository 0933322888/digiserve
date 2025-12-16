'use client'

import React from 'react'
import { Square, Circle, LayoutTemplate, Armchair, Type } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useFloorPlan } from './FloorPlanContext'

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
        type: 'wall',
        width: 15,
        height: 120,
        icon: LayoutTemplate,
        name: 'Wall'
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

    const handleAddObject = (template) => {
        // Calculate center of visible canvas (approximately)
        // Ideally we use the pan offset to center it
        const centerX = Math.abs(state.pan.x) + 400
        const centerY = Math.abs(state.pan.y) + 300

        const newObj = {
            id: uuidv4(),
            type: template.type,
            shape: template.shape || 'rect',
            x: 100, // Defautl top-left
            y: 100,
            width: template.width,
            height: template.height,
            rotation: 0,
            label: template.label || '',
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
                {TEMPLATES.map((template, i) => (
                    <button
                        key={i}
                        onClick={() => handleAddObject(template)}
                        className="flex items-center w-full p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors group text-left"
                    >
                        <div className="p-2 bg-white rounded border border-gray-200 text-gray-600 group-hover:text-primary transition-colors">
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
