import { getPostBySlug, getAllPosts } from '@/lib/mdx'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { formatDate } from '@/lib/utils'
import { Clock, User, Tag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CommentSection } from '@/components/comments/comment-section'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="gap-2">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4" />
              Blog&apos;a Dön
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <header className="mb-12">
          <div className="mb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
              {getCategoryName(post.category)}
            </span>
            {post.featured && (
              <span className="ml-2 inline-block px-3 py-1 bg-accent-100 text-accent-800 rounded-full text-sm font-medium dark:bg-accent-900 dark:text-accent-200">
                ⭐ Öne Çıkan
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            {post.description}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-8">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.readingTime} dakika okuma</span>
            </div>
            <time dateTime={post.date}>
              {formatDate(post.date)}
            </time>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-gray-400" />
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${tag}`}
                  className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
              h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>,
              p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
              code: ({ children, className }) => {
                const isInline = !className
                if (isInline) {
                  return <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">{children}</code>
                }
                return (
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                    <code className={className}>{children}</code>
                  </pre>
                )
              },
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary-500 pl-4 italic my-6 text-gray-700 dark:text-gray-300">
                  {children}
                </blockquote>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Article Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Bu yazı yararlı oldu mu?
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  👍 Evet
                </Button>
                <Button variant="outline" size="sm">
                  👎 Hayır
                </Button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Paylaş:
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Twitter
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </footer>

        {/* Comment Section */}
        <CommentSection postSlug={post.slug} language="tr" />
      </div>
    </article>
  )
}

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

function getCategoryName(category: string): string {
  const names = {
    'theoretical-ai': 'Teorik AI',
    'machine-learning': 'Makine Öğrenmesi',
    'research-reviews': 'Araştırma İncelemeleri',
    'energy-sustainability': 'Enerji & Sürdürülebilirlik',
    'implementation': 'Uygulama',
    'career-insights': 'Kariyer İpuçları',
  }
  return names[category as keyof typeof names] || category
}