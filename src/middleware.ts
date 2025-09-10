import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { setSecurityHeaders } from '@/lib/security'
import { rateLimit } from '@/lib/rate-limit'

const locales = ['tr']
const defaultLocale = 'tr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Apply security headers to all responses
  let response = NextResponse.next()
  
  // Skip middleware logic for static files, but still apply security headers
  const isStaticFile = pathname.startsWith('/_next') ||
                      pathname.startsWith('/static') ||
                      pathname.includes('.')
  
  // Skip for API routes - they handle their own rate limiting
  const isApiRoute = pathname.startsWith('/api')
  
  if (isStaticFile || isApiRoute) {
    response = setSecurityHeaders(response)
    return response
  }
  
  // Apply global rate limiting for non-API routes
  const rateLimitResult = await rateLimit(request, 'global')
  
  if (!rateLimitResult.success) {
    response = new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Too Many Requests</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #f8f9fa;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #dc3545; margin-bottom: 1rem; }
            p { color: #666; margin-bottom: 1rem; }
            .retry { color: #007bff; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚦 Too Many Requests</h1>
            <p>You've made too many requests. Please slow down.</p>
            <p class="retry">Retry after: ${Math.ceil((rateLimitResult.reset - Date.now()) / 1000)} seconds</p>
          </div>
        </body>
      </html>
      `,
      { 
        status: 429,
        headers: {
          'Content-Type': 'text/html',
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString()
        }
      }
    )
    
    response = setSecurityHeaders(response)
    return response
  }
  
  // All routes serve Turkish content with dynamic translation
  response = NextResponse.next()
  
  // Add rate limit headers to successful responses
  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
  response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())
  
  // Apply security headers
  response = setSecurityHeaders(response)
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - handled separately
     * - _next/static (static files) - will get security headers only
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}