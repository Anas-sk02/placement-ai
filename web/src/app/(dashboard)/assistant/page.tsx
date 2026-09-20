'use client';

import React, { useState } from 'react';
import { BotMessageSquare, Send, Sparkles, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: string[];
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm-1',
    sender: 'assistant',
    text: "Hello Anas! I'm your PlaceMint AI Assistant. I have analyzed all recent placement notices from your 4 monitored Telegram groups. Ask me anything about upcoming deadlines, required CGPA cutoffs, company eligibility, or preparation topics!",
  },
  {
    id: 'm-2',
    sender: 'user',
    text: 'What is the cutoff and deadline for Goldman Sachs?',
  },
  {
    id: 'm-3',
    sender: 'assistant',
    text: "Based on the notice posted in **TPO Official Placements 2026** today:\n\n• **Company**: Goldman Sachs\n• **Role**: Summer Analyst & Engineering Associate\n• **Min CGPA**: 7.5 (No active backlogs)\n• **Package**: ₹24 - 30 LPA (Stipend: ₹1.5L/mo)\n• **Registration Deadline**: Today, 6:00 PM Sharp\n• **Application URL**: https://forms.gle/gsachs2026campusdrive\n\nWith your current 8.42 CGPA, you are **100% Eligible** to apply.",
    sources: ['TPO Official Placements 2026 (Message #1842)'],
  },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const reply: Message = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: `Regarding your query about "${userMsg.text}": Amazon SDE-1 registration is open until tomorrow 11:59 PM (Min CGPA: 7.0), and Uber internship OA is scheduled for Sunday (Min CGPA: 8.0). Both are actively monitored in your feed!`,
        sources: ['CSE & IT Placement Cell', 'Off-Campus Tech Internships'],
      };
      setMessages((prev) => [...prev, reply]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BotMessageSquare size={24} color="var(--primary-light)" />
          <h1 style={{ fontSize: '22px', fontWeight: 800 }}>Grounded AI Placement Assistant</h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
          Answers strictly grounded in your college Telegram notices with zero hallucinations
        </p>
      </div>

      {/* Chat Messages Box */}
      <div
        className="glass-card"
        style={{
          flex: 1,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto',
          marginBottom: '16px',
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              gap: '12px',
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
            }}
          >
            {m.sender === 'assistant' && (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--brand-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={16} color="#fff" />
              </div>
            )}

            <div
              style={{
                backgroundColor:
                  m.sender === 'user' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(17, 24, 39, 0.8)',
                border: `1px solid ${
                  m.sender === 'user' ? 'rgba(99, 102, 241, 0.4)' : 'var(--border-subtle)'
                }`,
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '13.5px',
                lineHeight: 1.6,
                color: '#fff',
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.text}

              {m.sources && (
                <div
                  style={{
                    marginTop: '8px',
                    paddingTop: '6px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ShieldCheck size={12} color="var(--status-eligible)" />
                  <span>Sources: {m.sources.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Ask a question about placement drives, eligibility, or deadlines..."
          className="input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1 }}
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={loading}
          rightIcon={<Send size={16} />}
        >
          Send
        </Button>
      </form>
    </div>
  );
}
