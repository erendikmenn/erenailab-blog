'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { 
  Button, 
  Textarea, 
  Avatar, 
  AvatarFallback, 
  AvatarImage,
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui'
import { MessageSquare, LogIn } from 'lucide-react'

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>
  language?: 'tr' | 'en'
  isSubmitting?: boolean
}

function CommentFormComponent({ onSubmit, language = 'tr', isSubmitting = false }: CommentFormProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false)

  const handleSubmit = useCallback(async () => {
    if (!content.trim() || isSubmittingLocal || isSubmitting) return

    setIsSubmittingLocal(true)
    try {
      await onSubmit(content)
      setContent('')
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setIsSubmittingLocal(false)
    }
  }, [content, isSubmittingLocal, isSubmitting, onSubmit])

  const clearContent = useCallback(() => setContent(''), [])
  const handleSignIn = useCallback(() => signIn(), [])

  // Memoize computed values
  const isDisabled = useMemo(() => 
    isSubmittingLocal || isSubmitting || !content.trim(), 
    [isSubmittingLocal, isSubmitting, content]
  )

  const characterCount = useMemo(() => content.length, [content.length])

  const placeholder = useMemo(() => 
    language === 'tr' 
      ? 'Bu yazı hakkında düşüncelerinizi paylaşın...' 
      : 'Share your thoughts about this article...',
    [language]
  )

  const submitButtonText = useMemo(() => {
    if (isSubmittingLocal || isSubmitting) {
      return language === 'tr' ? 'Gönderiliyor...' : 'Posting...'
    }
    return language === 'tr' ? 'Yorum Yap' : 'Post Comment'
  }, [isSubmittingLocal, isSubmitting, language])

  if (!session) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-gray-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'tr' ? 'Yorumlarınızı Paylaşın' : 'Share Your Thoughts'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {language === 'tr' 
                  ? 'Bu yazı hakkında düşüncelerinizi paylaşmak için giriş yapın.'
                  : 'Sign in to share your thoughts about this article.'
                }
              </p>
              <Button onClick={handleSignIn} className="gap-2">
                <LogIn className="h-4 w-4" />
                {language === 'tr' ? 'Giriş Yap' : 'Sign In'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {language === 'tr' ? 'Yorum Yap' : 'Leave a Comment'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
            <AvatarFallback>
              {session.user.name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="mb-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {session.user.name}
              </span>
            </div>
            
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="resize-none min-h-[100px]"
              maxLength={2000}
            />
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {characterCount}/2000
              </span>
              
              <div className="flex space-x-2">
                <Button
                  onClick={clearContent}
                  variant="outline"
                  size="sm"
                  disabled={!content || isDisabled}
                >
                  {language === 'tr' ? 'Temizle' : 'Clear'}
                </Button>
                
                <Button
                  onClick={handleSubmit}
                  disabled={isDisabled}
                  size="sm"
                >
                  {submitButtonText}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
          {language === 'tr' 
            ? 'Yorumunuz moderasyon sonrası yayınlanacaktır. Lütfen saygılı bir dil kullanın.'
            : 'Your comment will be published after moderation. Please use respectful language.'
          }
        </div>
      </CardContent>
    </Card>
  )
}

// Memoize the CommentForm component
export const CommentForm = memo(CommentFormComponent)