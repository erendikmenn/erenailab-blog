import { NextRequest } from 'next/server'
import { config } from '@/lib/config'

// In-memory rate limiter for development
// In production, use Redis or external service
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  
  constructor(
    private maxRequests: number = config.security.rateLimit.max,
    private windowMs: number = config.security.rateLimit.windowMs
  ) {}
  
  async isAllowed(identifier: string): Promise<{
    allowed: boolean
    limit: number
    remaining: number
    reset: number
  }> {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    // Clean up old entries
    this.cleanup(windowStart)
    
    const current = this.requests.get(identifier)
    
    if (!current) {
      // First request in window
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      
      return {
        allowed: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: now + this.windowMs
      }
    }
    
    if (current.resetTime <= now) {
      // Window has expired, reset
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      
      return {
        allowed: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: now + this.windowMs
      }
    }
    
    // Check if limit exceeded
    if (current.count >= this.maxRequests) {
      return {
        allowed: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: current.resetTime
      }
    }
    
    // Increment count
    current.count++
    this.requests.set(identifier, current)
    
    return {
      allowed: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - current.count,
      reset: current.resetTime
    }
  }
  
  private cleanup(windowStart: number) {
    for (const [key, value] of this.requests.entries()) {
      if (value.resetTime <= windowStart) {
        this.requests.delete(key)
      }
    }
  }
}

// Global rate limiter instances
const globalLimiter = new RateLimiter(100, 15 * 60 * 1000) // 100 requests per 15 minutes
const apiLimiter = new RateLimiter(30, 5 * 60 * 1000)     // 30 requests per 5 minutes
const authLimiter = new RateLimiter(5, 15 * 60 * 1000)    // 5 requests per 15 minutes

export async function rateLimit(
  request: NextRequest,
  type: 'global' | 'api' | 'auth' = 'global'
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  // Get client identifier
  const identifier = getClientIdentifier(request)
  
  // Select appropriate limiter
  const limiter = type === 'api' ? apiLimiter : 
                 type === 'auth' ? authLimiter : 
                 globalLimiter
  
  const result = await limiter.isAllowed(identifier)
  
  return {
    success: result.allowed,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset
  }
}

function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP through various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  let ip = forwarded?.split(',')[0] || 
           realIp || 
           cfConnectingIp || 
           '127.0.0.1'
  
  // Clean IP address
  ip = ip.trim()
  
  // For development, include user agent to differentiate
  if (config.isDevelopment) {
    const userAgent = request.headers.get('user-agent') || 'unknown'
    return `${ip}-${userAgent.substring(0, 50)}`
  }
  
  return ip
}

// Redis-based rate limiter for production
export class RedisRateLimiter {
  constructor(
    private redisClient: any, // Redis client
    private maxRequests: number,
    private windowMs: number
  ) {}
  
  async isAllowed(identifier: string): Promise<{
    allowed: boolean
    limit: number
    remaining: number
    reset: number
  }> {
    const key = `rate_limit:${identifier}`
    const now = Date.now()
    const window = Math.floor(now / this.windowMs)
    const windowKey = `${key}:${window}`
    
    try {
      const count = await this.redisClient.incr(windowKey)
      
      if (count === 1) {
        // Set expiration for the window
        await this.redisClient.expire(windowKey, Math.ceil(this.windowMs / 1000))
      }
      
      const remaining = Math.max(0, this.maxRequests - count)
      const resetTime = (window + 1) * this.windowMs
      
      return {
        allowed: count <= this.maxRequests,
        limit: this.maxRequests,
        remaining,
        reset: resetTime
      }
    } catch (error) {
      console.error('Redis rate limiter error:', error)
      // Fallback to allowing request if Redis fails
      return {
        allowed: true,
        limit: this.maxRequests,
        remaining: this.maxRequests,
        reset: now + this.windowMs
      }
    }
  }
}

// Middleware helper to apply rate limiting
export function withRateLimit(
  handler: (request: NextRequest) => Promise<Response>,
  type: 'global' | 'api' | 'auth' = 'global'
) {
  return async (request: NextRequest) => {
    const rateLimitResult = await rateLimit(request, type)
    
    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString()
          }
        }
      )
    }
    
    const response = await handler(request)
    
    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())
    
    return response
  }
}