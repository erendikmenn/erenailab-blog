import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const newsletterSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  source: z.string().optional(),
})

// Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source } = newsletterSchema.parse(body)

    // Check if email already exists
    const existingSubscription = await prisma.newsletter.findUnique({
      where: { email }
    })

    if (existingSubscription) {
      if (existingSubscription.confirmed) {
        return NextResponse.json({ 
          success: false, 
          error: 'Bu e-posta adresi zaten kayıtlı' 
        }, { status: 400 })
      } else {
        // Resend confirmation (in a real app, you'd send an email here)
        return NextResponse.json({ 
          success: true, 
          message: 'Onay e-postası tekrar gönderildi' 
        })
      }
    }

    // Create new subscription
    const subscription = await prisma.newsletter.create({
      data: {
        email,
        confirmed: true, // In production, this would be false until email confirmation
        // source: source || 'website'
      }
    })

    // In production, send confirmation email here
    console.log('Newsletter subscription:', {
      email,
      source: source || 'website',
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Newsletter aboneliği başarılı!' 
    })

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Geçersiz e-posta formatı',
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Abonelik işlemi başarısız. Lütfen tekrar deneyin.' 
    }, { status: 500 })
  }
}

// Unsubscribe from newsletter
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'E-posta adresi gerekli' 
      }, { status: 400 })
    }

    // Find and delete subscription
    const subscription = await prisma.newsletter.findUnique({
      where: { email }
    })

    if (!subscription) {
      return NextResponse.json({ 
        success: false, 
        error: 'E-posta adresi bulunamadı' 
      }, { status: 404 })
    }

    await prisma.newsletter.delete({
      where: { email }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Newsletter aboneliğinden çıkıldı' 
    })

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Abonelik iptali başarısız. Lütfen tekrar deneyin.' 
    }, { status: 500 })
  }
}

// Get subscriber count (for admin)
export async function GET() {
  try {
    const count = await prisma.newsletter.count({
      where: {
        confirmed: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      count 
    })

  } catch (error) {
    console.error('Newsletter count error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Sayı alınamadı' 
    }, { status: 500 })
  }
}