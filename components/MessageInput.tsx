'use client';

import { useImperativeHandle, forwardRef, useRef, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

type MessageInputProps = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

export type MessageInputHandle = {
  reset: () => void;
  focus: () => void;
};

const MessageInput = forwardRef<MessageInputHandle, MessageInputProps>(
  ({ onSend, disabled = false }, ref) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = message.trim();
      if (!trimmed || disabled) return;
      onSend(trimmed);
      setMessage('');
    };

    useImperativeHandle(ref, () => ({
      reset: () => setMessage(''),
      focus: () => textareaRef.current?.focus(),
    }));

    // Focus textarea on mount
    useEffect(() => {
      textareaRef.current?.focus();
    }, []);

    return (
      <form
        onSubmit={handleSubmit}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 z-30"
      >
        <div className="bg-white rounded-xl shadow-md p-3 flex items-center">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}  
            rows={1}
            placeholder={disabled ? 'Waiting for response...' : 'Ask me...'}
            className="w-full text-black resize-none bg-transparent focus:outline-none disabled:opacity-60"
            disabled={disabled}
          />
          <button
            type="submit"
            className="ml-2 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
          >
            {disabled ? <Loader2 className="animate-spin w-4 h-4" /> : 'Send'}
          </button>
        </div>
      </form>
    );
  }
);

MessageInput.displayName = 'MessageInput';
export default MessageInput;
