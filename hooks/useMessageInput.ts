import { useState } from 'react';

export function useMessageInput(
  onSend: (msg: string) => void,
  disabled: boolean,
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  onFileSend?: (fileName: string) => void // <-- add this
) {
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement | null>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (onFileSend) {
        onFileSend(file.name); // send file name to session
      }
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