import { Comment } from "../types";

export async function fetchComments(postId: string) {
  const response = await fetch("http://localhost:8080/comment/" + postId);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export async function createComment(newComment: Comment): Promise<Comment> {
  const response = await fetch(
    "http://localhost:8080/comment/" + newComment.post_id,
    {
      method: "POST",
      body: JSON.stringify(newComment),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to create comment");
  }

  return response.json();
}

