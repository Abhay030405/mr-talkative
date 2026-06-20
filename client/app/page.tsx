'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Brain, Search, MessageSquare, BookOpen, FileText,
  Globe, Workflow, SlidersHorizontal, Zap, GraduationCap,
  ArrowRight, Sparkles, Check, Menu, X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/* ─────────────────────────────────────────────────────────────────────────────
   Shared constants
──────────────────────────────────────────────────────────────────────────────*/
const A = (o: number) => `rgba(212,146,41,${o})`;   // amber at opacity

/* ─────────────────────────────────────────────────────────────────────────────
   Sub-components
──────────────────────────────────────────────────────────────────────────────*/

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide border"
      style={{
        borderColor: A(0.3),
        background: A(0.06),
        color: "hsl(37 75% 68%)",
      }}
    >
      {children}
    </span>
  );
}

/** Faint ambient glow behind the hero */
function HeroGlow() {
  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% -10%, ${A(0.13)}, transparent)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${A(0.035)} 1px, transparent 1px),linear-gradient(90deg,${A(0.035)} 1px,transparent 1px)`,
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 70% 55% at 50% 0%, black 30%, transparent 100%)",
        }}
      />
    </>
  );
}

/* ── Animated chat mockup data ──────────────────────────────────────────── */
type AnimMsg = { role: "user" | "ai"; text: string; sources?: string[] };

const CHAT_SCRIPT: AnimMsg[] = [
  { role: "user", text: "Explain Power Factor Correction in simple terms" },
  {
    role: "ai",
    text: "Power Factor Correction (PFC) improves the ratio of real to apparent power in an AC circuit. Poor power factor means the supply delivers more current than needed, increasing losses. PFC adds capacitor banks or active circuits to bring current and voltage back in phase.",
    sources: ["Power Electronics – Ch 7", "EE Lab Manual – Unit 4"],
  },
  { role: "user", text: "What are the types of PFC techniques?" },
  {
    role: "ai",
    text: "Two main types: (1) Passive PFC — uses LC filters, simple but bulky. (2) Active PFC — uses boost converters controlled by PWM, achieving PF > 0.99. Active PFC is preferred in modern SMPS designs.",
    sources: ["Power Systems I – Sem 5"],
  },
];

const SIDEBAR_HISTORY = ["Transformer Theory", "Control Systems – PID", "Signals & Systems"];
const CHAR_SPEED = 36; // ms per character while "typing"

/** Live-animated chat mockup — replays in an infinite loop */
function AnimatedChatMockup() {
  const [messages, setMessages] = useState<AnimMsg[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll as messages appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiTyping]);

  // Animation loop
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    function run() {
      setMessages([]);
      setIsAiTyping(false);
      setInputText("");

      let t = 1000; // opening pause

      for (const msg of CHAT_SCRIPT) {
        if (msg.role === "user") {
          // Type character-by-character in the input bar
          for (let c = 1; c <= msg.text.length; c++) {
            const slice = msg.text.slice(0, c);
            at(() => setInputText(slice), t + c * CHAR_SPEED);
          }
          t += msg.text.length * CHAR_SPEED + 180;

          // "Send": message appears, input resets
          at(() => {
            setMessages((prev) => [...prev, msg]);
            setInputText("");
          }, t);
          t += 450;

          // AI starts thinking
          at(() => setIsAiTyping(true), t);
          t += 2000;
        } else {
          // AI response appears, typing indicator disappears
          at(() => {
            setIsAiTyping(false);
            setMessages((prev) => [...prev, msg]);
          }, t);
          t += 2200; // pause before next user turn
        }
      }

      // Restart after a rest
      at(run, t + 3500);
    }

    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="w-full rounded-2xl overflow-hidden border"
      style={{
        borderColor: A(0.12),
        boxShadow: `0 0 0 1px ${A(0.08)}, 0 32px 64px rgba(0,0,0,0.55), 0 0 80px ${A(0.06)}`,
        background: "hsl(20 6% 9%)",
      }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: A(0.08), background: "hsl(20 6% 10%)" }}
      >
        <span className="w-3 h-3 rounded-full bg-red-500/40" />
        <span className="w-3 h-3 rounded-full bg-yellow-400/40" />
        <span className="w-3 h-3 rounded-full bg-green-500/40" />
        <span className="ml-4 text-xs text-muted-foreground/50 font-mono truncate min-w-0 flex-1">
          mr-talkative · EE · Semester 5 · Power Systems I
        </span>
      </div>

      <div className="flex overflow-hidden h-[360px] sm:h-[420px]">
        {/* Sidebar */}
        <div
          className="hidden sm:flex flex-col w-44 shrink-0 border-r py-3 gap-1"
          style={{ borderColor: A(0.07), background: "hsl(24 4% 11%)" }}
        >
          <p className="px-3 text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-1.5">
            Recent
          </p>

          {/* Active thread — glows amber */}
          <div
            className="mx-2 px-2 py-1.5 rounded-lg text-xs truncate cursor-pointer"
            style={{ background: A(0.12), color: "hsl(37 75% 68%)", border: `1px solid ${A(0.2)}` }}
          >
            Power Factor Correction
          </div>

          {/* History */}
          {SIDEBAR_HISTORY.map((title) => (
            <div
              key={title}
              className="mx-2 px-2 py-1.5 rounded-lg text-xs truncate cursor-pointer hover:bg-white/5 transition-colors"
              style={{ color: "hsl(40 5% 40%)" }}
            >
              {title}
            </div>
          ))}

          {/* Divider + older placeholder rows */}
          <div className="mx-3 my-2 border-t" style={{ borderColor: A(0.06) }} />
          {["Vector Spaces", "Op-Amp Circuits"].map((title) => (
            <div
              key={title}
              className="mx-2 px-2 py-1.5 rounded-lg text-xs truncate cursor-pointer"
              style={{ color: "hsl(40 5% 30%)" }}
            >
              {title}
            </div>
          ))}
        </div>

        {/* Chat column */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages scroll area */}
          <div
            ref={scrollRef}
            className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2.5 chat-msg ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "ai" && (
                  <div
                    className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: A(0.15) }}
                  >
                    <Sparkles style={{ width: 11, height: 11, color: "hsl(37 75% 60%)" }} />
                  </div>
                )}
                <div className="max-w-[82%]">
                  <div
                    className="px-3 py-2 text-xs leading-relaxed"
                    style={
                      m.role === "user"
                        ? {
                            background: A(0.13),
                            color: "hsl(37 80% 78%)",
                            borderRadius: "14px 4px 14px 14px",
                          }
                        : {
                            background: "hsl(20 5% 14%)",
                            color: "hsl(40 10% 78%)",
                            borderRadius: "4px 14px 14px 14px",
                          }
                    }
                  >
                    {m.text}
                  </div>
                  {m.role === "ai" && m.sources && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {m.sources.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] px-2 py-0.5 rounded-md border"
                          style={{
                            borderColor: A(0.22),
                            color: "hsl(37 75% 58%)",
                            background: A(0.05),
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* AI typing indicator */}
            {isAiTyping && (
              <div className="flex gap-2.5 justify-start chat-msg">
                <div
                  className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center"
                  style={{ background: A(0.15) }}
                >
                  <Sparkles style={{ width: 11, height: 11, color: "hsl(37 75% 60%)" }} />
                </div>
                <div
                  className="px-4 py-3 flex items-center gap-1.5"
                  style={{ background: "hsl(20 5% 14%)", borderRadius: "4px 14px 14px 14px" }}
                >
                  <span className="typing-dot" style={{ animationDelay: "0ms" }} />
                  <span className="typing-dot" style={{ animationDelay: "160ms" }} />
                  <span className="typing-dot" style={{ animationDelay: "320ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div
            className="flex items-center gap-2 mx-4 mb-4 rounded-xl border px-3 py-2.5"
            style={{ borderColor: inputText ? A(0.25) : "hsl(20 4% 22%)", background: "hsl(20 5% 13%)", transition: "border-color 0.2s" }}
          >
            <span
              className="flex-1 text-xs"
              style={{ color: inputText ? "hsl(40 10% 76%)" : "hsl(40 5% 33%)" }}
            >
              {inputText || "Ask about your syllabus…"}
              {inputText && <span className="cursor-blink">|</span>}
            </span>
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
              style={{
                background: inputText ? "hsl(37 75% 55%)" : A(0.12),
              }}
            >
              <ArrowRight
                style={{
                  width: 11,
                  height: 11,
                  color: inputText ? "hsl(20 6% 9%)" : "hsl(37 75% 55%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Stat */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-8 py-4">
      <span
        className="font-display text-3xl font-semibold"
        style={{ color: "hsl(37 75% 62%)" }}
      >
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

/* Bento card */
interface BentoCardProps {
  icon: React.ElementType;
  title: string;
  desc: string;
  wide?: boolean;
  tall?: boolean;
  highlight?: React.ReactNode;
}
function BentoCard({ icon: Icon, title, desc, wide, tall, highlight }: BentoCardProps) {
  return (
    <div
      className={`
        relative rounded-2xl border p-6 flex flex-col gap-4 overflow-hidden group
        hover:border-primary/30 transition-all duration-300
        ${wide ? "sm:col-span-2" : ""}
        ${tall ? "row-span-2" : ""}
      `}
      style={{ borderColor: "hsl(20 4% 22%)", background: "hsl(20 6% 10%)" }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${A(0.06)}, transparent)` }}
      />

      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: A(0.1) }}
      >
        <Icon style={{ width: 17, height: 17, color: "hsl(37 75% 60%)" }} />
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground/90 mb-1.5">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>

      {highlight && <div className="mt-auto">{highlight}</div>}
    </div>
  );
}

/* Pipeline node row — used inside a bento card */
function PipelineNodes() {
  const nodes = [
    "classify_intent",
    "vector_retrieve",
    "mmr_select",
    "generate_answer",
  ];
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {nodes.map((n, i) => (
        <span key={n} className="flex items-center gap-1">
          <span
            className="text-[10px] font-mono px-2 py-1 rounded-lg"
            style={{ background: A(0.08), color: "hsl(37 75% 60%)", border: `1px solid ${A(0.2)}` }}
          >
            {n}
          </span>
          {i < nodes.length - 1 && (
            <ArrowRight style={{ width: 10, height: 10, color: "hsl(40 5% 35%)" }} />
          )}
        </span>
      ))}
    </div>
  );
}

/* Score bar — hybrid retrieval visual */
function ScoreBar({ label, v, k }: { label: string; v: number; k: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-20 truncate">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-border/60 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${v * 100}%`, background: `linear-gradient(90deg, ${A(0.5)}, ${A(0.85)})` }}
        />
      </div>
      <span
        className="text-[10px] font-mono w-8 text-right"
        style={{ color: "hsl(37 75% 60%)" }}
      >
        {(v * 0.7 + k * 0.3).toFixed(2)}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Page
──────────────────────────────────────────────────────────────────────────────*/
export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleGetStarted() {
    if (user?.reg_number) router.push(`/student/${user.reg_number}`);
    else router.push("/demo");
  }

  return (
    <div className="min-h-screen bg-chat-bg text-foreground overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 inset-x-0 z-50 border-b"
        style={{ borderColor: A(0.07), background: "rgba(18,16,14,0.9)", backdropFilter: "blur(20px)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Brand + nav */}
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2.5 group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                className="w-7 h-7 rounded-lg shrink-0 transition-transform group-hover:scale-105"
                style={{ boxShadow: `0 0 14px ${A(0.1)}` }}
              >
                <defs>
                  <linearGradient id="nav-bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1e1a16" />
                    <stop offset="100%" stopColor="#100e0b" />
                  </linearGradient>
                  <linearGradient id="nav-bub" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F0B040" />
                    <stop offset="100%" stopColor="#C07818" />
                  </linearGradient>
                </defs>
                <rect width="32" height="32" rx="7" fill="url(#nav-bg)" />
                <rect x="3" y="5" width="21" height="15" rx="4" fill="url(#nav-bub)" />
                <rect x="4" y="5.5" width="19" height="4" rx="2.5" fill="white" fillOpacity="0.12" />
                <polygon points="6,20 5,27 13,20" fill="#B87018" />
                <circle cx="8.5" cy="12.5" r="2" fill="#1e1612" />
                <circle cx="13.5" cy="12.5" r="2" fill="#1e1612" />
                <circle cx="18.5" cy="12.5" r="2" fill="#1e1612" />
                <path d="M27.5 3 L28.3 5.7 L31 6.5 L28.3 7.3 L27.5 10 L26.7 7.3 L24 6.5 L26.7 5.7 Z" fill="#FAD05A" />
              </svg>
              <span className="font-display text-[15px] font-semibold tracking-tight" style={{ color: "hsl(40 10% 91%)" }}>
                Mr. Talkative
              </span>
            </Link>

            <span className="hidden md:block w-px h-4 rounded-full bg-border/50" />

            <nav className="hidden md:flex items-center gap-0.5">
              {([["#features", "Features"], ["#how-it-works", "How it works"], ["#stack", "Stack"]] as [string, string][]).map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="px-3 py-1.5 rounded-lg text-[13px] transition-all"
                  style={{ color: "hsl(40 5% 52%)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(40 10% 85%)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(40 5% 52%)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {user ? (
              <button
                onClick={handleGetStarted}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-medium transition-all"
                style={{ background: A(0.1), color: "hsl(37 75% 68%)", border: `1px solid ${A(0.18)}` }}
              >
                Open workspace <ArrowRight style={{ width: 12, height: 12 }} />
              </button>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="hidden sm:inline-block px-4 py-2 rounded-lg text-[13px] transition-all"
                  style={{ color: "hsl(40 5% 52%)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(40 10% 85%)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(40 5% 52%)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-[13px] font-semibold transition-all"
                  style={{
                    background: "hsl(37 75% 55%)",
                    color: "hsl(20 6% 9%)",
                    boxShadow: `0 2px 14px ${A(0.28)}, 0 0 0 1px ${A(0.35)}`,
                  }}
                >
                  Get started
                  <ArrowRight style={{ width: 13, height: 13 }} />
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t" style={{ borderColor: A(0.07), background: "rgba(18,16,14,0.97)" }}>
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-1">
              {([["#features", "Features"], ["#how-it-works", "How it works"], ["#stack", "Stack"]] as [string, string][]).map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-white/5"
                  style={{ color: "hsl(40 5% 65%)" }}
                >
                  {label}
                </a>
              ))}
              {!user && (
                <>
                  <div className="my-1 border-t" style={{ borderColor: A(0.08) }} />
                  <Link
                    href="/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-white/5"
                    style={{ color: "hsl(40 5% 65%)" }}
                  >
                    Sign in
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6">
        <HeroGlow />

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 lg:gap-16 items-center">
          {/* Left — text */}
          <div className="flex flex-col gap-5 text-center lg:text-left items-center lg:items-start">
            <Pill>
              <Sparkles style={{ width: 11, height: 11 }} />
              Hybrid RAG · LangGraph · NeonDB · Qdrant
            </Pill>

            <h1
              className="font-display text-[clamp(2rem,3.5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.03em]"
              style={{ color: "hsl(40 10% 88%)" }}
            >
              Your syllabus,{" "}
              <span
                style={{
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundImage: `linear-gradient(135deg, hsl(37 75% 68%), hsl(37 75% 50%))`,
                  backgroundClip: "text",
                }}
              >
                answered.
              </span>
            </h1>

            <p className="text-sm leading-relaxed max-w-sm" style={{ color: "hsl(40 5% 55%)" }}>
              Ask questions about your B.Tech coursework and get grounded, cited
              answers retrieved from your actual study material — not hallucinations.
            </p>

            <div className="hidden sm:flex flex-col sm:flex-row items-center lg:items-start gap-3 mt-1">
              <button
                onClick={handleGetStarted}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all"
                style={{
                  background: "hsl(37 75% 55%)",
                  color: "hsl(20 6% 9%)",
                  boxShadow: `0 0 0 1px ${A(0.3)}, 0 8px 32px ${A(0.25)}`,
                }}
              >
                <Zap style={{ width: 15, height: 15 }} />
                {user ? "Open my workspace" : "Start for free"}
              </button>
              {!user && (
                <Link
                  href="/demo"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs transition-colors border"
                  style={{ borderColor: "hsl(20 4% 22%)", color: "hsl(40 5% 55%)" }}
                >
                  Try demo without signing up
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </Link>
              )}
            </div>

            {/* Social proof micro-line */}
            <div className="flex items-center gap-2 text-xs" style={{ color: "hsl(40 5% 40%)" }}>
              {["MNNIT students", "CSE · IT · EE · ECE", "Sem 1–8"].map((t, i) => (
                <span key={t} className="flex items-center gap-2">
                  {i > 0 && <span className="w-1 h-1 rounded-full bg-border" />}
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — animated chat mockup */}
          <div className="animate-fade-in w-full">
            <AnimatedChatMockup />
          </div>
        </div>
      </section>

      {/* ── Stats strip ────────────────────────────────────────────── */}
      <div
        className="border-y"
        style={{ borderColor: A(0.08), background: "hsl(20 6% 9%)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center sm:divide-x divide-border/60">
          {[
            { value: "4", label: "Engineering branches" },
            { value: "8", label: "Semesters covered" },
            { value: "40+", label: "Subjects seeded" },
            { value: "2-stage", label: "Hybrid retrieval" },
          ].map((s) => (
            <Stat key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </div>

      {/* ── Features bento ─────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-xs uppercase tracking-widest mb-3 font-medium"
              style={{ color: "hsl(37 75% 58%)" }}
            >
              What's inside
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-semibold tracking-tight"
              style={{ color: "hsl(40 10% 86%)" }}
            >
              Built for precision, not guesswork
            </h2>
            <p className="mt-3 text-sm max-w-md mx-auto leading-relaxed" style={{ color: "hsl(40 5% 48%)" }}>
              Eight integrated components that take a raw PDF and turn it into a
              grounded, cited, exam-ready answer.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Wide card — Hybrid Retrieval with visual */}
            <div
              className="relative rounded-2xl border p-6 flex flex-col gap-4 overflow-hidden group hover:border-primary/30 transition-all duration-300 sm:col-span-2"
              style={{ borderColor: "hsl(20 4% 22%)", background: "hsl(20 6% 10%)" }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: `radial-gradient(ellipse 70% 60% at 0% 50%, ${A(0.05)}, transparent)` }} />
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: A(0.1) }}>
                <Search style={{ width: 17, height: 17, color: "hsl(37 75% 60%)" }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground/90 mb-1">Hybrid Retrieval</p>
                <p className="text-xs leading-relaxed" style={{ color: "hsl(40 5% 48%)" }}>
                  Vector semantic search and BM25 keyword scoring run in parallel.
                  Results are fused by weighted rank — tunable per query.
                </p>
              </div>
              <div className="mt-auto space-y-2">
                {[
                  { label: "Power Factor", v: 0.91, k: 0.78 },
                  { label: "PFC Circuit", v: 0.85, k: 0.95 },
                  { label: "Boost Converter", v: 0.72, k: 0.61 },
                ].map((r) => (
                  <ScoreBar key={r.label} {...r} />
                ))}
              </div>
            </div>

            {/* Intent Classification */}
            <BentoCard
              icon={Brain}
              title="Intent Classification"
              desc="Before retrieval, the LLM classifies every query — question, follow-up, greeting, or clarification — and routes it through the right pipeline branch."
              highlight={
                <div className="flex flex-wrap gap-1.5">
                  {["question", "follow_up", "greeting", "clarification"].map((t, i) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={i === 0
                        ? { background: A(0.15), color: "hsl(37 75% 65%)", border: `1px solid ${A(0.3)}` }
                        : { background: "hsl(20 5% 16%)", color: "hsl(40 5% 45%)", border: "1px solid hsl(20 4% 22%)" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              }
            />

            {/* LangGraph pipeline */}
            <BentoCard
              icon={Workflow}
              title="LangGraph State Machine"
              desc="Every step is a node in a compiled graph — deterministic, traceable, and easily extended. The graph_path field in every response shows exactly what ran."
              highlight={<PipelineNodes />}
            />

            {/* Multi-turn */}
            <BentoCard
              icon={MessageSquare}
              title="Multi-turn Conversations"
              desc="PostgreSQL-backed checkpoint store persists state between turns. Follow-up questions always have context of the full thread, not just the last message."
            />

            {/* MMR */}
            <BentoCard
              icon={SlidersHorizontal}
              title="MMR Context Selection"
              desc="Maximal Marginal Relevance filters retrieved chunks for relevance AND diversity — eliminating redundant context before sending to the LLM."
            />

            {/* Document ingestion — wide */}
            <div
              className="relative rounded-2xl border p-6 flex flex-col gap-4 overflow-hidden group hover:border-primary/30 transition-all duration-300 sm:col-span-2"
              style={{ borderColor: "hsl(20 4% 22%)", background: "hsl(20 6% 10%)" }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: `radial-gradient(ellipse 70% 60% at 100% 50%, ${A(0.05)}, transparent)` }} />
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: A(0.1) }}>
                <FileText style={{ width: 17, height: 17, color: "hsl(37 75% 60%)" }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground/90 mb-1">Automatic Document Ingestion</p>
                <p className="text-xs leading-relaxed" style={{ color: "hsl(40 5% 48%)" }}>
                  Upload a PDF or TXT and the ingestion pipeline handles everything — splitting, embedding, and indexing into Qdrant Cloud, tagged by branch, semester, and subject.
                </p>
              </div>
              <div className="mt-auto grid grid-cols-3 gap-3">
                {["01 Upload", "02 Chunk", "03 Embed", "04 Index", "05 Tag", "06 Ready"].map((step) => (
                  <div
                    key={step}
                    className="flex items-center gap-1.5 text-[10px] font-mono"
                    style={{ color: "hsl(40 5% 48%)" }}
                  >
                    <Check style={{ width: 10, height: 10, color: "hsl(37 75% 55%)" }} />
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Academic Structure */}
            <BentoCard
              icon={GraduationCap}
              title="Academic Structure"
              desc="Every document and chat thread is scoped to Branch → Semester → Subject. Retrieval never leaks context across different curricula."
            />

            {/* Wikipedia Demo */}
            <BentoCard
              icon={Globe}
              title="Demo Mode"
              desc="No account needed. The public demo mode uses live Wikipedia retrieval so anyone can experience the RAG pipeline before signing up."
            />
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-24 px-6"
        style={{ borderTop: `1px solid ${A(0.07)}` }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest mb-3 font-medium" style={{ color: "hsl(37 75% 58%)" }}>
              Process
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight" style={{ color: "hsl(40 10% 86%)" }}>
              From PDF to precise answer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                n: "01",
                icon: FileText,
                title: "Upload study material",
                desc: "Admins upload PDF or TXT notes. The ingestion pipeline chunks, embeds, and stores them in Qdrant — tagged by branch, semester, and subject.",
              },
              {
                n: "02",
                icon: Search,
                title: "Ask a question",
                desc: "Students type any question. The graph classifies intent, expands the query with synonyms, then retrieves top-k chunks via hybrid vector + keyword search.",
              },
              {
                n: "03",
                icon: BookOpen,
                title: "Get a grounded answer",
                desc: "Gemini generates an answer strictly grounded in retrieved context. Every claim links back to the source document — no hallucinations.",
              },
            ].map((step) => (
              <div key={step.n} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className="font-display text-4xl font-light"
                    style={{ color: A(0.2) }}
                  >
                    {step.n}
                  </span>
                  <div
                    className="w-0.5 self-stretch rounded-full"
                    style={{ background: `linear-gradient(to bottom, ${A(0.3)}, transparent)` }}
                  />
                </div>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: A(0.08), border: `1px solid ${A(0.15)}` }}
                >
                  <step.icon style={{ width: 16, height: 16, color: "hsl(37 75% 60%)" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: "hsl(40 10% 82%)" }}>{step.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "hsl(40 5% 48%)" }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ─────────────────────────────────────────────── */}
      <section id="stack" className="py-24 px-6" style={{ borderTop: `1px solid ${A(0.07)}` }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest mb-3 font-medium" style={{ color: "hsl(37 75% 58%)" }}>
              Built with
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight" style={{ color: "hsl(40 10% 86%)" }}>
              Production-grade from the start
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { name: "FastAPI", role: "Async API" },
              { name: "Next.js 15", role: "Frontend" },
              { name: "LangGraph", role: "State machine" },
              { name: "Qdrant", role: "Vector DB" },
              { name: "NeonDB", role: "PostgreSQL" },
              { name: "asyncpg", role: "DB driver" },
              { name: "OpenRouter", role: "LLM gateway" },
              { name: "Gemini", role: "LLM + embed" },
              { name: "BM25", role: "Keyword rank" },
              { name: "LangChain", role: "Retrieval" },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-xl border p-3 flex flex-col items-center gap-1 text-center hover:border-primary/25 transition-colors"
                style={{ borderColor: "hsl(20 4% 20%)", background: "hsl(20 6% 10%)" }}
              >
                <span className="text-sm font-semibold" style={{ color: "hsl(40 10% 80%)" }}>{t.name}</span>
                <span className="text-[10px]" style={{ color: "hsl(40 5% 42%)" }}>{t.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ borderTop: `1px solid ${A(0.07)}` }}>
        <div className="max-w-3xl mx-auto">
          <div
            className="relative rounded-3xl p-6 sm:p-10 lg:p-14 flex flex-col items-center text-center gap-6 overflow-hidden border"
            style={{
              borderColor: A(0.15),
              background: "hsl(20 6% 10%)",
              boxShadow: `0 0 80px ${A(0.07)} inset, 0 0 0 1px ${A(0.05)}`,
            }}
          >
            {/* Background glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${A(0.1)}, transparent)` }}
            />

            <div
              className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: A(0.12), border: `1px solid ${A(0.25)}`, boxShadow: `0 0 32px ${A(0.2)}` }}
            >
              <BookOpen style={{ width: 24, height: 24, color: "hsl(37 75% 62%)" }} />
            </div>

            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mb-3" style={{ color: "hsl(40 10% 88%)" }}>
                Ready to study smarter?
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(40 5% 50%)" }}>
                Sign up with your MNNIT email and start getting grounded,
                cited answers from your own study material in minutes.
              </p>
            </div>

            <div className="relative flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGetStarted}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: "hsl(37 75% 55%)",
                  color: "hsl(20 6% 9%)",
                  boxShadow: `0 0 24px ${A(0.3)}`,
                }}
              >
                <Sparkles style={{ width: 15, height: 15 }} />
                {user ? "Open my workspace" : "Create free account"}
              </button>
              {!user && (
                <Link
                  href="/demo"
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm transition-colors border"
                  style={{ borderColor: A(0.2), color: "hsl(40 5% 55%)" }}
                >
                  Try demo first
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="py-10 px-6" style={{ borderTop: `1px solid ${A(0.07)}` }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <span className="font-display text-sm font-semibold" style={{ color: "hsl(40 10% 70%)" }}>
              Mr. Talkative
            </span>
            <span className="text-xs" style={{ color: "hsl(40 5% 35%)" }}>
              Context-aware exam intelligence · MNNIT
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs" style={{ color: "hsl(40 5% 38%)" }}>
            <Link href="/signin" className="hover:text-muted-foreground transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-muted-foreground transition-colors">Sign up</Link>
            <Link href="/demo" className="hover:text-muted-foreground transition-colors">Demo</Link>
            <Link href="/about" className="hover:text-muted-foreground transition-colors">About</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
