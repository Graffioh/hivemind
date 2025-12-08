import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getSessionId } from "../api/user";
import { callHivemindAgent } from "../api/agent";
import LoadingSpinner from "../components/LoadingSpinner";
import HivemindSVG from "../assets/hivemind-logo-hd.svg?react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: sessionId, isLoading: isLoadingSession } = useQuery<string | null>({
    queryKey: ["session_id"],
    queryFn: getSessionId,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  function goToHomePage() {
    navigate("/");
  }

  async function handleSend() {
    if (!input.trim() || !sessionId || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await callHivemindAgent(input.trim(), sessionId);
      const assistantMessage: Message = {
        role: "assistant",
        content: response.text || JSON.stringify(response),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (isLoadingSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="mb-4">
          <HivemindSVG />
        </div>
        <div className="text-xl mb-4">Please log in to use the chat</div>
        <button onClick={goToHomePage} className="px-4 py-2">
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-center mt-4 mb-2">
        <button
          onClick={goToHomePage}
          className="bg-transparent hover:bg-transparent"
        >
          <HivemindSVG width={48} height={64} />
        </button>
      </div>
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4">
        <div className="text-2xl font-bold mb-4 text-center">Hivemind Chat</div>
        <div className="flex-1 overflow-y-auto mb-4 border-2 border-neutral-600 rounded p-4 bg-neutral-900">
          {messages.length === 0 ? (
            <div className="text-center text-stone-400 mt-8">
              Start a conversation with the Hivemind agent...
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-yellow-500 text-black"
                        : "bg-neutral-700 text-white"
                    }`}
                  >
                    <div className="text-sm font-semibold mb-1">
                      {msg.role === "user" ? "You" : "Agent"}
                    </div>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-neutral-700 rounded-lg p-3">
                    <LoadingSpinner />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        <div className="flex gap-2 mb-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            className="flex-1 p-2 rounded border-2 border-neutral-600 bg-neutral-800 text-white resize-none"
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 py-2 disabled:bg-stone-800 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

