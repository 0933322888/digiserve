'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Gallery Component
 * Supports multiple layouts: 'grid', 'masonry', 'carousel'
 */
export default function Gallery({
    images = [],
    variant = 'masonry',
    columns = 3
}) {
    const [selectedImage, setSelectedImage] = useState(null)
    const [currentIndex, setCurrentIndex] = useState(0)

    // Default images if none provided
    const displayImages = images.length > 0 ? images : Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        src: `/images/gall${i + 1}.jpg`,
        alt: `Gallery Image ${i + 1}`
    }))

    // --- Carousel Logic ---
    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % displayImages.length)
    }
    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)
    }

    if (variant === 'carousel') {
        return (
            <div className="relative group w-full max-w-5xl mx-auto overflow-hidden rounded-xl shadow-2xl aspect-video bg-black">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.5 }}
                        className="relative w-full h-full"
                    >
                        <Image
                            src={displayImages[currentIndex].src}
                            alt={displayImages[currentIndex].alt || ''}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                            <p className="text-lg font-serif">{displayImages[currentIndex].caption || displayImages[currentIndex].alt}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-white/20 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-white/20 transition-colors">
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
        )
    }

    // --- Grid / Masonry Logic ---
    // Note: Tailwind columns are used for masonry effect (vertical stacking order)
    // For true grid, we use grid-cols

    const containerClass = variant === 'masonry'
        ? `columns-1 md:columns-2 lg:columns-${columns} gap-4 space-y-4`
        : `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`

    return (
        <>
            <div className={containerClass}>
                {displayImages.map((image, index) => (
                    <motion.div
                        key={image.id || index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={cn(
                            "relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer group",
                            variant === 'masonry' ? "break-inside-avoid mb-4" : "aspect-square"
                        )}
                        onClick={() => setSelectedImage(image)}
                    >
                        <Image
                            src={image.src}
                            alt={image.alt || ''}
                            width={800}
                            height={600}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </motion.div>
                ))}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button className="absolute top-4 right-4 text-white/70 hover:text-white">
                            <X className="w-8 h-8" />
                        </button>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={selectedImage.src}
                                alt={selectedImage.alt || ''}
                                width={1200}
                                height={800}
                                className="max-w-full max-h-full object-contain"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
