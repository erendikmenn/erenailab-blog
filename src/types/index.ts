import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: 'USER' | 'ADMIN' | 'MODERATOR' | 'EDITOR'
    }
  }

  interface User {
    role?: 'USER' | 'ADMIN' | 'MODERATOR' | 'EDITOR'
  }
}

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: string
  category: string
  tags: string[]
  readingTime: number
  content: string
  excerpt: string
  featured?: boolean
  language: 'tr' | 'en'
}

export interface Comment {
  id: string
  content: string
  postSlug: string
  userId: string
  parentId?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM' | 'HIDDEN'
  ipAddress?: string
  userAgent?: string
  createdAt: Date
  updatedAt: Date
  likeCount?: number
  dislikeCount?: number
  user: {
    id: string
    name?: string
    image?: string
    role?: 'USER' | 'ADMIN' | 'MODERATOR' | 'EDITOR'
    createdAt?: Date
  }
  likes: CommentLike[]
  replies?: Comment[]
  _count?: {
    likes?: number
    dislikes?: number
    replies?: number
  }
}

export interface CommentLike {
  id: string
  userId: string
  commentId: string
  type: 'LIKE' | 'DISLIKE'
  createdAt: Date
}

export interface Translation {
  id: string
  contentSlug: string
  language: string
  title?: string
  content: string
  abstract?: string
  cachedAt: Date
  updatedAt: Date
}

export interface Newsletter {
  id: string
  email: string
  confirmed: boolean
  token?: string
  unsubscribed: boolean
  source?: string
  createdAt: Date
  updatedAt: Date
}

export interface AdminLog {
  id: string
  userId: string
  action: string
  targetId?: string
  targetType?: string
  details?: any
  ipAddress?: string
  createdAt: Date
  user: {
    id: string
    name?: string
    email?: string
  }
}

export interface SiteSettings {
  id: string
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'json'
  category: string
  createdAt: Date
  updatedAt: Date
}

export interface PageView {
  id: string
  slug: string
  ipAddress: string
  userAgent?: string
  referer?: string
  country?: string
  createdAt: Date
}

export interface SiteConfig {
  name: string
  description: string
  url: string
  ogImage: string
  author: {
    name: string
    email: string
    twitter: string
    github: string
    linkedin: string
  }
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Form types
export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export interface NewsletterFormData {
  email: string
  source?: string
}

export interface CommentFormData {
  content: string
  postSlug: string
  parentId?: string
}

// Admin types
export interface AdminStats {
  totalUsers: number
  totalPosts: number
  totalComments: number
  pendingComments: number
  totalPageViews: number
  newsletterSubscribers: number
}

export interface ModerateCommentData {
  status: 'APPROVED' | 'REJECTED' | 'SPAM' | 'HIDDEN'
  reason?: string
}

// Security types
export interface SecurityHeaders {
  'X-Frame-Options': string
  'X-Content-Type-Options': string
  'Referrer-Policy': string
  'X-XSS-Protection': string
  'Strict-Transport-Security'?: string
  'Content-Security-Policy'?: string
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
  success: boolean
}