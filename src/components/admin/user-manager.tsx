'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Shield,
  ShieldCheck,
  ShieldX,
  Calendar,
  Mail,
  MoreHorizontal,
  Crown
} from 'lucide-react'

interface UserInfo {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
  _count: {
    comments: number
  }
}

export function UserManager() {
  const [users, setUsers] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'admin'>('all')

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users?filter=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        fetchUsers() // Refresh list
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        fetchUsers() // Refresh list
      }
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const filterButtons = [
    { key: 'all' as const, label: 'Tüm Kullanıcılar', icon: Users },
    { key: 'active' as const, label: 'Aktif', icon: ShieldCheck },
    { key: 'inactive' as const, label: 'Pasif', icon: ShieldX },
    { key: 'admin' as const, label: 'Adminler', icon: Crown },
  ]

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="h-4 w-4 text-yellow-600" />
      case 'MODERATOR':
        return <Shield className="h-4 w-4 text-blue-600" />
      case 'EDITOR':
        return <ShieldCheck className="h-4 w-4 text-green-600" />
      default:
        return <Users className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'MODERATOR':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'EDITOR':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Kullanıcı Yönetimi
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Kullanıcı rollerini yönetin ve hesap durumlarını kontrol edin
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {filterButtons.map((btn) => (
          <Button
            key={btn.key}
            variant={filter === btn.key ? 'default' : 'outline'}
            onClick={() => setFilter(btn.key)}
            className="gap-2"
          >
            <btn.icon className="h-4 w-4" />
            {btn.label}
          </Button>
        ))}
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <span>Kullanıcılar yükleniyor...</span>
            </CardContent>
          </Card>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Kullanıcı Bulunamadı
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Seçili filtrede kullanıcı bulunmuyor.
              </p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="font-medium text-lg">{user.name}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                        {!user.isActive && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full dark:bg-red-900 dark:text-red-200">
                            Pasif
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Kayıt: {new Date(user.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                        
                        {user.lastLoginAt && (
                          <div className="flex items-center gap-2">
                            <span>Son giriş: {new Date(user.lastLoginAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <span>{user._count.comments} yorum</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded dark:border-gray-700 dark:bg-gray-800"
                    >
                      <option value="USER">USER</option>
                      <option value="EDITOR">EDITOR</option>
                      <option value="MODERATOR">MODERATOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                    
                    <Button
                      size="sm"
                      variant={user.isActive ? "outline" : "default"}
                      onClick={() => toggleUserStatus(user.id, user.isActive)}
                      className={user.isActive ? "text-red-600 border-red-600" : "text-green-600 border-green-600"}
                    >
                      {user.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                    </Button>
                    
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}