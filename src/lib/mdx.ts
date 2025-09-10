import fs from 'fs'
import path from 'path'
import { BlogPost } from '@/types'
import { estimateReadingTime, extractExcerpt } from './utils'

const postsDirectory = path.join(process.cwd(), 'content/posts')

// Simple frontmatter parser
function parseFrontmatter(content: string) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)
  
  if (!match) {
    return { data: {}, content }
  }
  
  const frontmatter = match[1]
  const bodyContent = match[2]
  
  const data: any = {}
  
  frontmatter.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':')
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '')
      
      // Handle arrays (tags)
      if (value.startsWith('[') && value.endsWith(']')) {
        data[key.trim()] = value.slice(1, -1).split(',').map((item: string) => item.trim().replace(/^["']|["']$/g, ''))
      } else if (value === 'true') {
        data[key.trim()] = true
      } else if (value === 'false') {
        data[key.trim()] = false
      } else {
        data[key.trim()] = value
      }
    }
  })
  
  return { data, content: bodyContent }
}

/**
 * Get all posts (Turkish only - English handled by dynamic translation)
 * @returns Array of blog posts
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  // Only load Turkish posts (exclude English-specific files)
  const turkishFiles = fileNames.filter(fileName => 
    fileName.endsWith('.mdx') && !fileName.includes('-en.mdx')
  )

  const allPostsData: BlogPost[] = []

  for (const fileName of turkishFiles) {
    const slug = fileName.replace(/\.mdx$/, '')
    const post = await getPostBySlug(slug)
    if (post) {
      allPostsData.push(post)
    }
  }

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

/**
 * Get a single post by slug (Turkish content)
 * @param slug - Post slug
 * @returns Blog post or null
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const filePath = path.join(postsDirectory, `${slug}.mdx`)
    
    if (!fs.existsSync(filePath)) {
      return null
    }

    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = parseFrontmatter(fileContents)

    return {
      slug,
      title: data.title || '',
      description: data.description || '',
      date: data.date || '',
      author: data.author || 'Eren Dikmen',
      category: data.category || 'uncategorized',
      tags: data.tags || [],
      readingTime: estimateReadingTime(content),
      content: content,
      excerpt: data.description || extractExcerpt(content),
      featured: data.featured || false,
      language: 'tr', // Always Turkish, dynamic translation handles English
    }
  } catch (error) {
    console.error('Error reading post:', error)
    return null
  }
}

/**
 * Get posts by category
 * @param category - Category ID
 * @returns Array of blog posts in that category
 */
export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const allPosts = await getAllPosts()
  return allPosts.filter((post) => post.category === category)
}

/**
 * Get featured posts
 * @returns Array of featured blog posts
 */
export async function getFeaturedPosts(): Promise<BlogPost[]> {
  const allPosts = await getAllPosts()
  return allPosts.filter((post) => post.featured)
}

/**
 * Get recent posts
 * @param limit - Number of posts to return
 * @returns Array of recent blog posts
 */
export async function getRecentPosts(limit: number = 5): Promise<BlogPost[]> {
  const allPosts = await getAllPosts()
  return allPosts.slice(0, limit)
}

/**
 * Search posts by query
 * @param query - Search query
 * @returns Array of matching blog posts
 */
export async function searchPosts(query: string): Promise<BlogPost[]> {
  const allPosts = await getAllPosts()
  const lowercaseQuery = query.toLowerCase()

  return allPosts.filter((post) => {
    return (
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.description.toLowerCase().includes(lowercaseQuery) ||
      post.content.toLowerCase().includes(lowercaseQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
    )
  })
}

/**
 * Get all available categories
 * @returns Array of category IDs
 */
export function getAllCategories(): string[] {
  return [
    'theoretical-ai',
    'machine-learning',
    'research-reviews',
    'energy-sustainability',
    'implementation',
    'career-insights'
  ]
}

/**
 * Get all available tags
 * @returns Array of tag names
 */
export function getAllTags(): string[] {
  return [
    'deep-learning',
    'mathematics',
    'transformer',
    'neural-networks',
    'sustainability',
    'energy-efficiency',
    'green-ai',
    'carbon-footprint',
    'research',
    'theory',
    'implementation',
    'career'
  ]
}