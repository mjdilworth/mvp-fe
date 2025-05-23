import { useRef, useState } from 'react';


export function useMessageInput(onSend: (msg: string) => void, disabled: boolean) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement | null>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Selected file: ${file.name}`);
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    onSend(message.trim());
    setMessage('');
    textareaRef.current?.focus();
  };

  return {
    message,
    setMessage,
    textareaRef,
    handleFileChange,
    handleSubmit,
  };
}