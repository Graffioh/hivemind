const MASTRA_API_URL = "http://localhost:4111/api/agents/hivemindAgent/generate";

export interface AgentResponse {
  text: string;
  [key: string]: any;
}

export async function callHivemindAgent(
  message: string,
  sessionId: string
): Promise<AgentResponse> {
  const payload = {
    messages: [
      {
        role: "user",
        content: `${message}\n\nNote: My sessionId is ${sessionId}. Use this when calling tools that require authentication.`,
      },
    ],
  };

  const response = await fetch(MASTRA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to call agent: ${response.statusText}`);
  }

  const data = await response.json();
  const lastMessage =
    (Array.isArray(data?.messages) && data.messages[data.messages.length - 1]) ||
    data?.message;
  const text =
    lastMessage?.content ||
    data?.text ||
    (typeof data === "string" ? data : JSON.stringify(data));

  return { text, ...data };
}

