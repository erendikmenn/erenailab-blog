'use client'

import { useState, useEffect } from 'react'
import { getProviders, signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input } from '@/components/ui'
import { Github, Mail, Chrome, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Provider {
  id: string
  name: string
  type: string
  signinUrl: string
  callbackUrl: string
}

export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  useEffect(() => {
    const setupProviders = async () => {
      const res = await getProviders()
      setProviders(res)
    }
    setupProviders()
  }, [])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError('Giriş başarısız. Lütfen tekrar deneyin.')
      } else {
        router.push(callbackUrl)
      }
    } catch (error) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (providerId: string) => {
    setLoading(true)
    try {
      await signIn(providerId, { callbackUrl })
    } catch (error) {
      setError('OAuth giriş başarısız. Lütfen tekrar deneyin.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ana sayfaya dön
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            ErenAILab&apos;a Giriş Yapın
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Akademik AI araştırmalarına katılın
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Giriş Yöntemi Seçin</CardTitle>
            <CardDescription>
              E-posta ile hızlı giriş yapın veya OAuth ile bağlanın
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Email Sign In */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  E-posta Adresi
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  required
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Yeni kullanıcılar otomatik olarak kayıt edilir
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !email}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Giriş yapılıyor...
                  </div>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    E-posta ile Giriş Yap
                  </>
                )}
              </Button>
            </form>

            {/* OAuth Providers */}
            {providers && (
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-950 text-gray-500 dark:text-gray-400">
                      veya
                    </span>
                  </div>
                </div>

                {/* GitHub Provider */}
                {providers.github && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthSignIn('github')}
                    disabled={loading}
                  >
                    <Github className="h-4 w-4 mr-2" />
                    GitHub ile Giriş Yap
                  </Button>
                )}

                {/* Google Provider */}
                {providers.google && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthSignIn('google')}
                    disabled={loading}
                  >
                    <Chrome className="h-4 w-4 mr-2" />
                    Google ile Giriş Yap
                  </Button>
                )}

                {/* No OAuth Providers Available */}
                {!providers.github && !providers.google && Object.keys(providers).length <= 1 && (
                  <div className="text-center p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      OAuth provider&apos;lar henüz yapılandırılmamış.
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      Şimdilik e-posta ile giriş yapabilirsiniz.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Development Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="font-medium mb-2">🔧 Development Mode:</p>
                <p>• E-posta ile giriş: Otomatik kayıt</p>
                <p>• OAuth: .env.local&apos;de gerçek keys gerekli</p>
                <p>• Admin olmak için: Email ile giriş yap → DB&apos;de role=&quot;ADMIN&quot; yap</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}