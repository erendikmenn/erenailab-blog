'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@/components/ui'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'

const errors: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: 'OAuth Yapılandırma Hatası',
    description: 'OAuth provider yapılandırması eksik veya hatalı. Lütfen yönetici ile iletişime geçin.',
  },
  AccessDenied: {
    title: 'Erişim Reddedildi',
    description: 'Bu kaynağa erişim izniniz bulunmuyor.',
  },
  Verification: {
    title: 'Doğrulama Hatası',
    description: 'E-posta doğrulaması başarısız. Lütfen tekrar deneyin.',
  },
  Default: {
    title: 'Giriş Hatası',
    description: 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.',
  },
}

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorInfo = errors[error as string] || errors.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-red-900 dark:text-red-100">
              {errorInfo.title}
            </CardTitle>
            <CardDescription>
              {errorInfo.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Hata Kodu: <code className="font-mono">{error}</code>
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/auth/signin">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tekrar Dene
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Ana Sayfa
                </Link>
              </Button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="font-medium mb-2">🔧 Development Mode:</p>
                <p>Error details: {error || 'Unknown error'}</p>
                <p>Check console for more information</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}