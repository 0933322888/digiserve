'use client'

import { usePathname } from 'next/navigation'

export default function FooterWrapper({ children }) {
    const pathname = usePathname()
    if (pathname?.startsWith('/print')) return null
    return children
}
