import { Mastra } from '@mastra/core/mastra';
import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

"use strict";
const API_BASE_URL$2 = "http://localhost:8080";
const postSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  title: z.string(),
  content: z.string(),
  created_at: z.string(),
  // API returns as string, can be converted to Date if needed
  up_vote: z.number().optional(),
  down_vote: z.number().optional()
});
const userSchema$1 = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string().optional()
  // May or may not be included in response
});
const inputSchema$1 = z.object({
  action: z.enum(["create", "fetch", "fetchPaginated"]).describe("The action to perform"),
  postId: z.string().optional().describe("Post ID (required for fetch action)"),
  title: z.string().optional().describe("Post title (required for create action)"),
  content: z.string().optional().describe("Post content (required for create action)"),
  userId: z.number().optional().describe("User ID (required for create action, or use sessionId to auto-fetch)"),
  sessionId: z.string().optional().describe("Session ID (can be used to fetch userId automatically)"),
  page: z.number().optional().describe("Page number for pagination (default: 1)"),
  sort: z.string().optional().describe("Sorting method (default: 'newest')")
});
const postTool = createTool({
  id: "post-tool",
  description: "Create, fetch, or get paginated posts from the Hivemind platform",
  inputSchema: inputSchema$1,
  outputSchema: z.object({
    success: z.boolean(),
    data: z.union([
      postSchema,
      // Single post (create/fetch response)
      z.array(postSchema)
      // Array of posts (fetchPaginated response)
    ]).optional(),
    error: z.string().optional()
  }),
  execute: async ({ context }) => {
    const { action, postId, title, content, page = 1, sort = "newest" } = context;
    let { userId, sessionId } = context;
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
            const userDataRaw = await userResponse.json();
            const userData = userSchema$1.parse(userDataRaw);
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
        const dataRaw = await response.json();
        const data = postSchema.parse(dataRaw);
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
        const dataRaw = await response.json();
        const data = postSchema.parse(dataRaw);
        return { success: true, data };
      }
      if (action === "fetchPaginated") {
        const response = await fetch(
          `${API_BASE_URL$2}/post/pagination?page=${page}&sort=${sort}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.statusText}`);
        }
        const dataRaw = await response.json();
        const data = z.array(postSchema).parse(dataRaw);
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
const commentSchema = z.object({
  id: z.number(),
  post_id: z.number(),
  user_id: z.number(),
  content: z.string(),
  created_at: z.string(),
  // API returns as string, can be converted to Date if needed
  up_vote: z.number().optional(),
  down_vote: z.number().optional()
});
const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string().optional()
  // May or may not be included in response
});
const inputSchema = z.object({
  action: z.enum(["create", "fetch"]).describe("The action to perform"),
  postId: z.string().describe("Post ID (required for both actions)"),
  content: z.string().optional().describe("Comment content (required for create action)"),
  userId: z.number().optional().describe("User ID (required for create action, or use sessionId to auto-fetch)"),
  sessionId: z.string().optional().describe("Session ID (can be used to fetch userId automatically)")
});
const commentTool = createTool({
  id: "comment-tool",
  description: "Create or fetch comments for a post on the Hivemind platform",
  inputSchema,
  outputSchema: z.object({
    success: z.boolean(),
    data: z.union([
      commentSchema,
      // Single comment (create response)
      z.array(commentSchema)
      // Array of comments (fetch response)
    ]).optional(),
    error: z.string().optional()
  }),
  execute: async ({ context }) => {
    const { action, postId, content, sessionId } = context;
    let { userId } = context;
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
            const userDataRaw = await userResponse.json();
            const userData = userSchema.parse(userDataRaw);
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
        const dataRaw = await response.json();
        const data = commentSchema.parse(dataRaw);
        return { success: true, data };
      }
      if (action === "fetch") {
        const response = await fetch(`${API_BASE_URL$1}/comment/${postId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch comments: ${response.statusText}`);
        }
        const dataRaw = await response.json();
        const data = z.array(commentSchema).parse(dataRaw);
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

"use strict";
const hivemindAgent = new Agent({
  name: "Hivemind Agent",
  instructions: `
    You are a helpful assistant for the Hivemind platform, a social discussion forum.
    Your primary functions are to help users:
    - Create and manage posts
    - Create and view comments on posts
    - Fetch posts (with pagination and sorting options)
    
    When helping users:
    - When creating posts or comments, automatically try to get the userId from the current session using the provided sessionId
    - Use the postTool for all post-related operations (create, fetch, fetchPaginated)
    - Use the commentTool for all comment-related operations (create, fetch)
    - Use the userTool to get current user information if needed
    - Be clear and concise in your responses
    - If an error occurs, explain what went wrong and suggest how to fix it
    - When fetching posts, you can use pagination with page numbers and sorting options (newest, oldest, etc.)
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
