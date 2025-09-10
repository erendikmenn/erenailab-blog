'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>,
          p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
          code: ({ children, className }) => {
            const isInline = !className
            if (isInline) {
              return <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">{children}</code>
            }
            return (
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                <code className={className}>{children}</code>
              </pre>
            )
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary-500 pl-4 italic my-6 text-gray-700 dark:text-gray-300">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}