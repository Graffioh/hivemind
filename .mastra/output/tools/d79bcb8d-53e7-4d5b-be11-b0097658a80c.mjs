import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const API_BASE_URL = "http://localhost:8080";
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
        if (!content || !userId) {
          return {
            success: false,
            error: "Content and userId (or sessionId) are required for creating a comment"
          };
        }
        const response = await fetch(`${API_BASE_URL}/comment/${postId}`, {
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
        const response = await fetch(`${API_BASE_URL}/comment/${postId}`);
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

export { commentTool };
