//import { useRef, useState } from 'react';
import { useState, RefObject } from 'react';

export function useMessageInput(
  onSend: (msg: string) => void,
  disabled: boolean,
  textareaRef: React.RefObject<HTMLTextAreaElement>
) {
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement | null>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Selected file: ${file.name}`);
      e.target.value = '';
    }
    setTimeout(() => {
        textareaRef.current?.focus();
    }, 50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    onSend(message.trim());
    setMessage('');
    setTimeout(() => {
        textareaRef.current?.focus();
    }, 50);
    
  };

  return {
    message,
    setMessage,
    handleFileChange,
    handleSubmit,
  };
}