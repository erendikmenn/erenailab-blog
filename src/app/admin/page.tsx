'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui'
import {
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Shield,
  Activity,
  Eye,
  UserCheck,
  UserX,
  Trash2,
} from 'lucide-react'

interface AdminStats {
  overview: {
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
    totalComments: number
    pendingComments: number
    approvedComments: number
    rejectedComments: number
    spamComments: number
  }
  trends: {
    commentsToday: number
    commentsThisWeek: number
    commentsThisMonth: number
    commentTrend: number
    usersToday: number
    usersThisWeek: number
    usersThisMonth: number
    userTrend: number
  }
  distributions: {
    commentsByStatus: Record<string, number>
    usersByRole: Record<string, number>
  }
  recentActivity: Array<{
    id: string
    action: string
    user: string
    targetType: string
    targetId: string
    details: any
    createdAt: string
  }>
  alerts: {
    highPendingComments: boolean
    newSpamComments: boolean
    inactiveAdmins: boolean
  }
}

interface Comment {
  id: string
  content: string
  postSlug: string
  status: string
  createdAt: string
  ipAddress?: string
  user: {
    id: string
    name: string
    email: string
    image?: string
    role: string
  }
  parent?: {
    id: string
    content: string
    user: {
      name: string
    }
  }
  _count: {
    likes: number
    replies: number
  }
}

interface User {
  id: string
  name: string
  email: string
  image?: string
  role: string
  isActive: boolean
  bio?: string
  website?: string
  twitter?: string
  github?: string
  linkedin?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
  _count: {
    comments: number
    commentLikes: number
  }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [pendingComments, setPendingComments] = useState<Comment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'users' | 'activity'>('overview')

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/auth/signin?callbackUrl=/admin')
      return
    }
    
    if (session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }
  }, [session, status, router])

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats')
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
      }

      // Fetch pending comments
      const commentsRes = await fetch('/api/admin/comments?status=PENDING&limit=10')
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json()
        setPendingComments(commentsData.data.comments)
      }

      // Fetch recent users
      const usersRes = await fetch('/api/admin/users?limit=10')
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.data.users)
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchData()
    }
  }, [session, fetchData])

  // Comment moderation actions
  const moderateComment = async (commentId: string, action: 'APPROVED' | 'REJECTED' | 'SPAM') => {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      })

      if (response.ok) {
        // Remove comment from pending list
        setPendingComments(prev => prev.filter(c => c.id !== commentId))
        // Refresh stats
        fetchData()
      }
    } catch (error) {
      console.error('Error moderating comment:', error)
    }
  }

  // User management actions
  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        // Update user in list
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, isActive } : u
        ))
        // Refresh stats
        fetchData()
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Blog sistemi yönetim paneli
        </p>
      </div>

      {/* Alerts */}
      {stats?.alerts && (
        <div className="mb-6">
          {stats.alerts.highPendingComments && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                <span className="text-yellow-800 dark:text-yellow-200">
                  10&apos;dan fazla bekleyen yorum var. Moderasyon gerekiyor.
                </span>
              </div>
            </div>
          )}
          
          {stats.alerts.newSpamComments && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                <span className="text-red-800 dark:text-red-200">
                  Yeni spam yorumlar tespit edildi. İnceleme gerekiyor.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {[
              { key: 'overview', label: 'Genel Bakış', icon: Activity },
              { key: 'comments', label: 'Yorumlar', icon: MessageSquare },
              { key: 'users', label: 'Kullanıcılar', icon: Users },
              { key: 'activity', label: 'Aktivite', icon: Clock },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.totalUsers}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.trends.userTrend > 0 ? (
                    <span className="flex items-center text-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{stats.trends.userTrend}%
                    </span>
                  ) : stats.trends.userTrend < 0 ? (
                    <span className="flex items-center text-red-600">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {stats.trends.userTrend}%
                    </span>
                  ) : (
                    <span className="text-gray-500">Değişiklik yok</span>
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bekleyen Yorumlar</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.pendingComments}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Moderasyon bekliyor
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Onaylı Yorumlar</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.approvedComments}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.trends.commentTrend > 0 ? (
                    <span className="flex items-center text-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{stats.trends.commentTrend}%
                    </span>
                  ) : (
                    <span className="text-gray-500">Haftalık trend</span>
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktif Kullanıcılar</CardTitle>
                <UserCheck className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.activeUsers}</div>
                <p className="text-xs text-gray-500 mt-1">
                  %{Math.round((stats.overview.activeUsers / stats.overview.totalUsers) * 100)} aktif
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Son Aktiviteler</CardTitle>
              <CardDescription>
                Son admin işlemleri ve sistem olayları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        {' '}
                        {activity.action === 'comment_approved' && 'bir yorumu onayladı'}
                        {activity.action === 'comment_rejected' && 'bir yorumu reddetti'}
                        {activity.action === 'comment_spam' && 'bir yorumu spam olarak işaretledi'}
                        {activity.action === 'user_updated' && 'bir kullanıcıyı güncelledi'}
                        {activity.action === 'user_deleted' && 'bir kullanıcıyı sildi'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bekleyen Yorumlar</CardTitle>
              <CardDescription>
                Moderasyon bekleyen yorumlar ({pendingComments.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {pendingComments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Bekleyen yorum bulunmuyor
                  </p>
                ) : (
                  pendingComments.map((comment) => (
                    <div key={comment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.user.image} />
                            <AvatarFallback>
                              {comment.user.name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{comment.user.name}</p>
                            <p className="text-xs text-gray-500">{comment.user.email}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {comment.content}
                        </p>
                        <p className="text-xs text-gray-500">
                          Blog: <span className="font-medium">{comment.postSlug}</span>
                        </p>
                        {comment.parent && (
                          <p className="text-xs text-gray-500 mt-1">
                            Yanıt: <span className="font-medium">{comment.parent.user.name}</span>
                          </p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => moderateComment(comment.id, 'APPROVED')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Onayla
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moderateComment(comment.id, 'REJECTED')}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reddet
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moderateComment(comment.id, 'SPAM')}
                          className="border-orange-300 text-orange-600 hover:bg-orange-50"
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Spam
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Son Kullanıcılar</CardTitle>
              <CardDescription>
                Sisteme kayıt olan son kullanıcılar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image} />
                        <AvatarFallback>
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : user.role === 'MODERATOR'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {user.role}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {user.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {user._count.comments} yorum
                      </span>
                      {user.id !== session.user.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleUserStatus(user.id, !user.isActive)}
                          className={user.isActive ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-green-300 text-green-600 hover:bg-green-50'}
                        >
                          {user.isActive ? (
                            <>
                              <UserX className="h-4 w-4 mr-1" />
                              Pasifleştir
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Aktifleştir
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && stats && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Aktivite Geçmişi</CardTitle>
              <CardDescription>
                Tüm admin işlemleri ve sistem olayları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="h-2 w-2 bg-primary-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        {' '}
                        {activity.action === 'comment_approved' && 'bir yorumu onayladı'}
                        {activity.action === 'comment_rejected' && 'bir yorumu reddetti'}
                        {activity.action === 'comment_spam' && 'bir yorumu spam olarak işaretledi'}
                        {activity.action === 'comment_deleted' && 'bir yorumu sildi'}
                        {activity.action === 'user_updated' && 'bir kullanıcıyı güncelledi'}
                        {activity.action === 'user_deleted' && 'bir kullanıcıyı sildi'}
                      </p>
                      {activity.details && (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                          <pre className="text-gray-600 dark:text-gray-400">
                            {JSON.stringify(activity.details, null, 2)}
                          </pre>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}