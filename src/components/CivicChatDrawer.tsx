'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, Sparkles, User, Bot, HelpCircle } from 'lucide-react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface CivicChatDrawerProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  category: string;
}

export function CivicChatDrawer({
  messages,
  onSendMessage,
  isLoading,
  category,
}: CivicChatDrawerProps) {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const getQuickPrompts = () => {
    if (category === 'eviction') {
      return [
        'Can my landlord lock me out today?',
        'What happens if I can only pay part of the rent?',
        'How do I request an extension in writing?',
      ];
    }
    if (category === 'utility-shutoff') {
      return [
        'Can they shut off power in extreme heat or cold?',
        'How do I apply for the Austin Energy Plus-1 fund?',
        'What is a deferred payment agreement?',
      ];
    }
    if (category === 'medical-bill') {
      return [
        'How do I request an itemized billing code list?',
        'Does the No Surprises Act apply to my visit?',
        'What is hospital charity care in Texas?',
      ];
    }
    return [
      'What should I say when I call the office?',
      'What is the penalty if I miss the deadline?',
      'Can someone help me fill out this form?',
    ];
  };

  return (
    <div className="bg-surface border border-line rounded-2xl p-5 sm:p-7 space-y-4 shadow-sm flex flex-col h-[520px]">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-accent" />
          <h3 className="font-heading font-bold text-base text-ink">
            Civic AI Question Assistant
          </h3>
        </div>
        <span className="text-[10px] font-bold text-accent bg-accent-soft px-2 py-0.5 rounded">
          Powered by Gemini 2.5 Flash
        </span>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-1.5 pb-1">
        {getQuickPrompts().map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSendMessage(prompt)}
            className="text-[11px] font-semibold bg-paper-elevated hover:bg-accent-soft hover:text-accent border border-line rounded-lg px-2.5 py-1 text-ink-muted transition-colors flex items-center gap-1"
          >
            <HelpCircle className="w-3 h-3 text-accent" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-paper-elevated rounded-xl border border-line text-xs">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-ink-muted space-y-2 p-4">
            <Sparkles className="w-6 h-6 text-accent/60" />
            <p className="font-semibold text-ink">Have a question about this letter?</p>
            <p className="text-[11px] max-w-xs">
              Ask anything in plain English, Spanish, or your chosen language. We’ll explain terms, rights, and next steps.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-xl p-3 leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-accent text-white rounded-tr-xs'
                    : 'bg-surface text-ink border border-line rounded-tl-xs shadow-2xs'
                }`}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-ink text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-surface text-ink border border-line rounded-xl p-3 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
              <span className="text-ink-muted">Checking Texas statutes &amp; decoding...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this notice (e.g., 'What happens if I can't pay?')..."
          className="flex-1 bg-surface border border-line rounded-xl px-3.5 py-2 text-xs text-ink focus:ring-2 focus:ring-accent/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="btn-primary px-4 py-2 text-xs font-bold disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
