import { RefObject, useCallback } from 'react';
import { MessageInputHandle } from '@/components/MessageInput';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type UseFileUploadProps = {
  setIsTyping: (v: boolean) => void;
  setStreamingContent: React.Dispatch<React.SetStateAction<string>>;
  addMessageToCurrentSession: (
    sender: 'user' | 'bot',
    content: string,
    status?: 'ok' | 'error'
  ) => void;
  inputRef: RefObject<MessageInputHandle | null>;
};

export function useFileUpload({
  setIsTyping,
  setStreamingContent,
  addMessageToCurrentSession,
  inputRef,
}: UseFileUploadProps) {
  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement | null>) => {
      const file = event.target?.files?.[0];
      if (!file) return;

      addMessageToCurrentSession('user', `Uploaded file: ${file.name}`);
      setStreamingContent('');
      setIsTyping(true);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${apiUrl}/api/v1/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Upload failed with status ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        let buffer = '';

        const streamChars = () => {
          if (!buffer.length) return;
          const char = buffer[0];
          buffer = buffer.slice(1);
          fullResponse += char;
          setStreamingContent((prev) => prev + char);
        };

        const streamInterval = setInterval(streamChars, 20); // 20ms per char

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk; // add to buffer, characters will be pulled out by interval
        }

        // Wait until buffer is fully streamed
        const waitUntilEmpty = () =>
          new Promise<void>((resolve) => {
            const check = () => {
              if (!buffer.length) {
                clearInterval(streamInterval);
                resolve();
              } else {
                setTimeout(check, 20);
              }
            };
            check();
          });

        await waitUntilEmpty();

        addMessageToCurrentSession('bot', fullResponse);
        setStreamingContent('');
        setIsTyping(false);
        setTimeout(() => {
          inputRef.current?.focusInput?.();
        }, 50);
      } catch (error) {
        console.error('File upload error:', error);
        addMessageToCurrentSession('bot', '❌ File upload failed.', 'error');
        setIsTyping(false);
        setStreamingContent('');
      }

      if (event.target) {
        event.target.value = '';
      }
    },
    [setIsTyping, setStreamingContent, addMessageToCurrentSession, inputRef]
  );

  return { handleFileChange };
}
