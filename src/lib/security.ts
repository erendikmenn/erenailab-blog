import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

// Security headers configuration
export function setSecurityHeaders(response: NextResponse) {
  // Basic security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // HSTS for production
  if (config.isProduction) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
  
  // Content Security Policy
  const csp = generateCSP()
  response.headers.set('Content-Security-Policy', csp)
  
  // Additional security headers
  response.headers.set('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=()'
  )
  
  return response
}

function generateCSP(): string {
  const isDev = config.isDevelopment
  const siteUrl = config.site.url
  
  // Base CSP policies
  const policies = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      ...(isDev ? ["'unsafe-eval'", "'unsafe-inline'"] : []),
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://cdn.jsdelivr.net'
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for Tailwind CSS
      'https://fonts.googleapis.com'
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https://images.unsplash.com',
      'https://res.cloudinary.com',
      'https://www.gravatar.com',
      'https://github.com',
      'https://lh3.googleusercontent.com'
    ],
    'font-src': [
      "'self'",
      'data:',
      'https://fonts.gstatic.com'
    ],
    'connect-src': [
      "'self'",
      siteUrl,
      'https://www.google-analytics.com',
      'https://api.deepl.com',
      ...(isDev ? ['ws://localhost:*', 'http://localhost:*'] : [])
    ],
    'frame-src': [
      "'self'",
      'https://www.youtube.com',
      'https://www.youtube-nocookie.com'
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': isDev ? [] : ['']
  }
  
  // Convert to CSP string
  return Object.entries(policies)
    .filter(([_, values]) => values.length > 0)
    .map(([directive, values]) => 
      values.length === 1 && values[0] === '' 
        ? directive 
        : `${directive} ${values.join(' ')}`
    )
    .join('; ')
}

// CSP violation reporting endpoint
export async function handleCSPReport(request: NextRequest) {
  try {
    const report = await request.json()
    
    console.error('CSP Violation Report:', {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      url: request.url,
      violation: report
    })
    
    // In production, you might want to send this to a monitoring service
    if (config.isProduction && config.analytics.sentryDsn) {
      // Send to Sentry or other monitoring service
    }
    
    return NextResponse.json({ status: 'received' }, { status: 200 })
  } catch (error) {
    console.error('Error processing CSP report:', error)
    return NextResponse.json({ error: 'Invalid report' }, { status: 400 })
  }
}