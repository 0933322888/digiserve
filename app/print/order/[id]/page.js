import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

async function getOrder(barId, orderId) {
    try {
        const { getRestaurantModel } = await import('@/lib/db/mongodb-adapter')
        const OrderModel = await getRestaurantModel(barId, 'orders', 'OrderSchema')
        const order = await OrderModel.findOne({ id: orderId }).lean()
        if (!order) return null

        // Convert dates to strings for serialization
        return JSON.parse(JSON.stringify(order))
    } catch (error) {
        console.error('Error fetching order:', error)
        return null
    }
}

async function getTenantInfo(barId) {
    try {
        const { getTenantConfig } = await import('@/lib/tenant-service')
        return await getTenantConfig(barId)
    } catch (error) {
        return null
    }
}

export default async function BillPage({ params }) {
    const { id } = await params
    const headersList = await headers()
    const barId = headersList.get('x-tenant-id')

    if (!barId) return notFound()

    const order = await getOrder(barId, id)
    const tenant = await getTenantInfo(barId)

    if (!order) return notFound()

    return (
        <div className="min-h-screen bg-white p-8 max-w-md mx-auto print:p-0 print:max-w-none">
            <style>{`
                @media print {
                    @page { margin: 0; }
                    body { margin: 1cm; }
                    nav, footer, .no-print { display: none !important; }
                }
            `}</style>

            <div className="text-center space-y-2 mb-8">
                <h1 className="text-2xl font-bold uppercase">{tenant?.name || 'Restaurant'}</h1>
                <div className="text-sm text-gray-600">
                    <p>{tenant?.address?.street}</p>
                    <p>{tenant?.address?.city}, {tenant?.address?.state} {tenant?.address?.zip}</p>
                    <p>{tenant?.phone}</p>
                </div>
            </div>

            <div className="border-b-2 border-dashed border-gray-300 my-4"></div>

            <div className="space-y-1 mb-6 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">Order #:</span>
                    <span className="font-bold">{order.id}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                {order.tableId && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">Table:</span>
                        <span className="font-bold">{order.tableId} {order.seatNumber ? `(Seat ${order.seatNumber})` : ''}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span className="text-gray-600">Server:</span>
                    <span>{order.customerInfo?.name === 'Guest' ? 'Staff' : order.customerInfo?.name}</span>
                </div>
            </div>

            <div className="border-b-2 border-dashed border-gray-300 my-4"></div>

            <div className="space-y-2 mb-6">
                {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                        <div className="flex-1">
                            <span className="font-medium">{item.quantity}x {item.name}</span>
                        </div>
                        <span className="font-mono">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                ))}
            </div>

            <div className="border-t-2 border-gray-900 pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatPrice(order.totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span className="font-mono">{formatPrice(order.totals.tax)}</span>
                </div>
                {order.totals.delivery > 0 && (
                    <div className="flex justify-between text-sm">
                        <span>Delivery</span>
                        <span className="font-mono">{formatPrice(order.totals.delivery)}</span>
                    </div>
                )}
                <div className="flex justify-between text-xl font-bold mt-2">
                    <span>TOTAL</span>
                    <span className="font-mono">{formatPrice(order.totals.total)}</span>
                </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
                <p>Thank you for dining with us!</p>
                <div className="mt-2 text-xs">
                    Methods: Cash, Credit, Debit
                </div>
            </div>

            <div className="mt-8 no-print text-center">
                <button
                    onClick={() => window.print()}
                    className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors"
                >
                    Print Bill
                </button>
            </div>

            <script dangerouslySetInnerHTML={{
                __html: `
                // Auto-print when opened via refined logic if needed
             `}} />
        </div>
    )
}
