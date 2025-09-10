import { z } from 'zod'
import { Brain, Cpu, Search, Leaf, Code, Users } from 'lucide-react'

// Environment variables validation schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required').default('file:./dev.db'),
  DIRECT_URL: z.string().optional(),
  
  // NextAuth
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL').default('http://localhost:3000'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters').default('development-secret-key-minimum-32-characters-long-for-security-purposes'),
  
  // OAuth (optional for development)
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Site configuration
  SITE_URL: z.string().url('SITE_URL must be a valid URL').default('http://localhost:3000'),
  SITE_NAME: z.string().default('ErenAILab Blog'),
  SITE_DESCRIPTION: z.string().default('Academic AI Research Blog'),
  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be a valid email').optional(),
  
  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  FROM_NAME: z.string().optional(),
  
  // Security
  RATE_LIMIT_MAX: z.string().default('100'),
  RATE_LIMIT_WINDOW: z.string().default('15'),
  CSP_REPORT_URI: z.string().url().optional(),
  
  // Analytics & Monitoring (optional)
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Content & Media (optional)
  UPLOADTHING_SECRET: z.string().optional(),
  UPLOADTHING_APP_ID: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // Translation (optional)
  DEEPL_API_KEY: z.string().optional(),
  DEEPL_API_URL: z.string().url().optional(),
  
  // Development
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DEBUG: z.string().default('false'),
})

// Parse and validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      throw new Error(`Environment validation failed:\n${missingVars.join('\n')}`)
    }
    throw error
  }
}

// Export validated environment variables
export const env = validateEnv()

// Export individual configurations
export const config = {
  database: {
    url: env.DATABASE_URL,
    directUrl: env.DIRECT_URL,
  },
  
  auth: {
    url: env.NEXTAUTH_URL,
    secret: env.NEXTAUTH_SECRET,
    providers: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
  },
  
  site: {
    url: env.SITE_URL,
    name: env.SITE_NAME,
    description: env.SITE_DESCRIPTION,
    adminEmail: env.ADMIN_EMAIL,
  },
  
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ? parseInt(env.SMTP_PORT) : undefined,
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
    from: {
      email: env.FROM_EMAIL,
      name: env.FROM_NAME,
    },
  },
  
  security: {
    rateLimit: {
      max: parseInt(env.RATE_LIMIT_MAX),
      windowMs: parseInt(env.RATE_LIMIT_WINDOW) * 60 * 1000, // Convert to milliseconds
    },
    csp: {
      reportUri: env.CSP_REPORT_URI,
    },
  },
  
  analytics: {
    googleAnalyticsId: env.GOOGLE_ANALYTICS_ID,
    sentryDsn: env.SENTRY_DSN,
  },
  
  redis: {
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  },
  
  media: {
    uploadthing: {
      secret: env.UPLOADTHING_SECRET,
      appId: env.UPLOADTHING_APP_ID,
    },
    cloudinary: {
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      apiSecret: env.CLOUDINARY_API_SECRET,
    },
  },
  
  translation: {
    deepl: {
      apiKey: env.DEEPL_API_KEY,
      apiUrl: env.DEEPL_API_URL,
    },
  },
  
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  debug: env.DEBUG === 'true',
} as const

// Type export for TypeScript
export type Config = typeof config

// Blog categories configuration
export const categories = [
  {
    id: 'theoretical-ai',
    name: 'Teorik AI',
    description: 'Yapay zekanın matematiksel temelleri ve algoritma teorisi',
    color: 'bg-blue-500',
    icon: Brain
  },
  {
    id: 'machine-learning',
    name: 'Makine Öğrenmesi',
    description: 'Derin öğrenme ve pratik ML uygulamaları',
    color: 'bg-green-500',
    icon: Cpu
  },
  {
    id: 'research-reviews',
    name: 'Araştırma İncelemeleri',
    description: 'Akademik makaleler ve araştırma trendleri',
    color: 'bg-purple-500',
    icon: Search
  },
  {
    id: 'energy-sustainability',
    name: 'Enerji & Sürdürülebilirlik',
    description: 'Sürdürülebilir AI ve yeşil teknolojiler',
    color: 'bg-emerald-500',
    icon: Leaf
  },
  {
    id: 'implementation',
    name: 'Uygulama',
    description: 'Kod örnekleri ve pratik projeler',
    color: 'bg-orange-500',
    icon: Code
  },
  {
    id: 'career-insights',
    name: 'Kariyer İpuçları',
    description: 'AI kariyeri ve profesyonel gelişim',
    color: 'bg-pink-500',
    icon: Users
  }
] as const

export type CategoryId = typeof categories[number]['id']

// Site configuration for components
export const siteConfig = {
  name: config.site.name,
  description: config.site.description,
  url: config.site.url,
  adminEmail: config.site.adminEmail,
  ogImage: `${config.site.url}/og-image.png`,
  author: {
    name: 'ErenAILab Team',
    email: config.site.adminEmail || 'contact@erenailab.com',
    twitter: '@erenailab',
    github: 'https://github.com/erenailab',
    linkedin: 'https://linkedin.com/company/erenailab',
  }
} as const

// Navigation configuration  
export const navigation = [
  { title: 'Ana Sayfa', href: '/' },
  { title: 'Blog', href: '/blog' },
  { title: 'Kategoriler', href: '/categories' },
  { title: 'Hakkında', href: '/about' },
  { title: 'İletişim', href: '/contact' },
] as const

export type NavigationItem = typeof navigation[number]