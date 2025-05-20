'use client';

import { useState } from 'react';

type Session = {
  id: string;
  title: string;
};

type SidebarProps = {
  isOpen: boolean;
  sessions: Session[];
  onSelectSession: (id: string) => void;
  onRenameSession: (id: string, title: string) => void;
  onDeleteSession: (id: string) => void;
};

export default function Sidebar({
  isOpen,
  sessions,
  onSelectSession,
  onRenameSession,
  onDeleteSession,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleRename = (id: string) => {
    if (editValue.trim()) onRenameSession(id, editValue.trim());
    setEditingId(null);
    setEditValue('');
  };

  return (
    <div
      className={`bg-gray-800 text-white h-full transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64 p-4 pt-16' : 'w-0 p-0'
      }`}
    >
      {isOpen && (
        <>
          
          <h2 className="text-xl font-bold mb-4">Chats</h2>
          <ul className="space-y-2 text-sm">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between hover:bg-gray-700 px-2 py-1 rounded"
              >
                {editingId === s.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRename(s.id);
                    }}
                    className="flex-1"
                  >
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleRename(s.id)}
                      className="w-full bg-gray-900 text-white p-1 text-sm rounded outline-none"
                    />
                  </form>
                ) : (
                  <span
                    onClick={() => onSelectSession(s.id)}
                    onDoubleClick={() => {
                      setEditingId(s.id);
                      setEditValue(s.title);
                    }}
                    className="cursor-pointer flex-1 truncate"
                  >
                    {s.title}
                  </span>
                )}

                <button
                  onClick={() => onDeleteSession(s.id)}
                  className="text-gray-400 hover:text-red-400 text-xs ml-2"
                  title="Delete"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
