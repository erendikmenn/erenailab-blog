import Link from 'next/link'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { BlogPostCard } from '@/components/blog'
import { categories } from '@/lib/config'
import { getFeaturedPosts } from '@/lib/mdx'
import { BookOpen, Users, TrendingUp, Zap } from 'lucide-react'

export default async function HomePage() {
  const featuredPosts = await getFeaturedPosts()

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950 py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Yapay Zeka Alanında
              <span className="block text-primary-600 dark:text-primary-400">
                Öğrenme Yolculuğum
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Bir öğrenci olarak yapay zeka dünyasında keşfettiğim konuları, öğrendiklerimi ve 
              merak ettiklerimi paylaştığım kişisel öğrenme blogu.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-3">
                <Link href="/blog">
                  Blog Yazılarını Keşfet
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
                <Link href="/about">
                  ErenAILab Hakkında
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <section className="py-20 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Öne Çıkan Yazılar
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Son zamanlarda yazdığım ve en çok ilgi gören yazılarım
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredPosts.slice(0, 3).map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>

            <div className="text-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/blog">
                  Tüm Yazıları Görüntüle
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Neden Bu Blog?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Öğrenme sürecimi paylaşıyor, merak ettiklerimi araştırıyor ve birlikte büyüyoruz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center h-full">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <CardTitle>Öğrenme Odaklı</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>
                  Anlaşılır dilde, öğrenci perspektifinden yazılmış içerikler ve öğrenme notları
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center h-full">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-lg bg-secondary-100 dark:bg-secondary-900 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
                </div>
                <CardTitle>Merak ve Keşif</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>
                  AI dünyasında keşfettiğim yeni konular ve merak ettiğim araştırmalar
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center h-full">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-lg bg-accent-100 dark:bg-accent-900 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-accent-600 dark:text-accent-400" />
                </div>
                <CardTitle>Pratik Örnekler</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>
                  Teoriyi pratiğe dökmek için yaptığım projeler ve deneyimler
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center h-full">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle>Birlikte Öğrenme</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>
                  Sorular, tartışmalar ve birlikte öğrenme için samimi bir ortam
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              İçerik Kategorileri
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              İlginizi çeken AI konularını keşfedin ve benimle birlikte öğrenin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <Card key={category.id} className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center space-x-3">
                      <div className={`h-12 w-12 rounded-lg ${category.color} flex items-center justify-center text-white flex-shrink-0`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg leading-tight">{category.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <CardDescription className="mb-4 flex-1">
                      {category.description}
                    </CardDescription>
                    <Button asChild variant="outline" className="w-full mt-auto">
                      <Link href={`/categories/${category.id}`}>
                        Kategoriye Git
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 dark:bg-primary-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            AI Yolculuğunuza Bugün Başlayın
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Yeni yazılarımdan haberdar olmak için newsletter&apos;a abone olun
          </p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="E-posta adresiniz"
              className="flex-1 px-4 py-3 rounded-lg border-0 text-gray-900 bg-white focus:ring-2 focus:ring-primary-300 focus:outline-none dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
            />
            <Button variant="accent" size="lg" className="px-8">
              Abone Ol
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}