import { MessageInputHandle } from "@/components/MessageInput";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


export function useChatActions({
  sessions,
  setSessions,
  setIsTyping,
  setStreamingContent,
  inputRef,
  setCurrentSessionId,
  currentSessionId,
}: {
  sessions: any[];
  setSessions: React.Dispatch<React.SetStateAction<any[]>>;
  setIsTyping: (v: boolean) => void;
  setStreamingContent: (v: string) => void;
  inputRef: React.RefObject<MessageInputHandle | null>;
  setCurrentSessionId: (id: string) => void;
  currentSessionId: string;
}) {
  const addMessageToCurrentSession = (
    sender: 'user' | 'bot',
    content: string,
    status: 'ok' | 'error' = 'ok'
  ) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: [
                ...s.messages,
                { sender, content, timestamp: new Date(), status },
              ],
              title:
                s.title === 'New Chat' && sender === 'user'
                  ? content.slice(0, 30)
                  : s.title,
            }
          : s
      )
    );
  };


  const handleSend = async (text: string) => {
    addMessageToCurrentSession('user', text);
    setStreamingContent('');
    setIsTyping(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${apiUrl}/api/echo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const fullResponse = data.reply || 'No reply received.';

      let i = 0;
      const interval = setInterval(() => {
        i++;
        setStreamingContent(fullResponse.slice(0, i));
        if (i >= fullResponse.length) {
          clearInterval(interval);
          addMessageToCurrentSession('bot', fullResponse);
          setIsTyping(false);
          // Focus the input after bot response
        setTimeout(() => {
  inputRef.current?.focusInput?.();
}, 50);
        }
      }, 30);
    } catch (err) {
      setIsTyping(false);
      addMessageToCurrentSession(
        'bot',
        'Sorry, there was an error. Please try again.',
        'error'
      );
      // Focus the input even on error
   setTimeout(() => {
  inputRef.current?.focusInput?.();
}, 50);
    }
  };

  
  return {
    addMessageToCurrentSession,
    handleSend,
  };
}

