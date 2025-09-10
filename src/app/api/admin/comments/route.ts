import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { setSecurityHeaders } from '@/lib/security'

// GET - Fetch all comments for admin moderation
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
    const status = searchParams.get('status') || 'PENDING'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Validate status
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'SPAM', 'HIDDEN']
    if (!validStatuses.includes(status)) {
      response = NextResponse.json(
        { success: false, error: 'Invalid status' }, 
        { status: 400 }
      )
      return setSecurityHeaders(response)
    }

    const comments = await prisma.comment.findMany({
      where: {
        status: status as string,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
        parent: {
          select: {
            id: true,
            content: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
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
    const totalCount = await prisma.comment.count({
      where: {
        status: status as string,
      },
    })

    const totalPages = Math.ceil(totalCount / limit)

    response = NextResponse.json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    })
    
    return setSecurityHeaders(response)
  } catch (error) {
    console.error('Error fetching admin comments:', error)
    response = NextResponse.json(
      { success: false, error: 'Failed to fetch comments' }, 
      { status: 500 }
    )
    return setSecurityHeaders(response)
  }
}