'use client'

import { useState, useEffect } from 'react'

export default function CreateOrderModal({ barId, isOpen, onClose, onOrderCreated }) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [menu, setMenu] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    // Order State
    const [customerName, setCustomerName] = useState('')
    const [tableNumber, setTableNumber] = useState('')
    const [seatNumber, setSeatNumber] = useState('')
    const [orderType, setOrderType] = useState('dineIn')
    const [cart, setCart] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('all')

    useEffect(() => {
        if (isOpen && barId) {
            fetchMenu()
        }
    }, [isOpen, barId])

    const fetchMenu = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/menu/active?barId=${barId}`)
            const data = await res.json()
            if (data.menu) {
                setMenu(data.menu)
                // Set first section as default category if available
                if (data.menu.sections?.length > 0) {
                    setSelectedCategory(data.menu.sections[0].id)
                }
            }
        } catch (err) {
            console.error('Failed to fetch menu:', err)
            setError('Failed to load menu')
        } finally {
            setLoading(false)
        }
    }

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id)
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
            }
            return [...prev, { ...item, quantity: 1, originalPrice: item.price }]
        })
    }

    const updateQuantity = (itemId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === itemId) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) }
            }
            return item
        }))
    }

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(i => i.id !== itemId))
    }

    const calculateTotals = () => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const taxRate = 0.13 // Simplified for now, ideally fetch from config
        const tax = subtotal * taxRate
        const total = subtotal + tax
        return { subtotal, tax, total }
    }

    const getDefaultTime = (minutesOffset = 0) => {
        const now = new Date()
        const target = new Date(now.getTime() + minutesOffset * 60000)

        // Simple business logic for testing: Open 11am - 11pm
        // If target is before 11am, set to 12:00pm today
        if (target.getHours() < 11) {
            target.setHours(12, 0, 0, 0)
        }
        return target.toISOString()
    }

    const handleSubmit = async () => {
        // Name is hardcoded to "Guest" for admin/server orders as per requirement
        if (!tableNumber && orderType === 'dineIn') {
            alert('Please enter a table number')
            return
        }
        if (cart.length === 0) {
            alert('Please add items to the order')
            return
        }
        // ... (rest of validation)

        setSubmitting(true)
        try {
            const totals = calculateTotals()

            const orderData = {
                barId,
                customerInfo: {
                    name: 'Guest', // Hardcoded as per requirement
                    email: 'walkin@example.com',
                    phone: '000-000-0000',
                },
                orderType,
                tableId: tableNumber, // Send as top-level field
                seatNumber, // Send as top-level field
                cartItems: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                totals,
                ...(orderType === 'dineIn' && {
                    dineInTime: getDefaultTime(15),
                    notes: `Table ${tableNumber}${seatNumber ? ` - Seat ${seatNumber}` : ''}`
                }),
                ...(orderType === 'pickup' && { pickupTime: getDefaultTime(30) }),
                status: 'pending'
            }

            const res = await fetch('/api/order/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Failed to create order')
            }

            const newOrder = await res.json()
            onOrderCreated(newOrder)
            onClose()

            setCustomerName('')
            setTableNumber('')
            setSeatNumber('')
            setCart([])

        } catch (err) {
            console.error('Order creation error:', err)
            alert(`Failed to create order: ${err.message}`)
        } finally {
            setSubmitting(false)
        }
    }

    if (!isOpen) return null

    const totals = calculateTotals()

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex overflow-hidden">

                {/* Left Side: Menu */}
                <div className="w-2/3 flex flex-col border-r border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                        {/* Category Filter */}
                        <div className="flex gap-2 flex-wrap">
                            {menu?.sections?.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setSelectedCategory(section.id)}
                                    className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${selectedCategory === section.id
                                        ? 'bg-primary text-white'
                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                                        }`}
                                >
                                    {section.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
                        {loading ? (
                            <div className="flex justify-center items-center h-full">Loading menu...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {menu?.sections?.find(s => s.id === selectedCategory)?.items?.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => addToCart(item)}
                                        disabled={item.unavailable}
                                        className="flex flex-col text-left bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition-all group"
                                    >
                                        <div className="flex justify-between w-full mb-2">
                                            <span className="font-medium text-gray-900 dark:text-white line-clamp-1">{item.name}</span>
                                            <span className="font-bold text-primary-text">${item.price}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{item.description}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Order Summary */}
                <div className="w-1/3 flex flex-col bg-white dark:bg-gray-800">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Order</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['dineIn', 'pickup', 'delivery'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setOrderType(type)}
                                            className={`py-2 text-sm font-medium rounded-md ${orderType === type
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            {type === 'dineIn' ? 'Dine In' : type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Customer Name Removed */}
                                {orderType === 'dineIn' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Table No.</label>
                                            <input
                                                type="text"
                                                value={tableNumber}
                                                onChange={e => setTableNumber(e.target.value)}
                                                placeholder="e.g. 5"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-transparent dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Seat No.</label>
                                            <input
                                                type="text"
                                                value={seatNumber}
                                                onChange={e => setSeatNumber(e.target.value)}
                                                placeholder="e.g. 1"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-transparent dark:text-white"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {cart.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 text-sm">
                                No items added
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                                        <div className="text-xs text-gray-500">${item.price}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-600 rounded-full shadow text-gray-600 dark:text-gray-200">-</button>
                                        <span className="text-sm font-medium w-4 text-center dark:text-white">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-600 rounded-full shadow text-gray-600 dark:text-gray-200">+</button>
                                        <button onClick={() => removeFromCart(item.id)} className="ml-2 text-red-500 hover:text-red-700">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                        <div className="space-y-1 mb-4">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Subtotal</span>
                                <span>${totals.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Tax (13%)</span>
                                <span>${totals.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                                <span>Total</span>
                                <span>${totals.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting || cart.length === 0}
                            className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition-transform active:scale-95 ${submitting || cart.length === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {submitting ? 'Creating Order...' : `Place Order • $${totals.total.toFixed(2)}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
