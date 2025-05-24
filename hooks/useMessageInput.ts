import { useState } from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export function useMessageInput(
  onSend: (msg: string) => void,
  disabled: boolean,
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  onFileSend?: (fileMsg: string, fileName?: string) => void
) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement | null>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsTyping(true);
      setStreamingContent('');
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${apiUrl}/api/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('File upload failed');
        }

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
            setTimeout(() => {
              textareaRef.current?.focus();
            }, 50);
            if (onFileSend) {
              onFileSend(fileMsg, file.name); // Only call once, with the full message and file name
            }
          }
        }, 30);
      } catch (err) {
        setIsTyping(false);
        setStreamingContent('File upload failed');
        if (onFileSend) {
          onFileSend('File upload failed');
        }
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 50);
      }
      e.target.value = '';
    }
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
    isTyping,
    streamingContent,
  };
}