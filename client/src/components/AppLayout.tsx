'use client';

import { useState } from "react";
import ChatSidebar from "@/components/ChatSidebar";

interface AppLayoutProps {
  children: (props: { onToggleSidebar: () => void }) => React.ReactNode;
  threads?: { id: string; title: string; createdAt: Date }[];
  activeThreadId?: string | null;
  onNewThread?: () => void;
  onSelectThread?: (id: string) => void;
  onDeleteThread?: (id: string) => void;
}

const AppLayout = ({
  children,
  threads = [],
  activeThreadId = null,
  onNewThread = () => {},
  onSelectThread = () => {},
  onDeleteThread = () => {},
}: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ChatSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onNewThread={onNewThread}
        onSelectThread={onSelectThread}
        onDeleteThread={onDeleteThread}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {children({ onToggleSidebar: () => setSidebarOpen(true) })}
    </div>
  );
};

export default AppLayout;
