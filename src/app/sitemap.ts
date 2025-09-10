import { getAllPosts } from '@/lib/mdx'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts()
  const baseUrl = 'https://erenailab.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Categories
  const categories = ['theoretical-ai', 'machine-learning', 'research-reviews', 'energy-sustainability', 'implementation', 'career-insights']
  const categoryPages: MetadataRoute.Sitemap = categories.map(category => ({
    url: `${baseUrl}/categories/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Tags
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)))
  const tagPages: MetadataRoute.Sitemap = allTags.map(tag => ({
    url: `${baseUrl}/tags/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // Blog posts
  const blogPosts: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...staticPages, ...categoryPages, ...tagPages, ...blogPosts]
}