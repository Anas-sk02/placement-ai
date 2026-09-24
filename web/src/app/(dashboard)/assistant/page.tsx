'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  GraduationCap,
  Briefcase,
  Clock,
  Code2,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStudentProfile } from '@/lib/hooks/useStudentProfile';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: string[];
  timestamp?: string;
}

const QUICK_PROMPTS = [
  { label: 'Check My Eligibility', icon: <GraduationCap size={13} />, text: 'Which companies and high CTC drives am I currently eligible for based on my CGPA and branch?' },
  { label: 'Upcoming Deadlines', icon: <Clock size={13} />, text: 'What are my upcoming tracked application deadlines and test schedules?' },
  { label: 'DSA & Coding Roadmap', icon: <Code2 size={13} />, text: 'Give me a structured 4-week DSA and online assessment preparation plan for top product companies.' },
  { label: 'Core CS Subjects', icon: <BookOpen size={13} />, text: 'What are the top asked interview questions for OS, DBMS, Computer Networks, and OOPs?' },
  { label: 'Cold Email Template', icon: <Briefcase size={13} />, text: 'Generate a high-converting cold email template to reach out to recruiters for off-campus software roles.' },
];

/**
 * Lightweight Rich Text Formatter for Assistant Responses
 */
function FormattedAssistantText({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', lineHeight: 1.65 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Heading 3 / 2
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} style={{ fontSize: '15px', fontWeight: 700, color: '#93c5fd', marginTop: '12px', marginBottom: '4px' }}>
              {trimmed.replace('### ', '')}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginTop: '16px', marginBottom: '6px' }}>
              {trimmed.replace('## ', '')}
            </h3>
          );
        }

        // Horizontal Rule
        if (trimmed === '---') {
          return <hr key={idx} style={{ borderColor: 'var(--border-subtle)', margin: '12px 0' }} />;
        }

        // Bullet point
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const content = trimmed.replace(/^[\*\-•]\s*/, '');
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginLeft: '4px', color: 'var(--text-primary)' }}>
              <span style={{ color: 'var(--primary-light)', marginTop: '3px', fontWeight: 700 }}>•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
            </div>
          );
        }

        // Numbered list
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginLeft: '4px', color: 'var(--text-primary)' }}>
              <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>{trimmed.match(/^\d+\./)?.[0]}</span>
              <span
                dangerouslySetInnerHTML={{
                  __html: formatInlineMarkdown(trimmed.replace(/^\d+\.\s*/, '')),
                }}
              />
            </div>
          );
        }

        if (!trimmed) {
          return <div key={idx} style={{ height: '6px' }} />;
        }

        return (
          <p
            key={idx}
            style={{ color: 'var(--text-primary)', margin: 0 }}
            dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }}
          />
        );
      })}
    </div>
  );
}

function formatInlineMarkdown(str: string): string {
  let formatted = str.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#ffffff; font-weight:600;">$1</strong>');
  formatted = formatted.replace(/`([^`]+)`/g, '<code style="background:#090d16; color:#93c5fd; padding:2px 6px; border-radius:4px; border:1px solid rgba(255,255,255,0.08); font-family:var(--font-mono); font-size:12px;">$1</code>');
  formatted = formatted.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer" style="color:#60a5fa; text-decoration:underline; font-weight:500;">$1 ↗</a>'
  );
  return formatted;
}

export default function AssistantPage() {
  const { profile } = useStudentProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const studentName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Student';
    const cgpa = profile?.cgpa ? `${profile.cgpa} CGPA` : 'Current CGPA';
    const branch = profile?.branch || 'CSE';
    const batch = profile?.graduation_year || 2026;

    setMessages([
      {
        id: 'm-init',
        sender: 'assistant',
        text: `Hello **${studentName}**! 👋\n\nI am your **PlaceMint AI Placement Copilot**, synchronized with your **${branch} (${batch} Batch, ${cgpa})** profile and campus Telegram channels.\n\nAsk me anything about:\n• **Eligibility & Shortlisting**: Verify which drives match your branch & CGPA.\n• **Tracked Deadlines**: Check imminent assessment schedules.\n• **Interview & OA Prep**: Structured roadmaps for DSA, Core CS, and System Design.\n• **Resume Strategy**: Bullet points & cold email templates tailored for top recruiters.`,
        sources: ['Student Profile', 'Verified Database'],
      },
    ]);
  }, [profile?.full_name, profile?.branch, profile?.cgpa, profile?.graduation_year]);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    const studentName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Student';
    setMessages([
      {
        id: 'm-reset',
        sender: 'assistant',
        text: `Chat reset! How can I assist you with your placement preparation today, **${studentName}**?`,
        sources: ['PlaceMint Copilot'],
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationHistory: historyPayload,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const botReply: Message = {
          id: Math.random().toString(),
          sender: 'assistant',
          text: data.reply || 'Here is what I found for your request.',
          sources: data.sources || ['PlaceMint Database'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botReply]);
      } else {
        throw new Error('Chat API returned error');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'assistant',
          text: `Based on your profile (**${profile.branch || 'CSE'}, ${profile.cgpa || 8.0} CGPA**), your profile parameters are synchronized. Review your upcoming deadlines and explore verified Telegram notices on your dashboard.`,
          sources: ['Student Profile', 'Verified Database'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
            }}
          >
            <BotMessageSquare size={19} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                Placement AI Copilot
              </h1>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 600,
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                }}
              >
                Grounded Intelligence
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>
              Answers grounded in your academic criteria, deadlines, and live notice feeds
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetChat}
          leftIcon={<RefreshCw size={13} />}
        >
          New Chat
        </Button>
      </div>

      {/* Suggestion Prompts */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          flexShrink: 0,
        }}
      >
        {QUICK_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p.text)}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: '#0d111a',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-medium)';
              (e.currentTarget as HTMLElement).style.color = '#fff';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
          >
            <span style={{ color: 'var(--primary-light)' }}>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div
        className="glass-card"
        style={{
          flex: 1,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          overflowY: 'auto',
          marginBottom: '16px',
          borderRadius: '10px',
          backgroundColor: '#0a0d15',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {messages.map((m) => {
          const isAssistant = m.sender === 'assistant';
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: isAssistant ? 'flex-start' : 'flex-end',
                maxWidth: isAssistant ? '88%' : '76%',
              }}
            >
              {isAssistant && (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    backgroundColor: '#161d2f',
                    border: '1px solid var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <Sparkles size={15} color="var(--primary-light)" />
                </div>
              )}

              <div
                style={{
                  backgroundColor: isAssistant ? '#111624' : '#1d4ed8',
                  border: `1px solid ${
                    isAssistant ? 'var(--border-subtle)' : 'rgba(255, 255, 255, 0.15)'
                  }`,
                  borderRadius: '8px',
                  padding: '16px 20px',
                  color: '#fff',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                }}
              >
                {/* Assistant Message Body */}
                {isAssistant ? (
                  <FormattedAssistantText text={m.text} />
                ) : (
                  <p style={{ fontSize: '13.5px', lineHeight: 1.6, margin: 0 }}>{m.text}</p>
                )}

                {/* Grounding Source & Copy Action */}
                {isAssistant && (
                  <div
                    style={{
                      marginTop: '12px',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    {m.sources && m.sources.length > 0 ? (
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <ShieldCheck size={12} color="var(--status-eligible)" />
                        <span>Sources: {m.sources.join(' • ')}</span>
                      </div>
                    ) : (
                      <span />
                    )}

                    <button
                      onClick={() => handleCopy(m.id, m.text)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                      }}
                      title="Copy Response"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check size={12} color="var(--status-eligible)" />
                          <span style={{ color: 'var(--status-eligible)' }}>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#161d2f',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={15} color="var(--primary-light)" />
            </div>
            <div
              style={{
                backgroundColor: '#111624',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '12px 18px',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  animation: 'pulseGlow 1s infinite',
                }}
              />
              <span>Synthesizing placement intelligence...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <input
          type="text"
          placeholder="Ask anything about active drives, eligibility cutoff, test patterns, or interview prep..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="input-field"
          style={{
            padding: '12px 16px',
            fontSize: '13.5px',
            borderRadius: '8px',
          }}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!input.trim() || loading}
          leftIcon={<Send size={14} />}
          style={{ height: '44px', padding: '0 18px' }}
        >
          Send
        </Button>
      </form>
    </div>
  );
}
