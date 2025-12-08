import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const API_BASE_URL = "http://localhost:8080";

const inputSchema = z.object({
  action: z.enum(["create", "fetch"]).describe("The action to perform"),
  postId: z.string().describe("Post ID (required for both actions)"),
  content: z.string().optional().describe("Comment content (required for create action)"),
  userId: z.number().optional().describe("User ID (required for create action, or use sessionId to auto-fetch)"),
  sessionId: z.string().optional().describe("Session ID cookie value (can be used to fetch userId automatically)"),
});

export const commentTool = createTool({
  id: "comment-tool",
  description: "Create or fetch comments for a post on the Hivemind platform",
  inputSchema,
  outputSchema: z.object({
    success: z.boolean(),
    data: z.any().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    let { action, postId, content, userId, sessionId } = context;
    
    // Try to get sessionId from browser cookies if not provided
    if (!sessionId && typeof document !== "undefined") {
      const cookies = document.cookie.split(";");
      const sessionCookie = cookies.find((c) => c.trim().startsWith("session_id="));
      if (sessionCookie) {
        sessionId = sessionCookie.split("=")[1].trim();
      }
    }
    
    try {
      if (action === "create") {
        // If userId is not provided but sessionId is available, fetch the user first
        if (!userId && sessionId) {
          const userResponse = await fetch(`${API_BASE_URL}/user/current`, {
            method: "GET",
            headers: {
              "X-Session-ID": sessionId,
            },
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            userId = userData.id;
          } else {
            return {
              success: false,
              error: "Could not fetch user from session. Please provide userId or a valid sessionId.",
            };
          }
        }

        if (!content || !userId) {
          return {
            success: false,
            error: "Content and userId (or sessionId) are required for creating a comment",
          };
        }

        const response = await fetch(`${API_BASE_URL}/comment/${postId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            user_id: userId,
            post_id: parseInt(postId),
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to create comment: ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data };
      }

      if (action === "fetch") {
        const response = await fetch(`${API_BASE_URL}/comment/${postId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch comments: ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data };
      }

      return {
        success: false,
        error: `Unknown action: ${action}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
});

