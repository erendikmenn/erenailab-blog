import { Metadata } from 'next'
import { getAllPosts } from '@/lib/mdx'
import { notFound } from 'next/navigation'
import { BlogPostCard } from '@/components/blog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Filter, Calendar, Tag as TagIcon } from 'lucide-react'
import Link from 'next/link'

interface CategoryPageProps {
  params: Promise<{
    category: string
  }>
}

const categories = {
  'theoretical-ai': {
    name: 'Teorik AI',
    description: 'Yapay zekanın matematiksel temelleri, algoritma teorisi ve optimizasyon yöntemleri',
    color: 'blue'
  },
  'machine-learning': {
    name: 'Makine Öğrenmesi',
    description: 'Derin öğrenme, sinir ağları ve pratik ML uygulamaları',
    color: 'green'
  },
  'research-reviews': {
    name: 'Araştırma İncelemeleri',
    description: 'En son akademik makaleler, konferans sunumları ve araştırma trendleri',
    color: 'purple'
  },
  'energy-sustainability': {
    name: 'Enerji & Sürdürülebilirlik',
    description: 'AI\'nin çevresel etkisi, yeşil teknolojiler ve sürdürülebilir AI çözümleri',
    color: 'emerald'
  },
  'implementation': {
    name: 'Uygulama',
    description: 'Kod örnekleri, tutorial\'lar ve pratik AI projeleri',
    color: 'orange'
  },
  'career-insights': {
    name: 'Kariyer İpuçları',
    description: 'AI kariyeri, iş fırsatları ve profesyonel gelişim tavsiyeleri',
    color: 'pink'
  }
}

export async function generateStaticParams() {
  return Object.keys(categories).map((category) => ({
    category,
  }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params
  const categoryInfo = categories[category as keyof typeof categories]
  
  if (!categoryInfo) {
    return {
      title: 'Kategori Bulunamadı',
    }
  }

  return {
    title: `${categoryInfo.name} - ErenAILab`,
    description: categoryInfo.description,
    keywords: [categoryInfo.name.toLowerCase(), 'yapay zeka', 'blog', 'makale'],
    openGraph: {
      title: `${categoryInfo.name} - ErenAILab`,
      description: categoryInfo.description,
      type: 'website',
    },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params
  const categoryInfo = categories[category as keyof typeof categories]

  if (!categoryInfo) {
    notFound()
  }

  const allPosts = await getAllPosts()
  const categoryPosts = allPosts.filter(post => post.category === category)

  // Get unique tags from category posts
  const tags = Array.from(new Set(categoryPosts.flatMap(post => post.tags)))
  
  // Calculate total reading time
  const totalReadingTime = categoryPosts.reduce((total, post) => total + post.readingTime, 0)

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="gap-2">
            <Link href="/categories">
              <ArrowLeft className="h-4 w-4" />
              Kategoriler
            </Link>
          </Button>
        </div>

        {/* Category Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium bg-${categoryInfo.color}-100 text-${categoryInfo.color}-800 dark:bg-${categoryInfo.color}-900 dark:text-${categoryInfo.color}-200`}>
              {categoryInfo.name}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {categoryInfo.name}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            {categoryInfo.description}
          </p>

          {/* Category Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {categoryPosts.length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Yazı</p>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {tags.length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Etiket</p>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {totalReadingTime}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">dk Okuma</p>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {categoryPosts.filter(post => post.featured).length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Öne Çıkan</p>
            </Card>
          </div>
        </div>

        {/* Tags Filter */}
        {tags.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TagIcon className="h-4 w-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Bu Kategorideki Etiketler
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${tag}`}
                  className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Posts */}
        {categoryPosts.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {categoryInfo.name} Yazıları ({categoryPosts.length})
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>En yeniden eskiye</span>
              </div>
            </div>

            <div className="grid gap-8 mb-12">
              {categoryPosts.map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>
          </>
        ) : (
          <Card className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <Filter className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Bu kategoride henüz yazı yok
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {categoryInfo.name} kategorisinde yakında yeni içerikler yayınlanacak.
            </p>
            <Button asChild>
              <Link href="/blog">
                Diğer Yazıları Görüntüle
              </Link>
            </Button>
          </Card>
        )}

        {/* Related Categories */}
        <div className="mt-16">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            İlgili Kategoriler
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categories)
              .filter(([key]) => key !== category)
              .slice(0, 3)
              .map(([key, info]) => (
                <Card key={key} className="p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {info.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {info.description}
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/categories/${key}`}>
                      Keşfet
                    </Link>
                  </Button>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}