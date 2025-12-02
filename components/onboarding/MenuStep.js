'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, DollarSign } from 'lucide-react'

export default function MenuStep({ tenantId, onNext, onBack }) {
    const [foodItems, setFoodItems] = useState([
        { id: '1', name: 'Classic Burger', description: 'Angus beef patty with lettuce, tomato, onion', price: 14.99 },
        { id: '2', name: 'Caesar Salad', description: 'Crisp romaine lettuce, parmesan cheese, croutons', price: 11.99 },
        { id: '3', name: 'Grilled Salmon', description: 'Fresh Atlantic salmon with seasonal vegetables', price: 22.99 },
    ])
    const [drinkItems, setDrinkItems] = useState([
        { id: '4', name: 'House Red Wine', description: 'Smooth and full-bodied red wine', price: 8.99 },
        { id: '5', name: 'Craft Beer', description: 'Rotating selection of local craft beers', price: 7.50 },
        { id: '6', name: 'Fresh Lemonade', description: 'House-made lemonade with fresh lemons', price: 4.99 },
    ])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const addFoodItem = () => {
        setFoodItems([...foodItems, { id: Date.now().toString(), name: '', description: '', price: 0 }])
    }

    const addDrinkItem = () => {
        setDrinkItems([...drinkItems, { id: Date.now().toString(), name: '', description: '', price: 0 }])
    }

    const removeItem = (id, type) => {
        if (type === 'food') {
            setFoodItems(foodItems.filter(item => item.id !== id))
        } else {
            setDrinkItems(drinkItems.filter(item => item.id !== id))
        }
    }

    const updateItem = (id, field, value, type) => {
        const items = type === 'food' ? foodItems : drinkItems
        const setItems = type === 'food' ? setFoodItems : setDrinkItems

        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Validate at least one item
        if (foodItems.length === 0 && drinkItems.length === 0) {
            setError('Please add at least one menu item')
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/onboarding/menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId,
                    items: {
                        food: foodItems.filter(item => item.name && item.price > 0),
                        drinks: drinkItems.filter(item => item.name && item.price > 0),
                    },
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to save menu')
                setLoading(false)
                return
            }

            // Move to next step
            onNext()
        } catch (error) {
            console.error('Menu error:', error)
            setError('An error occurred. Please try again.')
            setLoading(false)
        }
    }

    const renderItemForm = (item, type) => (
        <div key={item.id} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <div className="grid grid-cols-12 gap-3">
                <div className="col-span-4">
                    <input
                        type="text"
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value, type)}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
                <div className="col-span-5">
                    <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value, type)}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
                <div className="col-span-2">
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={item.price || ''}
                            onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0, type)}
                            className="w-full pl-8 pr-3 py-2 bg-gray-800/50 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                </div>
                <div className="col-span-1 flex items-center">
                    <button
                        type="button"
                        onClick={() => removeItem(item.id, type)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Quick Menu Setup</h2>
                <p className="text-gray-400">Add a few items to get started. You can add more later in the admin panel.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Food Items */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white">Food Items</h3>
                        <button
                            type="button"
                            onClick={addFoodItem}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Item
                        </button>
                    </div>
                    <div className="space-y-3">
                        {foodItems.map(item => renderItemForm(item, 'food'))}
                    </div>
                </div>

                {/* Drink Items */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white">Drinks</h3>
                        <button
                            type="button"
                            onClick={addDrinkItem}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Item
                        </button>
                    </div>
                    <div className="space-y-3">
                        {drinkItems.map(item => renderItemForm(item, 'drinks'))}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? 'Saving...' : 'Next: Go Live'}
                    </button>
                </div>
            </form>
        </div>
    )
}
