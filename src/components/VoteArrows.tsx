import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Votes {
  Upvotes: number;
  Downvotes: number;
}

interface Reaction {
  id: number;
  user_id: number;
  post_id: number | null;
  comment_id: number | null;
  reaction_type: string;
  reaction: number;
  created_at: Date;
}

async function fetchReactions(
  postId: number | null,
  commentId: number | null
): Promise<Votes> {
  if (postId) {
    const response = await fetch(
      `http://localhost:8080/reaction/post/${postId}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  } else {
    const response = await fetch(
      `http://localhost:8080/reaction/comment/${commentId}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  }
}

async function createReaction(newReaction: Reaction): Promise<Reaction> {
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

export default function VoteArrows({
  vertical,
  postId,
  commentId,
}: {
  vertical: boolean;
  postId: number | null;
  commentId: number | null;
}) {
  const queryClient = useQueryClient();

  const { data: votes, error } = useQuery<Votes, Error>({
    queryKey: ["reactions", { postId, commentId }],
    queryFn: () => fetchReactions(postId, commentId),
    enabled: postId !== null || commentId !== null,
  });

  const mutation = useMutation<Reaction, Error, Reaction>({
    mutationFn: createReaction,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reactions", { postId, commentId }],
      });
    },
  });

  async function handleVote(reaction: number) {
    const postOrComment: string = postId ? "post" : "comment";
    const newReaction: Reaction = {
      id: Date.now(),
      user_id: 1,
      post_id: postId,
      comment_id: commentId,
      reaction_type: postOrComment,
      reaction: reaction,
      created_at: new Date(),
    };

    mutation.mutate(newReaction);
  }

  if (error) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <div className={`flex ${vertical ? "flex-col" : "flex-row"}`}>
      <div className="mx-1">
        <button
          onClick={(event) => {
            event.stopPropagation();
            handleVote(1);
          }}
          className="w-6 h-6 mb-1"
        >
          ↑
        </button>
        <p className="ml-2 text-orange-600 inline">{votes?.Upvotes}</p>
      </div>
      <div className="mx-1">
        <button
          onClick={(event) => {
            event.stopPropagation();
            handleVote(-1);
          }}
          className="w-6 h-6"
        >
          ↓
        </button>
        <p className="ml-2 inline text-violet-500">{votes?.Downvotes}</p>{" "}
        {/* Corrected to show downVotes */}
      </div>
    </div>
  );
}
