import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

// Common validation schemas
export const schemas = {
  // Comment validation
  comment: z.object({
    content: z
      .string()
      .min(1, 'Comment cannot be empty')
      .max(2000, 'Comment must be less than 2000 characters')
      .refine(
        (content) => content.trim().length > 0,
        'Comment cannot be only whitespace'
      ),
    postSlug: z
      .string()
      .min(1, 'Post slug is required')
      .regex(/^[a-z0-9-]+$/, 'Invalid post slug format'),
    parentId: z
      .string()
      .regex(/^[a-zA-Z0-9]+$/, 'Invalid parent ID format')
      .optional()
  }),

  // User profile validation
  userProfile: z.object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name must be less than 100 characters')
      .regex(/^[a-zA-Z\s\u00C0-\u017F\u0400-\u04FF\u0100-\u017F]+$/, 'Name contains invalid characters'),
    bio: z
      .string()
      .max(500, 'Bio must be less than 500 characters')
      .optional(),
    website: z
      .string()
      .url('Must be a valid URL')
      .optional()
      .or(z.literal('')),
    twitter: z
      .string()
      .regex(/^@?[a-zA-Z0-9_]{1,15}$/, 'Invalid Twitter username')
      .optional()
      .or(z.literal('')),
    github: z
      .string()
      .regex(/^[a-zA-Z0-9-]{1,39}$/, 'Invalid GitHub username')
      .optional()
      .or(z.literal('')),
    linkedin: z
      .string()
      .regex(/^[a-zA-Z0-9-]{3,100}$/, 'Invalid LinkedIn username')
      .optional()
      .or(z.literal(''))
  }),

  // Contact form validation
  contact: z.object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name must be less than 100 characters'),
    email: z
      .string()
      .email('Invalid email address')
      .max(255, 'Email must be less than 255 characters'),
    subject: z
      .string()
      .min(1, 'Subject is required')
      .max(200, 'Subject must be less than 200 characters'),
    message: z
      .string()
      .min(10, 'Message must be at least 10 characters')
      .max(2000, 'Message must be less than 2000 characters')
  }),

  // Newsletter subscription validation
  newsletter: z.object({
    email: z
      .string()
      .email('Invalid email address')
      .max(255, 'Email must be less than 255 characters'),
    source: z
      .string()
      .max(50, 'Source must be less than 50 characters')
      .optional()
  }),

  // Admin moderation validation
  moderation: z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SPAM', 'HIDDEN']),
    reason: z
      .string()
      .max(500, 'Reason must be less than 500 characters')
      .optional()
  }),

  // Site settings validation
  siteSettings: z.object({
    key: z
      .string()
      .min(1, 'Key is required')
      .regex(/^[a-z_][a-z0-9_]*$/, 'Key must be lowercase with underscores'),
    value: z.string(),
    type: z.enum(['string', 'number', 'boolean', 'json']),
    category: z
      .string()
      .min(1, 'Category is required')
      .regex(/^[a-z_][a-z0-9_]*$/, 'Category must be lowercase with underscores')
  })
}

// Content sanitization
export function sanitizeContent(content: string, options: {
  allowedTags?: string[]
  allowedAttributes?: Record<string, string[]>
  stripTags?: boolean
} = {}): string {
  const {
    allowedTags = ['b', 'i', 'em', 'strong', 'u', 'code', 'pre', 'br', 'p'],
    allowedAttributes = {
      'a': ['href'],
      'code': ['class']
    },
    stripTags = false
  } = options

  if (stripTags) {
    // Strip all HTML tags
    return content.replace(/<[^>]*>/g, '').trim()
  }

  // Sanitize HTML content
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: Object.keys(allowedAttributes).reduce((acc, tag) => {
      allowedAttributes[tag].forEach(attr => acc.push(attr))
      return acc
    }, [] as string[])
  })
}

// URL validation and sanitization
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }
    
    return parsed.toString()
  } catch {
    return null
  }
}

// Email validation with additional checks
export function validateEmail(email: string): {
  isValid: boolean
  isDisposable?: boolean
  suggestions?: string[]
} {
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email)) {
    return { isValid: false }
  }
  
  const domain = email.split('@')[1].toLowerCase()
  
  // Check for disposable email domains
  const disposableDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email'
  ]
  
  const isDisposable = disposableDomains.includes(domain)
  
  // Common domain suggestions
  const suggestions: string[] = []
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
  
  if (!commonDomains.includes(domain)) {
    // Simple typo detection
    commonDomains.forEach(commonDomain => {
      if (levenshteinDistance(domain, commonDomain) <= 2) {
        suggestions.push(email.replace(domain, commonDomain))
      }
    })
  }
  
  return {
    isValid: true,
    isDisposable,
    suggestions: suggestions.length > 0 ? suggestions : undefined
  }
}

// Simple Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

// Request validation middleware
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (data: unknown): Promise<{
    success: boolean
    data?: T
    error?: string
    fieldErrors?: Record<string, string[]>
  }> => {
    try {
      const validData = await schema.parseAsync(data)
      return { success: true, data: validData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string[]> = {}
        
        error.errors.forEach(err => {
          const field = err.path.join('.')
          if (!fieldErrors[field]) {
            fieldErrors[field] = []
          }
          fieldErrors[field].push(err.message)
        })
        
        return {
          success: false,
          error: 'Validation failed',
          fieldErrors
        }
      }
      
      return {
        success: false,
        error: 'Unknown validation error'
      }
    }
  }
}

// File upload validation
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number // in bytes
    allowedTypes?: string[]
    allowedExtensions?: string[]
  } = {}
): {
  isValid: boolean
  error?: string
} {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
  } = options

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
    }
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
    }
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`
    }
  }

  return { isValid: true }
}