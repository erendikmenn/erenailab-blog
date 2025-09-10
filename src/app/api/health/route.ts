import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { setSecurityHeaders } from '@/lib/security'

export async function GET(request: NextRequest) {
  let response: NextResponse
  
  try {
    // Basic health checks
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      checks: {
        database: false,
        auth: false,
        api: true,
      }
    }

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`
      health.checks.database = true
    } catch (error) {
      health.checks.database = false
      health.status = 'degraded'
    }

    // Test auth configuration
    try {
      const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET
      const hasNextAuthUrl = !!process.env.NEXTAUTH_URL
      health.checks.auth = hasNextAuthSecret && hasNextAuthUrl
      
      if (!health.checks.auth) {
        health.status = 'degraded'
      }
    } catch (error) {
      health.checks.auth = false
      health.status = 'degraded'
    }

    // Overall status
    const allHealthy = Object.values(health.checks).every(check => check === true)
    if (!allHealthy && health.status === 'healthy') {
      health.status = 'degraded'
    }

    const statusCode = health.status === 'healthy' ? 200 : 503

    response = NextResponse.json(health, { status: statusCode })
    return setSecurityHeaders(response)
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    response = NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      checks: {
        database: false,
        auth: false,
        api: false,
      }
    }, { status: 503 })
    
    return setSecurityHeaders(response)
  }
}