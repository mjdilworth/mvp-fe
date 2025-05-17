'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import MessageInput, { MessageInputHandle } from '@/components/MessageInput';
import { Menu, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Types

type Message = {
  sender: 'user' | 'bot';
  content: string;
  timestamp: Date;
  status?: 'ok' | 'error';
};

type Session = {
  id: string;
  title: string;
  messages: Message[];
};

const STORAGE_KEY = 'chat_sessions';
const CURRENT_SESSION_KEY = 'current_session_id';

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<MessageInputHandle | null>(null);

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  const createNewSession = () => {
    const newId = uuidv4();
    const newSession: Session = {
      id: newId,
      title: 'New Chat',
      messages: [],
    };
    setSessions((prev) => [...prev, newSession]);
    setCurrentSessionId(newId);
    inputRef.current?.reset();
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedId = localStorage.getItem(CURRENT_SESSION_KEY);

    if (stored) {
      try {
        const parsed: Session[] = JSON.parse(stored).map((session: Session) => ({
          ...session,
          messages: session.messages.map((m) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }));

        setSessions(parsed);
        setCurrentSessionId(storedId || parsed[0]?.id || '');
      } catch {
        console.warn('Failed to load chat sessions from localStorage');
      }
    } else {
      createNewSession();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem(CURRENT_SESSION_KEY, currentSessionId);
    }
  }, [currentSessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, streamingContent]);

  useEffect(() => {
    if (!isTyping && currentSession?.messages.length) {
      inputRef.current?.focus();
    }
  }, [currentSession?.messages.length]);
  

  const addMessageToCurrentSession = (
    sender: 'user' | 'bot',
    content: string,
    status: 'ok' | 'error' = 'ok'
  ) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: [...s.messages, { sender, content, timestamp: new Date(), status }],
              title: s.title === 'New Chat' && sender === 'user' ? content.slice(0, 30) : s.title,
            }
          : s
      )
    );
  };

  const handleSend = async (text: string) => {
    addMessageToCurrentSession('user', text);
    setStreamingContent('');
    setIsTyping(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://mvp.dilly.cloud/api/echo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        // Manually throw to trigger catch block
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const fullResponse = data.reply || 'No reply received.';

      let i = 0;
      const interval = setInterval(() => {
        i++;
        setStreamingContent(fullResponse.slice(0, i));
        if (i >= fullResponse.length) {
          clearInterval(interval);
          addMessageToCurrentSession('bot', fullResponse, 'ok');
          setStreamingContent('');
          setIsTyping(false);
          inputRef.current?.focus();
        }
      }, 30);
    }  catch (err: unknown) {
      const summary = '⚠️ Failed to send message.';
      let details = '';
    
      if (err instanceof DOMException && err.name === 'AbortError') {
        // Timeout triggered by AbortController
        details = 'Request timed out after 5 seconds.';
      } else if (err instanceof Error) {
        // Standard JS Error
        if (err.message?.startsWith('HTTP')) {
          details = err.message; // contains HTTP status + text
        } else {
          details = `Error: ${err.message}`;
        }
      } else {
        // Fallback for non-standard error types
        details = 'An unknown error occurred.';
      }
    
      const fullErrorMessage = `${summary}\n${details}`;
    
      addMessageToCurrentSession('bot', fullErrorMessage, 'error');
      setStreamingContent('');
      setIsTyping(false);
      inputRef.current?.focus();
    }
    
  };

  const retryMessage = (index: number) => {
    const session = sessions.find((s) => s.id === currentSessionId);
    if (!session) return;

    const lastUserMsg = [...session.messages]
      .slice(0, index)
      .reverse()
      .find((m) => m.sender === 'user');

    if (lastUserMsg) handleSend(lastUserMsg.content);
  };

  const handleRenameSession = (id: string, title: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));

    if (id === currentSessionId) {
      const remaining = sessions.filter((s) => s.id !== id);
      if (remaining.length > 0) {
        setCurrentSessionId(remaining[0].id);
      } else {
        createNewSession();
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        sessions={sessions}
        onSelectSession={(id) => setCurrentSessionId(id)}
        onNewChat={createNewSession}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
      />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-40 bg-gray-800 text-white p-2 rounded hover:bg-gray-700"
        aria-label="Toggle Sidebar"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="flex-1 flex flex-col relative bg-black text-white">
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
                      ? 'bg-[#bfa93a]  text-white text-right'
                      : 'bg-gray-800 text-white text-left'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {msg.sender === 'bot' && msg.status === 'error' && (
                    <button
                      onClick={() => retryMessage(i)}
                      className="mt-2 text-sm text-red-300 underline hover:text-red-500"
                      disabled={isTyping}
                    >
                      Retry
                    </button>
                  )}

                  <div className="text-xs mt-2 text-gray-300">
                    {msg.sender === 'user' ? 'You' : 'Bot'} ·{' '}
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}

            {streamingContent && (
              <div className="flex justify-start">
                <div className="max-w-lg bg-white text-black p-3 rounded-lg text-left">
                  <div className="whitespace-pre-wrap">{streamingContent}</div>
                  <div className="text-xs mt-2 text-gray-300">Bot · typing...</div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        <MessageInput ref={inputRef} onSend={handleSend} disabled={isTyping} />
      </div>
    </div>
  );
}
