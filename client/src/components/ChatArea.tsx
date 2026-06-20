'use client';

import { useState, useRef, useEffect } from "react";
import { Plus, Mic, SendHorizontal, Menu } from "lucide-react";
import { UserContext } from "@/components/SetupScreen";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onToggleSidebar: () => void;
  userContext: UserContext;
}

const ChatArea = ({ messages = [], onSendMessage, onToggleSidebar, userContext }: ChatAreaProps) => {
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

  const contextBadge = (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="px-2.5 py-1 rounded-full bg-primary/15 text-primary font-medium">{userContext.semester}</span>
      <span className="px-2.5 py-1 rounded-full bg-primary/15 text-primary font-medium">{userContext.branch}</span>
      <span className="px-2.5 py-1 rounded-full bg-primary/15 text-primary font-medium">{userContext.subject}</span>
    </div>
  );

  return (
    <main className="flex-1 flex flex-col bg-chat-bg min-h-screen min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={onToggleSidebar} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors md:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display text-base sm:text-lg font-medium text-foreground/80">Mr. Talkative</span>
        </div>
        {contextBadge}
      </div>

      {!hasMessages ? (
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
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary/20 text-foreground"
                        : "bg-accent text-foreground"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

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
};

export default ChatArea;
