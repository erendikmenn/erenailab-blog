'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Input } from '@/components/ui'
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { NewsletterFormData } from '@/types'

interface NewsletterFormProps {
  source?: string
  className?: string
}

export function NewsletterForm({ source = 'website', className = '' }: NewsletterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<NewsletterFormData>()

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          source
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSubmitStatus('success')
        reset()
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || 'Abonelik işlemi başarısız. Lütfen tekrar deneyin.')
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setSubmitStatus('error')
      setErrorMessage('Abonelik işlemi başarısız. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === 'success') {
    return (
      <div className={`text-center py-6 ${className}`}>
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Başarılı!
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Başarıyla abone oldunuz! En son içeriklerimizden haberdar olacaksınız.
        </p>
        <Button 
          onClick={() => setSubmitStatus('idle')} 
          variant="outline"
          size="sm"
        >
          Yeni Abonelik
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Newsletter&apos;a Abone Olun
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Yapay zeka dünyasındaki en son gelişmelerden haberdar olmak için e-posta listemize katılın.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="E-posta adresiniz"
            {...register('email', {
              required: 'E-posta adresi gerekli',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Geçerli bir e-posta adresi girin'
              }
            })}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        {submitStatus === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">
              {errorMessage}
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Abone Ol
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          E-posta adresinizi koruyoruz ve spam göndermeyiz.
        </p>
      </form>
    </div>
  )
}