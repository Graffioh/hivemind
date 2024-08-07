import { Reaction, Votes } from "../types";

export async function fetchReactionsCounts(
  postId: number | null,
  commentId: number | null,
): Promise<Votes> {
  if (postId) {
    const response = await fetch(
      `http://localhost:8080/reaction/post/count/${postId}`,
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  } else {
    const response = await fetch(
      `http://localhost:8080/reaction/comment/count/${commentId}`,
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.json();
  }
}

export async function fetchCurrentUserReaction(
  postId: number | null,
  commentId: number | null,
  currentUserId: number,
): Promise<number> {
  if (postId) {
    const response = await fetch(
      `http://localhost:8080/reaction/post/${postId}?user_id=${currentUserId}`,
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.json();
  } else {
    const response = await fetch(
      `http://localhost:8080/reaction/comment/${commentId}?user_id=${currentUserId}`,
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.json();
  }
}

export async function createReaction(newReaction: Reaction): Promise<Reaction> {
  const response = await fetch("http://localhost:8080/reaction", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newReaction),
  });

  if (!response.ok) {
    throw new Error("Failed to create reaction");
  }

  return response.json();
}

