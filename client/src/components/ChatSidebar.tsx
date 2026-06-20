'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Plus, Clock, Library, Upload, LogIn, MessageSquare,
  Trash2, X, FileText, BrainCircuit, LogOut, User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

export interface Thread {
  id: string;
  title: string;
  createdAt: Date;
}

interface ChatSidebarProps {
  threads: Thread[];
  activeThreadId: string | null;
  onNewThread: () => void;
  onSelectThread: (id: string) => void;
  onDeleteThread: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

const MIN_W = 140;
const MAX_W = 340;
const DEFAULT_W = 200;

const ChatSidebar = ({
  threads, activeThreadId,
  onNewThread, onSelectThread, onDeleteThread,
  open, onClose,
}: ChatSidebarProps) => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [width, setWidth] = useState(DEFAULT_W);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startW = useRef(DEFAULT_W);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    startX.current = e.clientX;
    startW.current = width;
    setIsDragging(true);
  }, [width]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const next = Math.max(MIN_W, Math.min(MAX_W, startW.current + e.clientX - startX.current));
      setWidth(next);
    };
    const onUp = () => setIsDragging(false);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  const handleLogout = () => {
    logout();
    router.push("/signin");
    onClose();
  };

  return (
    <>
      {/* Drag capture overlay — keeps col-resize cursor across entire screen while dragging */}
      {isDragging && (
        <div className="fixed inset-0 z-[200] cursor-col-resize" />
      )}

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar border-r border-border
          transition-transform duration-200 select-none
          md:relative md:translate-x-0 md:flex-shrink-0
          ${open ? "translate-x-0" : "-translate-x-full"}
          ${isDragging ? "cursor-col-resize" : ""}
        `}
        style={{ width: `${width}px` }}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-end p-2 md:hidden">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 md:py-4 space-y-1 overflow-hidden flex flex-col">
          <button
            onClick={() => { onNewThread(); onClose(); }}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="truncate">New Thread</span>
          </button>

          <SidebarItem icon={Clock} label="History" onClick={() => { router.push("/"); onClose(); }} />

          <Link
            href="/library"
            onClick={onClose}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-accent transition-colors"
          >
            <Library className="w-4 h-4 shrink-0" />
            <span className="truncate">Library</span>
          </Link>

          <SidebarItem
            icon={Upload}
            label="Upload Material"
            onClick={() => { router.push("/latest-uploads"); onClose(); }}
          />

          <button
            onClick={() => { toast("Mock Test is coming soon!"); onClose(); }}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-accent transition-colors"
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">Mock Test</span>
          </button>

          <Link
            href="/generate-quiz"
            onClick={onClose}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-accent transition-colors"
          >
            <BrainCircuit className="w-4 h-4 shrink-0" />
            <span className="truncate">Generate Quiz</span>
          </Link>

          {/* Thread list */}
          <div className="mt-3 pt-3 border-t border-border flex-1 overflow-y-auto min-h-0">
            <p className="text-xs text-muted-foreground px-3 mb-2">Recent</p>
            {threads.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 px-3">
                Recent and active threads will appear here.
              </p>
            ) : (
              <div className="space-y-0.5">
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    className={`group flex items-center gap-1.5 w-full px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      activeThreadId === thread.id
                        ? "bg-accent text-foreground"
                        : "text-sidebar-foreground hover:bg-accent/50"
                    }`}
                    onClick={() => { onSelectThread(thread.id); onClose(); }}
                  >
                    <MessageSquare className="w-3 h-3 shrink-0" />
                    <span className="truncate flex-1">{thread.title}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteThread(thread.id); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* User section */}
        <div className="px-3 py-3 border-t border-border">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 px-3 py-1.5">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.full_name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  <p className="text-[10px] text-primary/70 capitalize">{user.role}</p>
                </div>
              </div>
              <Separator />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="truncate">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/signin"
              onClick={onClose}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-accent transition-colors"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              <span className="truncate">Sign In</span>
            </Link>
          )}
        </div>

        {/* Drag-resize handle — desktop only */}
        <div
          onMouseDown={onDragStart}
          className="absolute right-0 top-0 bottom-0 w-3 hidden md:flex items-center justify-center cursor-col-resize group z-10"
          title="Drag to resize"
        >
          <div
            className={`w-[3px] h-10 rounded-full transition-colors duration-150 ${
              isDragging ? "bg-primary/60" : "bg-transparent group-hover:bg-border"
            }`}
          />
        </div>
      </aside>
    </>
  );
};

const SidebarItem = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-accent transition-colors"
  >
    <Icon className="w-4 h-4 shrink-0" />
    <span className="truncate">{label}</span>
  </button>
);

export default ChatSidebar;
