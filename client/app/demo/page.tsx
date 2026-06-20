'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Globe, Search, HelpCircle, Sparkles, Plus, Mic,
  SendHorizontal, Menu, ChevronDown, ChevronUp, ExternalLink, TriangleAlert,
} from "lucide-react";
import ChatSidebar, { Thread } from "@/components/ChatSidebar";
import { sendDemoChatMessage } from "@/services/api";

/* ─── types ──────────────────────────────────────────── */

interface WikiSource {
  title: string;
  url: string;
  snippet: string;
}

interface DemoMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: WikiSource[];
  loading?: boolean;
}

/* ─── suggestions (mirrors ChatArea) ─────────────────── */

const suggestions = [
  { icon: Globe,      label: "What is a neural network?" },
  { icon: Search,     label: "Explain the OSI model" },
  { icon: HelpCircle, label: "What is Big O notation?" },
  { icon: Sparkles,   label: "How does TCP/IP work?" },
];

/* ─── page ────────────────────────────────────────────── */

const MAX_DEMO_MESSAGES = 15;

export default function Demo() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, DemoMessage[]>>({});
  const [conversationIds, setConversationIds] = useState<Record<string, string>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalMessagesSent, setTotalMessagesSent] = useState(0);

  const createThread = useCallback((firstMessage: string) => {
    const id = crypto.randomUUID();
    const title = firstMessage.length > 30 ? firstMessage.slice(0, 30) + "…" : firstMessage;
    setThreads((prev) => [{ id, title, createdAt: new Date() }, ...prev]);
    setActiveThreadId(id);
    return id;
  }, []);

  const handleSendMessage = useCallback(
    async (content: string) => {
      let tid = activeThreadId;
      if (!tid) tid = createThread(content);

      const convId = conversationIds[tid];
      const userMsg: DemoMessage = { id: crypto.randomUUID(), role: "user", content };
      const loadingId = crypto.randomUUID();
      const loadingMsg: DemoMessage = { id: loadingId, role: "assistant", content: "Thinking…", loading: true };

      setMessagesByThread((prev) => ({
        ...prev,
        [tid!]: [...(prev[tid!] || []), userMsg, loadingMsg],
      }));

      setTotalMessagesSent((n) => n + 1);

      try {
        const data = await sendDemoChatMessage(content, convId);
        setConversationIds((prev) => ({ ...prev, [tid!]: data.conversation_id }));
        setMessagesByThread((prev) => ({
          ...prev,
          [tid!]: prev[tid!].map((m) =>
            m.id === loadingId
              ? { ...m, content: data.answer, sources: data.sources, loading: false }
              : m
          ),
        }));
      } catch {
        setMessagesByThread((prev) => ({
          ...prev,
          [tid!]: prev[tid!].map((m) =>
            m.id === loadingId
              ? { ...m, content: "Sorry, something went wrong. Please try again.", loading: false }
              : m
          ),
        }));
      }
    },
    [activeThreadId, createThread, conversationIds]
  );

  const handleNewThread = useCallback(() => setActiveThreadId(null), []);

  const handleSelectThread = useCallback((id: string) => setActiveThreadId(id), []);

  const handleDeleteThread = useCallback(
    (id: string) => {
      setThreads((prev) => prev.filter((t) => t.id !== id));
      setMessagesByThread((prev) => { const c = { ...prev }; delete c[id]; return c; });
      setConversationIds((prev) => { const c = { ...prev }; delete c[id]; return c; });
      if (activeThreadId === id) setActiveThreadId(null);
    },
    [activeThreadId]
  );

  const currentMessages = activeThreadId ? messagesByThread[activeThreadId] || [] : [];

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ChatSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onNewThread={handleNewThread}
        onSelectThread={handleSelectThread}
        onDeleteThread={handleDeleteThread}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <DemoChatArea
        messages={currentMessages}
        onSendMessage={handleSendMessage}
        onToggleSidebar={() => setSidebarOpen(true)}
        messagesLeft={Math.max(0, MAX_DEMO_MESSAGES - totalMessagesSent)}
      />
    </div>
  );
}

/* ─── DemoChatArea — mirrors ChatArea exactly ─────────── */

interface DemoChatAreaProps {
  messages: DemoMessage[];
  onSendMessage: (content: string) => void;
  onToggleSidebar: () => void;
  messagesLeft: number;
}

function DemoChatArea({ messages, onSendMessage, onToggleSidebar, messagesLeft }: DemoChatAreaProps) {
  const [query, setQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSendMessage(query.trim());
    setQuery("");
  };

  const hasMessages = messages.length > 0;

  const demoBadge = (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 text-primary font-medium">
        <Globe className="w-3 h-3" />
        Demo Mode
      </span>
      <span className="px-2.5 py-1 rounded-full bg-primary/15 text-primary font-medium">
        Wikipedia
      </span>
    </div>
  );

  return (
    <main className="flex-1 flex flex-col bg-chat-bg min-h-screen min-w-0">
      {/* Header — identical structure to ChatArea */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display text-base sm:text-lg font-medium text-foreground/80">Mr. Talkative</span>
        </div>
        {demoBadge}
        <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border sm:ml-auto ${
          messagesLeft <= 3
            ? "bg-red-500/10 text-red-500 border-red-500/30"
            : "bg-amber-500/10 text-amber-500 border-amber-500/30"
        }`}>
          <TriangleAlert className="w-3 h-3 shrink-0" />
          {messagesLeft} demo message{messagesLeft !== 1 ? "s" : ""} left
        </span>
      </div>

      {!hasMessages ? (
        /* ── Empty state — same layout as ChatArea ── */
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-2xl flex flex-col items-center animate-fade-in">
            <h1 className="font-display text-3xl sm:text-4xl font-light tracking-tight text-foreground/80 mb-8 select-none text-center">
              What can I help you with?
            </h1>

            <form onSubmit={handleSubmit} className="w-full">
              <div className="bg-chat-input rounded-2xl border border-border p-3 sm:p-4 focus-within:border-primary/40 transition-colors">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything..."
                  rows={2}
                  className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-base sm:text-sm resize-none outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <div className="flex items-center justify-between mt-2">
                  <button type="button" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button type="button" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                      <Mic className="w-4 h-4" />
                    </button>
                    <button
                      type="submit"
                      className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                    >
                      <SendHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 sm:mt-5">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => onSendMessage(s.label)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-suggestion border border-border text-xs sm:text-sm text-foreground/70 hover:text-foreground hover:border-primary/30 transition-colors"
                >
                  <s.icon className="w-3.5 h-3.5" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── Message list ── */
        <>
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
              {messages.map((msg) =>
                msg.role === "user" ? (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-primary/20 text-foreground">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <AssistantMessage key={msg.id} message={msg} />
                )
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Sticky input — identical to ChatArea */}
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit}>
                <div className="bg-chat-input rounded-2xl border border-border p-3 sm:p-4 focus-within:border-primary/40 transition-colors">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask anything..."
                    rows={1}
                    className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-base sm:text-sm resize-none outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <button type="button" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button type="button" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                        <Mic className="w-4 h-4" />
                      </button>
                      <button
                        type="submit"
                        className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                      >
                        <SendHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

/* ─── Assistant message with collapsible Wikipedia sources ─ */

function AssistantMessage({ message }: { message: DemoMessage }) {
  const [sourcesOpen, setSourcesOpen] = useState(false);

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] sm:max-w-[80%] space-y-2">
        <div className="rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-accent text-foreground">
          {message.loading ? <LoadingDots /> : message.content}
        </div>

        {!message.loading && message.sources && message.sources.length > 0 && (
          <div>
            <button
              onClick={() => setSourcesOpen((o) => !o)}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="w-3 h-3" />
              {message.sources.length} Wikipedia source{message.sources.length > 1 ? "s" : ""}
              {sourcesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {sourcesOpen && (
              <div className="mt-2 space-y-2">
                {message.sources.map((src, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-3 text-xs space-y-1">
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      {src.title}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                    <p className="text-muted-foreground leading-relaxed line-clamp-3">{src.snippet}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
