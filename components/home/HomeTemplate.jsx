import Image from 'next/image'
import Link from 'next/link'
import EventsCarousel from '@/components/EventsCarousel'

function HomeHero({ title, tagline, description, image, reservationsEnabled, giftCardsEnabled, style }) {
  const cta = reservationsEnabled
    ? { href: '/reservations', label: 'Reserve a table' }
    : giftCardsEnabled
      ? { href: '/gift-cards', label: 'Explore gift cards' }
      : null

  if (style === 'editorial') {
    return (
      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-16 pt-10 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:gap-16 md:pb-24">
        <div className="order-2 md:order-1">
          <p className="mb-5 text-xs uppercase tracking-[0.18em] text-[var(--primary-dark-text)]">{tagline}</p>
          <h1 className="max-w-xl font-serif text-5xl leading-tight text-[var(--primary-dark-text)] sm:text-6xl">{title}</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[var(--primary-dark-text)]/75">{description}</p>
          {cta && <Link href={cta.href} className="mt-8 inline-flex border-b border-[var(--primary-dark-text)] pb-2 text-sm">{cta.label} <span aria-hidden="true" className="ml-3">↗</span></Link>}
        </div>
        <figure className="relative order-1 aspect-[4/3] overflow-hidden md:order-2 md:aspect-[5/4]">
          <Image src={image} alt="" fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 58vw" />
          <figcaption className="absolute bottom-4 left-4 bg-[var(--primary-light-bg)] px-3 py-2 text-xs">{title}</figcaption>
        </figure>
      </section>
    )
  }

  if (style === 'traditional') {
    return (
      <section className="px-4 pb-12 pt-8 sm:px-8">
        <div className="mx-auto max-w-7xl border border-[var(--gold)]/50 p-2">
          <div className="relative flex min-h-[440px] items-center justify-center overflow-hidden text-center sm:min-h-[540px]">
            <Image src={image} alt="" fill priority className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-black/45" />
            <div className="relative z-10 max-w-3xl px-5 py-16 text-white">
              <p className="mb-4 text-xs uppercase tracking-[0.18em]">{tagline}</p>
              <h1 className="font-serif text-5xl leading-tight sm:text-7xl">{title}</h1>
              <div aria-hidden="true" className="mx-auto my-6 h-px w-24 bg-[var(--gold)]" />
              <p className="mx-auto max-w-xl text-base leading-7 sm:text-lg">{description}</p>
              {cta && <Link href={cta.href} className="mt-8 inline-flex border border-white px-7 py-3 text-sm uppercase tracking-widest transition-colors hover:bg-white hover:text-black">{cta.label}</Link>}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative flex min-h-[min(780px,calc(100svh-5rem))] items-end overflow-hidden bg-black px-5 pb-16 pt-24 text-white sm:px-10 sm:pb-24 lg:px-16">
      <Image src={image} alt="" fill priority className="object-cover opacity-75" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <p className="mb-5 text-xs uppercase tracking-[0.2em] text-white/80">{tagline}</p>
        <h1 className="max-w-5xl font-serif text-6xl leading-[0.95] sm:text-8xl lg:text-9xl">{title}</h1>
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-lg text-base leading-7 text-white/80">{description}</p>
          {cta && <Link href={cta.href} className="inline-flex w-fit border border-white/80 px-7 py-3 text-sm uppercase tracking-widest hover:bg-white hover:text-black">{cta.label} <span aria-hidden="true" className="ml-5">↗</span></Link>}
        </div>
      </div>
    </section>
  )
}

function EventFeature({ events, pageContent, style }) {
  if (!events.length) return null
  const title = pageContent?.eventsSection?.title || (events.length === 1 ? 'Upcoming Event' : 'Upcoming Events')
  const subtitle = pageContent?.eventsSection?.subtitle || "Don't miss out on these special experiences"

  return (
    <section className={`px-5 py-16 sm:px-8 md:py-20 ${style === 'editorial' ? 'border-y border-black/10' : style === 'traditional' ? 'border-y-4 border-double border-[var(--gold)]/50 bg-[var(--primary-light-bg)]' : 'bg-black text-white'}`}>
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-xs uppercase tracking-[0.16em] opacity-70">{title}</p>
        <h2 className="mb-3 font-serif text-3xl sm:text-4xl">{subtitle}</h2>
        <EventsCarousel events={events} />
      </div>
    </section>
  )
}

function MenuFeature({ menuSections, pageContent, style }) {
  const allItems = menuSections.flatMap(section =>
    (section.items || [])
      .filter(item => !item.archived && !item.unavailable)
      .map(item => ({ ...item, sectionName: section.name }))
  )
  const beverageItems = allItems.filter(item => /drink|cocktail|wine|beer|beverage/i.test(item.sectionName))
  const previewItems = style === 'bar' && beverageItems.length ? beverageItems : allItems
  const items = previewItems.slice(0, style === 'editorial' ? 5 : 4)
  if (!items.length) return null

  const heading = pageContent?.menuSection?.title || (style === 'bar' && beverageItems.length ? 'Signature pours' : 'From Our Menu')
  const intro = pageContent?.menuSection?.subtitle || 'A few of the things we make with care.'

  return (
    <section className={`px-5 py-16 sm:px-8 md:py-24 ${style === 'traditional' ? 'bg-[var(--secondary-light-bg)]/40' : ''}`}>
      <div className="mx-auto max-w-7xl">
        <div className={`mb-10 ${style === 'editorial' ? 'max-w-lg' : 'text-center'}`}>
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--primary-dark-text)]/65">{heading}</p>
          <h2 className="font-serif text-4xl text-[var(--primary-dark-text)] sm:text-5xl">{intro}</h2>
        </div>
        {style === 'editorial' ? (
          <div className="border-t border-black/20">
            {items.map(item => (
              <article key={item.id} className="grid grid-cols-[1fr_auto] gap-x-5 border-b border-black/15 py-5 sm:grid-cols-[1fr_auto]">
                <p className="text-xs uppercase tracking-wider text-[var(--primary-dark-text)]/60">{item.sectionName}</p>
                <p className="row-span-2 text-sm text-[var(--primary-dark-text)]">{item.price != null ? `$${item.price}` : ''}</p>
                <h3 className="mt-1 font-serif text-xl text-[var(--primary-dark-text)]">{item.name}</h3>
                {item.description && <p className="col-span-2 mt-2 max-w-2xl text-sm leading-6 text-[var(--primary-dark-text)]/70">{item.description}</p>}
              </article>
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${style === 'traditional' ? 'lg:grid-cols-4' : 'lg:grid-cols-2'}`}>
            {items.map((item, index) => (
              <article key={item.id} className={`overflow-hidden ${style === 'traditional' ? 'border border-[var(--gold)]/40 bg-[var(--primary-light-bg)]' : 'relative min-h-64 border border-white/20 bg-black text-white'}`}>
                {style === 'bar' && item.image && (
                  <div className="relative h-48">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                )}
                <div className={style === 'bar' ? 'p-5' : 'p-6'}>
                  <p className="mb-2 text-xs uppercase tracking-wider opacity-65">{item.sectionName}</p>
                  <div className="flex justify-between gap-4">
                    <h3 className="font-serif text-xl">{item.name}</h3>
                    {item.price != null && <span className="whitespace-nowrap text-sm">${item.price}</span>}
                  </div>
                  {item.description && <p className="mt-3 text-sm leading-6 opacity-75">{item.description}</p>}
                  {style === 'traditional' && index === 0 && <span aria-hidden="true" className="mt-5 block h-px w-12 bg-[var(--gold)]" />}
                </div>
              </article>
            ))}
          </div>
        )}
        <div className={style === 'editorial' ? 'mt-7' : 'mt-9 text-center'}>
          <Link href="/menu" className="inline-flex border-b border-current pb-1 text-sm">View full menu <span aria-hidden="true" className="ml-3">↗</span></Link>
        </div>
      </div>
    </section>
  )
}

function StoryFeature({ restaurant, pageContent, style }) {
  const story = pageContent?.aboutPreview || {}
  const image = story.image || '/images/interior.jpg'
  return (
    <section className={`px-5 py-16 sm:px-8 md:py-24 ${style === 'editorial' ? 'border-y border-black/10' : style === 'traditional' ? 'bg-[var(--secondary-light-bg)]/30' : 'bg-[var(--secondary-dark-bg)]/20'}`}>
      <div className={`mx-auto grid max-w-7xl items-center gap-9 ${style === 'editorial' ? 'md:grid-cols-[1.15fr_0.85fr]' : 'md:grid-cols-2 md:gap-16'}`}>
        <div className={`relative ${style === 'editorial' ? 'aspect-[5/4] md:order-2' : 'aspect-[4/3]'}`}>
          <Image src={image} alt={story.imageAlt || 'Restaurant interior'} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        <div className={style === 'editorial' ? 'md:order-1 md:py-8' : ''}>
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--primary-dark-text)]/60">{style === 'bar' ? 'The atmosphere' : style === 'editorial' ? 'Our approach' : 'Welcome'}</p>
          <h2 className="font-serif text-3xl leading-tight text-[var(--primary-dark-text)] sm:text-4xl">{story.title || restaurant.tagline}</h2>
          <p className="mt-5 max-w-xl leading-7 text-[var(--primary-dark-text)]/75">{story.description || restaurant.description}</p>
          <Link href={story.buttonLink || '/about'} className="mt-7 inline-flex border-b border-current pb-1 text-sm">{story.buttonText || 'Our story'} <span aria-hidden="true" className="ml-3">↗</span></Link>
        </div>
      </div>
    </section>
  )
}

function WelcomeFeature({ restaurant }) {
  return (
    <section className="px-5 py-12 text-center sm:px-8 md:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--primary-dark-text)]/60">Welcome</p>
        <h2 className="font-serif text-3xl text-[var(--primary-dark-text)] sm:text-4xl">{restaurant.tagline}</h2>
        <div aria-hidden="true" className="mx-auto my-5 h-px w-16 bg-[var(--gold)]" />
        <p className="leading-7 text-[var(--primary-dark-text)]/75">{restaurant.description}</p>
      </div>
    </section>
  )
}

function LocationHoursFeature({ restaurant, businessHours }) {
  return (
    <section className="border-y border-[var(--gold)]/30 bg-[var(--secondary-light-bg)]/30 px-5 py-14 sm:px-8 md:py-18">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--primary-dark-text)]/60">Find us</p>
          <h2 className="mb-5 font-serif text-3xl text-[var(--primary-dark-text)]">Location</h2>
          <address className="not-italic leading-7 text-[var(--primary-dark-text)]/80">
            {restaurant.address.street}<br />
            {restaurant.address.city}, {restaurant.address.state} {restaurant.address.zip}<br />
            {restaurant.address.country}
          </address>
          <a href={`tel:${restaurant.phone}`} className="mt-4 inline-block border-b border-current pb-1 text-sm">{restaurant.phone}</a>
        </div>
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--primary-dark-text)]/60">Join us</p>
          <h2 className="mb-5 font-serif text-3xl text-[var(--primary-dark-text)]">Opening Hours</h2>
          <dl className="space-y-2 text-sm text-[var(--primary-dark-text)]/80">
            {Object.entries(businessHours).map(([day, hours]) => (
              <div key={day} className="flex max-w-sm justify-between gap-5 border-b border-[var(--gold)]/20 pb-2">
                <dt>{day}</dt>
                <dd>{hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

function HighlightsFeature({ highlights, pageContent, style }) {
  if (!highlights.length) return null
  return (
    <section className="px-5 py-14 sm:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--primary-dark-text)]/60">{pageContent?.highlights?.sectionTitle || 'Discover'}</p>
          <h2 className="mt-2 font-serif text-3xl text-[var(--primary-dark-text)]">{pageContent?.highlights?.sectionSubtitle || 'More to experience'}</h2>
        </div>
        <div className={`grid grid-cols-1 gap-5 ${style === 'editorial' ? 'md:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {highlights.map((highlight, index) => (
            <Link key={`${highlight.link}-${index}`} href={highlight.link} className="group grid grid-cols-[96px_1fr] items-center gap-4 border-t border-black/15 py-4">
              {highlight.image && <div className="relative aspect-square overflow-hidden"><Image src={highlight.image} alt={highlight.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="96px" /></div>}
              <div>
                <h3 className="font-serif text-xl text-[var(--primary-dark-text)]">{highlight.title}</h3>
                <p className="mt-1 text-sm leading-5 text-[var(--primary-dark-text)]/70">{highlight.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function GalleryFeature({ images, style }) {
  if (!images.length) return null
  const shownImages = images.slice(0, 6)
  return (
    <section className={`px-5 py-14 sm:px-8 md:py-20 ${style === 'editorial' ? 'border-y border-black/10' : ''}`}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl text-[var(--primary-dark-text)] sm:text-4xl">A glimpse inside</h2>
          <Link href="/gallery" className="shrink-0 border-b border-current pb-1 text-sm">View gallery</Link>
        </div>
        <div className={`grid grid-cols-2 gap-2 sm:gap-4 ${style === 'bar' ? 'md:grid-cols-4' : style === 'editorial' ? 'md:grid-cols-3' : 'md:grid-cols-3'}`}>
          {shownImages.map((image, index) => (
            <div key={image.id || index} className={`relative overflow-hidden ${style === 'bar' && index === 0 ? 'col-span-2 row-span-2 aspect-square md:aspect-auto' : style === 'editorial' && index === 1 ? 'col-span-2 aspect-[2/1] md:col-span-1 md:aspect-[3/4]' : 'aspect-[4/3]'}`}>
              <Image src={image.src} alt={image.alt || ''} fill className="object-cover transition-transform duration-700 hover:scale-105" sizes="(max-width: 768px) 50vw, 33vw" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ReservationFeature({ enabled, pageContent, style }) {
  if (!enabled) return null
  const cta = pageContent?.ctaSection || {}
  return (
    <section className={`px-5 py-16 text-center sm:px-8 md:py-24 ${style === 'bar' ? 'bg-black text-white' : style === 'traditional' ? 'border-y-4 border-double border-[var(--gold)]/60 bg-[var(--secondary-light-bg)]/40' : 'border-t border-black/15'}`}>
      <div className="mx-auto max-w-3xl">
        {style === 'traditional' && <p className="mb-4 text-xs uppercase tracking-[0.18em]">By reservation</p>}
        <h2 className="font-serif text-4xl sm:text-5xl">{cta.title || 'Reserve your table'}</h2>
        <p className="mx-auto mt-5 max-w-xl leading-7 opacity-75">{cta.description || 'We look forward to welcoming you.'}</p>
        <Link href={cta.buttonLink || '/reservations'} className={`mt-8 inline-flex px-7 py-3 text-sm ${style === 'editorial' ? 'border-b border-current' : 'border border-current uppercase tracking-widest'}`}>
          {cta.buttonText || 'Make a reservation'}
        </Link>
      </div>
    </section>
  )
}

export default function HomeTemplate({
  templateId,
  title,
  tagline,
  description,
  restaurant,
  pageContent,
  reservationsEnabled,
  giftCardsEnabled,
  events,
  highlights,
  menuSections,
  galleryImages,
  businessHours,
}) {
  const image = pageContent?.heroImage || '/images/trio_main.png'

  if (templateId === 'sushi') {
    return (
      <div>
        <HomeHero title={title} tagline={tagline} description={description} image={image} reservationsEnabled={reservationsEnabled} giftCardsEnabled={giftCardsEnabled} style="editorial" />
        <StoryFeature restaurant={restaurant} pageContent={pageContent} style="editorial" />
        <MenuFeature menuSections={menuSections} pageContent={pageContent} style="editorial" />
        <GalleryFeature images={galleryImages} style="editorial" />
        <EventFeature events={events} pageContent={pageContent} style="editorial" />
        <HighlightsFeature highlights={highlights} pageContent={pageContent} style="editorial" />
        <ReservationFeature enabled={reservationsEnabled} pageContent={pageContent} style="editorial" />
      </div>
    )
  }

  if (templateId === 'restaurant') {
    return (
      <div>
        <HomeHero title={title} tagline={tagline} description={description} image={image} reservationsEnabled={reservationsEnabled} giftCardsEnabled={giftCardsEnabled} style="traditional" />
        <WelcomeFeature restaurant={restaurant} />
        <MenuFeature menuSections={menuSections} pageContent={pageContent} style="traditional" />
        <StoryFeature restaurant={restaurant} pageContent={pageContent} style="traditional" />
        <EventFeature events={events} pageContent={pageContent} style="traditional" />
        <GalleryFeature images={galleryImages} style="traditional" />
        <LocationHoursFeature restaurant={restaurant} businessHours={businessHours} />
        <HighlightsFeature highlights={highlights} pageContent={pageContent} style="traditional" />
        <ReservationFeature enabled={reservationsEnabled} pageContent={pageContent} style="traditional" />
      </div>
    )
  }

  return (
    <div>
      <HomeHero title={title} tagline={tagline} description={description} image={image} reservationsEnabled={reservationsEnabled} giftCardsEnabled={giftCardsEnabled} style="bar" />
      <MenuFeature menuSections={menuSections} pageContent={pageContent} style="bar" />
      <EventFeature events={events} pageContent={pageContent} style="bar" />
      <StoryFeature restaurant={restaurant} pageContent={pageContent} style="bar" />
      <HighlightsFeature highlights={highlights} pageContent={pageContent} style="bar" />
      <GalleryFeature images={galleryImages} style="bar" />
      <ReservationFeature enabled={reservationsEnabled} pageContent={pageContent} style="bar" />
    </div>
  )
}