'use client';

import { useImperativeHandle, forwardRef, useRef, useState } from 'react';
import { Loader2, Paperclip } from 'lucide-react';

type MessageInputProps = {
  onSend: (message: string) => void;
  onFileSend: (fileMsg: string, fileName?: string) => void;
  disabled: boolean;
  isTyping: boolean;
  setIsTyping: (v: boolean) => void;
  streamingContent: string;
  setStreamingContent: (v: string) => void;
};

export type MessageInputHandle = {
  focusInput: () => void;
  reset: () => void;
  focus: () => void;
};

const MessageInput = forwardRef<MessageInputHandle, MessageInputProps>(
  (
    {
      onSend,
      onFileSend,
      disabled,
      isTyping,
      setIsTyping,
      streamingContent,
      setStreamingContent,
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const [message, setMessage] = useState('');

    useImperativeHandle(ref, () => ({
      focusInput: () => textareaRef.current?.focus(),
      reset: () => setStreamingContent(''),
      focus: () => textareaRef.current?.focus(),
    }));

    const handleFileChange = async (
      e: React.ChangeEvent<HTMLInputElement | null>
    ) => {
      const file = e.target.files?.[0];
      if (file) {
        setIsTyping(true);
        setStreamingContent('');
        try {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
            {
              method: 'POST',
              body: formData,
            }
          );

          if (!response.ok) throw new Error('File upload failed');
          const data = await response.json();
          const fileMsg = data.reply || data.filename || 'No reply received.';
          let i = 0;
          const interval = setInterval(() => {
            i++;
            const streamed = fileMsg.slice(0, i);
            setStreamingContent(streamed);
            if (i >= fileMsg.length) {
              clearInterval(interval);
              setIsTyping(false);
              setTimeout(() => textareaRef.current?.focus(), 50);
              onFileSend(fileMsg, file.name);
            }
          }, 30);
        } catch {
          setIsTyping(false);
          setStreamingContent('File upload failed');
          onFileSend('File upload failed');
          setTimeout(() => textareaRef.current?.focus(), 50);
        }
        e.target.value = '';
      }
    };

    

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!message.trim() || disabled) return;
      onSend(message.trim());
      setMessage('');
      setTimeout(() => textareaRef.current?.focus(), 50);
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 z-30"
      >
        <div className="bg-white rounded-xl shadow-md p-3 flex items-center">
          <label className="mr-2 cursor-pointer flex items-center">
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={disabled}
            />
            <Paperclip
              size={20}
              className={`text-gray-500 hover:text-gray-800 ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
          </label>
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

export default MessageInput;