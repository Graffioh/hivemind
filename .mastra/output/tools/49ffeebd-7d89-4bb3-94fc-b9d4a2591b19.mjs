import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const API_BASE_URL = "http://localhost:8080";
const inputSchema = z.object({
  action: z.enum(["create", "fetch", "fetchPaginated"]).describe("The action to perform"),
  postId: z.string().optional().describe("Post ID (required for fetch action)"),
  title: z.string().optional().describe("Post title (required for create action)"),
  content: z.string().optional().describe("Post content (required for create action)"),
  userId: z.number().optional().describe("User ID (required for create action, or use sessionId to auto-fetch)"),
  sessionId: z.string().optional().describe("Session ID cookie value (can be used to fetch userId automatically)"),
  page: z.number().optional().describe("Page number for pagination (default: 1)"),
  sort: z.string().optional().describe("Sorting method (default: 'newest')")
});
const postTool = createTool({
  id: "post-tool",
  description: "Create, fetch, or get paginated posts from the Hivemind platform",
  inputSchema,
  outputSchema: z.object({
    success: z.boolean(),
    data: z.any().optional(),
    error: z.string().optional()
  }),
  execute: async ({ context }) => {
    let { action, postId, title, content, userId, sessionId, page = 1, sort = "newest" } = context;
    if (!sessionId && typeof document !== "undefined") {
      const cookies = document.cookie.split(";");
      const sessionCookie = cookies.find((c) => c.trim().startsWith("session_id="));
      if (sessionCookie) {
        sessionId = sessionCookie.split("=")[1].trim();
      }
    }
    try {
      if (action === "create") {
        if (!userId && sessionId) {
          const userResponse = await fetch(`${API_BASE_URL}/user/current`, {
            method: "GET",
            headers: {
              "X-Session-ID": sessionId
            }
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            userId = userData.id;
          } else {
            return {
              success: false,
              error: "Could not fetch user from session. Please provide userId or a valid sessionId."
            };
          }
        }
        if (!title || !content || !userId) {
          return {
            success: false,
            error: "Title, content, and userId (or sessionId) are required for creating a post"
          };
        }
        const response = await fetch(`${API_BASE_URL}/post`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title,
            content,
            user_id: userId
          })
        });
        if (!response.ok) {
          throw new Error(`Failed to create post: ${response.statusText}`);
        }
        const data = await response.json();
        return { success: true, data };
      }
      if (action === "fetch") {
        if (!postId) {
          return {
            success: false,
            error: "Post ID is required for fetching a post"
          };
        }
        const response = await fetch(`${API_BASE_URL}/post/${postId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch post: ${response.statusText}`);
        }
        const data = await response.json();
        return { success: true, data };
      }
      if (action === "fetchPaginated") {
        const response = await fetch(
          `${API_BASE_URL}/post/pagination?page=${page}&sort=${sort}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.statusText}`);
        }
        const data = await response.json();
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

export { postTool };
