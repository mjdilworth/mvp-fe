'use client';

import { useImperativeHandle, forwardRef, useRef, useEffect, useState } from 'react';
import { Loader2, Paperclip } from 'lucide-react';
import { useMessageInput } from '@/hooks/useMessageInput';

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
    
    const {
      message,
      setMessage,
      textareaRef,
      handleFileChange,
      handleSubmit,
    } = useMessageInput(onSend, disabled);

    
    return (
      <form
        onSubmit={handleSubmit}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 z-30"
      >
        <div className="bg-white rounded-xl shadow-md p-3 flex items-center">
          {/* File upload button */}
          <label className="mr-2 cursor-pointer flex items-center">
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={disabled}
            />
            <Paperclip
              size={20}
              className={`text-gray-500 hover:text-gray-800 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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


MessageInput.displayName = 'MessageInput';
export default MessageInput;
