'use client';

import { useState, useRef, useEffect } from "react";
import { BrainCircuit, Menu, Plus, Mic, SendHorizontal, BookOpen } from "lucide-react";
import AppLayout from "@/components/AppLayout";

interface QuizMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const instructions = [
  "📚 Topics you want the quiz to cover",
  "📝 Total marks for the quiz",
  "🎯 Pattern / format (MCQ, short answer, etc.)",
  "📎 Share a relevant text file to help understand the pattern",
];

export default function GenerateQuiz() {
  const [messages, setMessages] = useState<QuizMessage[]>([]);
  const [query, setQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg: QuizMessage = { id: crypto.randomUUID(), role: "user", content: query.trim() };
    const botMsg: QuizMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "🚧 Coming soon — Quiz generation is under development! Stay tuned.",
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setQuery("");
  };

  const hasMessages = messages.length > 0;

  return (
    <AppLayout>
      {({ onToggleSidebar }) => (
        <main className="flex-1 flex flex-col bg-chat-bg min-h-screen min-w-0">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <BrainCircuit className="w-5 h-5 text-primary" />
            <span className="font-display text-lg font-medium text-foreground/80">
              Generate Quiz
            </span>
          </div>

          {!hasMessages ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="w-full max-w-2xl flex flex-col items-center animate-fade-in">
                <h1 className="font-display text-3xl sm:text-4xl font-light tracking-tight text-foreground/80 mb-3 select-none text-center">
                  Generate a Quiz
                </h1>
                <p className="text-muted-foreground text-sm mb-6 text-center max-w-md">
                  Tell us what you need and we&apos;ll create a quiz for you.
                </p>

                <div className="w-full max-w-md rounded-2xl border border-border bg-accent/30 p-5 mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      In the text box below, please share:
                    </span>
                  </div>
                  <ul className="space-y-2.5">
                    {instructions.map((item, i) => (
                      <li key={i} className="text-sm text-foreground/70 pl-1">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <form onSubmit={handleSubmit} className="w-full">
                  <div className="bg-chat-input rounded-2xl border border-border p-3 sm:p-4 focus-within:border-primary/40 transition-colors">
                    <textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g. Create a 50 marks MCQ quiz on Data Structures — Trees & Graphs..."
                      rows={3}
                      className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm resize-none outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <button
                        type="button"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
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
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
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
                        placeholder="Add more details..."
                        rows={1}
                        className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm resize-none outline-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                          }
                        }}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
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
      )}
    </AppLayout>
  );
}
