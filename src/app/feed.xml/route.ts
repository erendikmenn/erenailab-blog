import { getAllPosts } from '@/lib/mdx'

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '\'': return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}

export async function GET() {
  const posts = await getAllPosts()
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000'
  
  const rssItemsXml = posts
    .slice(0, 20) // Latest 20 posts
    .map((post) => {
      const postUrl = `${siteUrl}/blog/${post.slug}`
      const pubDate = new Date(post.date).toUTCString()
      
      return `
        <item>
          <title><![CDATA[${escapeXml(post.title)}]]></title>
          <description><![CDATA[${escapeXml(post.description)}]]></description>
          <link>${postUrl}</link>
          <guid isPermaLink="true">${postUrl}</guid>
          <pubDate>${pubDate}</pubDate>
          <author>contact@erenailab.com (${escapeXml(post.author)})</author>
          <category><![CDATA[${escapeXml(getCategoryName(post.category))}]]></category>
          ${post.tags.map(tag => `<category><![CDATA[${escapeXml(tag)}]]></category>`).join('')}
        </item>`
    })
    .join('')

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[ErenAILab - Akademik Yapay Zeka Blog]]></title>
    <description><![CDATA[Yapay zeka araştırmaları, makine öğrenmesi ve akademik çalışmalar. DeepMind tarzı araştırma laboratuvarları için akademik içerik.]]></description>
    <link>${siteUrl}</link>
    <language>tr-TR</language>
    <managingEditor>contact@erenailab.com (ErenAILab Team)</managingEditor>
    <webMaster>contact@erenailab.com (ErenAILab Team)</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <generator>ErenAILab Blog</generator>
    <ttl>60</ttl>
    <image>
      <url>${siteUrl}/logo.png</url>
      <title>ErenAILab</title>
      <link>${siteUrl}</link>
      <width>144</width>
      <height>144</height>
    </image>
    ${rssItemsXml}
  </channel>
</rss>`

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    },
  })
}

function getCategoryName(category: string): string {
  const names = {
    'theoretical-ai': 'Teorik AI',
    'machine-learning': 'Makine Öğrenmesi',
    'research-reviews': 'Araştırma İncelemeleri',
    'energy-sustainability': 'Enerji & Sürdürülebilirlik',
    'implementation': 'Uygulama',
    'career-insights': 'Kariyer İpuçları',
  }
  return names[category as keyof typeof names] || category
}