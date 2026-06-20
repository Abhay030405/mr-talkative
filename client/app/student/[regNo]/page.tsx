'use client';

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatSidebar, { Thread } from "@/components/ChatSidebar";
import ChatArea, { Message } from "@/components/ChatArea";
import SetupScreen, { UserContext } from "@/components/SetupScreen";
import { useAuth } from "@/contexts/AuthContext";
import { sendChatMessage } from "@/services/api";

export default function StudentPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, Message[]>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);

  useEffect(() => {
    if (!user) router.replace("/signin");
  }, [user, router]);

  const createThread = useCallback((firstMessage: string) => {
    const id = crypto.randomUUID();
    const title = firstMessage.length > 30 ? firstMessage.slice(0, 30) + "…" : firstMessage;
    const newThread: Thread = { id, title, createdAt: new Date() };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(id);
    return id;
  }, []);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!userContext) return;

      let threadId = activeThreadId;
      if (!threadId) {
        threadId = createThread(content);
      }

      const userMsg: Message = { id: crypto.randomUUID(), role: "user", content };
      const loadingId = crypto.randomUUID();
      const loadingMsg: Message = { id: loadingId, role: "assistant", content: "Thinking…" };

      setMessagesByThread((prev) => ({
        ...prev,
        [threadId!]: [...(prev[threadId!] || []), userMsg, loadingMsg],
      }));

      try {
        const data = await sendChatMessage(
          content,
          userContext.branch,
          Number.parseInt(userContext.semester),
          userContext.subject,
          token ?? ""
        );
        setMessagesByThread((prev) => ({
          ...prev,
          [threadId!]: prev[threadId!].map((m) =>
            m.id === loadingId ? { ...m, content: data.answer } : m
          ),
        }));
      } catch {
        setMessagesByThread((prev) => ({
          ...prev,
          [threadId!]: prev[threadId!].map((m) =>
            m.id === loadingId
              ? { ...m, content: "Sorry, something went wrong. Please try again." }
              : m
          ),
        }));
      }
    },
    [activeThreadId, createThread, userContext, token]
  );

  const handleNewThread = useCallback(() => {
    setActiveThreadId(null);
    setUserContext(null);
  }, []);

  const handleSelectThread = useCallback((id: string) => {
    setActiveThreadId(id);
  }, []);

  const handleDeleteThread = useCallback(
    (id: string) => {
      setThreads((prev) => prev.filter((t) => t.id !== id));
      setMessagesByThread((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      if (activeThreadId === id) {
        setActiveThreadId(null);
        setUserContext(null);
      }
    },
    [activeThreadId]
  );

  if (!user) return null;

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
      {userContext ? (
        <ChatArea
          messages={currentMessages}
          onSendMessage={handleSendMessage}
          onToggleSidebar={() => setSidebarOpen(true)}
          userContext={userContext}
        />
      ) : (
        <SetupScreen onComplete={setUserContext} onToggleSidebar={() => setSidebarOpen(true)} />
      )}
    </div>
  );
}
