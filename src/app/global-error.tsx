'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="max-w-md w-full mx-auto px-4">
            <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                Kritik Hata
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Uygulama düzeyinde bir hata oluştu. Bu sorunu çözmek için sayfayı yenilemeniz gerekebilir.
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={reset}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Uygulamayı Yenile
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Ana Sayfaya Dön
                </Button>
              </div>
              
              {error.digest && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                  Hata ID: {error.digest}
                </p>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}