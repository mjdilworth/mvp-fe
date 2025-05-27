import { useState, RefObject } from 'react';

export function useMessageInput(
  handleSend: (message: string) => Promise<void>,
  textareaRef: RefObject<HTMLTextAreaElement | null>
) {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = message.trim();
    if (!trimmed) return;

    await handleSend(trimmed);
    setMessage('');
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  return {
    message,
    setMessage,
    handleSubmit,
  };
}
