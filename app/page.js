import Hero from '@/components/Hero'
import SectionTitle from '@/components/SectionTitle'
import AnimatedCard from '@/components/AnimatedCard'
import { siteConfig } from '@/config/siteConfig'
import Link from 'next/link'
import { Utensils, Wine, Calendar, Gift } from 'lucide-react'
import Image from 'next/image'

/**
 * Home Page Metadata
 */
export const metadata = {
  title: 'Home',
  description: siteConfig.restaurant.description,
  openGraph: {
    title: `${siteConfig.restaurant.name} | ${siteConfig.restaurant.tagline}`,
    description: siteConfig.restaurant.description,
  },
}

/**
 * Home Page
 * Features hero section, highlights, and promotional banners
 */
export default function HomePage() {
  const { restaurant, features } = siteConfig

  const highlights = [
    ...(features.foodMenu
      ? [
          {
            icon: Utensils,
            title: 'Exquisite Cuisine',
            description: 'Our chef-curated menu features the finest ingredients and innovative flavors.',
            link: '/menu/food',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
          },
        ]
      : []),
    ...(features.drinkMenu
      ? [
          {
            icon: Wine,
            title: 'Craft Cocktails',
            description: 'Handcrafted cocktails and an extensive wine selection to complement your meal.',
            link: '/menu/drinks',
            image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop',
          },
        ]
      : []),
    ...(features.events
      ? [
          {
            icon: Calendar,
            title: 'Special Events',
            description: 'Join us for live music, wine tastings, and exclusive dining experiences.',
            link: '/events',
            image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop',
          },
        ]
      : []),
    ...(features.giftCards
      ? [
          {
            icon: Gift,
            title: 'Gift Cards',
            description: 'Give the gift of an unforgettable dining experience.',
            link: '/gift-cards',
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
          },
        ]
      : []),
  ]

  return (
    <>
      <Hero />

      {/* Highlights Section */}
      {highlights.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <SectionTitle
              title="Experience TRIO"
              subtitle="Discover what makes us special"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {highlights.map((highlight, index) => {
                const Icon = highlight.icon
                return (
                  <AnimatedCard key={highlight.link} delay={index * 0.1}>
                    <Link href={highlight.link}>
                      <div className="group relative h-64 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                        <Image
                          src={highlight.image}
                          alt={highlight.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-primary/10 dark:bg-gray-900/80 group-hover:bg-primary/90 dark:group-hover:bg-gray-900/90 transition-colors" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-cream">
                          <Icon className="w-12 h-12 mb-4 text-gold" />
                          <h3 className="text-2xl font-serif font-bold mb-2">
                            {highlight.title}
                          </h3>
                          <p className="text-sm">{highlight.description}</p>
                        </div>
                      </div>
                    </Link>
                  </AnimatedCard>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* About Preview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <AnimatedCard>
              <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/images/interior.jpg"
                  alt="Restaurant interior"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </AnimatedCard>
            <AnimatedCard delay={0.2}>
              <h2 className="text-4xl font-serif font-bold text-primary dark:text-gold mb-6">
                {restaurant.tagline}
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                {restaurant.description}
              </p>
              <Link
                href="/about"
                className="inline-block bg-primary dark:bg-gold text-cream dark:text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark dark:hover:bg-gold-light transition-colors"
              >
                Learn More About Us
              </Link>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {features.reservations && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedCard>
              <h2 className="text-4xl font-serif font-bold text-primary dark:text-gold mb-6">
                Reserve Your Table
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Experience the perfect blend of vintage elegance and modern flavor.
                Book your table today.
              </p>
              <Link
                href="/reservations"
                className="inline-block bg-primary dark:bg-gold text-cream dark:text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark dark:hover:bg-gold-light transition-colors"
              >
                Make a Reservation
              </Link>
            </AnimatedCard>
          </div>
        </section>
      )}
    </>
  )
}

