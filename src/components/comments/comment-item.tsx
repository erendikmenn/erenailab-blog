'use client'

import { useState, useCallback, memo } from 'react'
import { useSession } from 'next-auth/react'
import { Button, Textarea, Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { Heart, MessageCircle, ThumbsUp, ThumbsDown, Reply, MoreHorizontal } from 'lucide-react'
import { Comment } from '@/types'

interface CommentItemProps {
  comment: Comment
  onReply: (parentId: string, content: string) => Promise<void>
  onLike: (commentId: string, type: 'LIKE' | 'DISLIKE') => Promise<void>
  language?: 'tr' | 'en'
  depth?: number
}

function CommentItemComponent({ 
  comment, 
  onReply, 
  onLike, 
  language = 'tr',
  depth = 0 
}: CommentItemProps) {
  const { data: session } = useSession()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  const handleReplySubmit = useCallback(async () => {
    if (!replyContent.trim() || isSubmittingReply) return

    setIsSubmittingReply(true)
    try {
      await onReply(comment.id, replyContent)
      setReplyContent('')
      setShowReplyForm(false)
    } catch (error) {
      console.error('Error submitting reply:', error)
    } finally {
      setIsSubmittingReply(false)
    }
  }, [replyContent, isSubmittingReply, onReply, comment.id])

  const handleLike = useCallback(async (type: 'LIKE' | 'DISLIKE') => {
    if (isLiking || !session) return

    setIsLiking(true)
    try {
      await onLike(comment.id, type)
    } catch (error) {
      console.error('Error liking comment:', error)
    } finally {
      setIsLiking(false)
    }
  }, [isLiking, session, onLike, comment.id])

  const toggleReplyForm = useCallback(() => {
    setShowReplyForm(!showReplyForm)
  }, [showReplyForm])

  const cancelReply = useCallback(() => {
    setShowReplyForm(false)
    setReplyContent('')
  }, [])

  const maxDepth = 3 // Maximum nesting level
  const isMaxDepth = depth >= maxDepth

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-100 dark:border-gray-800 pl-4' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
        {/* Comment Header */}
        <div className="flex items-start space-x-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.user.image || ''} alt={comment.user.name || ''} />
            <AvatarFallback>
              {comment.user.name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {comment.user.name}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(comment.createdAt.toString())}
              </span>
              {comment.status !== 'APPROVED' && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full dark:bg-yellow-900 dark:text-yellow-200">
                  {language === 'tr' ? 'Onay Bekliyor' : 'Pending'}
                </span>
              )}
            </div>
          </div>

          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Comment Content */}
        <div className="mb-3">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>

        {/* Comment Actions */}
        <div className="flex items-center space-x-4 text-sm">
          <button
            onClick={() => handleLike('LIKE')}
            disabled={isLiking || !session}
            className={`flex items-center space-x-1 ${
              comment._count?.likes ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
            } hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50`}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{comment.likeCount || 0}</span>
          </button>

          <button
            onClick={() => handleLike('DISLIKE')}
            disabled={isLiking || !session}
            className={`flex items-center space-x-1 ${
              comment._count?.likes ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
            } hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50`}
          >
            <ThumbsDown className="h-4 w-4" />
            <span>{comment.dislikeCount || 0}</span>
          </button>

          {!isMaxDepth && session && (
            <button
              onClick={toggleReplyForm}
              className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <Reply className="h-4 w-4" />
              <span>{language === 'tr' ? 'Yanıtla' : 'Reply'}</span>
            </button>
          )}

          {comment._count?.replies && comment._count.replies > 0 && (
            <span className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <MessageCircle className="h-4 w-4" />
              <span>
                {comment._count.replies} {language === 'tr' ? 'yanıt' : 'replies'}
              </span>
            </span>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && session && (
          <div className="mt-4 space-y-3">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={language === 'tr' ? 'Yanıtınızı yazın...' : 'Write your reply...'}
              className="resize-none"
              rows={3}
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleReplySubmit}
                disabled={!replyContent.trim() || isSubmittingReply}
                size="sm"
              >
                {isSubmittingReply 
                  ? (language === 'tr' ? 'Gönderiliyor...' : 'Sending...') 
                  : (language === 'tr' ? 'Yanıtla' : 'Reply')
                }
              </Button>
              <Button
                onClick={cancelReply}
                variant="outline"
                size="sm"
              >
                {language === 'tr' ? 'İptal' : 'Cancel'}
              </Button>
            </div>
          </div>
        )}

        {/* Authentication Required Message */}
        {showReplyForm && !session && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {language === 'tr' 
                ? 'Yanıt verebilmek için giriş yapmanız gerekiyor.'
                : 'You need to sign in to reply.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-0">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onLike={onLike}
              language={language}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export const CommentItem = memo(CommentItemComponent)