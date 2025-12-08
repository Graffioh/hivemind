import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
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
  tools: { postTool, commentTool, userTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: ":memory:",
    }),
    options: {
      lastMessages: 20,
    },
  }),
});

