import { Agent } from "@mastra/core/agent";
import { postTool } from "../tools/postTool";
import { commentTool } from "../tools/commentTool";
import { userTool } from "../tools/userTool";

export const hivemindAgent = new Agent({
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
  tools: { postTool, commentTool, userTool },
});

