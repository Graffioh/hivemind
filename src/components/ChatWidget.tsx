import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSessionId } from "../api/user";
import { callHivemindAgent } from "../api/agent";
import LoadingSpinner from "./LoadingSpinner";
import HivemindSVG from "../assets/hivemind-logo-hd.svg?react";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type ChatWidgetProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    data: sessionId,
    isLoading: isLoadingSession,
    isFetching: isFetchingSession,
  } = useQuery<string | null>({
    queryKey: ["session_id"],
    queryFn: getSessionId,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: isOpen,
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!isOpen) return null;

  async function handleSend() {
    if (!input.trim() || !sessionId || isSending) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await callHivemindAgent(userMessage.content, sessionId);
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
      setIsSending(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[360px] max-w-[90vw] shadow-xl">
      <div className="bg-neutral-900 border-2 border-neutral-700 rounded-lg flex flex-col max-h-[70vh]">
        <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-700 bg-neutral-800 rounded-t-lg">
          <div className="flex items-center gap-2">
            <HivemindSVG width={28} height={36} />
            <span className="font-semibold">Hivemind Agent</span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-300 hover:text-white bg-transparent px-2"
          >
            ✕
          </button>
        </div>

        {isLoadingSession || isFetchingSession ? (
          <div className="flex flex-col items-center justify-center p-4 h-48">
            <LoadingSpinner />
            <div className="mt-2 text-sm text-stone-400">Loading session...</div>
          </div>
        ) : !sessionId ? (
          <div className="p-4 text-sm text-center text-stone-300">
            Please log in to chat with the agent.
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[220px]">
              {messages.length === 0 ? (
                <div className="text-center text-stone-400 mt-4">
                  Start a conversation with the Hivemind agent...
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === "user"
                          ? "bg-yellow-500 text-black"
                          : "bg-neutral-700 text-white"
                      }`}
                    >
                      <div className="text-xs font-semibold mb-1">
                        {msg.role === "user" ? "You" : "Agent"}
                      </div>
                      <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                    </div>
                  </div>
                ))
              )}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-neutral-700 rounded-lg p-3">
                    <LoadingSpinner />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-neutral-700 flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 p-2 rounded border-2 border-neutral-600 bg-neutral-800 text-white resize-none"
                rows={2}
                disabled={isSending}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="px-4 py-2 disabled:bg-stone-800 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
