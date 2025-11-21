import SectionTitle from '@/components/SectionTitle'
import AnimatedCard from '@/components/AnimatedCard'
import { siteConfig } from '@/config/siteConfig'
import Image from 'next/image'

/**
 * About Page Metadata
 */
export const metadata = {
  title: 'About Us',
  description: `Learn about ${siteConfig.restaurant.name} - our history, mission, and commitment to excellence.`,
  openGraph: {
    title: `About Us | ${siteConfig.restaurant.name}`,
    description: `Learn about ${siteConfig.restaurant.name} - our history, mission, and commitment to excellence.`,
  },
}

/**
 * About Page
 * Features restaurant history, mission, and philosophy
 */
export default function AboutPage() {
  const { restaurant } = siteConfig

  const timeline = [
    {
      year: '2015',
      title: 'The Beginning',
      description:
        'TRIO BISTRO AND LOUNGE opened its doors with a vision to blend vintage elegance with modern culinary innovation.',
    },
    {
      year: '2017',
      title: 'Award Recognition',
      description:
        'Received "Best New Restaurant" award from the local dining association.',
    },
    {
      year: '2020',
      title: 'Expansion',
      description:
        'Expanded our menu and renovated our space to create an even more memorable dining experience.',
    },
    {
      year: '2024',
      title: 'Today',
      description:
        'Continuing to serve exceptional cuisine and create unforgettable moments for our guests.',
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=1080&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-primary/70 dark:bg-gray-900/70" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-cream mb-4">
            Our Story
          </h1>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <AnimatedCard>
              <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop"
                  alt="Restaurant interior"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </AnimatedCard>
            <AnimatedCard delay={0.2}>
              <h2 className="text-4xl font-serif font-bold text-primary dark:text-gold mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                At {restaurant.name}, we believe that dining is an experience
                that should engage all the senses. Our mission is to create
                memorable moments through exceptional cuisine, impeccable
                service, and an atmosphere that blends vintage elegance with
                contemporary comfort.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                We source the finest ingredients, craft each dish with care, and
                curate a beverage selection that complements our culinary
                offerings. Every detail, from the ambiance to the presentation,
                is designed to make your visit unforgettable.
              </p>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title="Our Journey"
            subtitle="Milestones that shaped who we are today"
          />
          <div className="space-y-8">
            {timeline.map((item, index) => (
              <AnimatedCard key={item.year} delay={index * 0.1}>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-primary dark:bg-gold rounded-full flex items-center justify-center">
                      <span className="text-2xl font-serif font-bold text-cream dark:text-primary">
                        {item.year}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 bg-cream dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-2xl font-serif font-bold text-primary dark:text-gold mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {item.description}
                    </p>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedCard>
            <h2 className="text-4xl font-serif font-bold text-primary dark:text-gold mb-6">
              Our Philosophy
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              We believe that great food brings people together. Our philosophy
              centers on three core principles:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="bg-cream dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-serif font-semibold text-primary dark:text-gold mb-3">
                  Quality
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We use only the finest ingredients, sourced locally when
                  possible, to ensure every dish meets our high standards.
                </p>
              </div>
              <div className="bg-cream dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-serif font-semibold text-primary dark:text-gold mb-3">
                  Craftsmanship
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Every dish is prepared with attention to detail and a passion
                  for culinary excellence.
                </p>
              </div>
              <div className="bg-cream dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-serif font-semibold text-primary dark:text-gold mb-3">
                  Hospitality
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We strive to make every guest feel welcomed and valued,
                  creating an atmosphere of warmth and elegance.
                </p>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </section>
    </>
  )
}

