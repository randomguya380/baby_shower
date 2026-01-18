'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Default placeholder images - user can replace these
const defaultImages = [
  '/images/invite.jpeg',
  '/images/couple1.jpeg',
  '/images/couple2.jpg',
]

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    // Check which images exist, fallback to defaults
    setImages(defaultImages)
  }, [])

  useEffect(() => {
    if (images.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [images.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (images.length === 0) {
    return (
      <div className="relative w-full h-[600px] bg-cream flex items-center justify-center">
        <p className="text-gray-500">Add images to /public/images directory</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[600px] md:h-[700px] overflow-hidden bg-cream">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            fill
            sizes="100vw"
            quality={90}
            className="object-cover object-center"
            priority={currentIndex === 0}
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            onError={(e) => {
              // Fallback to placeholder if image doesn't exist
              const target = e.target as HTMLImageElement
              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23F5F5DC" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="serif" font-size="24" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E'
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-gray-700" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

