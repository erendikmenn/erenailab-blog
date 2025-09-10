import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be no more than 100 characters'),
  email: z.string().email('Invalid email address').max(255, 'Email must be no more than 255 characters'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject must be no more than 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be no more than 2000 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = contactFormSchema.parse(body)

    // For now, we'll just log the message and return success
    // In production, you would send this to your email service (e.g., SendGrid, Mailgun, etc.)
    console.log('Contact form submission:', {
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject,
      message: validatedData.message,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    })

    // In a real application, you would implement email sending here:
    /*
    await sendEmail({
      to: 'contact@erenailab.com',
      from: validatedData.email,
      subject: \`Contact Form: \${validatedData.subject}\`,
      html: \`
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> \${validatedData.name}</p>
        <p><strong>Email:</strong> \${validatedData.email}</p>
        <p><strong>Subject:</strong> \${validatedData.subject}</p>
        <p><strong>Message:</strong></p>
        <p>\${validatedData.message.replace(/\\n/g, '<br>')}</p>
      \`
    })

    // Send auto-reply to user
    await sendEmail({
      to: validatedData.email,
      from: 'contact@erenailab.com',
      subject: 'Thank you for contacting ErenAILab',
      html: \`
        <h3>Thank you for your message!</h3>
        <p>Dear \${validatedData.name},</p>
        <p>We have received your message and will get back to you soon.</p>
        <p>Best regards,<br>ErenAILab Team</p>
      \`
    })
    */

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully!' 
    })

  } catch (error) {
    console.error('Contact form error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid form data',
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send message. Please try again later.' 
    }, { status: 500 })
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}