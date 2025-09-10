import { Metadata } from 'next'
import { getAllPosts } from '@/lib/mdx'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { ArrowRight } from 'lucide-react'
import { categories } from '@/lib/config'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Kategoriler - ErenAILab',
  description: 'ErenAILab blog kategorilerini keşfedin. Yapay zeka, makine öğrenmesi, araştırma incelemeleri ve daha fazlası.',
  keywords: ['kategoriler', 'yapay zeka', 'makine öğrenmesi', 'araştırma', 'blog'],
  openGraph: {
    title: 'Kategoriler - ErenAILab',
    description: 'ErenAILab blog kategorilerini keşfedin. Yapay zeka, makine öğrenmesi, araştırma incelemeleri ve daha fazlası.',
    type: 'website',
  },
}

export default async function CategoriesPage() {
  const posts = await getAllPosts()
  
  // Count posts by category
  const categoryStats = categories.map(category => {
    const postCount = posts.filter(post => post.category === category.id).length
    return {
      ...category,
      postCount
    }
  })

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Blog Kategorileri
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Yapay zeka dünyasının farklı alanlarını keşfedin. Her kategori, uzman içerikler 
            ve derinlemesine analizler içerir.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {categoryStats.map((category) => {
            const IconComponent = category.icon
            
            return (
              <Card 
                key={category.id} 
                className="group hover:shadow-lg transition-all duration-300 h-full"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className={`h-12 w-12 rounded-lg ${category.color} flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {category.postCount} yazı
                    </span>
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-between flex-1">
                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed flex-1">
                    {category.description}
                  </p>
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full transition-colors"
                  >
                    <Link href={`/categories/${category.id}`} className="flex items-center justify-center gap-2">
                      Kategoriyi Keşfet
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="text-center h-full">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {posts.length}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Toplam Yazı</p>
            </CardContent>
          </Card>
          <Card className="text-center h-full">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {categories.length}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Kategori</p>
            </CardContent>
          </Card>
          <Card className="text-center h-full">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {posts.filter(post => post.featured).length}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Öne Çıkan</p>
            </CardContent>
          </Card>
        </div>

        {/* Popular Categories */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            En Popüler Kategoriler
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {categoryStats
              .sort((a, b) => b.postCount - a.postCount)
              .slice(0, 4)
              .map((category, index) => {
                const IconComponent = category.icon
                
                return (
                  <Card key={category.id} className="flex items-center p-6 hover:shadow-md transition-shadow h-full">
                    <div className={`h-10 w-10 rounded-lg ${category.color} flex items-center justify-center mr-4 flex-shrink-0`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.postCount} yazı
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-gray-300 dark:text-gray-600 flex-shrink-0">
                      #{index + 1}
                    </div>
                  </Card>
                )
              })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">
                İlginizi Çeken Kategorileri Keşfedin
              </h2>
              <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
                Her kategori özenle seçilmiş, uzman yazarlar tarafından hazırlanmış 
                kaliteli içerikler barındırır. Bilginizi derinleştirin.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/blog">
                    Tüm Yazıları Görüntüle
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-transparent border-white text-white hover:bg-white hover:text-primary-600" 
                  asChild
                >
                  <Link href="/contact">
                    Kategori Öner
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}