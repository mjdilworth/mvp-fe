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
  setStreamingContent: React.Dispatch<React.SetStateAction<string>>;
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
  addMessageToCurrentSession("user", text);
  setStreamingContent(""); // clear before starting
  setIsTyping(true);

  try {
    const response = await fetch(`${apiUrl}/api/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });

      console.debug("[stream chunk]", chunk); // ✅ Inspect in console
      fullResponse += chunk;
      setStreamingContent((prev) => prev + chunk);
    }

    addMessageToCurrentSession("bot", fullResponse);
    setIsTyping(false);
    setStreamingContent('');
    setTimeout(() => {
      inputRef.current?.focusInput?.();
    }, 50);
  } catch (err) {
    console.error("Streaming error:", err);
    addMessageToCurrentSession(
      "bot",
      "Sorry, there was an error. Please try again.",
      "error"
    );
  } finally {
    setIsTyping(false);
    // optional: briefly keep streamed message visible
    setTimeout(() => setStreamingContent(""), 200);
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

