import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { setSecurityHeaders } from '@/lib/security'

// GET - Get specific user details
export async function GET(
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

    const user = await prisma.user.findUnique({
      where: { id },
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
        comments: {
          select: {
            id: true,
            content: true,
            postSlug: true,
            status: true,
            createdAt: true,
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
          take: 10, // Last 10 comments
        },
        _count: {
          select: {
            comments: true,
            commentLikes: true,
          },
        },
      },
    })

    if (!user) {
      response = NextResponse.json(
        { success: false, error: 'User not found' }, 
        { status: 404 }
      )
      return setSecurityHeaders(response)
    }

    response = NextResponse.json({
      success: true,
      data: user,
    })
    
    return setSecurityHeaders(response)
  } catch (error) {
    console.error('Error fetching user:', error)
    response = NextResponse.json(
      { success: false, error: 'Failed to fetch user' }, 
      { status: 500 }
    )
    return setSecurityHeaders(response)
  }
}

// PUT - Update user (role, status, etc.)
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
    const { role, isActive, reason } = body

    // Validate role if provided
    if (role && !['USER', 'ADMIN', 'MODERATOR', 'EDITOR'].includes(role)) {
      response = NextResponse.json(
        { success: false, error: 'Invalid role' }, 
        { status: 400 }
      )
      return setSecurityHeaders(response)
    }

    // Prevent self-deactivation or role change
    if (id === session.user.id) {
      if (isActive === false) {
        response = NextResponse.json(
          { success: false, error: 'Cannot deactivate your own account' }, 
          { status: 400 }
        )
        return setSecurityHeaders(response)
      }
      
      if (role && role !== 'ADMIN') {
        response = NextResponse.json(
          { success: false, error: 'Cannot change your own admin role' }, 
          { status: 400 }
        )
        return setSecurityHeaders(response)
      }
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    })

    if (!existingUser) {
      response = NextResponse.json(
        { success: false, error: 'User not found' }, 
        { status: 404 }
      )
      return setSecurityHeaders(response)
    }

    // Build update data
    const updateData: any = {}
    if (role !== undefined) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
    })

    // Log admin action
    const changes = []
    if (role !== undefined && role !== existingUser.role) {
      changes.push(`role: ${existingUser.role} → ${role}`)
    }
    if (isActive !== undefined && isActive !== existingUser.isActive) {
      changes.push(`status: ${existingUser.isActive ? 'active' : 'inactive'} → ${isActive ? 'active' : 'inactive'}`)
    }

    if (changes.length > 0) {
      await prisma.adminLog.create({
        data: {
          userId: session.user.id,
          action: 'user_updated',
          targetId: id,
          targetType: 'user',
          details: JSON.stringify({
            targetUserEmail: existingUser.email,
            changes: changes.join(', '),
            reason: reason || null,
          }),
          ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] ||
                    request.headers.get('x-real-ip') ||
                    '127.0.0.1',
        },
      })
    }

    response = NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    })
    
    return setSecurityHeaders(response)
  } catch (error) {
    console.error('Error updating user:', error)
    response = NextResponse.json(
      { success: false, error: 'Failed to update user' }, 
      { status: 500 }
    )
    return setSecurityHeaders(response)
  }
}

// DELETE - Delete user permanently (dangerous operation)
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

    // Prevent self-deletion
    if (id === session.user.id) {
      response = NextResponse.json(
        { success: false, error: 'Cannot delete your own account' }, 
        { status: 400 }
      )
      return setSecurityHeaders(response)
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
    })

    if (!existingUser) {
      response = NextResponse.json(
        { success: false, error: 'User not found' }, 
        { status: 404 }
      )
      return setSecurityHeaders(response)
    }

    // Check if user has content (comments)
    if (existingUser._count.comments > 0) {
      response = NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete user with existing comments. Deactivate instead.' 
        }, 
        { status: 400 }
      )
      return setSecurityHeaders(response)
    }

    // Delete user and associated data
    await prisma.$transaction([
      // Delete comment likes
      prisma.commentLike.deleteMany({
        where: { userId: id },
      }),
      // Delete sessions
      prisma.session.deleteMany({
        where: { userId: id },
      }),
      // Delete accounts
      prisma.account.deleteMany({
        where: { userId: id },
      }),
      // Delete admin logs
      prisma.adminLog.deleteMany({
        where: { userId: id },
      }),
      // Delete the user
      prisma.user.delete({
        where: { id },
      }),
    ])

    // Log admin action
    await prisma.adminLog.create({
      data: {
        userId: session.user.id,
        action: 'user_deleted',
        targetId: id,
        targetType: 'user',
        details: JSON.stringify({
          deletedUserEmail: existingUser.email,
          deletedUserRole: existingUser.role,
        }),
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] ||
                  request.headers.get('x-real-ip') ||
                  '127.0.0.1',
      },
    })

    response = NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    })
    
    return setSecurityHeaders(response)
  } catch (error) {
    console.error('Error deleting user:', error)
    response = NextResponse.json(
      { success: false, error: 'Failed to delete user' }, 
      { status: 500 }
    )
    return setSecurityHeaders(response)
  }
}