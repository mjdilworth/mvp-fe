'use client';

import { useRef, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopMenuBar from '@/components/TopMenuBar';
import MessageInput, { MessageInputHandle } from '@/components/MessageInput';
import { useChatActions } from '@/hooks/useChatActions';

type Message = {
  sender: 'user' | 'bot';
  content: string;
  timestamp: Date;
  status: 'ok' | 'error';
};

type Session = {
  id: string;
  title: string;
  messages: Message[];
};

export default function HomePage() {
  // State
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 'default',
      title: 'New Chat',
      messages: [],
    },
  ]);
  const [currentSessionId, setCurrentSessionId] = useState('default');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const inputRef = useRef<MessageInputHandle>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Helpers
  const currentSession = sessions.find((s) => s.id === currentSessionId);

  // Chat actions (from custom hook)
  const { addMessageToCurrentSession, handleSend } = useChatActions({
    sessions,
    setSessions,
    setIsTyping,
    setStreamingContent,
    inputRef,
    setCurrentSessionId,
    currentSessionId,
  });

  // Session management
  const createNewSession = () => {
    const newId = Math.random().toString(36).slice(2);
    setSessions([
      ...sessions,
      { id: newId, title: 'New Chat', messages: [] },
    ]);
    setCurrentSessionId(newId);
  };

  const handleRenameSession = (id: string, title: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title } : s))
    );
  };

  const handleDeleteSession = (id: string) => {
    if (sessions.length === 1) return;
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (currentSessionId === id) {
      const next = sessions.find((s) => s.id !== id);
      if (next) setCurrentSessionId(next.id);
    }
  };

  const handleFileSend = (fileName: string) => {
    // Add the file name as a message to the current session
    addMessageToCurrentSession('user', `Uploaded file: ${fileName}`);
  };

  // Scroll to bottom on new message
  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Scroll when messages or streamingContent changes
  // (You may want to use useEffect here if needed)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        sessions={sessions}
        onSelectSession={setCurrentSessionId}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
      />

      <TopMenuBar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={createNewSession}
        profileInitials="Dilly"
        title={currentSession?.title || 'SciAnno Chat'}
      />

      <div className="flex-1 flex flex-col relative bg-gray-700 text-white pt-14">
        <div className="flex-1 overflow-y-auto p-6 pb-32">
          <h1 className="text-4xl font-bold mb-4">{currentSession?.title || 'Chat'}</h1>
          <div className="space-y-4">
            {currentSession?.messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-lg rounded-lg p-3 ${
                    msg.sender === 'user'
                      ? 'bg-[#bfa93a] text-white text-right'
                      : 'bg-gray-800 text-white text-left'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {/* Streaming content (for bot typing) */}
            {isTyping && streamingContent && (
              <div className="flex justify-start">
                <div className="max-w-lg rounded-lg p-3 bg-gray-800 text-white text-left">
                  {streamingContent}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
        <MessageInput ref={inputRef} onSend={handleSend} onFileSend={handleFileSend}  disabled={isTyping} />
      </div>
    </div>
  );
}