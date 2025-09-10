'use client'

import { useState } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Textarea
} from '@/components/ui'
import { 
  Plus,
  Save,
  Eye,
  FileText,
  Tag,
  Calendar,
  User
} from 'lucide-react'

export function PostCreator() {
  const [isCreating, setIsCreating] = useState(false)
  const [postData, setPostData] = useState({
    title: '',
    title_en: '',
    excerpt: '',
    excerpt_en: '',
    content: '',
    content_en: '',
    category: '',
    tags: '',
    author: '',
    featured: false,
    language: 'tr'
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setPostData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCreatePost = async () => {
    if (!postData.title || !postData.content) {
      alert('Başlık ve içerik zorunludur!')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      if (response.ok) {
        alert('Post başarıyla oluşturuldu!')
        setPostData({
          title: '',
          title_en: '',
          excerpt: '',
          excerpt_en: '',
          content: '',
          content_en: '',
          category: '',
          tags: '',
          author: '',
          featured: false,
          language: 'tr'
        })
      } else {
        const error = await response.json()
        alert(`Hata: ${error.message}`)
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Post oluşturulurken hata oluştu!')
    } finally {
      setIsCreating(false)
    }
  }

  const categories = [
    { id: 'theoretical-ai', name: 'Teorik AI' },
    { id: 'machine-learning', name: 'Makine Öğrenmesi' },
    { id: 'research-reviews', name: 'Araştırma İncelemeleri' },
    { id: 'energy-sustainability', name: 'Enerji & Sürdürülebilirlik' },
    { id: 'implementation', name: 'Uygulama' },
    { id: 'career-insights', name: 'Kariyer İpuçları' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Post Yönetimi
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Yeni blog yazısı oluşturun veya mevcut yazıları düzenleyin
          </p>
        </div>
        <Button 
          onClick={() => setIsCreating(!isCreating)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Yeni Post
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Yeni Blog Yazısı Oluştur
            </CardTitle>
            <CardDescription>
              Sadece ADMIN kullanıcıları yeni post oluşturabilir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Başlık (Türkçe) *
                </label>
                <Input
                  value={postData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Post başlığını girin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Başlık (İngilizce)
                </label>
                <Input
                  value={postData.title_en}
                  onChange={(e) => handleInputChange('title_en', e.target.value)}
                  placeholder="English title"
                />
              </div>
            </div>

            {/* Excerpts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Özet (Türkçe)
                </label>
                <Textarea
                  value={postData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Kısa özet yazın..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Özet (İngilizce)
                </label>
                <Textarea
                  value={postData.excerpt_en}
                  onChange={(e) => handleInputChange('excerpt_en', e.target.value)}
                  placeholder="Short excerpt..."
                  rows={3}
                />
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  İçerik (Türkçe) *
                </label>
                <Textarea
                  value={postData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Markdown formatında içerik yazın..."
                  rows={10}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  İçerik (İngilizce)
                </label>
                <Textarea
                  value={postData.content_en}
                  onChange={(e) => handleInputChange('content_en', e.target.value)}
                  placeholder="Content in markdown format..."
                  rows={10}
                />
              </div>
            </div>

            {/* Meta Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Tag className="h-4 w-4 inline mr-1" />
                  Kategori
                </label>
                <select
                  value={postData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">Kategori seçin</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Tag className="h-4 w-4 inline mr-1" />
                  Etiketler
                </label>
                <Input
                  value={postData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="ai, machine-learning, deep-learning"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Yazar
                </label>
                <Input
                  value={postData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  placeholder="Yazar adı"
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={postData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Öne çıkan post</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsCreating(false)}
              >
                İptal
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={isCreating || !postData.title || !postData.content}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isCreating ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Posts List */}
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Blog Yazıları</CardTitle>
          <CardDescription>
            Yayınlanan ve taslak blog yazıları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Modern Deep Learning Mathematics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  theoretical-ai • 15 dakika okuma • Eren AI
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full dark:bg-green-900 dark:text-green-200">
                  Yayında
                </span>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Sustainable AI Energy Efficiency</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  energy-sustainability • 12 dakika okuma • Eren AI
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full dark:bg-green-900 dark:text-green-200">
                  Yayında
                </span>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}