const MASTRA_API_URL = "http://localhost:4111/api/agents/hivemindAgent/generate";

// Type for the message structure in the API request
interface AgentMessage {
  role: string;
  content: string;
}

// Type for the API request payload
interface AgentRequestPayload {
  messages: AgentMessage[];
}

// Type for the API response - flexible since Mastra API can return various structures
interface AgentApiResponse {
  text?: string;
  message?: {
    content?: string;
  };
  messages?: Array<{
    content?: string;
  }>;
  [key: string]: unknown; // Allow extra fields from the API
}

// Type for the response we return to the caller
export interface AgentResponse {
  text: string;
  [key: string]: unknown; // Use unknown instead of any - forces type checking before use
}

export async function callHivemindAgent(
  message: string,
  sessionId: string
): Promise<AgentResponse> {
  const payload: AgentRequestPayload = {
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

  const data = (await response.json()) as AgentApiResponse;
  
  // Helper function to safely extract text content with proper type checking
  const extractText = (responseData: AgentApiResponse): string => {
    // Try to get text from messages array
    if (Array.isArray(responseData.messages) && responseData.messages.length > 0) {
      const lastMsg = responseData.messages[responseData.messages.length - 1];
      if (lastMsg && typeof lastMsg === "object" && "content" in lastMsg) {
        const content = lastMsg.content;
        if (typeof content === "string" && content) {
          return content;
        }
      }
    }
    
    // Try to get text from message object
    if (responseData.message && typeof responseData.message === "object" && "content" in responseData.message) {
      const content = responseData.message.content;
      if (typeof content === "string" && content) {
        return content;
      }
    }
    
    // Try to get text directly
    if (typeof responseData.text === "string" && responseData.text) {
      return responseData.text;
    }
    
    // Fallback: stringify the entire response
    return JSON.stringify(responseData);
  };

  const text = extractText(data);
  return { text, ...data };
}

