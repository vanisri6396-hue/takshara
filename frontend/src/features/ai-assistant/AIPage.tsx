import { useState } from 'react'
import { Send, Bot, Zap, BookOpen, Brain, Lightbulb } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  { icon: <Brain className="h-4 w-4" />, text: 'Generate quiz questions' },
  { icon: <BookOpen className="h-4 w-4" />, text: 'Summarize my notes' },
  { icon: <Lightbulb className="h-4 w-4" />, text: 'Create flashcards' },
  { icon: <Zap className="h-4 w-4" />, text: 'Study tips for exams' },
]

type Message = { role: 'user' | 'assistant'; content: string }

const MESSAGES: Message[] = [
  { role: 'assistant', content: 'Hello! I\'m your AI study assistant. I can help you with quizzes, summaries, flashcards, and more. What would you like to work on today?' },
]

export default function AIPage() {
  const [messages] = useState(MESSAGES)
  const [input, setInput] = useState('')

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col pb-8">
      {/* Header */}
      <div className="flex-shrink-0 animate-fade-in-up">
        <h1 className="font-headline text-headline-lg text-on-surface">AI Assistant</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Your intelligent study companion</p>
      </div>

      {/* Chat Area */}
      <div className="mt-4 flex flex-1 flex-col overflow-hidden animate-fade-in-up">
        <Card variant="glass" className="flex flex-1 flex-col overflow-hidden p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex gap-3 animate-fade-in-up',
                    msg.role === 'user' ? 'justify-end' : 'justify-start',
                  )}
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
                      msg.role === 'user'
                        ? 'gradient-gold text-on-primary'
                        : 'bg-surface-container-high text-on-surface',
                    )}
                  >
                    <p className="text-body-md">{msg.content}</p>
                  </div>
                </div>
              ))}

              {/* Suggestions */}
              <div className="pt-4">
                <p className="mb-3 text-center text-label-sm text-on-surface-variant">
                  Suggested actions
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTIONS.map((suggestion, i) => (
                    <button
                      key={i}
                      className="flex items-center gap-2 rounded-radius-lg border border-outline-variant/20 bg-surface-container-low p-3 text-label-sm text-on-surface-variant transition-all duration-200 hover:border-primary-container/30 hover:text-on-surface"
                    >
                      <span className="text-primary-container">{suggestion.icon}</span>
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-outline-variant/20 p-4">
            <div className="mx-auto flex max-w-3xl items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your studies..."
                className="flex-1 rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-all duration-200 focus:border-primary-container focus:ring-2 focus:ring-primary-container/30"
                onKeyDown={(e) => e.key === 'Enter' && setInput('')}
              />
              <Button variant="primary" size="md" icon={<Send className="h-4 w-4" />}>
                Send
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}