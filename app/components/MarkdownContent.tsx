'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/atom-one-dark.css'

interface MarkdownContentProps {
  content: string
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      className="markdown-content"
      components={{
        // Headings
        h1: ({ node, ...props }) => (
          <h1 className="text-xl font-bold mt-4 mb-2" style={{ color: '#D1D5DA' }} {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-lg font-bold mt-3 mb-2" style={{ color: '#D1D5DA' }} {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-base font-semibold mt-3 mb-1" style={{ color: '#D1D5DA' }} {...props} />
        ),
        h4: ({ node, ...props }) => (
          <h4 className="text-sm font-semibold mt-2 mb-1" style={{ color: '#C9D1D9' }} {...props} />
        ),
        
        // Paragraphs
        p: ({ node, ...props }) => (
          <p className="text-[15px] mb-3 leading-relaxed" style={{ color: '#C9D1D9' }} {...props} />
        ),
        
        // Lists
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside mb-3 space-y-1 text-[15px]" style={{ color: '#C9D1D9' }} {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside mb-3 space-y-1 text-[15px]" style={{ color: '#C9D1D9' }} {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="text-[15px]" style={{ color: '#C9D1D9' }} {...props} />
        ),
        
        // Code blocks
        code: ({ node, inline, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '')
          const txt = String(children).trim()
          
          // Eğer inline veya tek satırlık kısa kod ise satır içinde göster
          if (inline || txt.split('\n').length === 1) {
            return (
              <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ backgroundColor: '#30363D', color: '#79C0FF' }} {...props}>
                {children}
              </code>
            )
          }
          
          // Çok satırlı kod bloğu
          return (
            <div className="my-3 rounded-lg overflow-hidden" style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}>
              <div className="px-4 py-2 text-xs" style={{ backgroundColor: '#0D1117', borderBottom: '1px solid #30363D', color: '#8B949E' }}>
                {match ? match[1] : 'code'}
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            </div>
          )
        },
        
        // Blockquote
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 pl-4 py-2 my-3 text-sm italic" style={{ borderColor: '#30363D', color: '#8B949E' }} {...props} />
        ),
        
        // Links
        a: ({ node, ...props }) => (
          <a className="hover:underline" style={{ color: '#58A6FF' }} {...props} />
        ),
        
        // Strong/Bold
        strong: ({ node, ...props }) => (
          <strong className="font-semibold" style={{ color: '#D1D5DA' }} {...props} />
        ),
        
        // Emphasis/Italic
        em: ({ node, ...props }) => (
          <em className="italic" style={{ color: '#C9D1D9' }} {...props} />
        ),
        
        // Horizontal rule
        hr: ({ node, ...props }) => (
          <hr className="my-4" style={{ borderColor: '#30363D' }} {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

