import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const likeCommentSchema = z.object({
  type: z.enum(['LIKE', 'DISLIKE']),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id: commentId } = await params
    const body = await request.json()
    const validationResult = likeCommentSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { type } = validationResult.data

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    })
    
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Check if user already liked/disliked this comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    })

    if (existingLike) {
      if (existingLike.type === type) {
        // Remove like/dislike if same type
        await prisma.commentLike.delete({
          where: { id: existingLike.id },
        })
      } else {
        // Update like/dislike if different type
        await prisma.commentLike.update({
          where: { id: existingLike.id },
          data: { type },
        })
      }
    } else {
      // Create new like/dislike
      await prisma.commentLike.create({
        data: {
          userId: session.user.id,
          commentId,
          type,
        },
      })
    }

    // Get updated like counts
    const likes = await prisma.commentLike.findMany({
      where: { commentId },
    })

    const likeCount = likes.filter(like => like.type === 'LIKE').length
    const dislikeCount = likes.filter(like => like.type === 'DISLIKE').length

    return NextResponse.json({
      likeCount,
      dislikeCount,
      userLike: existingLike?.type === type ? null : type,
    })
  } catch (error) {
    console.error('Error updating comment like:', error)
    return NextResponse.json({ error: 'Failed to update like' }, { status: 500 })
  }
}