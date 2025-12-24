import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const API_BASE_URL = "http://localhost:8080";
const postSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  title: z.string(),
  content: z.string(),
  created_at: z.string(),
  up_vote: z.number(),
  down_vote: z.number()
});
const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string().optional()
  // May or may not be included in response
});
const inputSchema = z.object({
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
  inputSchema,
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
    const { action, postId, title, content, page = 1, sort = "newest", sessionId } = context;
    let { userId } = context;
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
        const response = await fetch(`${API_BASE_URL}/post/${postId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch post: ${response.statusText}`);
        }
        const dataRaw = await response.json();
        const data = postSchema.parse(dataRaw);
        return { success: true, data };
      }
      if (action === "fetchPaginated") {
        const response = await fetch(
          `${API_BASE_URL}/post/pagination?page=${page}&sort=${sort}`
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

export { postTool };
