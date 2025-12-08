import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const API_BASE_URL = "http://localhost:8080";
const userDataSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string().optional()
  // May or may not be included in response
});
const userTool = createTool({
  id: "user-tool",
  description: "Get the current logged-in user information from the session. Requires sessionId to be provided.",
  inputSchema: z.object({
    action: z.enum(["getCurrent"]).describe("Get the current logged-in user"),
    sessionId: z.string().describe("Session ID value (required)")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: userDataSchema.optional(),
    error: z.string().optional()
  }),
  execute: async ({ context }) => {
    const { action, sessionId } = context;
    try {
      if (action === "getCurrent") {
        if (!sessionId) {
          return {
            success: false,
            error: "Session ID is required. Please provide sessionId parameter."
          };
        }
        const headers = {
          "Content-Type": "application/json",
          "X-Session-ID": sessionId
        };
        const response = await fetch(`${API_BASE_URL}/user/current`, {
          method: "GET",
          headers
        });
        if (!response.ok) {
          if (response.status === 400) {
            return {
              success: false,
              error: "No user is currently logged in. Please log in first."
            };
          }
          throw new Error(`Failed to fetch current user: ${response.statusText}`);
        }
        const dataRaw = await response.json();
        const data = userDataSchema.parse(dataRaw);
        return { success: true, data };
      }
      return {
        success: false,
        error: `Unknown action: ${action}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }
});

export { userTool };
