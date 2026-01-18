// Blog Types - Mirror of Payload CMS structure for easy swapping
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  heroImage: string;
  category: "tutorials" | "artist-stories" | "product-news";
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  readTime: string;
  featured?: boolean;
}

export interface Comment {
  id: string;
  name: string;
  email: string;
  comment: string;
  createdAt: string;
}

// Dummy data for development - Replace with Payload CMS data
export const dummyPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Art of Touch: Mastering Piano Dynamics",
    slug: "mastering-piano-dynamics",
    excerpt:
      "Discover the secrets behind expressive piano playing and how to develop a nuanced touch that brings music to life.",
    content: `
      <p>The piano is often called the "king of instruments," and for good reason. Its remarkable range of dynamics—from the softest whisper to the most thunderous fortissimo—makes it uniquely expressive among keyboard instruments.</p>
      
      <h2>Understanding Dynamic Control</h2>
      <p>Dynamic control begins with understanding the mechanics of the piano. When you press a key, a hammer strikes the string. The velocity of your keystroke determines the hammer's speed, which in turn affects the volume and tone quality of the note.</p>
      
      <blockquote>
        <p>"The piano keys are black and white, but they sound like a million colors in your mind."</p>
        <cite>— Maria Cristina Mena</cite>
      </blockquote>
      
      <h2>Developing Your Touch</h2>
      <p>Professional pianists spend years developing what they call "touch"—the ability to produce exactly the sound they want through subtle variations in keystroke velocity, weight transfer, and finger technique.</p>
      
      <h3>Key Techniques to Practice</h3>
      <p>Begin with simple scales, focusing not on speed but on producing an even, controlled sound. Pay attention to the weight of your arm and how it transfers through your fingers to the keys.</p>
      
      <p>The journey to mastering dynamics is a lifelong pursuit, but the rewards—the ability to truly "sing" through the instrument—are immeasurable.</p>
    `,
    heroImage:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=1600&h=900&fit=crop",
    category: "tutorials",
    author: {
      name: "Elena Rossi",
    },
    publishedAt: "2026-01-15",
    readTime: "8 min read",
    featured: true,
  },
  {
    id: "2",
    title: "Behind the Keys: An Interview with Marcus Chen",
    slug: "interview-marcus-chen",
    excerpt:
      "World-renowned pianist Marcus Chen shares his journey from childhood prodigy to concert hall sensation.",
    content: `<p>In this exclusive interview, Marcus Chen opens up about his musical journey...</p>`,
    heroImage:
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=600&fit=crop",
    category: "artist-stories",
    author: {
      name: "James Wright",
    },
    publishedAt: "2026-01-12",
    readTime: "12 min read",
  },
  {
    id: "3",
    title: "Introducing the DreamPlay Concert Grand",
    slug: "dreamplay-concert-grand",
    excerpt:
      "Experience unparalleled craftsmanship with our latest flagship instrument, designed for the world's most demanding performers.",
    content: `<p>We are proud to unveil the DreamPlay Concert Grand...</p>`,
    heroImage:
      "https://images.unsplash.com/photo-1552422535-c45813c61732?w=800&h=600&fit=crop",
    category: "product-news",
    author: {
      name: "DreamPlay Team",
    },
    publishedAt: "2026-01-10",
    readTime: "5 min read",
  },
  {
    id: "4",
    title: "Proper Piano Posture: A Complete Guide",
    slug: "proper-piano-posture",
    excerpt:
      "Learn the fundamentals of ergonomic piano playing to prevent injury and improve your technique.",
    content: `<p>Good posture is the foundation of healthy piano playing...</p>`,
    heroImage:
      "https://images.unsplash.com/photo-1514119412350-e174d90d280e?w=800&h=600&fit=crop",
    category: "tutorials",
    author: {
      name: "Dr. Sarah Miller",
    },
    publishedAt: "2026-01-08",
    readTime: "6 min read",
  },
  {
    id: "5",
    title: "The Journey of Yuki Tanaka: From Tokyo to Carnegie Hall",
    slug: "yuki-tanaka-journey",
    excerpt:
      "Follow the inspiring story of pianist Yuki Tanaka and her path to international recognition.",
    content: `<p>Yuki Tanaka's story is one of dedication and passion...</p>`,
    heroImage:
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&h=600&fit=crop",
    category: "artist-stories",
    author: {
      name: "Michael Torres",
    },
    publishedAt: "2026-01-05",
    readTime: "10 min read",
  },
  {
    id: "6",
    title: "2026 Limited Edition: The Midnight Collection",
    slug: "midnight-collection-2026",
    excerpt:
      "Introducing our exclusive limited edition pianos featuring stunning ebony finishes and gold accents.",
    content: `<p>The Midnight Collection represents the pinnacle of piano design...</p>`,
    heroImage:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&h=600&fit=crop",
    category: "product-news",
    author: {
      name: "DreamPlay Team",
    },
    publishedAt: "2026-01-03",
    readTime: "4 min read",
  },
];

export const dummyComments: Comment[] = [
  {
    id: "1",
    name: "Alexandra Kim",
    email: "alex@example.com",
    comment:
      "This article completely transformed how I approach dynamics in my practice sessions. Thank you for such detailed insights!",
    createdAt: "2026-01-16",
  },
  {
    id: "2",
    name: "Robert Chen",
    email: "robert@example.com",
    comment:
      "As a piano teacher, I'll definitely be sharing this with my students. Beautifully written.",
    createdAt: "2026-01-15",
  },
];

// Helper functions
export function getPostBySlug(slug: string): BlogPost | undefined {
  return dummyPosts.find((post) => post.slug === slug);
}

export function getFeaturedPost(): BlogPost | undefined {
  return dummyPosts.find((post) => post.featured);
}

export function getPostsByCategory(
  category: BlogPost["category"]
): BlogPost[] {
  return dummyPosts.filter((post) => post.category === category);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getCategoryLabel(category: BlogPost["category"]): string {
  const labels: Record<BlogPost["category"], string> = {
    tutorials: "Tutorials",
    "artist-stories": "Artist Stories",
    "product-news": "Product News",
  };
  return labels[category];
}
