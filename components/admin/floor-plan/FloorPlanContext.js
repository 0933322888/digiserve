'use client'

import React, { createContext, useContext, useReducer, useCallback } from 'react'

const FloorPlanContext = createContext(null)

const initialState = {
    floors: [],
    currentFloorId: null,
    objects: [], // Objects for the current floor
    selectedIds: [],
    history: [], // Past states for Undo
    future: [],  // Future states for Redo
    zoom: 1,
    pan: { x: 0, y: 0 },
    gridSize: 20,
    snapToGrid: true,
    isDirty: false, // Has unsaved changes
}

function floorPlanReducer(state, action) {
    switch (action.type) {
        case 'SET_FLOORS':
            return { ...state, floors: action.payload }

        case 'SELECT_FLOOR':
            // detailed logic to switch floor would go here (or be handled by effect)
            return {
                ...state,
                currentFloorId: action.payload,
                selectedIds: [],
                history: [],
                future: []
            }

        case 'SET_OBJECTS':
            return {
                ...state,
                objects: action.payload,
                // Clear history on initial load? No, usually we want to keep it if merely updating.
                // But if we are loading a new floor, history is cleared in SELECT_FLOOR
            }

        case 'UPDATE_OBJECT':
            // Payload: { id, updates }
            const updatedObjects = state.objects.map(obj =>
                obj.id === action.payload.id ? { ...obj, ...action.payload.updates } : obj
            )
            // Add to history
            const newHistory = [...state.history, state.objects]
            return {
                ...state,
                objects: updatedObjects,
                history: newHistory,
                future: [], // Clear redo stack on new change
                isDirty: true
            }

        case 'ADD_OBJECT':
            // Payload: object
            return {
                ...state,
                objects: [...state.objects, action.payload],
                history: [...state.history, state.objects],
                future: [],
                isDirty: true
            }

        case 'REMOVE_OBJECTS':
            // Payload: array of ids
            const remainingObjects = state.objects.filter(obj => !action.payload.includes(obj.id))
            return {
                ...state,
                objects: remainingObjects,
                history: [...state.history, state.objects],
                future: [],
                selectedIds: [],
                isDirty: true
            }

        case 'SELECT_OBJECTS':
            // Payload: array of ids
            return { ...state, selectedIds: action.payload }

        case 'SET_ZOOM':
            return { ...state, zoom: action.payload }

        case 'SET_PAN':
            return { ...state, pan: action.payload }

        case 'TOGGLE_SNAP':
            return { ...state, snapToGrid: !state.snapToGrid }

        case 'UNDO':
            if (state.history.length === 0) return state
            const previous = state.history[state.history.length - 1]
            const newPast = state.history.slice(0, -1)
            return {
                ...state,
                objects: previous,
                history: newPast,
                future: [state.objects, ...state.future],
                isDirty: true
            }

        case 'REDO':
            if (state.future.length === 0) return state
            const next = state.future[0]
            const newFuture = state.future.slice(1)
            return {
                ...state,
                objects: next,
                history: [...state.history, state.objects],
                future: newFuture,
                isDirty: true
            }

        case 'SAVE_SUCCESS':
            return { ...state, isDirty: false }

        default:
            return state
    }
}

export function FloorPlanProvider({ children }) {
    const [state, dispatch] = useReducer(floorPlanReducer, initialState)

    return (
        <FloorPlanContext.Provider value={{ state, dispatch }}>
            {children}
        </FloorPlanContext.Provider>
    )
}

export function useFloorPlan() {
    const context = useContext(FloorPlanContext)
    if (!context) {
        throw new Error('useFloorPlan must be used within a FloorPlanProvider')
    }
    return context
}
