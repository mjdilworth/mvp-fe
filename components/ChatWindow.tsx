// File: components/ChatWindow.tsx
'use client';
import React from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}
interface ChatWindowProps {
  messages: Message[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  return (
    <div className="flex-1 p-4 space-y-4 bg-white dark:bg-gray-900 flex flex-col overflow-y-auto">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`px-4 py-2 rounded-md max-w-xl
            ${msg.role === 'user' ? 'bg-blue-100 dark:bg-blue-600 self-end text-right' : 'bg-gray-100 dark:bg-gray-700 self-start'}`}
        >
          {msg.content}
        </div>
      ))}
    </div>
  );
};

export default ChatWindow;
