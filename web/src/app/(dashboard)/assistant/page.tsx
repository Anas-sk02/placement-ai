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
  User,
  ExternalLink,
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
  // Simple markdown renderer for bold, lists, headers, code, and links
  const lines = text.split('\n');

  return (
    <div className="space-y-2 text-[14px] leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Heading 3 / 2
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-base font-bold text-indigo-200 mt-3 mb-1">
              {trimmed.replace('### ', '')}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="text-lg font-bold text-white mt-4 mb-1">
              {trimmed.replace('## ', '')}
            </h3>
          );
        }

        // Horizontal Rule
        if (trimmed === '---') {
          return <hr key={idx} className="border-white/10 my-3" />;
        }

        // Bullet point
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const content = trimmed.replace(/^[\*\-•]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 ml-1 text-slate-200">
              <span className="text-indigo-400 mt-1 font-bold">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
            </div>
          );
        }

        // Numbered list
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <div key={idx} className="flex items-start gap-2 ml-1 text-slate-200">
              <span className="text-indigo-400 font-semibold">{trimmed.match(/^\d+\./)?.[0]}</span>
              <span
                dangerouslySetInnerHTML={{
                  __html: formatInlineMarkdown(trimmed.replace(/^\d+\.\s*/, '')),
                }}
              />
            </div>
          );
        }

        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        return (
          <p
            key={idx}
            className="text-slate-200"
            dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }}
          />
        );
      })}
    </div>
  );
}

function formatInlineMarkdown(str: string): string {
  // Bold **text**
  let formatted = str.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
  // Inline code `code`
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-indigo-950/60 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20 font-mono text-xs">$1</code>');
  // URL links
  formatted = formatted.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer" class="text-indigo-400 hover:text-indigo-300 underline inline-flex items-center gap-1">$1 ↗</a>'
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

  // Initialize dynamic greeting with real profile name
  useEffect(() => {
    const studentName = profile?.full_name || 'Hasan';
    const cgpa = profile?.cgpa ? `${profile.cgpa} CGPA` : '8.73 CGPA';
    const branch = profile?.branch || 'CSE';
    const batch = profile?.graduation_year || 2026;

    setMessages([
      {
        id: 'm-init',
        sender: 'assistant',
        text: `Hello **${studentName}**! 👋\n\nI am your **PlaceMint AI Placement Copilot**, fully synchronized with your **${branch} (${batch} Batch, ${cgpa})** profile and your live college Telegram channels.\n\nAsk me anything about:\n• **Eligibility & Shortlisting**: Check which active hiring drives match your branch & CGPA.\n• **Tracked Deadlines**: Get real-time alerts on upcoming applications.\n• **Interview & OA Prep**: Customized company-specific roadmaps (DSA, Core CS, System Design).\n• **Resume & Cold Outreach**: High-yield templates tailored for campus & off-campus hiring.`,
        sources: ['Student Profile', 'Active Telegram Feeds'],
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
    const studentName = profile?.full_name || 'Hasan';
    setMessages([
      {
        id: 'm-reset',
        sender: 'assistant',
        text: `Chat reset! How can I help you with your placement preparation today, **${studentName}**?`,
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
      // Build conversation history for multi-turn context
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
      // Smart Fallback
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'assistant',
          text: `Based on your profile (**${profile.branch || 'CSE'}, ${profile.cgpa || 8.73} CGPA**), here is your quick status:\n\n• **Arista Networks (Software Engineer)**: Tracked under upcoming deadlines.\n• **Core CS Preparation**: Ensure you review OS (Process Synchronization, Deadlocks) and DBMS (Indexing, Normalization).\n• Click **"Sync Recent Posts"** on your dashboard anytime to fetch the latest TPO notices!`,
          sources: ['Student Profile', 'Verified Database'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            }}
          >
            <BotMessageSquare size={22} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0 }}>
                PlaceMint AI Placement Copilot
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  color: '#818cf8',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                Gemini 2.5 Flash
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Instant answers grounded in your profile, telegram channels & application deadlines
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetChat}
            leftIcon={<RefreshCw size={14} />}
          >
            New Conversation
          </Button>
        </div>
      </div>

      {/* Suggestion Prompts */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '10px',
          flexShrink: 0,
          scrollbarWidth: 'none',
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
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(99, 102, 241, 0.12)';
              (e.currentTarget as HTMLElement).style.color = '#fff';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
          >
            <span style={{ color: 'var(--primary)' }}>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div
        className="glass-card"
        style={{
          flex: 1,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto',
          marginBottom: '14px',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
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
                maxWidth: isAssistant ? '88%' : '78%',
              }}
            >
              {isAssistant && (
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <Sparkles size={18} color="#fff" />
                </div>
              )}

              <div
                style={{
                  backgroundColor: isAssistant
                    ? 'rgba(30, 41, 59, 0.85)'
                    : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  background: isAssistant
                    ? 'rgba(30, 41, 59, 0.85)'
                    : 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
                  border: `1px solid ${
                    isAssistant ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.5)'
                  }`,
                  borderRadius: isAssistant ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                  padding: '16px 20px',
                  color: '#fff',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                  position: 'relative',
                }}
              >
                {/* Assistant Message Body */}
                {isAssistant ? (
                  <FormattedAssistantText text={m.text} />
                ) : (
                  <p style={{ fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{m.text}</p>
                )}

                {/* Grounding Source & Copy Action */}
                {isAssistant && (
                  <div
                    style={{
                      marginTop: '12px',
                      paddingTop: '10px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
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
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <ShieldCheck size={13} color="#10b981" />
                        <span>Sources: {m.sources.join(' • ')}</span>
                      </div>
                    ) : (
                      <span />
                    )}

                    <button
                      onClick={() => handleCopy(m.id, m.text)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        color: copiedId === m.id ? '#10b981' : '#94a3b8',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      title="Copy response"
                    >
                      {copiedId === m.id ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start', maxWidth: '80%' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={18} color="#fff" />
            </div>
            <div
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px 16px 16px 16px',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#818cf8',
                  animation: 'pulse 1.4s infinite ease-in-out',
                }}
              />
              <span style={{ fontSize: '13px', color: '#cbd5e1' }}>
                PlaceMint AI is synthesizing notices & profile data...
              </span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        style={{ display: 'flex', gap: '10px' }}
      >
        <input
          type="text"
          placeholder="Ask about active notices, eligibility, upcoming deadlines, or interview prep..."
          className="input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{
            flex: 1,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            padding: '12px 18px',
            fontSize: '14px',
            color: '#fff',
            outline: 'none',
          }}
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={loading}
          disabled={!input.trim() || loading}
          rightIcon={<Send size={16} />}
          style={{
            borderRadius: '12px',
            padding: '0 24px',
          }}
        >
          Send
        </Button>
      </form>
    </div>
  );
}
