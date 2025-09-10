'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Textarea,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui'
import { User, Mail, Calendar, Settings, Shield, MessageSquare, Heart } from 'lucide-react'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userStats, setUserStats] = useState({
    totalComments: 0,
    totalLikes: 0,
    joinDate: '',
  })
  const [loading, setLoading] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/auth/signin?callbackUrl=/profile')
      return
    }
  }, [session, status, router])

  // Fetch user statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!session?.user?.id) return

      try {
        const response = await fetch(`/api/users/${session.user.id}/stats`)
        if (response.ok) {
          const data = await response.json()
          setUserStats(data)
        }
      } catch (error) {
        console.error('Error fetching user stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchUserStats()
    }
  }, [session])

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const { user } = session

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Profil
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Hesap bilgilerinizi ve istatistiklerinizi görüntüleyin
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Temel Bilgiler
                </CardTitle>
                <CardDescription>
                  Hesap bilgileriniz ve profil detayları
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.image || ''} alt={user.name || ''} />
                    <AvatarFallback className="text-2xl">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {user.name || 'İsimsiz Kullanıcı'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1">
                      <Mail className="h-4 w-4 mr-2" />
                      {user.email}
                    </p>
                    <div className="flex items-center mt-2">
                      <Shield className="h-4 w-4 mr-2 text-primary-600" />
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : user.role === 'MODERATOR'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      İsim
                    </label>
                    <Input
                      type="text"
                      value={user.name || ''}
                      disabled
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      İsim OAuth provider tarafından belirlenir
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      E-posta
                    </label>
                    <Input
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio (Yakında)
                    </label>
                    <Textarea
                      placeholder="Kendiniz hakkında kısa bir açıklama..."
                      disabled
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Profil düzenleme özelliği yakında eklenecek
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Hesap İşlemleri
                </CardTitle>
                <CardDescription>
                  Hesap güvenliği ve tercihler
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" disabled className="w-full sm:w-auto">
                  Şifre Değiştir (OAuth)
                </Button>
                <Button variant="outline" disabled className="w-full sm:w-auto ml-0 sm:ml-3">
                  Profil Fotoğrafı Değiştir
                </Button>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    OAuth ile giriş yaptığınız için şifre değiştirme ve profil fotoğrafı değiştirme 
                    işlemleri OAuth provider üzerinden yapılmalıdır.
                  </p>
                  
                  {user.role === 'ADMIN' && (
                    <Button asChild className="w-full sm:w-auto">
                      <a href="/admin">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Panel
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>İstatistikler</CardTitle>
                <CardDescription>
                  Aktivite özeti
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Yorumlar</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {userStats.totalComments}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Beğeniler</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {userStats.totalLikes}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Üyelik</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {userStats.joinDate || 'Yakında'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Hızlı Erişim</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/blog">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Blog Yazıları
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/categories">
                    <Settings className="h-4 w-4 mr-2" />
                    Kategoriler
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/contact">
                    <Mail className="h-4 w-4 mr-2" />
                    İletişim
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Development Note */}
            {process.env.NODE_ENV === 'development' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-yellow-600">🔧 Dev Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Profil düzenleme özellikleri yakında eklenecek. Şimdilik sadece görüntüleme modu aktif.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}