import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// POST - Create new post (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Only admins can create posts.' }, 
        { status: 403 }
      )
    }

    const data = await request.json()
    const {
      title,
      title_en,
      excerpt,
      excerpt_en,
      content,
      content_en,
      category,
      tags,
      author,
      featured = false
    } = data

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' }, 
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    // Create MDX content for Turkish
    const mdxContent = `---
title: "${title}"
description: "${excerpt || ''}"
date: "${new Date().toISOString()}"
author: "${author || session.user.name || 'Admin'}"
category: "${category || 'general'}"
tags: [${tags ? tags.split(',').map((tag: string) => `"${tag.trim()}"`).join(', ') : ''}]
featured: ${featured}
language: "tr"
---

${content}
`

    // Create MDX content for English (if provided)
    const mdxContentEn = title_en && content_en ? `---
title: "${title_en}"
description: "${excerpt_en || ''}"
date: "${new Date().toISOString()}"
author: "${author || session.user.name || 'Admin'}"
category: "${category || 'general'}"
tags: [${tags ? tags.split(',').map((tag: string) => `"${tag.trim()}"`).join(', ') : ''}]
featured: ${featured}
language: "en"
---

${content_en}
` : null

    // Save files
    const contentDir = join(process.cwd(), 'content', 'posts')
    
    try {
      await mkdir(contentDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Save Turkish version
    const trFilePath = join(contentDir, `${slug}.mdx`)
    await writeFile(trFilePath, mdxContent, 'utf8')

    // Save English version if provided
    if (mdxContentEn) {
      const enFilePath = join(contentDir, `${slug}-en.mdx`)
      await writeFile(enFilePath, mdxContentEn, 'utf8')
    }

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      data: {
        slug,
        title,
        title_en,
        files: {
          tr: `${slug}.mdx`,
          en: mdxContentEn ? `${slug}-en.mdx` : null
        }
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create post' }, 
      { status: 500 }
    )
  }
}