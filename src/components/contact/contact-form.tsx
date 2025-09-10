'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Input, Textarea } from '@/components/ui'
import { Loader2, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { ContactFormData } from '@/types'

interface ContactFormProps {
  language?: 'tr' | 'en'
}

export function ContactForm({ language = 'tr' }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>()

  const texts = {
    tr: {
      name: 'Ad Soyad',
      email: 'E-posta',
      subject: 'Konu',
      message: 'Mesajınız',
      submit: 'Mesajı Gönder',
      submitting: 'Gönderiliyor...',
      success: 'Mesajınız başarıyla gönderildi! En kısa sürede size geri dönüş yapacağız.',
      error: 'Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.',
      required: 'Bu alan zorunludur',
      invalidEmail: 'Geçerli bir e-posta adresi girin',
      minLength: (field: string, min: number) => `${field} en az ${min} karakter olmalıdır`,
      maxLength: (field: string, max: number) => `${field} en fazla ${max} karakter olmalıdır`,
      placeholders: {
        name: 'Adınız ve soyadınız',
        email: 'ornek@email.com',
        subject: 'Mesajınızın konusu',
        message: 'Mesajınızı buraya yazın...'
      }
    },
    en: {
      name: 'Full Name',
      email: 'Email',
      subject: 'Subject',
      message: 'Your Message',
      submit: 'Send Message',
      submitting: 'Sending...',
      success: 'Your message has been sent successfully! We will get back to you soon.',
      error: 'Failed to send message. Please try again later.',
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
      maxLength: (field: string, max: number) => `${field} must be no more than ${max} characters`,
      placeholders: {
        name: 'Your full name',
        email: 'example@email.com',
        subject: 'Subject of your message',
        message: 'Write your message here...'
      }
    }
  }

  const t = texts[language]

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSubmitStatus('success')
        reset() // Clear form
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || t.error)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setSubmitStatus('error')
      setErrorMessage(t.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === 'success') {
    return (
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {language === 'tr' ? 'Mesaj Gönderildi!' : 'Message Sent!'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t.success}
        </p>
        <Button 
          onClick={() => setSubmitStatus('idle')} 
          variant="outline"
        >
          {language === 'tr' ? 'Yeni Mesaj Gönder' : 'Send Another Message'}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name Field */}
      <div>
        <label 
          htmlFor="name" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {t.name} *
        </label>
        <Input
          id="name"
          type="text"
          placeholder={t.placeholders.name}
          {...register('name', {
            required: t.required,
            minLength: {
              value: 2,
              message: t.minLength('İsim', 2)
            },
            maxLength: {
              value: 100,
              message: t.maxLength('İsim', 100)
            }
          })}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label 
          htmlFor="email" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {t.email} *
        </label>
        <Input
          id="email"
          type="email"
          placeholder={t.placeholders.email}
          {...register('email', {
            required: t.required,
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: t.invalidEmail
            },
            maxLength: {
              value: 255,
              message: t.maxLength('E-posta', 255)
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

      {/* Subject Field */}
      <div>
        <label 
          htmlFor="subject" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {t.subject} *
        </label>
        <Input
          id="subject"
          type="text"
          placeholder={t.placeholders.subject}
          {...register('subject', {
            required: t.required,
            minLength: {
              value: 5,
              message: t.minLength('Konu', 5)
            },
            maxLength: {
              value: 200,
              message: t.maxLength('Konu', 200)
            }
          })}
          className={errors.subject ? 'border-red-500' : ''}
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.subject.message}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div>
        <label 
          htmlFor="message" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {t.message} *
        </label>
        <Textarea
          id="message"
          rows={6}
          placeholder={t.placeholders.message}
          {...register('message', {
            required: t.required,
            minLength: {
              value: 10,
              message: t.minLength('Mesaj', 10)
            },
            maxLength: {
              value: 2000,
              message: t.maxLength('Mesaj', 2000)
            }
          })}
          className={errors.message ? 'border-red-500' : ''}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Error Message */}
      {submitStatus === 'error' && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {t.submitting}
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            {t.submit}
          </>
        )}
      </Button>

      {/* Form Note */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {language === 'tr' 
          ? 'Formunuzu göndererek kişisel verilerinizin işlenmesini kabul etmiş olursunuz.'
          : 'By submitting this form, you agree to the processing of your personal data.'
        }
      </p>
    </form>
  )
}