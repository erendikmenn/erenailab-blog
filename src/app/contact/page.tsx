'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Mail, MessageCircle, Users, Clock, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

// Simple inline contact form instead of dynamic import
function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // TODO: Implement contact form submission
      console.log('Contact form submission:', formData)
      alert('Mesajınız alındı! Size en kısa sürede dönüş yapacağım.')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bize Mesaj Gönderin</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ad Soyad *
              </label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Adınız ve soyadınız"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-posta *
              </label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ornek@email.com"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Konu *
            </label>
            <Input
              id="subject"
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Mesajınızın konusu"
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mesaj *
            </label>
            <Textarea
              id="message"
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Mesajınızı buraya yazın..."
              className="min-h-[120px]"
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Gönderiliyor...' : 'Mesaj Gönder'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            İletişime Geçin
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Merhaba! Ben Eren, Bursa Teknik Üniversitesi Elektrik Elektronik Mühendisliği 4. sınıf öğrencisiyim. 
            Bu blogda yapay zeka makalelerini sıfırdan anlaşılır bir şekilde açıklamaya çalışıyorum. 
            Sorularınız, önerileriniz veya görüşleriniz varsa benimle iletişime geçebilirsiniz.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary-600" />
                  Mesaj Gönder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Contact Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary-600" />
                  İletişim Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email</p>
                    <a 
                      href="mailto:dikmeneren@hotmail.com" 
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                      dikmeneren@hotmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Üniversite</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Bursa Teknik Üniversitesi<br />
                      Elektrik Elektronik Mühendisliği
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary-600" />
                  Yanıt Süresi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">E-posta</span>
                    <span className="font-medium text-gray-900 dark:text-white">1-2 gün</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Makale Önerileri</span>
                    <span className="font-medium text-gray-900 dark:text-white">2-3 gün</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Teknik Sorular</span>
                    <span className="font-medium text-gray-900 dark:text-white">3-5 gün</span>
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Bu Blog Hakkında
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Merhaba! Ben Eren, BTÜ Elektrik Elektronik Mühendisliği son sınıf öğrencisiyim. 
                  Bu blogda karmaşık yapay zeka makalelerini herkesin anlayabileceği şekilde 
                  açıklamaya çalışıyorum. Amacım, sıfır AI bilgisi olan birinin bile 
                  bu alandaki gelişmeleri takip edebilmesini sağlamak.
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Ne Bulacaksınız?</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Karmaşık AI makalelerinin basit açıklamaları</li>
                      <li>• Matematiksel kavramların görsel anlatımları</li>
                      <li>• Gerçek örneklerle uygulamalar</li>
                      <li>• Yeni teknolojilerin etkilerinin değerlendirmesi</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Kimler İçin?</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• AI öğrenmeye yeni başlayanlar</li>
                      <li>• Mühendislik öğrencileri</li>
                      <li>• Teknoloji meraklıları</li>
                      <li>• Akademik gelişmeleri takip etmek isteyenler</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
