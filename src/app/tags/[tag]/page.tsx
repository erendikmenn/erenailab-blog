import { Metadata } from 'next'
import { getAllPosts } from '@/lib/mdx'
import { notFound } from 'next/navigation'
import { BlogPostCard } from '@/components/blog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Tag as TagIcon, Hash } from 'lucide-react'
import Link from 'next/link'

interface TagPageProps {
  params: Promise<{
    tag: string
  }>
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  const tags = Array.from(new Set(posts.flatMap(post => post.tags)))
  
  return tags.map((tag) => ({
    tag,
  }))
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)

  return {
    title: `#${decodedTag} - ErenAILab`,
    description: `${decodedTag} etiketi ile işaretlenmiş tüm blog yazılarını keşfedin.`,
    keywords: [decodedTag, 'etiket', 'blog', 'yazılar'],
    openGraph: {
      title: `#${decodedTag} - ErenAILab`,
      description: `${decodedTag} etiketi ile işaretlenmiş tüm blog yazılarını keşfedin.`,
      type: 'website',
    },
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  
  const allPosts = await getAllPosts()
  const tagPosts = allPosts.filter(post => 
    post.tags.some(postTag => postTag.toLowerCase() === decodedTag.toLowerCase())
  )

  if (tagPosts.length === 0) {
    notFound()
  }

  // Get related tags (tags that appear with this tag)
  const relatedTags = Array.from(new Set(
    tagPosts.flatMap(post => post.tags)
      .filter(postTag => postTag.toLowerCase() !== decodedTag.toLowerCase())
  )).slice(0, 8)

  // Calculate total reading time
  const totalReadingTime = tagPosts.reduce((total, post) => total + post.readingTime, 0)

  // Get categories of posts with this tag
  const categories = Array.from(new Set(tagPosts.map(post => post.category)))

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="gap-2">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4" />
              Blog
            </Link>
          </Button>
        </div>

        {/* Tag Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900 rounded-full">
              <Hash className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span className="text-primary-800 dark:text-primary-200 font-medium">
                {decodedTag}
              </span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            #{decodedTag}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            <strong>{decodedTag}</strong> etiketi ile işaretlenmiş tüm yazılar. 
            Bu konuda uzman içerikler ve derinlemesine analizler.
          </p>

          {/* Tag Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-lg mx-auto">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {tagPosts.length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Yazı</p>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {totalReadingTime}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">dk Okuma</p>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {categories.length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Kategori</p>
            </Card>
          </div>
        </div>

        {/* Related Tags */}
        {relatedTags.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TagIcon className="h-4 w-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                İlgili Etiketler
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {relatedTags.map((relatedTag) => (
                <Link
                  key={relatedTag}
                  href={`/tags/${encodeURIComponent(relatedTag)}`}
                  className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  #{relatedTag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            #{decodedTag} Yazıları ({tagPosts.length})
          </h2>
        </div>

        <div className="grid gap-8 mb-12">
          {tagPosts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>

        {/* Categories this tag appears in */}
        {categories.length > 1 && (
          <div className="mt-16">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Bu Etiketin Bulunduğu Kategoriler
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const categoryPosts = tagPosts.filter(post => post.category === category)
                const categoryNames = {
                  'theoretical-ai': 'Teorik AI',
                  'machine-learning': 'Makine Öğrenmesi',
                  'research-reviews': 'Araştırma İncelemeleri',
                  'energy-sustainability': 'Enerji & Sürdürülebilirlik',
                  'implementation': 'Uygulama',
                  'career-insights': 'Kariyer İpuçları',
                }
                
                return (
                  <Card key={category} className="p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {categoryNames[category as keyof typeof categoryNames] || category}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {categoryPosts.length} yazı
                    </p>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={`/categories/${category}`}>
                        Kategoriye Git
                      </Link>
                    </Button>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Back to Blog CTA */}
        <div className="mt-16 text-center">
          <Card className="p-8 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Daha Fazla İçerik Keşfet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Yapay zeka dünyasının diğer konularını da keşfetmek ister misiniz?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/blog">
                  Tüm Yazılar
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/categories">
                  Kategoriler
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}