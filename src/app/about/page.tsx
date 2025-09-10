import { Metadata } from 'next'
import { config } from '@/lib/config'
import { User, Brain, Lightbulb, Target, Users, Mail, Linkedin, Github, Twitter } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Hakkımda - Eren AI Blog',
  description: 'Merhaba! Ben Eren, BTÜ Elektrik Elektronik Mühendisliği öğrencisiyim. Yapay zeka makalelerini anlaşılır şekilde açıklıyorum.',
  keywords: ['hakkımda', 'yapay zeka', 'öğrenci', 'blog', 'eren', 'btu'],
  openGraph: {
    title: 'Hakkımda - Eren AI Blog',
    description: 'Merhaba! Ben Eren, BTÜ Elektrik Elektronik Mühendisliği öğrencisiyim. Yapay zeka makalelerini anlaşılır şekilde açıklıyorum.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hakkımda - Eren AI Blog',
    description: 'Merhaba! Ben Eren, BTÜ Elektrik Elektronik Mühendisliği öğrencisiyim. Yapay zeka makalelerini anlaşılır şekilde açıklıyorum.',
  },
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center">
              <Brain className="h-10 w-10 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Hakkımda
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Merhaba! Ben Eren, Bursa Teknik Üniversitesi Elektrik Elektronik Mühendisliği 
            4. sınıf öğrencisiyim. Yapay zeka dünyasındaki karmaşık kavramları herkesin 
            anlayabileceği şekilde açıklamaya çalışıyorum.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-2 border-primary-100 dark:border-primary-800">
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <Target className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Amacım</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Karmaşık yapay zeka makalelerini sıfır bilgisi olan birinin bile anlayabileceği 
                şekilde açıklamak. AI dünyasındaki gelişmeleri takip ederek öğrendiklerimi 
                paylaşmak ve bu alanda ilgilenenlerle bilgi alışverişi yapmak.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary-100 dark:border-primary-800">
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <Lightbulb className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hedefim</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Bu blog aracılığıyla hem kendi öğrenim sürecimi belgelemek hem de 
                yapay zeka ile ilgilenen herkese faydalı olabilecek içerikler üretmek. 
                İleride bu alanda daha derin çalışmalar yapabilmek için temel oluşturmak.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Research Areas */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            İlgi Alanlarım
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "Temel AI Kavramları",
                description: "Makine öğrenmesinin matematiksel temellerini anlamaya çalışıyorum."
              },
              {
                icon: Users,
                title: "Derin Öğrenme",
                description: "Neural network'ler ve modern AI modellerinin nasıl çalıştığını öğreniyorum."
              },
              {
                icon: Lightbulb,
                title: "AI'nin Geleceği",
                description: "Yapay zekanın toplumsal etkilerini ve etik boyutlarını merak ediyorum."
              }
            ].map((area, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                      <area.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {area.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {area.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Benim Hakkımda
          </h2>
          <Card className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-primary-600 dark:bg-primary-400 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white dark:text-gray-900" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Eren Dikmen
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Bursa Teknik Üniversitesi Elektrik Elektronik Mühendisliği 4. sınıf öğrencisiyim. 
                Yapay zeka alanında kendimi geliştirmeye çalışıyor, öğrendiklerimi bu blogda 
                paylaşıyorum. Henüz profesyonel değilim ama öğrenme sürecimi sizlerle paylaşmak istiyorum.
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" size="sm" asChild>
                  <a href="mailto:dikmeneren@hotmail.com" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Blog Felsefem
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: "💡",
                title: "Sade Anlatım",
                description: "Karmaşık konuları mümkün olduğunca basit ve anlaşılır şekilde açıklamaya çalışıyorum.",
                color: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
                iconBg: "bg-amber-100 dark:bg-amber-900"
              },
              {
                icon: "🌱",
                title: "Öğrenme Süreci",
                description: "Kendi öğrenim sürecimi paylaşarak, beraber öğrenebileceğimiz bir ortam yaratmak istiyorum.",
                color: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
                iconBg: "bg-green-100 dark:bg-green-900"
              },
              {
                icon: "🔓",
                title: "Açık Kaynak Zihniyeti",
                description: "Öğrendiklerimi özgürce paylaşarak, bilginin herkes tarafından erişilebilir olmasını destekliyorum.",
                color: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
                iconBg: "bg-blue-100 dark:bg-blue-900"
              },
              {
                icon: "🚀",
                title: "Sürekli Gelişim",
                description: "Hatalarımı kabul ediyor, geri bildirimlerle kendimi sürekli geliştirmeye çalışıyorum.",
                color: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
                iconBg: "bg-purple-100 dark:bg-purple-900"
              }
            ].map((value, index) => (
              <Card key={index} className={`bg-gradient-to-br ${value.color} border-0 shadow-md hover:shadow-lg transition-shadow duration-300`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${value.iconBg} rounded-full flex items-center justify-center text-xl flex-shrink-0`}>
                      {value.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {value.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">
                Beraber Öğrenelim
              </h2>
              <p className="text-primary-100 mb-6">
                Bu öğrenim yolculuğunda bana eşlik etmek ister misiniz? 
                Sorularınızı, eleştirilerinizi ve önerilerinizi bekliyorum.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/blog">
                    Yazıları Oku
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary-600" asChild>
                  <Link href="/contact">
                    İletişime Geç
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}