'use client'

import { createContext, useContext, useState, useEffect } from 'react'

/**
 * Cart Context for managing shopping cart state
 */
const CartContext = createContext(undefined)

/**
 * Cart Provider Component
 * Manages cart state with localStorage persistence
 */
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    }
  }, [cartItems, isLoaded])

  /**
   * Add item to cart
   * @param {Object} item - Menu item to add
   * @param {Object} options - Item options (size, variations, etc.)
   */
  const addItem = (item, options = {}) => {
    const cartItem = {
      id: `${item.id}-${JSON.stringify(options)}`,
      menuItemId: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      options: options,
      quantity: 1,
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (i) => i.id === cartItem.id
      )
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === cartItem.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prevItems, cartItem]
    })
  }

  /**
   * Remove item from cart
   * @param {string} itemId - Cart item ID
   */
  const removeItem = (itemId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== itemId)
    )
  }

  /**
   * Update item quantity
   * @param {string} itemId - Cart item ID
   * @param {number} quantity - New quantity
   */
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }

  /**
   * Clear entire cart
   */
  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cart')
  }

  /**
   * Calculate cart totals
   */
  const cartTotals = {
    subtotal: cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ),
    tax: 0, // Will be calculated on checkout
    delivery: 0, // Will be calculated on checkout
    total: 0, // Will be calculated on checkout
  }

  const value = {
    cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    cartTotals,
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

/**
 * Hook to use cart context
 */
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

