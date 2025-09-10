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
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  User,
  Calendar,
  MoreHorizontal
} from 'lucide-react'

interface CommentModeration {
  id: string
  content: string
  postSlug: string
  status: string
  createdAt: string
  user: {
    name: string
    email: string
    role: string
  }
}

export function CommentModerator() {
  const [comments, setComments] = useState<CommentModeration[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/comments?status=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const moderateComment = async (commentId: string, action: 'approve' | 'reject' | 'spam') => {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        fetchComments() // Refresh list
      }
    } catch (error) {
      console.error('Error moderating comment:', error)
    }
  }

  const filterButtons = [
    { key: 'all' as const, label: 'Tümü', count: comments.length },
    { key: 'pending' as const, label: 'Bekleyen', count: comments.filter(c => c.status === 'PENDING').length },
    { key: 'approved' as const, label: 'Onaylı', count: comments.filter(c => c.status === 'APPROVED').length },
    { key: 'rejected' as const, label: 'Reddedilen', count: comments.filter(c => c.status === 'REJECTED').length },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Yorum Moderasyonu
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Kullanıcı yorumlarını onaylayın, reddedin veya spam olarak işaretleyin
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
            {btn.label}
            <span className="bg-white/20 px-2 py-1 rounded text-xs">
              {btn.count}
            </span>
          </Button>
        ))}
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <span>Yorumlar yükleniyor...</span>
            </CardContent>
          </Card>
        ) : comments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Yorum Bulunamadı
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Seçili filtrede yorum bulunmuyor.
              </p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{comment.user.name}</span>
                        <span className="text-sm text-gray-500">({comment.user.email})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        {comment.content}
                      </p>
                      <p className="text-sm text-gray-500">
                        Post: {comment.postSlug}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        comment.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        comment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        comment.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {comment.status === 'APPROVED' ? 'Onaylı' :
                         comment.status === 'PENDING' ? 'Bekliyor' :
                         comment.status === 'REJECTED' ? 'Reddedildi' : comment.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {comment.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moderateComment(comment.id, 'approve')}
                          className="gap-2 text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Onayla
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moderateComment(comment.id, 'reject')}
                          className="gap-2 text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Reddet
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moderateComment(comment.id, 'spam')}
                          className="gap-2 text-orange-600 border-orange-600 hover:bg-orange-50"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Spam
                        </Button>
                      </>
                    )}
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