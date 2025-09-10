import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { setSecurityHeaders } from '@/lib/security'

// PUT - Update comment status (approve, reject, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    const { status, reason } = body

    // Validate status
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'SPAM', 'HIDDEN']
    if (!validStatuses.includes(status)) {
      response = NextResponse.json(
        { success: false, error: 'Invalid status' }, 
        { status: 400 }
      )
      return setSecurityHeaders(response)
    }

    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!existingComment) {
      response = NextResponse.json(
        { success: false, error: 'Comment not found' }, 
        { status: 404 }
      )
      return setSecurityHeaders(response)
    }

    // Update comment status
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { status },
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
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    })

    // Log admin action
    await prisma.adminLog.create({
      data: {
        userId: session.user.id,
        action: `comment_${status.toLowerCase()}`,
        targetId: id,
        targetType: 'comment',
        details: JSON.stringify({
          commentUserId: existingComment.userId,
          commentContent: existingComment.content.substring(0, 100),
          postSlug: existingComment.postSlug,
          reason: reason || null,
        }),
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] ||
                  request.headers.get('x-real-ip') ||
                  '127.0.0.1',
      },
    })

    response = NextResponse.json({
      success: true,
      data: updatedComment,
      message: `Comment ${status.toLowerCase()} successfully`,
    })
    
    return setSecurityHeaders(response)
  } catch (error) {
    console.error('Error updating comment:', error)
    response = NextResponse.json(
      { success: false, error: 'Failed to update comment' }, 
      { status: 500 }
    )
    return setSecurityHeaders(response)
  }
}

// DELETE - Delete comment permanently
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    })

    if (!existingComment) {
      response = NextResponse.json(
        { success: false, error: 'Comment not found' }, 
        { status: 404 }
      )
      return setSecurityHeaders(response)
    }

    // Check if comment has replies
    if (existingComment._count.replies > 0) {
      response = NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete comment with replies. Mark as hidden instead.' 
        }, 
        { status: 400 }
      )
      return setSecurityHeaders(response)
    }

    // Delete comment and associated data
    await prisma.$transaction([
      // Delete comment likes first
      prisma.commentLike.deleteMany({
        where: { commentId: id },
      }),
      // Delete the comment
      prisma.comment.delete({
        where: { id },
      }),
    ])

    // Log admin action
    await prisma.adminLog.create({
      data: {
        userId: session.user.id,
        action: 'comment_deleted',
        targetId: id,
        targetType: 'comment',
        details: JSON.stringify({
          commentUserId: existingComment.userId,
          commentContent: existingComment.content.substring(0, 100),
          postSlug: existingComment.postSlug,
        }),
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] ||
                  request.headers.get('x-real-ip') ||
                  '127.0.0.1',
      },
    })

    response = NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
    })
    
    return setSecurityHeaders(response)
  } catch (error) {
    console.error('Error deleting comment:', error)
    response = NextResponse.json(
      { success: false, error: 'Failed to delete comment' }, 
      { status: 500 }
    )
    return setSecurityHeaders(response)
  }
}