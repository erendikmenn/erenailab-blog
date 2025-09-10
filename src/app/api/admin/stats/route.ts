import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { setSecurityHeaders } from '@/lib/security'

// GET - Fetch admin dashboard statistics
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

    // Get date range for statistics
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfDay.getTime() - (startOfDay.getDay() * 24 * 60 * 60 * 1000))
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Parallel queries for better performance
    const [
      totalUsers,
      activeUsers,
      totalComments,
      pendingComments,
      approvedComments,
      rejectedComments,
      spamComments,
      todayComments,
      weekComments,
      monthComments,
      todayUsers,
      weekUsers,
      monthUsers,
      recentActivity,
      commentsByStatus,
      usersByRole,
    ] = await Promise.all([
      // User statistics
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      
      // Comment statistics
      prisma.comment.count(),
      prisma.comment.count({ where: { status: 'PENDING' } }),
      prisma.comment.count({ where: { status: 'APPROVED' } }),
      prisma.comment.count({ where: { status: 'REJECTED' } }),
      prisma.comment.count({ where: { status: 'SPAM' } }),
      
      // Time-based comment statistics
      prisma.comment.count({
        where: { createdAt: { gte: startOfDay } }
      }),
      prisma.comment.count({
        where: { createdAt: { gte: startOfWeek } }
      }),
      prisma.comment.count({
        where: { createdAt: { gte: startOfMonth } }
      }),
      
      // Time-based user statistics
      prisma.user.count({
        where: { createdAt: { gte: startOfDay } }
      }),
      prisma.user.count({
        where: { createdAt: { gte: startOfWeek } }
      }),
      prisma.user.count({
        where: { createdAt: { gte: startOfMonth } }
      }),
      
      // Recent admin activity
      prisma.adminLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      
      // Grouped statistics
      prisma.comment.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      }),
    ])

    // Process grouped data
    const statusStats = commentsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.id
      return acc
    }, {} as Record<string, number>)

    const roleStats = usersByRole.reduce((acc, item) => {
      acc[item.role] = item._count.id
      return acc
    }, {} as Record<string, number>)

    // Calculate trends (simplified - could be enhanced with more complex calculations)
    const commentTrend = weekComments > 0 ? ((todayComments / (weekComments / 7)) - 1) * 100 : 0
    const userTrend = weekUsers > 0 ? ((todayUsers / (weekUsers / 7)) - 1) * 100 : 0

    response = NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          totalComments,
          pendingComments,
          approvedComments,
          rejectedComments,
          spamComments,
        },
        trends: {
          commentsToday: todayComments,
          commentsThisWeek: weekComments,
          commentsThisMonth: monthComments,
          commentTrend: Math.round(commentTrend),
          usersToday: todayUsers,
          usersThisWeek: weekUsers,
          usersThisMonth: monthUsers,
          userTrend: Math.round(userTrend),
        },
        distributions: {
          commentsByStatus: {
            PENDING: statusStats.PENDING || 0,
            APPROVED: statusStats.APPROVED || 0,
            REJECTED: statusStats.REJECTED || 0,
            SPAM: statusStats.SPAM || 0,
            HIDDEN: statusStats.HIDDEN || 0,
          },
          usersByRole: {
            USER: roleStats.USER || 0,
            ADMIN: roleStats.ADMIN || 0,
            MODERATOR: roleStats.MODERATOR || 0,
            EDITOR: roleStats.EDITOR || 0,
          },
        },
        recentActivity: recentActivity.map(log => ({
          id: log.id,
          action: log.action,
          user: log.user.name || log.user.email,
          targetType: log.targetType,
          targetId: log.targetId,
          details: log.details ? JSON.parse(log.details) : null,
          createdAt: log.createdAt,
        })),
        alerts: {
          highPendingComments: pendingComments > 10,
          newSpamComments: spamComments > 0,
          inactiveAdmins: false, // Could be calculated based on last login
        },
      },
    })
    
    return setSecurityHeaders(response)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    response = NextResponse.json(
      { success: false, error: 'Failed to fetch admin statistics' }, 
      { status: 500 }
    )
    return setSecurityHeaders(response)
  }
}