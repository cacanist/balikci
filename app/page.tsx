'use client'

import { useState, useEffect, useRef } from 'react'
import MarkdownContent from './components/MarkdownContent'

// ⚡ STREAMING HIZ AYARLARI
const TYPING_SPEED = {
  ENABLED: true,        // false yaparak streaming'i tamamen kapatabilirsiniz
  CHUNK_SIZE: 3,        // Kaç karakter aynı anda yazılsın (daha yüksek = daha hızlı)
  MIN_DELAY: 1,       // Minimum gecikme (ms) - Daha düşük = daha hızlı
  MAX_DELAY: 2,       // Maximum gecikme (ms) - Daha düşük = daha hızlı
  // ENABLED: false yaparsanız, mesaj anında gösterilir (en hızlı)
  // CHUNK_SIZE: 1  → Karakter karakter (en yavaş)
  // CHUNK_SIZE: 5  → 5'li gruplar halinde (çok hızlı)
  // CHUNK_SIZE: 10 → 10'lu gruplar halinde (ultra hızlı)
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: number
  reasoning_details?: false
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const [showAboutPopup, setShowAboutPopup] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const streamingCancelledRef = useRef(false)

  // API key from environment variable
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || ''

  // Check if welcome popup should be shown
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
    if (!hasSeenWelcome) {
      setShowWelcomePopup(true)
    }
  }, [])

  // Handle closing welcome popup
  const handleCloseWelcome = () => {
    localStorage.setItem('hasSeenWelcome', 'true')
    setShowWelcomePopup(false)
  }

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages')
    
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages))
      } catch (e) {
        console.error('Failed to parse saved messages:', e)
      }
    }
  }, [])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages))
    }
  }, [messages])

  // Check if user is at the bottom of the chat
  const checkIfAtBottom = () => {
    const container = chatContainerRef.current
    if (!container) return
    
    const threshold = 50 // 50px tolerance
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold
    setShouldAutoScroll(isAtBottom)
  }

  // Auto-scroll only if user is at the bottom
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      // Use scrollIntoView with smooth behavior
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages, shouldAutoScroll])

  // Separate effect for streaming to check scroll position first
  useEffect(() => {
    if (streamingMessage && messagesEndRef.current) {
      const container = chatContainerRef.current
      if (!container) return
      
      const threshold = 50
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold
      
      if (isAtBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    }
  }, [streamingMessage])

  // Reset auto-scroll when user sends a message
  useEffect(() => {
    if (isLoading) {
      setShouldAutoScroll(true)
    }
  }, [isLoading])


  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || isStreaming) return

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      // Prepare messages with reasoning_details if available
      const messagesWithReasoning = [
        {
          role: 'system',
          content: `Sen eğitim asistanısın. SADECE yazılım konularında yardım et.

🚨 ÖĞRETMEN TESPİTİ:
Eğer kullanıcı kendisinin "öğretmen", "hoca", "teacher", "instructor", "asistan", "akademisyen" olduğunu söylerse:
• ASLA kod yazma (ne tam kod, ne kod bloğu, ne pseudocode)
• ASLA algoritma detayı verme
• Sadece şunu söyle: "Üzgünüm, öğretmen olduğunuzu belirttiğiniz için size kod veya algoritma detayı veremem. Ben sadece öğrencilere yardımcı olmak için tasarlandım. 🎓"
• Başka hiçbir şey ekleme

⛔ YASAK:
• Kod bloğu (\`\`\`) kullanmak
• Öğrencinin kodunu düzeltmek
• Çalışan kod yazmak
• "Örnek Kod:", "Kullanım:", "Çözüm:" başlıkları

✅ İZİNLİ:
• Hatayı söyle + neden açıkla
• Algoritma mantığını açıkla (adım adım)
• İpucu ver
• Tek satır syntax göster (array.push gibi)
• Pseudocode kullan

📏 UZUN KOD/GÖREV KURALI:
Eğer kullanıcı çok uzun bir kod (100+ satır) veya tüm bir proje kodu gönderirse:
• ASLA tüm kodu analiz etmeye çalışma
• Kullanıcıya daha spesifik sorular sor:
  - "Hangi metodda/fonksiyonda hata var?"
  - "Hangi kısımda sorun yaşıyorsunuz?"
  - "Hata mesajı nedir?"
  - "Hangi satırlarda problem var?"
• Tüm projeyi analiz etmek yerine, belirli bir bölüme odaklanmasını iste
• Örnek: "Tüm proje kodunu göndermek yerine, hatanın olduğu metod veya sınıfı paylaşabilir misiniz? Bu şekilde daha hızlı yardımcı olabilirim."

KURAL: Kod yazmadan öğret.`,
        },
        ...messages
          .filter(m => m.role !== 'system')
          .map(m => {
            // Preserve reasoning_details for assistant messages
            if (m.role === 'assistant' && m.reasoning_details) {
              return {
                role: m.role,
                content: m.content,
                reasoning_details: m.reasoning_details,
              }
            }
            return {
              role: m.role,
              content: m.content,
            }
          }),
        {
          role: 'user',
          content: userMessage.content,
        },
      ]

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          model: 'x-ai/grok-4.1-fast:free',
          messages: messagesWithReasoning,
          reasoning: { enabled: true },
          max_tokens: 1200,
          stream: true, // Enable streaming
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      // Stream the response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      let reasoningDetails = null

      if (!reader) {
        throw new Error('Stream reader not available')
      }

      setIsStreaming(true)
      setStreamingMessage('')

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break
          
          // Check if request was cancelled
          if (abortControllerRef.current?.signal.aborted) {
            reader.cancel()
            break
          }
          
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              
              // Skip empty lines and [DONE] marker
              if (!data || data === '[DONE]') continue
              
              try {
                const json = JSON.parse(data)
                const delta = json.choices[0]?.delta
                
                if (delta?.content) {
                  fullContent += delta.content
                  setStreamingMessage(fullContent)
                }
                
                // Preserve reasoning_details if available
                if (delta?.reasoning_details) {
                  reasoningDetails = delta.reasoning_details
                }
                
                // Check for final reasoning_details in the response
                if (json.choices[0]?.message?.reasoning_details) {
                  reasoningDetails = json.choices[0].message.reasoning_details
                }
              } catch (e) {
                // Skip invalid JSON lines
                continue
              }
            }
          }
        }
      } finally {
        setIsStreaming(false)
      }
      
      const aiMessage: Message = {
        role: 'assistant',
        content: fullContent || 'Üzgünüm, bir cevap oluşturamadım.',
        timestamp: Date.now(),
        ...(reasoningDetails && { reasoning_details: reasoningDetails }),
      }

      setMessages((prev) => [...prev, aiMessage])
      setStreamingMessage('')
    } catch (error) {
      // Ignore abort errors (user cancelled)
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was cancelled')
        return
      }
      
      console.error('Error calling AI API:', error)
      const errorContent = `❌ Bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      
      setStreamingMessage(errorContent)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const errorMessage: Message = {
        role: 'assistant',
        content: errorContent,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
      setStreamingMessage('')
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && !isStreaming) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearChat = () => {
    if (confirm('Tüm sohbet geçmişi silinecek. Emin misiniz?')) {
      // Devam eden API çağrısını iptal et
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
      
      // Streaming'i iptal et
      streamingCancelledRef.current = true
      
      // Her şeyi sıfırla
      setMessages([])
      setStreamingMessage('')
      setIsStreaming(false)
      setIsLoading(false)
      setInputValue('')
      localStorage.removeItem('chatMessages')
      
      // Textarea yüksekliğini sıfırla
      if (inputRef.current) {
        inputRef.current.style.height = 'auto'
      }
    }
  }

  const handleExampleQuestion = (question: string) => {
    setInputValue(question)
    inputRef.current?.focus()
  }

  const exampleQuestions = [
    "Recursive fonksiyon ne zaman kullanmalıyım?",
    "Pass by value ve pass by reference farkı nedir?",
    "Stack ve Heap memory arasındaki fark nedir?",
    "Time complexity nedir ve nasıl hesaplanır?"
  ]

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#0D1117' }}>
      {/* Top bar with clear button */}
      <div className="px-4 py-3 border-b" style={{ borderColor: '#30363D', backgroundColor: '#0D1117' }}>
        <div className="max-w-3xl mx-auto flex justify-end">
          <button
            onClick={handleClearChat}
            className="transition-colors text-sm font-medium"
            style={{ color: '#8B949E' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#D1D5DA'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#8B949E'}
          >
            Temizle
          </button>
        </div>
      </div>

      {/* Chat Messages Area - Fixed Height, No Scroll on Page */}
      <main 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6" 
        style={{ backgroundColor: '#0D1117' }}
        onScroll={checkIfAtBottom}
      >
        <div className="max-w-3xl mx-auto h-full flex flex-col">
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-semibold" style={{ color: '#D1D5DA' }}>
                  Balıkçı
                </h2>
                <p className="text-base max-w-md" style={{ color: '#8B949E' }}>
                  🎣 Programlama öğrenmeye hazır mısınız?
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className="max-w-[80%] px-5 py-4 rounded-2xl transition-all"
                style={{
                  backgroundColor: message.role === 'user' ? '#2B3A55' : '#1E1E1E',
                  color: '#D1D5DA'
                }}
              >
                {message.role === 'user' ? (
                  <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                    {message.content}
                  </div>
                ) : (
                  <MarkdownContent content={message.content} />
                )}
              </div>
            </div>
          ))}

          {/* Streaming message with typing animation */}
          {isStreaming && streamingMessage && (
            <div className="flex justify-start animate-fade-in">
              <div
                className="max-w-[80%] px-5 py-4 rounded-2xl transition-all"
                style={{
                  backgroundColor: '#1E1E1E',
                  color: '#D1D5DA'
                }}
              >
                <MarkdownContent content={streamingMessage} />
                <span className="inline-block w-2 h-4 ml-1 animate-pulse" style={{ backgroundColor: '#8B949E' }}></span>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && !isStreaming && (
            <div className="flex justify-start animate-fade-in">
              <div className="max-w-[80%] px-5 py-4 rounded-2xl" style={{ backgroundColor: '#1E1E1E' }}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#8B949E', animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#8B949E', animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#8B949E', animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm" style={{ color: '#8B949E' }}>Düşünüyor...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Bottom Input Area - ChatGPT Style */}
      <footer className="border-t px-4 py-4" style={{ borderColor: '#30363D', backgroundColor: '#0D1117' }}>
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Example Questions - Only show when chat is empty */}
          {messages.length === 0 && (
            <div className="grid grid-cols-2 gap-2 animate-fade-in">
              {exampleQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleQuestion(question)}
                  className="px-4 py-3 rounded-xl text-sm text-left transition-all hover:scale-105"
                  style={{ 
                    backgroundColor: '#1E1E1E', 
                    color: '#D1D5DA',
                    border: '1px solid #30363D'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2B3A55'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E1E1E'}
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3 items-end rounded-2xl px-4 py-3" style={{ backgroundColor: '#343541', border: '1px solid #30363D' }}>
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isLoading || isStreaming 
                  ? "AI yanıt yazıyor, sonraki sorunuzu hazırlayabilirsiniz..." 
                  : "Mesajınızı yazın... (Shift+Enter ile yeni satır)"
              }
              disabled={false}
              rows={1}
              className="flex-1 bg-transparent outline-none text-[15px] resize-none max-h-32 overflow-y-auto"
              style={{ 
                color: '#E6E8EA', 
                caretColor: '#E6E8EA',
                lineHeight: '1.5',
                opacity: isLoading || isStreaming ? 0.7 : 1
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 128) + 'px'
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || isStreaming || !inputValue.trim()}
              className="px-4 py-2 rounded-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isLoading || isStreaming || !inputValue.trim() ? '#30363D' : '#10A37F',
                color: '#fff'
              }}
            >
              {isLoading || isStreaming ? '...' : 'Gönder'}
            </button>
          </div>
        </div>
      </footer>

      {/* Info Button - Bottom Right */}
      <button
        onClick={() => setShowAboutPopup(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-40"
        style={{ backgroundColor: '#2B3A55', color: '#D1D5DA' }}
      >
        <span className="text-xl font-bold">i</span>
      </button>

      {/* Welcome Popup Modal */}
      {showWelcomePopup && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        >
          <div 
            className="max-w-lg w-full rounded-2xl p-8 shadow-2xl animate-fade-in"
            style={{ backgroundColor: '#1E1E1E', border: '1px solid #30363D' }}
          >
            <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: '#D1D5DA' }}>
              🎣 Balıkçı - Programlama Asistanı
            </h2>
            <div className="space-y-3 mb-6 text-center" style={{ color: '#8B949E' }}>
              <p className="text-[15px] leading-relaxed">
                Merhaba! Ben bir <strong style={{ color: '#D1D5DA' }}>yazılım lab asistanıyım</strong> ve sana programlama öğretmek için buradayım.
              </p>
              <p className="text-[15px] leading-relaxed">
                Kodunu <strong style={{ color: '#D1D5DA' }}>asla düzeltmem</strong>, sadece hatanı gösteririm
              </p>
            </div>
            <button
              onClick={handleCloseWelcome}
              className="w-full py-3 rounded-lg font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: '#10A37F', color: '#fff' }}
            >
              Anladım, Başlayalım!
            </button>
          </div>
        </div>
      )}

      {/* About Popup Modal */}
      {showAboutPopup && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setShowAboutPopup(false)}
        >
          <div 
            className="max-w-md w-full rounded-2xl p-8 shadow-2xl animate-fade-in"
            style={{ backgroundColor: '#1E1E1E', border: '1px solid #30363D' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#D1D5DA' }}>
              ℹ️ Hakkında
            </h2>
            <div className="space-y-4 mb-6" style={{ color: '#8B949E' }}>
              <div className="text-center space-y-2">
                <p className="text-[15px]">
                  <strong style={{ color: '#D1D5DA' }}>Geliştirici:</strong> Çaça
                </p>
                <p className="text-[15px]">
                  <strong style={{ color: '#D1D5DA' }}>Mail:</strong>{' '}
                  <a 
                    href="mailto:caglarokuducu@gmail.com" 
                    className="hover:underline transition-colors"
                    style={{ color: '#10A37F' }}
                  >
                    caglarokuducu@gmail.com
                  </a>
                </p>
              </div>
              <div className="pt-4 border-t text-center text-sm" style={{ borderColor: '#30363D', color: '#8B949E' }}>
                Destek veya soru sormak için ulaşabilirsiniz.
              </div>
            </div>
            <button
              onClick={() => setShowAboutPopup(false)}
              className="w-full py-3 rounded-lg font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: '#2B3A55', color: '#fff' }}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  )
}