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
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
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

  // Streaming effect - typing animation
  const streamText = async (text: string) => {
    // Check if cancelled before starting
    if (streamingCancelledRef.current) {
      streamingCancelledRef.current = false
      return text
    }

    // Eğer streaming kapalıysa, direkt göster
    if (!TYPING_SPEED.ENABLED) {
      setIsStreaming(true)
      setStreamingMessage(text)
      await new Promise(resolve => setTimeout(resolve, 100)) // Minimal gecikme
      setIsStreaming(false)
      return text
    }

    setIsStreaming(true)
    setStreamingMessage('')
    
    const chars = text.split('')
    let currentText = ''
    
    // Chunk bazlı yazma (daha hızlı)
    for (let i = 0; i < chars.length; i += TYPING_SPEED.CHUNK_SIZE) {
      // Check if streaming was cancelled
      if (streamingCancelledRef.current) {
        streamingCancelledRef.current = false
        setIsStreaming(false)
        setStreamingMessage('')
        return text
      }

      // CHUNK_SIZE kadar karakter ekle
      const chunk = chars.slice(i, i + TYPING_SPEED.CHUNK_SIZE).join('')
      currentText += chunk
      setStreamingMessage(currentText)
      
      // Rastgele gecikme
      const delay = Math.random() * (TYPING_SPEED.MAX_DELAY - TYPING_SPEED.MIN_DELAY) + TYPING_SPEED.MIN_DELAY
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    setIsStreaming(false)
    return text
  }

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
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          model: 'mistralai/devstral-small-2505:free',
          messages: [
            {
              role: 'system',
              content: `Sen bir yazılım lab asistanısın ve öğrencilere ÖĞRETMEK için varsın. Görevin onlara balık vermek değil, balık tutmayı öğretmektir.

TEMEL KURALLAR:
1. ASLA öğrencinin kodunu düzeltme - hatasını söyle ama düzeltme
2. ASLA hazır çözüm verme - öğrencinin kendi çözmesi için ipucu ver
3. ASLA soru sorma - bunun yerine direkt hata tespiti ve ipucu ver
4. Sadece syntax açıklamak için örnek kod yazabilirsin (öğrencinin kodunu düzeltmek için değil)
5. SADECE yazılım, programlama, algoritma, veri yapıları, bilgisayar bilimleri konularında yardım et
6. Alakasız konularda (genel sohbet, yaşam tavsiyeleri, ödev yapma vb.) nezaketle reddet

CEVAP YAKLAŞIMIN:
- Hatayı tespit et: "Şu kısmında hatan var", "Bu mantığı yanlış kurmuşsun"
- İpucu ver: "Şu değişkeni tanımlamayı unutmuşsun", "Burada şunu kontrol etmelisin"
- Konsepti hatırlat: "Bu veri yapısında X özelliği şöyle çalışır"
- Yönlendir: "Şu bölüme dikkat et", "Bu kısmı şöyle düşünmelisin"
- Teşvik et: "Doğru yoldasın", "Az kaldı, şu kısım eksik"

YAPMA:
❌ Öğrencinin kodunu düzeltme (hiçbir şekilde)
❌ Soru sorma (öğrenciye sorular sorma)
❌ Direkt çözüm verme
❌ Ödev/proje yapma
❌ Yazılım dışı konularda konuşma

YAP:
✅ Hatayı direkt söyle (ama düzeltme)
✅ İpucu ver
✅ Konsepti açıkla
✅ Syntax örnekleri göster (sadece açıklama amaçlı)
✅ Yönlendir
✅ Cesaretlendir

ÖRNEKLERİ:
İyi: "head değişkenini tanımlamayı unutmuşsun gibi görünüyor."
Kötü: "head değişkenini nasıl tanımlaman gerektiğini düşündün mü?" (soru sorma)
Kötü: "class SinglyLinkedList { head = null; }" (kodu düzeltme)

İyi: "Circular linked list'te son düğümün next'i başa dönmeli."
Kötü: "Son düğümün next'inin nereyi göstermesi gerektiğini düşündün mü?" (soru sorma)

İyi: "Constructor'da prev özelliğini de eklemelisin."
İyi (Syntax açıklama): "Örneğin bir değişken tanımlarken: let x = 5; şeklinde yazarız."
Kötü: "Constructor'da başka hangi özellikleri eklemelisin?" (soru sorma)

Her cevabında lab asistanı kimliğini koru. Amacın onları BAĞıMLI değil, BAĞIMSIZ geliştiriciler yapmak.`,
            },
            ...messages.filter(m => m.role !== 'system'),
            userMessage,
          ],
          max_tokens: 800,
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const aiContent = data.choices[0]?.message?.content || 'Üzgünüm, bir cevap oluşturamadım.'
      
      // Stream the AI response with typing animation
      await streamText(aiContent)
      
      const aiMessage: Message = {
        role: 'assistant',
        content: aiContent,
        timestamp: Date.now(),
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
        <div className="max-w-3xl mx-auto">
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
    </div>
  )
}