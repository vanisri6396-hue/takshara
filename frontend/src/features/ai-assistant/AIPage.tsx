import { useMemo, useRef, useState } from 'react'
import { Send, Bot, RotateCcw, StopCircle } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

import type { ChatMessage } from './types'
import type { AiChatMode } from './api'
import { sendAiChatStream } from './api'


const MESSAGES_SEED: ChatMessage[] = [
  {
    role: 'assistant',
    content:
      "Hello! I'm your AI study assistant. I can help you with questions, quizzes, summaries, flashcards, and more. What would you like to work on today?",
  },
]


function formatMode(mode: AiChatMode) {
  return mode === 'takshara' ? 'Takshara (Personalized)' : 'General'
}

export default function AIPage() {
  const [mode, setMode] = useState<AiChatMode>('takshara')
  const [messages, setMessages] = useState<ChatMessage[]>(MESSAGES_SEED)
  const [input, setInput] = useState('')
  const [conversationId] = useState<string | null>(null)

  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  const scrollAnchorRef = useRef<HTMLDivElement | null>(null)

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending])

  async function appendUserMessage(text: string) {
    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    return userMsg
  }

  async function handleSend() {
    const text = input.trim()
    if (!text) return

    setError(null)
    setIsSending(true)

    try {
      const userMsg = await appendUserMessage(text)
      setInput('')

      const payload = {
        mode,
        conversation_id: conversationId,
        messages: [...messages, userMsg],
      }

      // Stop any previous request
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      // Prefer streaming for better UX
      const streamPayload = { ...payload, stream: true }

      const stream = await sendAiChatStream(streamPayload as any)

      const assistantMsgIndexRef = { idx: -1 }
      // Create placeholder assistant message in UI
      setMessages((prev) => {
        assistantMsgIndexRef.idx = prev.length
        return [...prev, { role: 'assistant', content: '' }]
      })

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        full += chunk

        setMessages((prev) => {
          const idx = assistantMsgIndexRef.idx
          if (idx < 0 || idx >= prev.length) return prev
          const next = [...prev]
          next[idx] = { ...next[idx], content: full }
          return next
        })
      }

      // Fetch conversation id if we ever need it in non-stream (server already creates it).
      // For streaming we persist it server-side; frontend can re-sync later.
      // Best-effort: attempt a non-stream follow-up for id only would be extra traffic; we avoid it.
      // If your UI requires it immediately, we can extend API later.
      // Keep local conversationId if it already exists; otherwise set it to a placeholder null.
      // The server will still persist the assistant message to the conversation.
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : 'Request failed'
      setError(msg)
    } finally {
      abortRef.current = null
      setIsSending(false)
      setTimeout(() => {
        scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 0)
    }
  }

  function stopSending() {
    abortRef.current?.abort()
    abortRef.current = null
    setIsSending(false)
  }

  async function handleRegenerate() {
    // Simple regenerate: resend the last user message
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUser) return

    // Remove last assistant message
    setMessages((prev) => {
      const idx = prev.map((m) => m.role).lastIndexOf('assistant')
      if (idx >= 0) return prev.slice(0, idx)
      return prev
    })

    setInput(lastUser.content)
    await handleSend()
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col pb-8">
      <div className="flex-shrink-0 animate-fade-in-up flex items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-headline-lg text-on-surface">AI Assistant</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">{formatMode(mode)}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={mode === 'takshara' ? 'primary' : 'secondary'}
            size="md"
            onClick={() => setMode('takshara')}
          >
            Takshara
          </Button>
          <Button
            variant={mode === 'general' ? 'primary' : 'secondary'}
            size="md"
            onClick={() => setMode('general')}
          >
            General
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col overflow-hidden animate-fade-in-up">
        <Card variant="glass" className="flex flex-1 flex-col overflow-hidden p-0">
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn('flex gap-3 animate-fade-in-up', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/15 text-primary-container">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-radius-lg px-4 py-3',
                      msg.role === 'user' ? 'gradient-gold text-on-primary' : 'bg-surface-container-high text-on-surface',
                    )}
                  >
                    <p className="text-body-md whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {error && (
                <div className="mx-auto max-w-3xl rounded-radius-lg border border-outline-variant/20 bg-error-container/10 p-3 text-body-md text-on-surface-variant">
                  {error}
                </div>
              )}

              <div ref={scrollAnchorRef} />
            </div>
          </div>

          <div className="border-t border-outline-variant/20 p-4">
            <div className="mx-auto max-w-3xl flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your studies..."
                  className="flex-1 rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-all duration-200 focus:border-primary-container focus:ring-2 focus:ring-primary-container/30"
                  onKeyDown={(e) => e.key === 'Enter' && canSend && handleSend()}
                  disabled={isSending}
                />

                {isSending ? (
                  <Button variant="secondary" size="md" icon={<StopCircle className="h-4 w-4" />} onClick={stopSending}>
                    Stop
                  </Button>
                ) : (
                  <Button variant="primary" size="md" icon={<Send className="h-4 w-4" />} onClick={handleSend} disabled={!canSend}>
                    Send
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-label-sm text-on-surface-variant">Conversation is persisted by the server.</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<RotateCcw className="h-4 w-4" />}
                    onClick={handleRegenerate}
                    disabled={isSending}
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

