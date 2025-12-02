import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { tone = 'fun', platform = 'facebook' } = body

    // Mock logic to generate posts based on tone
    const generatePosts = () => {
      const posts = []
      const today = new Date()

      // Helper to format date
      const formatDate = date => date.toISOString().slice(0, 16)

      // Tone-specific content templates
      const templates = {
        fun: [
          "Who's ready for some fun tonight? 🥳 Come join us!",
          'Good vibes only at Trio! ✨ See you soon!',
          'Eat, drink, and be merry! 🍻 #TrioLife',
          'Why cook when you can come to Trio? 🍕🍔',
          "Weekend mode: ON! 🚀 Let's party!",
        ],
        classy: [
          'Experience the elegance of fine dining at Trio. 🍷',
          'A taste of sophistication in every bite. ✨',
          'Join us for an evening of exquisite flavors. 🍽️',
          'Elevate your dining experience with us tonight.',
          'Savor the moment with our curated wine selection. 🥂',
        ],
        short: [
          'Open tonight! 🌙',
          'See you soon! 👋',
          'Fresh eats. 🥗',
          'Drinks are poured. 🍺',
          'Come on in! 🚪',
        ],
        promotional: [
          'Special Offer! 50% off appetizers tonight! 🏷️',
          "Don't miss out on our Happy Hour deals! ⏰",
          'Buy one get one free on select cocktails! 🍹',
          "Limited time offer: Chef's Special! 👨‍🍳",
          'Book your table now and get a free dessert! 🍰',
        ],
      }

      const captions = templates[tone] || templates.fun

      // Generate 5 posts scheduled for the next 5 days
      for (let i = 0; i < 5; i++) {
        const scheduledDate = new Date(today)
        scheduledDate.setDate(today.getDate() + i + 1) // Start tomorrow
        scheduledDate.setHours(18, 0, 0, 0) // Set to 6 PM

        posts.push({
          caption: captions[i],
          mediaUrls: [], // Placeholder for images
          scheduledFor: formatDate(scheduledDate),
        })
      }

      return posts
    }

    const generatedPosts = generatePosts()

    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    return NextResponse.json({
      success: true,
      posts: generatedPosts,
    })
  } catch (error) {
    console.error('Generate campaign error:', error)
    return NextResponse.json({ error: 'Failed to generate campaign' }, { status: 500 })
  }
}
