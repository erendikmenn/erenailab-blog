import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/rate-limit'
import { setSecurityHeaders } from '@/lib/security'
import { schemas, validateRequest, sanitizeContent } from '@/lib/validation'

// GET - Fetch comments for a post
export async function GET(request: NextRequest) {
  let response: NextResponse
  
  try {
    const { searchParams } = new URL(request.url)
    const postSlug = searchParams.get('postSlug')
    
    if (!postSlug) {
      response = NextResponse.json(
        { success: false, error: 'Post slug is required' }, 
        { status: 400 }
      )
      return setSecurityHeaders(response)
    }

    // Validate post slug format
    const slugValidation = await validateRequest(schemas.comment.pick({ postSlug: true }))({
      postSlug
    })
    
    if (!slugValidation.success) {
      response = NextResponse.json(
        { success: false, error: 'Invalid post slug format' }, 
        { status: 400 }
      )
      return setSecurityHeaders(response)
    }

    const comments = await prisma.comment.findMany({
      where: {
        postSlug,
        status: 'APPROVED',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        likes: true,
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
    })

    // Organize comments into threads
    const commentMap = new Map()
    const topLevelComments: any[] = []

    // First pass: create map of all comments with sanitized content
    comments.forEach(comment => {
      commentMap.set(comment.id, {
        ...comment,
        content: sanitizeContent(comment.content, {
          allowedTags: ['b', 'i', 'em', 'strong', 'code', 'br'],
          allowedAttributes: {}
        }),
        replies: [],
        likeCount: comment.likes.filter(like => like.type === 'LIKE').length,
        dislikeCount: comment.likes.filter(like => like.type === 'DISLIKE').length,
      })
    })

    // Second pass: organize into threads
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId)
        if (parent) {
          parent.replies.push(commentWithReplies)
        }
      } else {
        topLevelComments.push(commentWithReplies)
      }
    })

    response = NextResponse.json({
      success: true,
      data: topLevelComments
    })
    
    return setSecurityHeaders(response)
  } catch (error) {
    console.error('Error fetching comments:', error)
    response = NextResponse.json(
      { success: false, error: 'Failed to fetch comments' }, 
      { status: 500 }
    )
    return setSecurityHeaders(response)
  }
}

// POST - Create a new comment (with rate limiting)
export const POST = withRateLimit(async (request: NextRequest) => {
  let response: NextResponse
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      response = NextResponse.json(
        { success: false, error: 'Authentication required' }, 
        { status: 401 }
      )
      return setSecurityHeaders(response)
    }

    const body = await request.json()
    
    // Validate input with enhanced schema
    const validationResult = await validateRequest(schemas.comment)(body)
    
    if (!validationResult.success) {
      response = NextResponse.json({
        success: false,
        error: 'Validation failed',
        fieldErrors: validationResult.fieldErrors
      }, { status: 400 })
      return setSecurityHeaders(response)
    }

    const { content, postSlug, parentId } = validationResult.data!

    // Sanitize content
    const sanitizedContent = sanitizeContent(content, {
      allowedTags: ['b', 'i', 'em', 'strong', 'code', 'br'],
      allowedAttributes: {}
    })

    // Additional content validation
    if (sanitizedContent.trim().length === 0) {
      response = NextResponse.json({
        success: false,
        error: 'Comment content cannot be empty after sanitization'
      }, { status: 400 })
      return setSecurityHeaders(response)
    }

    // Check if parent comment exists (if parentId provided)
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      })
      
      if (!parentComment) {
        response = NextResponse.json(
          { success: false, error: 'Parent comment not found' }, 
          { status: 404 }
        )
        return setSecurityHeaders(response)
      }
    }

    // Get client IP and user agent for security logging
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                    request.headers.get('x-real-ip') ||
                    request.headers.get('cf-connecting-ip') ||
                    '127.0.0.1'
    
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // Rate limiting check for comment creation per user
    const userCommentCount = await prisma.comment.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      }
    })

    if (userCommentCount >= 10) { // Max 10 comments per hour
      response = NextResponse.json({
        success: false,
        error: 'Comment rate limit exceeded. Please wait before posting again.'
      }, { status: 429 })
      return setSecurityHeaders(response)
    }

    const comment = await prisma.comment.create({
      data: {
        content: sanitizedContent,
        postSlug,
        parentId,
        userId: session.user.id,
        status: 'PENDING', // New comments need approval
        ipAddress: clientIP,
        userAgent: userAgent.substring(0, 255) // Truncate if too long
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    })

    response = NextResponse.json({
      success: true,
      data: {
        ...comment,
        likeCount: 0,
        dislikeCount: 0,
        replies: [],
      }
    }, { status: 201 })
    
    return setSecurityHeaders(response)
  } catch (error) {
    console.error('Error creating comment:', error)
    response = NextResponse.json(
      { success: false, error: 'Failed to create comment' }, 
      { status: 500 }
    )
    return setSecurityHeaders(response)
  }
}, 'api')