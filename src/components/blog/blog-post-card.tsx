'use client'

import { memo, useMemo } from 'react'
import Link from 'next/link'
import { BlogPost } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { Clock, User, Tag } from 'lucide-react'
import { categories } from '@/lib/config'

interface BlogPostCardProps {
  post: BlogPost
}

function BlogPostCardComponent({ post }: BlogPostCardProps) {
  // Memoize computed values that depend on props
  const categoryColor = useMemo(() => getCategoryColor(post.category), [post.category])
  
  const categoryName = useMemo(() => {
    const category = categories.find(cat => cat.id === post.category)
    return category ? category.name : post.category
  }, [post.category])
  
  const formattedDate = useMemo(() => formatDate(post.date), [post.date])
  
  const visibleTags = useMemo(() => post.tags.slice(0, 3), [post.tags])
  
  const hiddenTagsCount = useMemo(() => {
    const count = post.tags.length - 3
    return count > 0 ? count : 0
  }, [post.tags.length])
  
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColor}`}>
            {categoryName}
          </span>
          {post.featured && (
            <span className="px-2 py-1 bg-accent-100 text-accent-800 rounded-full text-xs font-medium dark:bg-accent-900 dark:text-accent-200">
              ⭐ Öne Çıkan
            </span>
          )}
        </div>
        
        <CardTitle className="line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
          <Link href={`/blog/${post.slug}`}>
            {post.title}
          </Link>
        </CardTitle>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
          {post.excerpt}
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Meta Information */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{post.readingTime} dk</span>
            </div>
          </div>
          
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-gray-400" />
              {visibleTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${tag}`}
                  className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
              {hiddenTagsCount > 0 && (
                <span className="text-xs text-gray-400">
                  +{hiddenTagsCount} daha
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formattedDate}
          </span>
          <Button asChild variant="outline" size="sm">
            <Link href={`/blog/${post.slug}`}>
              Devamını Oku
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Memoize the component to prevent unnecessary re-renders when props haven't changed
export const BlogPostCard = memo(BlogPostCardComponent)

function getCategoryColor(category: string): string {
  const colors = {
    'theoretical-ai': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'machine-learning': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'research-reviews': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'energy-sustainability': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    'implementation': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'career-insights': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  }
  return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

