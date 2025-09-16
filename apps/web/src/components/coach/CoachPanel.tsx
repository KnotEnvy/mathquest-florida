'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CoachMode = 'hint' | 'explain' | 'comfort' | 'challenge';

type CoachMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const MODE_OPTIONS: Array<{ id: CoachMode; label: string; tagline: string }> = [
  { id: 'hint', label: 'Hint', tagline: 'Nudge me forward' },
  { id: 'explain', label: 'Explain', tagline: 'Show every step' },
  { id: 'comfort', label: 'Boost', tagline: 'Keep me calm' },
  { id: 'challenge', label: 'Challenge', tagline: 'Push my limits' },
];

export interface CoachPanelProps {
  question: {
    id?: string;
    prompt: string;
    choices?: string[];
    domain?: string;
    difficulty?: number;
  };
  attemptSummary?: {
    attempts?: number;
    lastAnswer?: string;
    correct?: boolean;
    streak?: number;
  };
  disabled?: boolean;
}

export function CoachPanel({ question, attemptSummary, disabled }: CoachPanelProps) {
  const [mode, setMode] = useState<CoachMode>('hint');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setInput('');
    setError(null);
    setMode('hint');
  }, [question.id, question.prompt]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const isSendDisabled = useMemo(() => {
    return disabled || isLoading || input.trim().length === 0;
  }, [disabled, isLoading, input]);

  const handleSend = async () => {
    if (isSendDisabled) return;

    const trimmed = input.trim();
    const userMessage: CoachMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
          question,
          attemptSummary,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? 'Coach is taking a quick break. Try again.');
      }

      const data = await response.json();
      const coachMessage: CoachMessage = {
        id: `coach-${Date.now()}`,
        role: 'assistant',
        content: data.message,
      };

      setMessages((prev) => [...prev, coachMessage]);
    } catch (err) {
      console.error('Coach request failed', err);
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      // Revert last user message on failure so they can resend
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="flex h-full flex-col rounded-2xl border border-magenta-primary/20 bg-white/80 p-6 shadow-lg backdrop-blur">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-magenta-primary">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          <h3 className="text-lg font-semibold">AI Coach</h3>
        </div>
        <span className="text-xs uppercase tracking-wide text-gray-400">Beta</span>
      </header>

      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        {MODE_OPTIONS.map((option) => (
          <Button
            key={option.id}
            type="button"
            size="sm"
            variant={mode === option.id ? 'default' : 'outline'}
            aria-pressed={mode === option.id}
            onClick={() => setMode(option.id)}
            disabled={isLoading}
            className={cn('justify-start', mode === option.id && 'shadow-sm')}
          >
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold">{option.label}</span>
              <span className="text-xs text-gray-500">{option.tagline}</span>
            </div>
          </Button>
        ))}
      </div>

      <div
        ref={listRef}
        className="mb-4 min-h-[180px] flex-1 space-y-3 overflow-y-auto rounded-xl bg-gray-50/70 p-4"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <p className="text-sm text-gray-500">
            Ask for a hint, explanation, pep talk, or an extra challenge about this question.
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'w-fit max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm',
              message.role === 'assistant'
                ? 'ml-auto bg-magenta-primary text-white'
                : 'bg-white text-gray-700',
            )}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Thinking...
          </div>
        )}
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      <div className="mt-auto flex items-end gap-2">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Coach, how do I get started?"
          disabled={disabled}
          rows={2}
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-magenta-primary focus:outline-none focus:ring-2 focus:ring-magenta-primary/40 disabled:opacity-60"
        />
        <Button onClick={handleSend} disabled={isSendDisabled} className="shrink-0">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </aside>
  );
}
