// Database connectivity test
const { PrismaClient } = require('@prisma/client')

async function testDatabase() {
  console.log('🔍 Testing database connectivity...')
  
  const prisma = new PrismaClient()
  
  try {
    // Test 1: Database connectivity
    console.log('📊 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test 2: Check tables
    console.log('📋 Checking database tables...')
    const userCount = await prisma.user.count()
    const commentCount = await prisma.comment.count()
    console.log(`✅ Found ${userCount} users and ${commentCount} comments`)
    
    // Test 3: Create a test comment (if user exists)
    console.log('💬 Testing comment operations...')
    
    // Create a test user first
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER'
      }
    })
    
    // Create a test comment
    const testComment = await prisma.comment.create({
      data: {
        content: 'Test comment for database verification',
        postSlug: 'test-post',
        userId: testUser.id,
        status: 'APPROVED'
      }
    })
    
    console.log(`✅ Created test comment with ID: ${testComment.id}`)
    
    // Test 4: Fetch comments with user data
    const comments = await prisma.comment.findMany({
      where: { postSlug: 'test-post' },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })
    
    console.log(`✅ Retrieved ${comments.length} comments with user data`)
    
    // Cleanup test data
    await prisma.comment.delete({ where: { id: testComment.id } })
    console.log('🧹 Cleaned up test data')
    
    console.log('🎉 All database tests passed!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
