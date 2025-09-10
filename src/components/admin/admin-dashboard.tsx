'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button
} from '@/components/ui'
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Settings,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { PostCreator } from './post-creator'
import { CommentModerator } from './comment-moderator'
import { UserManager } from './user-manager'

type AdminView = 'dashboard' | 'posts' | 'comments' | 'users' | 'settings'

export function AdminDashboard() {
  const { data: session } = useSession()
  const [currentView, setCurrentView] = useState<AdminView>('dashboard')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalComments: 0,
    pendingComments: 0,
    totalPosts: 0
  })

  useEffect(() => {
    // Fetch admin stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error)
      }
    }

    fetchStats()
  }, [])

  const menuItems = [
    { key: 'dashboard' as AdminView, label: 'Dashboard', icon: Settings },
    { key: 'posts' as AdminView, label: 'Post Yönetimi', icon: FileText },
    { key: 'comments' as AdminView, label: 'Yorum Moderasyonu', icon: MessageSquare },
    { key: 'users' as AdminView, label: 'Kullanıcı Yönetimi', icon: Users },
  ]

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardStats stats={stats} />
      case 'posts':
        return <PostCreator />
      case 'comments':
        return <CommentModerator />
      case 'users':
        return <UserManager />
      default:
        return <DashboardStats stats={stats} />
    }
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-64 space-y-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Admin Menüsü</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.key}
                variant={currentView === item.key ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setCurrentView(item.key)}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  )
}

function DashboardStats({ stats }: { stats: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Yorum</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Yorumlar</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingComments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blog Yazıları</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Son Aktiviteler</CardTitle>
          <CardDescription>
            Sistemdeki son yönetim aktiviteleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-gray-600 dark:text-gray-400">Yeni kullanıcı kaydı</span>
              <span className="text-gray-500 dark:text-gray-500 ml-auto">2 dakika önce</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-gray-600 dark:text-gray-400">Yeni yorum onaylandı</span>
              <span className="text-gray-500 dark:text-gray-500 ml-auto">5 dakika önce</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-gray-600 dark:text-gray-400">Spam yorum silindi</span>
              <span className="text-gray-500 dark:text-gray-500 ml-auto">10 dakika önce</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}