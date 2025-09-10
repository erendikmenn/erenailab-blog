'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useSession } from 'next-auth/react'
import { CommentForm } from './comment-form'
import { CommentItem } from './comment-item'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { MessageSquare, Loader2, RefreshCw } from 'lucide-react'
import { Comment } from '@/types'

interface CommentSectionProps {
  postSlug: string
  language?: 'tr' | 'en'
}

function CommentSectionComponent({ postSlug, language = 'tr' }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch(`/api/comments?postSlug=${encodeURIComponent(postSlug)}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }
      
      const result = await response.json()
      
      // Handle new API response format
      if (result.success) {
        setComments(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch comments')
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      setError(language === 'tr' ? 'Yorumlar yüklenirken hata oluştu.' : 'Error loading comments.')
    } finally {
      setLoading(false)
    }
  }, [postSlug, language])

  // Submit new comment
  const handleCommentSubmit = useCallback(async (content: string) => {
    if (!session) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          postSlug,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to post comment')
      }

      if (result.success) {
        const newComment = result.data
        setComments(prev => [newComment, ...prev])
      } else {
        throw new Error(result.error || 'Failed to post comment')
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [session, postSlug])

  // Submit reply
  const handleReply = useCallback(async (parentId: string, content: string) => {
    if (!session) return

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          postSlug,
          parentId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to post reply')
      }

      if (result.success) {
        const newReply = result.data
        
        // Add reply to the appropriate parent comment
        setComments(prev => {
          const updateComment = (comment: Comment): Comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newReply],
                _count: {
                  ...comment._count,
                  replies: (comment._count?.replies || 0) + 1,
                },
              }
            }
            
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map(updateComment),
              }
            }
            
            return comment
          }
          
          return prev.map(updateComment)
        })
      } else {
        throw new Error(result.error || 'Failed to post reply')
      }
    } catch (error) {
      console.error('Error posting reply:', error)
      throw error
    }
  }, [session, postSlug])

  // Like/unlike comment
  const handleLike = useCallback(async (commentId: string, type: 'LIKE' | 'DISLIKE') => {
    if (!session) return

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      })

      if (!response.ok) {
        throw new Error('Failed to update like')
      }

      const { likeCount, dislikeCount } = await response.json()
      
      // Update like counts in state
      setComments(prev => {
        const updateComment = (comment: Comment): Comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likeCount,
              dislikeCount,
            }
          }
          
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(updateComment),
            }
          }
          
          return comment
        }
        
        return prev.map(updateComment)
      })
    } catch (error) {
      console.error('Error updating like:', error)
      throw error
    }
  }, [session])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  // Memoize computed values
  const commentCount = useMemo(() => {
    return comments.reduce((count, comment) => {
      return count + 1 + (comment.replies?.length || 0)
    }, 0)
  }, [comments])

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            {language === 'tr' ? 'Yorumlar' : 'Comments'}
            {commentCount > 0 && (
              <span className="text-lg font-normal text-gray-500 dark:text-gray-400">
                ({commentCount})
              </span>
            )}
          </h2>
          
          {!loading && (
            <Button
              onClick={fetchComments}
              variant="outline"
              size="sm"
              className="gap-2"
              aria-label={language === 'tr' ? 'Yorumları yenile' : 'Refresh comments'}
            >
              <RefreshCw className="h-4 w-4" />
              {language === 'tr' ? 'Yenile' : 'Refresh'}
            </Button>
          )}
        </div>

        {/* Comment Form */}
        <CommentForm
          onSubmit={handleCommentSubmit}
          language={language}
          isSubmitting={isSubmitting}
        />

        {/* Comments List */}
        <div>
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  {language === 'tr' ? 'Yorumlar yükleniyor...' : 'Loading comments...'}
                </span>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <Button onClick={fetchComments} variant="outline" size="sm">
                  {language === 'tr' ? 'Tekrar Dene' : 'Try Again'}
                </Button>
              </CardContent>
            </Card>
          ) : comments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'tr' ? 'Henüz yorum yok' : 'No comments yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {language === 'tr' 
                    ? 'Bu yazı hakkında ilk yorumu yapan siz olun!'
                    : 'Be the first to share your thoughts about this article!'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-0">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                  onLike={handleLike}
                  language={language}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// Memoize the CommentSection component
export const CommentSection = memo(CommentSectionComponent)