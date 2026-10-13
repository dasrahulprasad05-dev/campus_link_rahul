'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { 
  HelpCircle, 
  Send, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Bot, 
  User,
  ArrowRight
} from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export default function StudentPolicyQAPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: 'Hello! I am your 24/7 Campus Placement Policy Assistant. You can ask me about offer acceptance rules, Dream vs Super Dream tiers, backlog criteria, or drive attendance policies.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    'Can I apply for a Super Dream company if I already hold an offer?',
    'What is the minimum CGPA and backlog cutoff for Tier-1 companies?',
    'What happens if I miss a scheduled technical interview round?',
    'How does the university one-student one-offer policy work?',
  ];

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: q }]);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/policy-qa', { query: q });
      if (res && res.data && res.data.answer) {
        setMessages(prev => [...prev, { sender: 'bot', text: res.data.answer }]);
      } else {
        generateLocalResponse(q);
      }
    } catch {
      generateLocalResponse(q);
    } finally {
      setLoading(false);
    }
  };

  const generateLocalResponse = (q: string) => {
    const lower = q.toLowerCase();
    let reply = 'According to university placement cell regulations, students are required to maintain active registration and attend all scheduled rounds for drives they apply to.';

    if (lower.includes('dream') || lower.includes('another offer') || lower.includes('already hold')) {
      reply = 'Under the University Placement Policy:\n1. Students holding a Regular offer (< ₹5.0 LPA) may upgrade once to a Dream company (₹5.0 - ₹9.0 LPA) or Super Dream company (> ₹9.0 LPA).\n2. Once an offer from a Super Dream company is secured, the candidate becomes ineligible for further drives to ensure equal opportunity for peers.';
    } else if (lower.includes('backlog') || lower.includes('cgpa')) {
      reply = 'Most Tier-1 software and product companies require 0 active backlogs at the time of drive registration and an aggregate CGPA of 7.0 or above. Students with 1 cleared backlog may still apply for IT Services firms with a 6.0 cutoff.';
    } else if (lower.includes('miss') || lower.includes('absent')) {
      reply = 'Unexcused absence from an interview or aptitude test after registering for a company drive results in automatic de-registration from the subsequent 2 placement drives unless medical certificate is submitted to TPO within 24 hours.';
    }

    setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
          <Sparkles className="h-3.5 w-3.5" />
          <span>University Placement Regulations Assistant</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Placement Policy Q&A</h1>
        <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-1 max-w-2xl">
          Ask questions about eligibility thresholds, multiple offers, drive attendance rules, and TPO guidelines.
        </p>
      </div>

      {/* Suggested Questions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {sampleQuestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            className="px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)] text-xs whitespace-nowrap transition-colors cursor-pointer"
          >
            💬 {sq}
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="glass-card rounded-3xl flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, i) => {
            const isBot = msg.sender === 'bot';
            return (
              <div
                key={i}
                className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
              >
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isBot
                    ? 'bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 border border-indigo-500/25'
                    : 'bg-violet-600 text-white shadow-md'
                }`}>
                  {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                <div className={`p-4 rounded-2xl max-w-lg text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                  isBot
                    ? 'bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)]'
                    : 'bg-indigo-600 text-white font-medium shadow-md'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs text-[var(--text-tertiary)] flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                <span>Checking campus placement guidelines...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-[var(--border)] bg-[var(--surface-elevated)]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask any question about university placement policy..."
              className="flex-1 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-indigo-500/50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
