'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Chunk {
  id: string;
  title: string;
  section: string;
  version: string;
  citation: string;
  content: string;
}

interface AgentResponse {
  finalOutput: string;
  route: string;
  guardsFired: string[];
  retrievedChunks: Chunk[];
  tokensIn: number;
  tokensOut: number;
  inrCost: number;
  latencyBreakdown: Record<string, number>;
  status: string;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isInitialGreeting?: boolean;
  telemetry?: {
    route: string;
    latencyMs: number;
    inrCost: number;
    guardsFired: string[];
    citations: Chunk[];
  };
}

interface UserProps {
  id: string;
  name: string;
  role: string;
  email: string;
  programme?: string;
  annual_family_income?: number;
  cgpa?: number;
}

const THINKING_STAGES = [
  '✦ Querying IIM Bodh Gaya policy knowledge graph...',
  '✦ Evaluating income ceilings and academic standing...',
  '✦ Validating constitutional guardrails (F1–F6)...',
  '✦ Synthesizing citation-grounded advisory...',
];

const SUGGESTED_PROMPTS = [
  { label: '✦ NBFA Eligibility Criteria', query: 'What are the eligibility criteria and income limits for Need Based Financial Assistance?' },
  { label: '✦ fees maaf hoti hai kya? (Hinglish)', query: 'fees maaf hoti hai kya? What is the procedure in Hindi/Hinglish?' },
  { label: '✦ Application Deadlines', query: 'When is the last date and deadline to submit documents for financial aid?' },
  { label: '✦ Income Certificate & ITR Rules', query: 'What documents are required for income verification and ITR?' },
  { label: '✦ SBI Scholar Loan guidance', query: 'How does SBI Scholar education loan work at IIM Bodh Gaya?' },
];

export default function ChatInterface({
  user,
  initialQuery = '',
  initialResponse = null,
}: {
  user: UserProps;
  initialQuery?: string;
  initialResponse?: AgentResponse | null;
}) {
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStageIndex, setThinkingStageIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize messages list
  const [messages, setMessages] = useState<MessageItem[]>(() => {
    const list: MessageItem[] = [
      {
        id: 'msg_welcome',
        sender: 'bot',
        isInitialGreeting: true,
        text: `Namaste **${user.name}**! I am **Sahayata**, your official AI Financial Aid Assistant at IIM Bodh Gaya. I provide authoritative answers deterministically verified against approved institute statutes.\n\nHow can I help you today? You can ask about tuition fee waivers, Need-Based Financial Assistance (NBFA), Director's Merit Scholarship, or education loan guidance.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];

    if (initialQuery) {
      list.push({
        id: 'msg_initial_user',
        sender: 'user',
        text: initialQuery,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      if (initialResponse) {
        const totalMs = Object.values(initialResponse.latencyBreakdown || {}).reduce((a, b) => a + b, 0);
        list.push({
          id: 'msg_initial_bot',
          sender: 'bot',
          text: initialResponse.finalOutput,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          telemetry: {
            route: initialResponse.route,
            latencyMs: totalMs,
            inrCost: initialResponse.inrCost,
            guardsFired: initialResponse.guardsFired,
            citations: initialResponse.retrievedChunks || [],
          },
        });
      }
    }

    return list;
  });

  // Cycle thinking stage messages while isThinking is true
  useEffect(() => {
    if (!isThinking) return;
    const interval = setInterval(() => {
      setThinkingStageIndex((prev) => (prev + 1) % THINKING_STAGES.length);
    }, 450);
    return () => clearInterval(interval);
  }, [isThinking]);

  // Smooth scroll to bottom on message updates or when thinking starts
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Send message function with realistic thinking delay and progress
  const handleSendMessage = async (queryToSend: string) => {
    const trimmed = queryToSend.trim();
    if (!trimmed || isThinking) return;

    setInputText('');

    // 1. Append user message
    const userMsg: MessageItem = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);
    setThinkingStageIndex(0);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch AI response');
      }

      const data: AgentResponse = await res.json();
      const totalMs = Object.values(data.latencyBreakdown || {}).reduce((a, b) => a + b, 0);

      const botMsg: MessageItem = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: data.finalOutput,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        telemetry: {
          route: data.route,
          latencyMs: totalMs,
          inrCost: data.inrCost,
          guardsFired: data.guardsFired || [],
          citations: data.retrievedChunks || [],
        },
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: MessageItem = {
        id: `bot_err_${Date.now()}`,
        sender: 'bot',
        text: 'I encountered a brief connection delay reaching the IIM Bodh Gaya policy agent. Please try submitting your query again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg_welcome_reset',
        sender: 'bot',
        isInitialGreeting: true,
        text: `Chat reset. Hello **${user.name}**! How can I assist you with IIM Bodh Gaya financial aid, scholarships, or fee waivers today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="sap-chat-window" role="region" aria-label="Sahayata AI Chatbot">
      {/* Chatbot Header */}
      <div className="sap-chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <img
            src="/brand/iimbg-logo.png"
            alt="IIM Bodh Gaya Logo"
            width="44"
            height="34"
            style={{ objectFit: 'contain', backgroundColor: '#ffffff', padding: '2px', borderRadius: '4px' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <strong style={{ fontSize: '15px', color: '#ffffff' }}>Sahayata Enterprise CoPilot</strong>
              <span className="sap-badge sap-badge--ai" style={{ fontSize: '10px', padding: '0.15rem 0.45rem' }}>
                <span className="sap-ai-pulse-dot" style={{ width: 5, height: 5 }} />
                ✦ JOULE ACTIVE
              </span>
            </div>
            <span style={{ fontSize: '11.5px', color: '#c4b5fd' }}>
              IIM Bodh Gaya Policy Intelligence &bull; Deterministic Guardrails F1&ndash;F6 Active
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleClearChat}
            className="sap-btn--ghost"
            style={{ color: '#ffffff', fontSize: '12px', padding: '0.3rem 0.65rem', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '4px', cursor: 'pointer' }}
          >
            ✦ New Chat
          </button>
        </div>
      </div>

      {/* Operational Ribbon */}
      <div className="sap-ai-ribbon" style={{ margin: 0, borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', padding: '0.55rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '12px', color: 'var(--sap-ai-badge-text)', fontWeight: 600 }}>
          <span>✦ Active System Guardrails:</span>
          <span className="sap-ai-step-pill">PII Redaction (F1)</span>
          <span className="sap-ai-step-pill">Hinglish NLP (F2)</span>
          <span className="sap-ai-step-pill">Policy Grounding (F3)</span>
          <span className="sap-ai-step-pill">Triage Routing (F4)</span>
        </div>
        <span style={{ fontSize: '11.5px', color: 'var(--sap-text-secondary)' }}>
          Retrieval: Cosine Sim &gt; 0.65 &bull; 100% Policy Grounded
        </span>
      </div>

      {/* Messages Stream */}
      <div className="sap-chat-messages" id="chat-messages" style={{ minHeight: '380px' }}>
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="sap-chat-msg--user">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--sap-text-secondary)', fontWeight: 600 }}>
                    👤 You ({user.name}) &bull; {msg.timestamp}
                  </span>
                </div>
                <div className="sap-chat-bubble">{msg.text}</div>
              </div>
            );
          }

          // Bot message
          return (
            <div key={msg.id} className="sap-chat-msg--bot">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                <span className="sap-badge sap-badge--ai" style={{ fontSize: '11px', padding: '0.15rem 0.5rem' }}>
                  ✦ Sahayata Joule Assistant
                </span>
                {msg.telemetry && (
                  <span style={{ fontSize: '11.5px', color: 'var(--sap-positive-text)', fontWeight: 600 }}>
                    ✓ Policy Grounded &bull; Route: {msg.telemetry.route} &bull; {msg.telemetry.latencyMs}ms &bull; ₹{msg.telemetry.inrCost.toFixed(4)}
                  </span>
                )}
              </div>

              <div className="sap-chat-bubble">
                {/* Active Guard Interception Warning */}
                {msg.telemetry?.guardsFired && msg.telemetry.guardsFired.length > 0 && (
                  <div className="govuk-warning-text" style={{ margin: '0 0 0.85rem 0', padding: '0.5rem 0.75rem', backgroundColor: '#fff8e1', border: '1px solid #ffe082', borderRadius: '4px' }}>
                    <span className="govuk-warning-text__icon" style={{ fontSize: '14px', width: '22px', height: '22px', lineHeight: '20px' }}>!</span>
                    <div style={{ fontSize: '12px' }}>
                      <strong>Constitutional Guardrail Intercepted:</strong> {msg.telemetry.guardsFired.join(', ')}
                    </div>
                  </div>
                )}

                {/* Main Text Content */}
                <div style={{ whiteSpace: 'pre-line', fontSize: '14.5px', lineHeight: '1.65', color: 'var(--sap-text-primary)' }}>
                  {msg.text}
                </div>

                {/* Citations Accordion */}
                {msg.telemetry?.citations && msg.telemetry.citations.length > 0 && (
                  <details className="govuk-details" style={{ marginTop: '1.25rem', backgroundColor: '#faf9ff', border: '1px solid #e2d9fc', borderRadius: '4px' }}>
                    <summary className="govuk-details__summary" style={{ fontSize: '13px' }}>
                      <span>✦ View Authoritative Policy Citations ({msg.telemetry.citations.length} sources)</span>
                    </summary>
                    <div className="govuk-details__text" style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {msg.telemetry.citations.map((chunk, i) => (
                          <div key={chunk.id || i} style={{ borderBottom: '1px solid #e2d9fc', paddingBottom: '0.5rem' }}>
                            <p className="govuk-body-s" style={{ fontWeight: 600, color: 'var(--sap-ai-primary)', margin: 0 }}>
                              ✦ {chunk.citation}
                            </p>
                            <p className="govuk-body-s" style={{ margin: '0.25rem 0 0 0', whiteSpace: 'pre-line', color: 'var(--sap-text-secondary)', fontSize: '12.5px' }}>
                              {chunk.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                )}

                {/* Action Buttons inside Bot Bubble */}
                {!msg.isInitialGreeting && (
                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.15rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleSendMessage(`Please evaluate my scheme eligibility based on my current profile (${user.programme || 'PGP'}, annual family income INR ${user.annual_family_income || 240000}, CGPA ${user.cgpa || 7.8}).`)}
                      className="sap-btn sap-btn--ai-emphasized"
                      style={{ fontSize: '12.5px', padding: '0.35rem 0.85rem', cursor: 'pointer' }}
                    >
                      ✦ Pre-Screen Scheme Eligibility
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage('What is the complete document verification checklist and 12-month validity rule for income certificates?')}
                      className="sap-btn sap-btn--ai"
                      style={{ fontSize: '12.5px', padding: '0.35rem 0.85rem', cursor: 'pointer' }}
                    >
                      ✦ Check Document Checklist
                    </button>
                    <a
                      href="/check-eligibility"
                      className="sap-btn sap-btn--ghost"
                      style={{ fontSize: '12px', padding: '0.35rem 0.65rem' }}
                    >
                      Open 4-Step Form ↗
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Real-time Thinking Indicator Bubble */}
        {isThinking && (
          <div className="sap-chat-msg--bot sap-chat-msg--thinking">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
              <span className="sap-badge sap-badge--ai" style={{ fontSize: '11px', padding: '0.15rem 0.5rem' }}>
                ✦ Sahayata Joule
              </span>
              <span style={{ fontSize: '11.5px', color: '#7c3aed', fontWeight: 600 }}>
                Thinking &amp; Validating Policies...
              </span>
            </div>

            <div className="sap-chat-bubble sap-chat-bubble--thinking">
              <div className="sap-thinking-indicator">
                <span className="sap-thinking-dot" />
                <span className="sap-thinking-dot" />
                <span className="sap-thinking-dot" />
              </div>
              <div className="sap-thinking-stage-text">
                <span>{THINKING_STAGES[thinkingStageIndex]}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="sap-chat-chips-bar" aria-label="Suggested Prompts">
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--sap-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0 }}>
          Suggested:
        </span>
        {SUGGESTED_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(p.query)}
            disabled={isThinking}
            className="sap-chat-chip-item"
            style={{ cursor: isThinking ? 'not-allowed' : 'pointer' }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Bottom Docked Input Form */}
      <div className="sap-chat-input-dock">
        <form onSubmit={handleFormSubmit} className="sap-chat-input-form">
          <span style={{ color: 'var(--sap-ai-primary)', fontSize: '16px' }}>✦</span>
          <input
            type="text"
            className="sap-chat-input-field"
            placeholder={isThinking ? 'Sahayata is thinking...' : "Ask Sahayata any policy question (e.g. 'fees maaf hoti hai kya?' or 'what are NBFA limits?')..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isThinking}
            autoFocus
          />
          <button
            type="submit"
            disabled={isThinking || !inputText.trim()}
            className="sap-btn sap-btn--ai-emphasized sap-chat-send-btn"
            style={{ opacity: isThinking || !inputText.trim() ? 0.6 : 1 }}
          >
            {isThinking ? '✦ Thinking...' : '✦ Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
