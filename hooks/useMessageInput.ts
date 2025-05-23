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
        console.log("handleSubmit replied with:", data);
      //const fileMsg = data.filename || data.url || file.name || 'File uploaded';
      const fileMsg = data.reply || data.filename || 'No reply received.';
    const message = JSON.stringify(fileMsg, null, 2);

      // Stream the file message out
      let i = 0;
      //console.log("fileMsg:", fileMsg, typeof fileMsg);

      const interval = setInterval(() => {
        i++;
        setStreamingContent(message.slice(0, i));
        if (i >= message.length) {
          clearInterval(interval);
          setIsTyping(false);
          if (onFileSend) {
            onFileSend(message, file.name); // Pass both API reply and file name
          }
          setTimeout(() => {
            textareaRef.current?.focus();
          }, 50);
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