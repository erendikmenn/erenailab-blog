import { getAllPosts } from '@/lib/mdx'
import { BlogPostCard } from '@/components/blog'

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Blog Yazıları
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Yapay zeka alanındaki en son araştırmalar ve derinlemesine analizler
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Henüz blog yazısı bulunmuyor.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}