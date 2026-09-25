'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/providers/CartProvider'
import CheckoutForm from '@/components/ordering/CheckoutForm'

/**
 * Checkout Client Component
 * Handles client-side logic for checkout
 */
export default function CheckoutClient({ stripeEnabled, orderingSettings }) {
    const router = useRouter()
    const { cartItems, cartTotals } = useCart()

    if (cartItems.length === 0) {
        router.push('/order')
        return null
    }

    const handleSuccess = order => {
        router.push(`/order/success?orderId=${order.id}`)
    }

    return (
        <div className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-serif font-bold text-primary-text  mb-8">Checkout</h1>
                <CheckoutForm
                    cartItems={cartItems}
                    cartTotals={cartTotals}
                    onSuccess={handleSuccess}
                    stripeEnabled={stripeEnabled}
                    orderingSettings={orderingSettings}
                />
            </div>
        </div>
    )
}
