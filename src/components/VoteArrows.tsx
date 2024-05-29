import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Reaction, Votes } from "../types";
import { fetchReactions, createReaction } from "../api/reaction";

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
      </div>
    </div>
  );
}
