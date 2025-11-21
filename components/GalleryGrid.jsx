'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'

/**
 * Gallery Grid Component with Masonry Layout
 * @param {Array} images - Array of image objects with src and alt
 */
export default function GalleryGrid({ images = [] }) {
  const [selectedImage, setSelectedImage] = useState(null)

  // Generate placeholder images if none provided
  const galleryImages =
    images.length > 0
      ? images
      : Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          src: `https://images.unsplash.com/photo-${1517248135467 + i}?w=800&h=600&fit=crop`,
          alt: `Gallery image ${i + 1}`,
        }))

  return (
    <>
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {galleryImages.map((image, index) => (
          <motion.div
            key={image.id || index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="break-inside-avoid mb-4 cursor-pointer"
            onClick={() => setSelectedImage(image)}
          >
            <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <Image
                src={image.src}
                alt={image.alt}
                width={800}
                height={600}
                className="w-full h-auto object-cover hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative max-w-5xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

