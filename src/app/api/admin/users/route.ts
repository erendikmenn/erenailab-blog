import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { setSecurityHeaders } from '@/lib/security'

// GET - Fetch all users for admin management
export async function GET(request: NextRequest) {
  let response: NextResponse
  
  try {
    const session = await getServerSession(authOptions)
    
    // Check admin authorization
    if (!session?.user || session.user.role !== 'ADMIN') {
      response = NextResponse.json(
        { success: false, error: 'Admin access required' }, 
        { status: 403 }
      )
      return setSecurityHeaders(response)
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {}
    
    if (role && ['USER', 'ADMIN', 'MODERATOR', 'EDITOR'].includes(role)) {
      whereClause.role = role
    }
    
    if (isActive !== null && (isActive === 'true' || isActive === 'false')) {
      whereClause.isActive = isActive === 'true'
    }
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isActive: true,
        bio: true,
        website: true,
        twitter: true,
        github: true,
        linkedin: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            comments: true,
            commentLikes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    })

    // Get total count for pagination
    const totalCount = await prisma.user.count({
      where: whereClause,
    })

    const totalPages = Math.ceil(totalCount / limit)

    // Get user statistics
    const stats = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    })

    const roleStats = {
      USER: 0,
      ADMIN: 0,
      MODERATOR: 0,
      EDITOR: 0,
    }

    stats.forEach(stat => {
      roleStats[stat.role as keyof typeof roleStats] = stat._count.id
    })

    response = NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        stats: {
          totalUsers: totalCount,
          roleDistribution: roleStats,
          activeUsers: await prisma.user.count({ where: { isActive: true } }),
          inactiveUsers: await prisma.user.count({ where: { isActive: false } }),
        },
      },
    })
    
    return setSecurityHeaders(response)
  } catch (error) {
    console.error('Error fetching admin users:', error)
    response = NextResponse.json(
      { success: false, error: 'Failed to fetch users' }, 
      { status: 500 }
    )
    return setSecurityHeaders(response)
  }
}