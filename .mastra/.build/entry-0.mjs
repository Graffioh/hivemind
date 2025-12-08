import { Mastra } from '@mastra/core/mastra';
import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

"use strict";
const API_BASE_URL$2 = "http://localhost:8080";
const inputSchema$1 = z.object({
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
  inputSchema: inputSchema$1,
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
          const userResponse = await fetch(`${API_BASE_URL$2}/user/current`, {
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
        const response = await fetch(`${API_BASE_URL$2}/post`, {
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
        const response = await fetch(`${API_BASE_URL$2}/post/${postId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch post: ${response.statusText}`);
        }
        const data = await response.json();
        return { success: true, data };
      }
      if (action === "fetchPaginated") {
        const response = await fetch(
          `${API_BASE_URL$2}/post/pagination?page=${page}&sort=${sort}`
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

"use strict";
const API_BASE_URL$1 = "http://localhost:8080";
const inputSchema = z.object({
  action: z.enum(["create", "fetch"]).describe("The action to perform"),
  postId: z.string().describe("Post ID (required for both actions)"),
  content: z.string().optional().describe("Comment content (required for create action)"),
  userId: z.number().optional().describe("User ID (required for create action, or use sessionId to auto-fetch)"),
  sessionId: z.string().optional().describe("Session ID cookie value (can be used to fetch userId automatically)")
});
const commentTool = createTool({
  id: "comment-tool",
  description: "Create or fetch comments for a post on the Hivemind platform",
  inputSchema,
  outputSchema: z.object({
    success: z.boolean(),
    data: z.any().optional(),
    error: z.string().optional()
  }),
  execute: async ({ context }) => {
    let { action, postId, content, userId, sessionId } = context;
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
          const userResponse = await fetch(`${API_BASE_URL$1}/user/current`, {
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
        if (!content || !userId) {
          return {
            success: false,
            error: "Content and userId (or sessionId) are required for creating a comment"
          };
        }
        const response = await fetch(`${API_BASE_URL$1}/comment/${postId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            content,
            user_id: userId,
            post_id: parseInt(postId)
          })
        });
        if (!response.ok) {
          throw new Error(`Failed to create comment: ${response.statusText}`);
        }
        const data = await response.json();
        return { success: true, data };
      }
      if (action === "fetch") {
        const response = await fetch(`${API_BASE_URL$1}/comment/${postId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch comments: ${response.statusText}`);
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

"use strict";
const API_BASE_URL = "http://localhost:8080";
const userTool = createTool({
  id: "user-tool",
  description: "Get the current logged-in user information from the session. Requires sessionId to be provided.",
  inputSchema: z.object({
    action: z.enum(["getCurrent"]).describe("Get the current logged-in user"),
    sessionId: z.string().describe("Session ID value (required)")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.object({
      id: z.number(),
      username: z.string()
    }).optional(),
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

"use strict";
const hivemindAgent = new Agent({
  name: "Hivemind Agent",
  instructions: `
    You are a helpful assistant for the Hivemind platform, a social discussion forum.
    Your primary functions are to help users:
    - Create and manage posts
    - Create and view comments on posts
    - Fetch posts with pagination and sorting options
    
    When helping users:
    - When creating posts or comments, automatically try to get the userId from the current session
    - The tools will automatically read the sessionId from browser cookies if available
    - If userId is not available, the tools will automatically fetch it from the session
    - Use the postTool for all post-related operations (create, fetch, fetchPaginated)
    - Use the commentTool for all comment-related operations (create, fetch)
    - Use the userTool to get current user information if needed
    - Be clear and concise in your responses
    - If an error occurs, explain what went wrong and suggest how to fix it
    - When fetching posts, you can use pagination with page numbers and sorting options (newest, oldest, etc.)
    - IMPORTANT: The tools automatically handle session authentication when running in browser context
  `,
  model: "google/gemini-flash-lite-latest",
  tools: { postTool, commentTool, userTool }
});

"use strict";
const mastra = new Mastra({
  agents: {
    hivemindAgent
  }
});

export { mastra };
